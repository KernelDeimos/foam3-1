foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BulkTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    A decorator in the localTransactionQuotePlanDAO that supports
     the one to many transactions and one to one transactions.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.payment.PADType',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.liquidity.LiquiditySettings',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote parentQuote = (TransactionQuote) obj;

        // Check whether it is bulkTransaction
        if ( parentQuote.getRequestTransaction() instanceof BulkTransaction) {
          BulkTransaction bulkTxn = (BulkTransaction) parentQuote.getRequestTransaction();
          
          PADType bulkTxnPADType = PADTypeLineItem.getPADTypeFrom(x, bulkTxn);

          DAO userDAO = (DAO) x.get("localUserDAO");
          DAO planDAO = (DAO) x.get("localTransactionPlannerDAO");
          DAO balanceDAO = (DAO) x.get("localBalanceDAO");

          Account sourceAccount = bulkTxn.findSourceAccount(x);
          User payer = (User) userDAO.find_(x, bulkTxn.getPayerId());
          if ( payer == null && sourceAccount != null ) {
            payer = sourceAccount.findOwner(x);
          } else if ( payer != null && sourceAccount == null ) {
            sourceAccount = getAccount(x, payer, bulkTxn.getSourceCurrency(), bulkTxn.getExplicitCI());
          }
          if ( payer == null || sourceAccount == null ) {
              throw new RuntimeException("BulkTransaction failed to determine payer or sourceAccount. payerId: "+bulkTxn.getPayerId()+" sourceAccount: "+bulkTxn.getSourceAccount());
          }

          // If only a single child transaction or no children and a non-null
          // payee then quote a single transaction, which is a one to one transaction.
          if ( bulkTxn.getNext().length == 0 ) {
            if ( bulkTxn.getPayeeId() != 0 ) {
              User payee = (User) userDAO.find_(x, bulkTxn.getPayeeId());

              // SourceAccount and DestinationAccount are required
              bulkTxn.setSourceAccount(sourceAccount.getId());
              bulkTxn.setDestinationAccount(getAccount(x, payee, bulkTxn.getDestinationCurrency(), bulkTxn.getExplicitCO()).getId());

              // Need to fclone the bulkTxn when reusing it as the request transaction in a quote since bulkTxn is frozen.
              parentQuote.setRequestTransaction((Transaction) bulkTxn.fclone());
              parentQuote = (TransactionQuote) getDelegate().put_(x, parentQuote);
              
              // Update the child of the bulk transaction
              bulkTxn.addNext(parentQuote.getPlan());
              bulkTxn.setIsQuoted(true);

              parentQuote.setPlan(bulkTxn);
              return parentQuote;
            } else {
              throw new RuntimeException("BulkTransaction missing child transactions or a payee.");
            }
          }

          // Set the destination of bulk transaction to payer's default digital account
          DigitalAccount payerDigitalAccount = DigitalAccount.findDefault(x, payer, bulkTxn.getSourceCurrency());
          bulkTxn.setSourceAccount(payerDigitalAccount.getId());
          bulkTxn.setDestinationAccount(payerDigitalAccount.getId());

          long sum = 0;
          Transaction[] childTransactions = bulkTxn.getNext();
          CompositeTransaction ct = new CompositeTransaction();
          // Set the composite transaction as a quoted transaction so that
          // it won't be quoted in the DigitalTransactionPlanDAO decorator.
          // In order to set the composite transaction as a quoted one, it requires
          // to have both source account and destination account setup.
          ct.setSourceAccount(payerDigitalAccount.getId());
          ct.setDestinationAccount(payerDigitalAccount.getId());
          ct.setIsQuoted(true);

          for (Transaction childTransaction : childTransactions) {
            // Sum amount of child transactions
            sum += childTransaction.getAmount();

            TransactionQuote childQuote = new TransactionQuote();
            childQuote.setParent(parentQuote);

            // Set the source of each child transaction to its parent destination digital account
            childTransaction.setSourceAccount(bulkTxn.getDestinationAccount());

            User payee = (User) userDAO.find_(x, childTransaction.getPayeeId());
            // Get the default digital account
            DigitalAccount digitalAccount = DigitalAccount.findDefault(x, payee, childTransaction.getDestinationCurrency());

            LiquiditySettings digitalAccLiquid = digitalAccount.findLiquiditySetting(x);
            Boolean explicitCO = bulkTxn.getExplicitCO();

            // Check liquidity settings of the digital account associated to the digital transaction
            if ( digitalAccLiquid != null && digitalAccLiquid.getHighLiquidity().getEnabled()) {
              // If it is a transaction to GFO or GD, then it should not trigger explicit cashout
              explicitCO = false;
            }

            // Set the destination of each child transaction to payee's default digital account
            childTransaction.setDestinationAccount(getAccount(x, payee, childTransaction.getDestinationCurrency(), explicitCO).getId());

            // set the pad type for each child transaction
            if ( bulkTxnPADType != null ) { PADTypeLineItem.addTo(childTransaction, bulkTxnPADType.getId()); }

            // Quote each child transaction
            childQuote.setRequestTransaction(childTransaction);

            // Put all the child transaction quotes to TransactionQuotePlanDAO
            TransactionQuote result = (TransactionQuote) planDAO.put(childQuote);

            // Add the child transaction plans as the next of the compositeTransaction
            ct.addNext(result.getPlan());
          }

          // TODO: consider FX.
          // Set the total amount on parent
          bulkTxn.setAmount(sum);

          Long payerDigitalBalance = (Long) payerDigitalAccount.findBalance(x);

          if ( sum > payerDigitalBalance ||
               bulkTxn.getExplicitCI() ) {
            // If digital does not have sufficient funds
            BankAccount payerDefaultBankAccount = BankAccount.findDefault(x, payer, bulkTxn.getSourceCurrency());

            // Create a Cash-In transaction
            Transaction cashInTransaction = new Transaction();
            cashInTransaction.setSourceAccount(payerDefaultBankAccount.getId());
            cashInTransaction.setDestinationAccount(payerDigitalAccount.getId());
            cashInTransaction.setAmount(bulkTxn.getAmount());
            if ( bulkTxnPADType != null ) { PADTypeLineItem.addTo(cashInTransaction, bulkTxnPADType.getId()); }
            TransactionQuote cashInTransactionQuote = new TransactionQuote();
            cashInTransactionQuote.setRequestTransaction(cashInTransaction);
            cashInTransactionQuote = (TransactionQuote) planDAO.put(cashInTransactionQuote);
            cashInTransaction = cashInTransactionQuote.getPlan();

            // Add the compositeTransaction as the next of the cash-in transaction.
            cashInTransaction.addNext(ct);
            // Add the cash-in transaction as the next of the bulk transaction.
            bulkTxn.clearNext();
            bulkTxn.addNext(cashInTransaction);
          } else {
            // If the payer's digital account has sufficient balance, then cash-in transaction is not required.
            // Add the compositeTransaction as the next of the bulk transaction.
            bulkTxn.clearNext();
            bulkTxn.addNext(ct);
          }
          bulkTxn.setIsQuoted(true);

          // Set bulk transaction to the parent quote
          parentQuote.setPlan(bulkTxn);

          return parentQuote;
        }
        return super.put_(x, obj);
      `
    },
    {
      name: 'getAccount',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'user',
          type: 'User'
        },
        {
          name: 'currency',
          type: 'String'
        },
        {
          name: 'cico',
          type: 'Boolean'
        }
      ],
      javaType: 'net.nanopay.account.Account',
      javaCode: `
        if ( cico ) {
          Account account = BankAccount.findDefault(x, user, currency);
          if ( account != null ) {
            return account;
          }
          throw new RuntimeException(currency + " BankAccount not found for " + user.getId());
        } else {
          return DigitalAccount.findDefault(x, user, currency);
        }
      `
    },
    // {
    //   name: 'setPADType',
    //   args: [
    //     {
    //       name: 'transaction',
    //       type: 'Transaction'
    //     },
    //     {
    //       name: 'padType',
    //       class: 'Int'
    //     },
    //   ],
    //   javaCode: `
    //     // only set the pad type if it's not provided by client
    //     if ( getPADType(transaction) == 0 ) {
    //       PADTypeLineItem lineItem = new PADTypeLineItem();
    //       lineItem.setPadType(padType);
    //       transaction.addLineItems(new TransactionLineItem[] { lineItem }, null);
    //     }
    //   `
    // },
    // {
    //   name: 'getPADType',
    //   javaType: 'int',
    //   args: [
    //     {
    //       name: 'transaction',
    //       type: 'Transaction'
    //     }
    //   ],
    //   javaCode:`
    //     PADTypeLineItem padTypeLineItem = null;
    //     for (TransactionLineItem lineItem : transaction.getLineItems()) {
    //       if ( lineItem instanceof PADTypeLineItem ) {
    //         padTypeLineItem = (PADTypeLineItem) lineItem;
    //       }
    //     }
    //
    //     return padTypeLineItem == null ? 0 : padTypeLineItem.getPadType();
    //   `
    // }
  ]
});

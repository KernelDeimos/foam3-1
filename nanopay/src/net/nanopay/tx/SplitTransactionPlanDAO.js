/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SplitTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',

    'java.util.ArrayList',
    'java.util.List',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.exception.UnsupportedTransactionException',
    'net.nanopay.tx.*',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.model.Broker',
    'foam.dao.DAO'
  ],

  constants: [
     {
       type: 'String',
       name: 'NANOPAY_FX_SERVICE_NSPEC_ID',
       value: 'localFXService'
     }
   ],

  properties: [
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) obj;

      if ( quote.getPlans().length > 0 ) return super.put_(x, quote);
      Transaction request = quote.getRequestTransaction();
      Transaction txn;

      // create summary transaction when the request transaction is the base Transaction,
      // otherwise conserve the type of the transaction.
      if ( request.getType().equals("Transaction") ) {
        txn = new SummaryTransaction.Builder(x).build();
        txn.copyFrom(request);
      } else {
        txn = (Transaction) request.fclone();
      }

      txn.setStatus(TransactionStatus.PENDING);
      txn.setInitialStatus(TransactionStatus.COMPLETED);

      Transaction cashinPlan = null;

      Account sourceAccount = request.findSourceAccount(x);
      Account destinationAccount = request.findDestinationAccount(x);

      if ( sourceAccount instanceof BankAccount &&
        destinationAccount instanceof BankAccount &&
        ! sourceAccount.getDenomination().equalsIgnoreCase(destinationAccount.getDenomination())) {
        DigitalAccount sourceDigitalaccount = DigitalAccount.findDefault(getX(), sourceAccount.findOwner(getX()), sourceAccount.getDenomination());
        DigitalAccount destinationDigitalaccount = DigitalAccount.findDefault(getX(), destinationAccount.findOwner(getX()), destinationAccount.getDenomination());

        // Split 1: XBank -> XDigital.
        TransactionQuote q1 = new TransactionQuote.Builder(x).build();
        q1.copyFrom(quote);
        Transaction t1 = new Transaction.Builder(x).build();
        t1.copyFrom(request);
        // Get Payer Digital Account to fufil CASH-IN
        t1.setDestinationAccount(sourceDigitalaccount.getId());
        t1.setDestinationCurrency(t1.getSourceCurrency());
        q1.setRequestTransaction(t1);
        TransactionQuote c1 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q1);
        if ( null != c1.getPlan() ) {
          cashinPlan = c1.getPlan();
          txn.addNext(cashinPlan);
          txn.addLineItems(cashinPlan.getLineItems(), cashinPlan.getReverseLineItems());
        }

        // Split 2: XDigital -> XDIgital
        Long destinationCurrencyAmount = 0l;

        // Check we can handle currency pair
        Transaction digitalPlan = null;
        if ( null != CurrencyFXService.getFXServiceByNSpecId(x, sourceDigitalaccount.getDenomination(),
          destinationDigitalaccount.getDenomination(), NANOPAY_FX_SERVICE_NSPEC_ID)) {
          // XDigital -> XDIgital.
          TransactionQuote q2 = new TransactionQuote.Builder(x).build();
          q2.copyFrom(quote);

          Transaction t2 = new Transaction.Builder(x).build();
          t2.copyFrom(request);
          t2.setSourceAccount(sourceDigitalaccount.getId());
          t2.setDestinationAccount(destinationDigitalaccount.getId());
          q2.setRequestTransaction(t2);
          TransactionQuote c2 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q2);
          if ( null != c2.getPlan() ) {
            digitalPlan = c2.getPlan();
            cashinPlan.setAmount(digitalPlan.getAmount() + digitalPlan.getCost());
            destinationCurrencyAmount = digitalPlan.getDestinationAmount();
            cashinPlan.addNext(digitalPlan);
            txn.addLineItems(digitalPlan.getLineItems(), digitalPlan.getReverseLineItems());
          }
        } else {
          // XDigital -> USDIgital. Check if supported first
          DigitalAccount destinationUSDDigitalaccount = DigitalAccount.findDefault(getX(), destinationAccount.findOwner(getX()), "USD");
          if ( null != CurrencyFXService.getFXServiceByNSpecId(x, sourceDigitalaccount.getDenomination(),
          destinationUSDDigitalaccount.getDenomination(), NANOPAY_FX_SERVICE_NSPEC_ID)){

            TransactionQuote q3 = new TransactionQuote.Builder(x).build();
            q3.copyFrom(quote);
            Transaction t3 = new Transaction.Builder(x).build();
            t3.copyFrom(request);
            t3.setSourceAccount(sourceDigitalaccount.getId());
            t3.setDestinationAccount(destinationUSDDigitalaccount.getId());
            q3.setRequestTransaction(t3);
            TransactionQuote c3 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q3);
            if ( null != c3.getPlan() )  {
              // USDigital -> INDIgital.
              TransactionQuote q4 = new TransactionQuote.Builder(x).build();
              q4.copyFrom(quote);

              Transaction t4 = new Transaction.Builder(x).build();
              t4.copyFrom(request);
              t4.setAmount(c3.getPlan().getAmount());
              t4.setSourceAccount(destinationUSDDigitalaccount.getId());
              t4.setDestinationAccount(destinationDigitalaccount.getId());
              q4.setRequestTransaction(t4);
              TransactionQuote c4 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q4);
              if ( null != c4.getPlan() ) {
                Transaction plan = c4.getPlan();
                destinationCurrencyAmount = plan.getDestinationAmount();
                txn.addLineItems(plan.getLineItems(), plan.getReverseLineItems());
              } else {
                // No possible route to destination currency
               sendNOC(x, sourceAccount, destinationAccount);
                return super.put_(x, quote);
              }
            }
          } else {
            // No possible route to destination currency
            sendNOC(x, sourceAccount, destinationAccount);
            return super.put_(x, quote);
          }
        }

        // Split 3: XDigital -> XBank.
        TransactionQuote q5 = new TransactionQuote.Builder(x).build();
        q5.copyFrom(quote);
        Transaction t5 = new Transaction.Builder(x).build();
        t5.copyFrom(request);
        t5.setSourceCurrency(t5.getDestinationCurrency());
        t5.setSourceAccount(destinationDigitalaccount.getId());
        t5.setDestinationAccount(destinationAccount.getId());
        t5.setAmount(destinationCurrencyAmount);
        q5.setRequestTransaction(t5);
        TransactionQuote c5 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q5);
        if ( null != c5.getPlan() ) {
          Transaction cashOutPlan = c5.getPlan();
          if ( digitalPlan != null )
            digitalPlan.addNext(cashOutPlan);
          else
            cashinPlan.addNext(cashOutPlan);
          txn.addLineItems(cashOutPlan.getLineItems(), cashOutPlan.getReverseLineItems());
        }
        txn.setStatus(TransactionStatus.COMPLETED);
        txn.setIsQuoted(true);
        quote.addPlan(txn);
      }

      if ( sourceAccount instanceof BankAccount &&
        destinationAccount instanceof BankAccount &&
        sourceAccount.getDenomination().equalsIgnoreCase(destinationAccount.getDenomination())) {
        DigitalAccount digitalaccount = DigitalAccount.findDefault(getX(), destinationAccount.findOwner(getX()), destinationAccount.getDenomination());

        // Split 1: XBank -> XDigital
        TransactionQuote q1 = new TransactionQuote.Builder(x).build();
        q1.copyFrom(quote);
        Transaction t1 = new Transaction.Builder(x).build();
        t1.copyFrom(request);
        // Get Payer Digital Account to fufil CASH-IN
        t1.setDestinationAccount(digitalaccount.getId());
        q1.setRequestTransaction(t1);

        TransactionQuote c1 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q1);
        if ( null != c1.getPlan() ) {
          cashinPlan = c1.getPlan();
          txn.addNext(cashinPlan);
          txn.addLineItems(cashinPlan.getLineItems(), cashinPlan.getReverseLineItems());
        }

        // XDigital -> XBankAccount.
        TransactionQuote q2 = new TransactionQuote.Builder(x).build();
        q2.copyFrom(quote);

        Transaction t2 = new Transaction.Builder(x).build();
        t2.copyFrom(request);
        t2.setSourceAccount(digitalaccount.getId());
        t2.setDestinationAccount(destinationAccount.getId());
        q2.setRequestTransaction(t2);

        TransactionQuote c2 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q2);
        if ( null != c2.getPlan() ) {
          Transaction plan = c2.getPlan();
          cashinPlan.addNext(plan);
          txn.addLineItems(plan.getLineItems(), plan.getReverseLineItems());
        }

        txn.setStatus(TransactionStatus.COMPLETED);
        txn.setIsQuoted(true);
        quote.addPlan(txn);
      }


      return super.put_(x, quote);
    `
    },
    {
      name: 'sendNOC',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'sourceAccount',
          type: 'net.nanopay.account.Account'
        },
        {
          name: 'destinationAccount',
          type: 'net.nanopay.account.Account'
        }
      ],
      javaCode: `
      String message = "Unable to provide broker to handle FX transaction from source bank account currency: "+ sourceAccount.getDenomination() + " to destination bank account currency: " + destinationAccount.getDenomination() ;
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(message)
        .build();
    ((DAO) x.get("notificationDAO")).put(notification);
    ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
`
    },
    {
      name: 'addTxn',
      args: [
        {
          name: 'txn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
`
    }
  ]
});

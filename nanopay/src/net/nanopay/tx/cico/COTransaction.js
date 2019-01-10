foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'COTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.TransactionLineItem',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.util.ArrayList',
  ],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Cash Out';
      },
      javaFactory: `
        return "Cash Out";
      `
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    }
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaType: 'void',
      javaCode: `
      super.validate(x);

      if ( BankAccountStatus.UNVERIFIED.equals(((BankAccount)findDestinationAccount(x)).getStatus())) {
        throw new RuntimeException("Bank account must be verified");
      }

      if ( ! SafetyUtil.isEmpty(getId()) ) {
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn.getStatus().equals(TransactionStatus.DECLINED) ||
             oldTxn.getStatus().equals(TransactionStatus.COMPLETED) &&
             ! getStatus().equals(TransactionStatus.DECLINED) ) {
          throw new RuntimeException("Unable to update COTransaction, if transaction status is accepted or declined. Transaction id: " + getId());
        }
      }
      `
    },
    {
      documentation: `return true when status change is such that normal Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaType: 'Boolean',
      javaCode: `
      if ( getStatus() == TransactionStatus.COMPLETED && oldTxn == null ||
      getStatus() == TransactionStatus.PENDING &&
       ( oldTxn == null || oldTxn.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED  ) ) {
        return true;
      }
      return false;
      `
    },
    {
      documentation: `return true when status change is such that reversal Transfers should be executed (applied)`,
      name: 'canReverseTransfer',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaType: 'Boolean',
      javaCode: `
        if ( getStatus() == TransactionStatus.DECLINED &&
             ( oldTxn != null &&
                 ( oldTxn.getStatus() == TransactionStatus.SENT ||
                   oldTxn.getStatus() == TransactionStatus.COMPLETED ||
                   oldTxn.getStatus() == TransactionStatus.PENDING ) ) )  {
          return true;
        }
        return false;
      `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaType: 'Transfer[]',
      javaCode: `
      List all = new ArrayList();
      TransactionLineItem[] lineItems = getLineItems();

        if ( canTransfer(x, oldTxn) ) {
          for ( int i = 0; i < lineItems.length; i++ ) {
            TransactionLineItem lineItem = lineItems[i];
            Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, false);
            for ( int j = 0; j < transfers.length; j++ ) {
              all.add(transfers[j]);
            }
          }
          all.add(new Transfer.Builder(x)
            .setDescription(TrustAccount.find(x, findSourceAccount(x)).getName()+" Cash-Out")
            .setAccount(TrustAccount.find(x, findSourceAccount(x)).getId())
            .setAmount(getTotal())
            .build());
          all.add(new Transfer.Builder(x)
            .setDescription("Cash-Out")
            .setAccount(getSourceAccount())
            .setAmount(-getTotal())
            .build());
          Transfer[] transfers = getTransfers();
          for ( int i = 0; i < transfers.length; i++ ) {
            all.add(transfers[i]);
          }
        } else if ( canReverseTransfer(x, oldTxn) ) {
          for ( int i = 0; i < lineItems.length; i++ ) {
            TransactionLineItem lineItem = lineItems[i];
            Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, true);
            for ( int j = 0; j < transfers.length; j++ ) {
              all.add(transfers[j]);
            }
          }
          all.add(new Transfer.Builder(x)
            .setDescription(TrustAccount.find(x, findSourceAccount(x)).getName()+" Cash-Out DECLINED")
            .setAccount(TrustAccount.find(x, findSourceAccount(x)).getId())
            .setAmount(-getTotal())
            .build());
          all.add(new Transfer.Builder(x)
            .setDescription("Cash-Out DECLINED")
            .setAccount(getSourceAccount())
            .setAmount(getTotal())
            .build());
          Transfer[] transfers = getReverseTransfers();
            for ( int i = 0; i < transfers.length; i++ ) {
              all.add(transfers[i]);
            }
            setStatus(TransactionStatus.REVERSE);
          }
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});

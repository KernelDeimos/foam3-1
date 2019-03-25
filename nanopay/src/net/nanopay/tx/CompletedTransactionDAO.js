foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompletedTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `On transition to completed reset status of children.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      Transaction oldTxn = (Transaction) getDelegate().find_(x, obj);
      Transaction txn = (Transaction) getDelegate().put_(x, obj);
      if ( oldTxn != null && txn.getStatus() == TransactionStatus.COMPLETED && oldTxn.getStatus() != TransactionStatus.COMPLETED ||
        oldTxn == null && txn.getStatus() == TransactionStatus.COMPLETED ) {
        DAO children = txn.getChildren(x);
        for ( Object o : ((ArraySink) children.select(new ArraySink())).getArray() ) {
          Transaction child = (Transaction) o;
          child.setStatus(child.getInitialStatus());

          /**
           * need to use the put_ override because of the newly added transaction.status permissionRequired: true property
           * we call put_ with the DAO context rather than the calling context instead
           * this is because the user in the calling context may not have permission to update
           * all neccessary properties
           */
          children.put_(getX(), child);
        }
      }
      return txn;
      `
    }
  ],
});

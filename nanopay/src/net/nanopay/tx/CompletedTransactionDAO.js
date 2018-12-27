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
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
      Transaction oldTxn = (Transaction) getDelegate().find_(x, obj);
      Transaction txn = (Transaction) getDelegate().put_(x, obj);
      if ( oldTxn != null && txn.getStatus() == TransactionStatus.COMPLETED && oldTxn.getStatus() != TransactionStatus.COMPLETED ||
        oldTxn == null && txn.getStatus() == TransactionStatus.COMPLETED ) {
        DAO children = txn.getChildren(x);
        for ( Object o : ((ArraySink) children.select(new ArraySink())).getArray() ) {
          Transaction child = (Transaction) o;
          child.setStatus(child.getInitialStatus());
          children.put(child);
        }
      }
      return txn;
      `
    }
  ],
});


foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ExecuteMethodsTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorator calls two methods on transaction: 
  executeBefore() - for additional logic on each transaction that needs to be executed before transaction is written to journals,
  executeAfter() - for additional logic that needs to be executed after transaction was written to journals.`,

  javaImports: [
    'foam.dao.DAO',
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
    Transaction transaction = (Transaction) obj;
    Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(((Transaction)obj).getId());
    transaction = transaction.executeBefore(x, oldTxn);
    Transaction returnTxn = (Transaction) getDelegate().put_(x, transaction);
    ((Transaction)returnTxn.fclone()).executeAfter(x, oldTxn); //to prevent change of returned transaction
    return returnTxn;
    `
    },
  ]
});

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayeeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Determine destination account based on payee when account is not provided.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger'
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'localUserDAO'
  ],

  requires: [
    'foam.nanos.auth.User'
  ],

  implements: [
    'foam.mlang.Expressions'
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
      Logger logger = (Logger) x.get("logger");
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();
        logger.info("txn.findSourceAccount(x) " + txn.findSourceAccount(x));
        if ( txn.findDestinationAccount(x) == null ) {
          User user = (User) ((DAO) x.get("localUserDAO")).find_(x, txn.getPayeeId());
          if ( user == null ) {
            throw new RuntimeException("Payee not found");
          }
          DigitalAccount digitalAccount = DigitalAccount.findDefault(x, user, txn.getSourceCurrency());
          txn = (Transaction) obj.fclone();
          txn.setDestinationAccount(digitalAccount.getId());
        }
        return getDelegate().put_(x, txn);
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PayeeTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
            System.err.println("Direct constructor use is deprecated. Use Builder instead.");
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});

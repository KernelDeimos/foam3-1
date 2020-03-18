foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'QuoteFillerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Groom the quote, so it has useful information to help with planning.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.LifecycleState'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }

        Logger logger = (Logger) x.get("logger");
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();

        //clear the incoming quote
        txn.setNext(null);
        quote.setPlans(null);
        quote.setPlan(null);
        quote.setSourceAccount((Account) txn.findSourceAccount(x));
        quote.setDestinationAccount((Account) txn.findDestinationAccount(getX())); // elevate destination account search to system.
        if ( SafetyUtil.isEmpty(txn.getSourceCurrency()) ) {
          logger.log("Transaction Source Currency not specified, defaulting to source account denomination");
          txn.setSourceCurrency(quote.getSourceAccount().getDenomination());
        }
        if ( SafetyUtil.isEmpty(txn.getDestinationCurrency()) ) {
          logger.log("Transaction Source Currency not specified, defaulting to source account denomination");
          txn.setDestinationCurrency(quote.getDestinationAccount().getDenomination());
        }

        quote.setSourceUnit(txn.getSourceCurrency());
        quote.setDestinationUnit(txn.getDestinationCurrency());
        return getDelegate().put_(x, quote);
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public QuoteFillerDAO(foam.core.X x, foam.dao.DAO delegate) {
            System.err.println("Direct constructor use is deprecated. Use Builder instead.");
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});

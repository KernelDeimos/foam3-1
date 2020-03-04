foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'RejectedTransactionReportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A DAO decorator to generate the RejectedTransactionReport',

  javaImports: [
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.Constant',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Nary',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.predicate.True',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.meter.report.RejectedTransactionReport',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',

    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        if ( sink == null )
          return super.select_(x, sink, skip, limit, order, predicate);

        Predicate newPredicate = new True();
        Logger logger = (Logger) x.get("logger");

        if ( predicate != null ) {
          Predicate predicateContent = ((And) predicate).getArgs()[1];
          if ( predicateContent instanceof Nary ) {
            newPredicate = AND(
              OR(
                GTE(
                  Transaction.CREATED,
                  ((Constant) ((Gt) ((And) predicateContent).getArgs()[0]).getArg2()).getValue()
                ),
                GTE(
                  Transaction.PROCESS_DATE,
                  ((Constant) ((Gt) ((And) predicateContent).getArgs()[0]).getArg2()).getValue()
                ),
                GTE(
                  Transaction.COMPLETION_DATE,
                  ((Constant) ((Gt) ((And) predicateContent).getArgs()[0]).getArg2()).getValue()
                )
              ),
              LTE(
                Transaction.CREATED,
                ((Constant) ((Lt) ((And) predicateContent).getArgs()[1]).getArg2()).getValue()
              )
            );
          } else if ( predicateContent instanceof Gt ) {
            newPredicate = OR(
              GTE(
                Transaction.CREATED,
                ((Constant) ((Gt) predicateContent).getArg2()).getValue()
              ),
              GTE(
                Transaction.PROCESS_DATE,
                ((Constant) ((Gt) predicateContent).getArg2()).getValue()
              ),
              GTE(
                Transaction.COMPLETION_DATE,
                ((Constant) ((Gt) predicateContent).getArg2()).getValue()
              )
            );
          } else if ( predicateContent instanceof Lt ) {
            newPredicate = LTE(
              Transaction.CREATED,
              ((Constant) ((Lt) predicateContent).getArg2()).getValue()
            );
          } else {
            newPredicate = predicate;
          }
        }

        Sink decoratedSink = decorateSink(x, sink, skip, limit, order, null);

        // Retrieve the DAO
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");

        transactionDAO.where(AND(
          newPredicate, 
          OR(
            EQ(Transaction.STATUS, TransactionStatus.DECLINED),
            EQ(Transaction.STATUS, TransactionStatus.REVERSE),
            EQ(Transaction.STATUS, TransactionStatus.REVERSE_FAIL),
            EQ(Transaction.STATUS, TransactionStatus.CANCELLED),
            EQ(Transaction.STATUS, TransactionStatus.FAILED)
          )
        )).orderBy(Transaction.INVOICE_ID).select(new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            Transaction transaction = (Transaction) obj;
            try {
              User sender = ((Account) transaction.findSourceAccount(x)).findOwner(x);
              User receiver = ((Account) transaction.findDestinationAccount(x)).findOwner(x);

              PaymentReport pr = new PaymentReport.Builder(x)
                .setId(transaction.getId())
                .setCreated(transaction.getCreated())
                .setStatus(transaction.getStatus())
                .setState(transaction.getState(x))
                .setType(transaction.getType())
                .setSenderUserId(sender.getId())
                .setSenderName(sender.label())
                .setReceiverUserId(receiver.getId())
                .setReceiverName(receiver.label())
                .setSourceAmount(transaction.getAmount())
                .setSourceCurrency(transaction.getSourceCurrency())
                .setDestinationAmount(transaction.getDestinationAmount())
                .setDestinationCurrency(transaction.getDestinationCurrency())
                .build();
                decoratedSink.put(pr, null);
            } catch (Exception e ){
              logger.error("Failed to generate rejected transaction report for ID: " + transaction.getId(), e);
            }
          }
        });

        return decoratedSink;
      `
    }
  ]
});

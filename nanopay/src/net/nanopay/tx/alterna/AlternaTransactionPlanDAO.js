/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.mlang.sink.Count',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.TransactionPlan',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
    'foam.dao.DAO'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
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

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = quote.getRequestTransaction();
    TransactionPlan plan = new TransactionPlan.Builder(x).build();

    logger.debug(this.getClass().getSimpleName(), "put", quote);

    // RequestTransaction may or may not have accounts.
    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    logger.debug(this.getClass().getSimpleName(), "put", "sourceAccount", sourceAccount, "destinationAccount", destinationAccount);

    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount ) {
       long count = ((Count) ((DAO) x.get("localTransactionDAO")).where(
          AND(
            EQ(Transaction.SOURCE_ACCOUNT, sourceAccount.getId()),
            INSTANCE_OF(AlternaVerificationTransaction.getOwnClassInfo())
          )).select(new Count())).getValue();
           if ( count == 0 ) {
             AlternaVerificationTransaction v = new AlternaVerificationTransaction.Builder(x).build();
             v.copyFrom(request);
             v.setIsQuoted(true);
             plan.setTransaction(v);
             quote.addPlan(plan);
             return super.put_(x, quote);
           }
      AlternaCITransaction t = new AlternaCITransaction.Builder(x).build();
      t.copyFrom(request);
      // TODO: use EFT calculation process
      plan.setEta(/* 2 days */ 172800000L);
      t.setIsQuoted(true);
      plan.setTransaction(t);
    } else if ( destinationAccount instanceof CABankAccount &&
      sourceAccount instanceof DigitalAccount ) {
      AlternaCOTransaction t = new AlternaCOTransaction.Builder(x).build();
      t.copyFrom(request);
      // TODO: use EFT calculation process
      plan.setEta(/* 2 days */ 172800000L);
      t.setIsQuoted(true);
      plan.setTransaction(t);
    }

    // TODO: add nanopay fee

    if ( plan != null ) {
      quote.addPlan(plan);
    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});

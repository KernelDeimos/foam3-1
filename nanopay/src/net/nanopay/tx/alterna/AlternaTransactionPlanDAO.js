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
  'net.nanopay.bank.BankAccountStatus',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.mlang.sink.Count',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.ComplianceTransaction',
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
      javaCode: `

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = (Transaction) quote.getRequestTransaction().fclone();

    if ( request instanceof AlternaVerificationTransaction ) {
      request.setIsQuoted(true);
      quote.addPlan(request);
      return quote;
    }

    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount ) {

      if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) throw new RuntimeException("Bank account needs to be verified for cashin");

      AlternaCITransaction t = new AlternaCITransaction.Builder(x).build();
      t.copyFrom(request);

      // TODO: use EFT calculation process
      t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    } else if ( destinationAccount instanceof CABankAccount &&
      sourceAccount instanceof DigitalAccount ) {

      if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) throw new RuntimeException("Bank account needs to be verified for cashout");

      AlternaCOTransaction t = new AlternaCOTransaction.Builder(x).build();
      t.copyFrom(request);

      // TODO: use EFT calculation process
      t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
      t.setIsQuoted(true);

      ComplianceTransaction ct = new ComplianceTransaction.Builder(x)
      //.setRequestedTransaction(t)
      .build();
      ct.copyFrom(t); // We might want to change destination/source to not show this as a user transaction
      ct.addNext(t);
      quote.addPlan(ct);
    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});

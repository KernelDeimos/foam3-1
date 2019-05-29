/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DebtRepaymentPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Transactions with a destination of a DebtAccount are repaying Debt',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      if ( ! ( request.findDestinationAccount(x) instanceof DebtAccount ) )
        return super.put_(x, quote);

      Transaction repayment = new DebtRepaymentTransaction.Builder(x).build();
      repayment.copyFrom(request);
      repayment.setIsQuoted(true);

      quote.setPlan(repayment);
      return quote;
      `
    }
  ]
});

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Base class of Exchange Rate Transactions.
Stores all Exchange Rate info.`,

  implements: [
    'net.nanopay.tx.AcceptAware'
  ],

  javaImports: [
    'net.nanopay.tx.AcceptAware',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FeesFields',

    'java.util.Arrays',
  ],

  properties: [
    {
      name: 'fxRate',
      class: 'Double'
    },
    {
      name: 'fxExpiry',
      class: 'DateTime'
    },
    {
      name: 'accepted',
      class: 'Boolean',
      value: false
    },
    {
      name: 'fxQuoteId', // or fxQuoteCode
      class: 'String'
    },
    {
      name: 'fxFees',
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.FeesFields'
    }
  ],

  methods: [
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
      ],
      javaCode: `
/* nop */
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
  javaReturns: 'Transfer[]',
  javaCode: `
    return getTransfers();

  `
},
  ]
});

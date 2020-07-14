/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXLineItem',
  extends: 'net.nanopay.tx.ExpiryLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'rate',
      class: 'Double',
      view: function(_, x) {
        return foam.u2.Element.create()
          .start()
            .add( x.data.sourceCurrency.format(1 * Math.pow(10, x.data.sourceCurrency.precision)) + ' : ' + x.data.destinationCurrency.format(x.data.rate * Math.pow(10, x.data.sourceCurrency.precision)))
          .end();
      }
    },
    {
      name: 'accepted',
      class: 'Boolean',
      value: false,
      hidden: true
    },
    {
      // can we use id for this.
      name: 'quoteId', // or fxQuoteCode
      class: 'String',
      hidden: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'sourceCurrency',
      hidden: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'destinationCurrency',
      hidden: true
    },
    // destinationAmount ?
  ],

  messages: [
      { name: 'DESCRIPTION', message: 'Foreign Exchange Information' },
  ],

  methods: [
    function toSummary() {
      return this.DESCRIPTION;
    }
  ]
});

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
  package: 'net.nanopay.tx',
  name: 'FeeSummaryTransactionLineItem',
  extends: 'net.nanopay.tx.SummaryTransactionLineItem',

  javaImports: [
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'totalFee',
      label: 'Fees' // TODO see if can make total storage transient, and calculate from currency + amount
    },
    {
      name: 'lineItems',
      hidden: false
    },
  ],

  messages: [
    { name: 'FEE', message: 'Service fees' }
  ],

  methods: [
    function toSummary() {
      return this.FEE;
    }
  ]

});

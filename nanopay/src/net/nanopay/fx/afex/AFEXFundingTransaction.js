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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXFundingTransaction',
  extends: 'net.nanopay.fx.afex.AFEXTransaction',
  documentation: `Hold AFEX Funding transaction specific properties`,

  implements: [
    'net.nanopay.tx.PartnerTransaction',
    'net.nanopay.iso20022.ISO20022Transaction'
  ],

  javaImports: [
    'foam.core.X',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      class: 'String',
      name: 'AccountId',
    },
    {
      class: 'String',
      name: 'fundingBalanceId',
      documentation: 'id of the AFEX funding balance response'
    },
    {
      class: 'String',
      name: 'valueDate'
    },
    {
      documentation: `Defined by ISO 20022 (Pacs008)`,
      class: 'String',
      name: 'messageId',
      visibility: 'RO',
      hidden: true
    }
  ]
});

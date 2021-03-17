/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionSummary',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'id'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.integration.ErrorCode',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode'
    },
    {
      class: 'UnitValue',
      name: 'amount'
    },
    {
      class: 'DateTime',
      name: 'created'
    },
    {
      class: 'DateTime',
      name: 'lastModified'
    }
  ]
});

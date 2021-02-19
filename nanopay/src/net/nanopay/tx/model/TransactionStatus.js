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

foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'TransactionStatus',

  documentation: 'Status for transactions. Purpose of each status would depend on the implementation. The documentation in this file will descibe only existing models.',

  values: [
    {
      name: 'PENDING',
      label: 'Pending',
      documentation: 'CICO: as soon as cico transaction is created it takes PENDING status until it is sent to EFT.',
      ordinal: 0,
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',
    },
    {
      // deprecated
      name: 'REVERSE',
      label: 'Reverse',
      documentation: 'DEPRECATED. CICO: after transaction was marked as COMPLETED we might receive rejection file from EFT. We attempt to reverse balance - REVERSE status occurs when balance reverted successfully. Should never be set manully, the status is calculated.',
      ordinal: 1,
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',
    },
    {
      // deprecated
      name: 'REVERSE_FAIL',
      label: 'ReverseFail',
      documentation: 'DEPRECATED. CICO: after transaction was marked as COMPLETED we might receive rejection file from EFT. We attempt to reverse balance - REVERSE_FAIL status occurs when balance failed to revert. Should never be set manully, the status is calculated.',
      ordinal: 2,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f', 
    },
    {
      name: 'SENT',
      label: 'Sent',
      documentation: 'CICO: transaction takes status SENT when automatically generated CSV file with transactions is sent to EFT.',
      ordinal: 3,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    },
    {
      name: 'DECLINED',
      label: 'Declined',
      documentation: 'CICO: transaction that was rejected by EFT.',
      ordinal: 4,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f', 
    },
    {
      name: 'COMPLETED',
      label: 'Completed',
      documentation: 'Base transaction: status indicating that transaction was successfully proccessed. CICO: after waiting period(2days), we assume transaction was successfully proccessed.',
      ordinal: 5,
      color: '/*%APPROVAL2%*/ #117a41',
      background: '/*%APPROVAL5%*/ #e2f2dd',
    },
    {
      // deprecated
      name: 'REFUNDED',
      label: 'Refunded',
      documentation: 'DEPRECATED. Retail transaction: status of a transaction that was refunded.',
      ordinal: 6,
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',
    },
    {
      name: 'FAILED',
      label: 'Failed',
      documentation: 'CICO: in case confirmation files indicates invalid transactions, those transactions take FAILED status.',
      ordinal: 9,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f', 
    },
    {
      name: 'PAUSED',
      label: 'Paused',
      documentation: 'CICO: PAUSED transactions are being ignored by the system. Example: transaction was voided on EFT portal, the transaction should be marked as PAUSED within the system.', // REVIEW
      ordinal: 10,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    },
    {
      name: 'CANCELLED',
      label: 'Cancelled',
      ordinal: 11,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f', 
    },
    {
      name: 'PENDING_PARENT_COMPLETED',
      label: 'Pending Parent Completed',
      documentation: 'Chained transaction: child transactions are in PENDING_PARENT_COMPLETED and being ignored by the system until all parents go to COMPLETED state.',
      ordinal: 12,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    },
    {
      name: 'SCHEDULED',
      label: 'Scheduled',
      documentation: 'Scheduled transaction specifies the time when transaction needs to be processsed.',
      ordinal: 13,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    }
  ]
});

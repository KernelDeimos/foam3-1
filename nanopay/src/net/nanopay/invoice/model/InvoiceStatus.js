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
    package: 'net.nanopay.invoice.model',
    name: 'InvoiceStatus',
  
    documentation: `The base model for tracking the status of an Invoice. The 
      values in this model will return specific labels on the UI.`,
  
    values: [
      {
        name: 'SCHEDULED',
        documentation: `A status that indicates that the invoice has a scheduled 
          due date, and has not been paid yet.`,
        label: 'Scheduled'
      },
      {
        name: 'OVERDUE',
        documentation: `A status that indicates that the invoice has a passed 
          due date, and has not been paid yet.`,
        label: 'Overdue'
      },
      {
        name: 'UNPAID',
        documentation: 'A status that indicates that the invoice is unpaid.',
        label: 'Unpaid'
      },
      {
        name: 'PAID',
        documentation: 'A status that indicates that the invoice has been paid.',
        label: 'Complete'
      },
      {
        name: 'VOID',
        documentation: 'A status that indicates the invoice has been voided.',
        label: 'Void'
      },
      {
        name: 'FAILED',
        documentation: 'A status that indicates the invoice transaction failed.',
        label: 'Transaction failed'
      },
      {
        name: 'PROCESSING',
        documentation: `A status that indicates that the invoice has been paid, 
          but that payment is still in processing.`,
        label: 'Processing'
      },
      {
        name: 'PENDING_ACCEPTANCE',
        documentation: `A status that indicates that the invoice has been paid by 
          moving money into Payer owned holding account(default DigitalAccount), 
          and is pending Payee acceptance of transfer.`,
        label: 'Pending acceptance'
      },
      {
        name: 'DEPOSITING_MONEY',
        documentation: `A status that indicates that the invoice has been paid by 
          moving money into the Payer's owned holding account (default DigitalAccount), 
          and is now moving to the Payee's BankAccount.`,
        label: 'Depositing money'
      },
      {
        name: 'DRAFT',
        documentation: 'A status that indicates that the invoice is a draft.',
        label: 'Draft'
      },
      {
        name: 'PENDING_APPROVAL',
        documentation: `A status that indicates that the invoice still needs to be 
          approved and paid.`,
        label: 'Pending approval'
      },
      {
        name: 'QUOTED',
        documentation: 'A status that indicates that the invoice is being used to create a quote for a transaction',
        label: 'Quote'
      },
      {
        name: 'SUBMIT',
        documentation: 'A status that indicates that the quoting invoice is ready to be submited as a transaction',
        label: 'Submit'
      },
      {
        name: 'REJECTED',
        documentation: 'A status that indicates the invoice has been rejected.',
        label: 'Rejected'
      }
    ]
  });

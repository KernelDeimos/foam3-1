foam.ENUM({
  package: 'net.nanopay.invoice.model',
  name: 'PaymentStatus',

  documentation: 'Keeps track of the payment state of an invoice.',

  values: [
    {
      name: 'NONE',
      documentation: 'The invoice has not been paid yet.',
      label: 'None'
    },
    {
      name: 'NANOPAY',
      documentation: 'The invoice has been paid using the nanopay platform.',
      label: 'paid'
    },
    {
      name: 'CHEQUE',
      documentation: 'The invoice has been paid.',
      label: 'Paid'
    },
    {
      name: 'VOID',
      documentation: 'The invoice has been voided.',
      label: 'Void'
    },
    {
      name: 'PENDING',
      documentation: 'The invoice has been paid, but that payment hasn\'t been confirmed yet.',
      label: 'Pending'
    },
    {
      name: 'HOLDINGS',
      documentation: 'The invoice has been paid, but the payment is in Holdings account.',
      label: 'Holding'
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InternationalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    // TODO/REVIEW: this should just use referenceNumber
    // {
    //   class: 'Long',
    //   name: 'impsReferenceNumber',
    //   label: 'IMPS Reference Number',
    //   visibility: 'RO'
    // },
    {
      // class: 'FObjectProperty',
      class: 'Reference',
      of: 'net.nanopay.tx.TransactionPurpose',
      name: 'purpose',
      label: 'Purpose',
      visibility: 'RO',
      documentation: 'Transaction purpose'
    },
  ]
});

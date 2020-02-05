foam.CLASS({
  package: 'net.nanopay.tx.rbc.iso20022file',
  name: 'RbcRecord',

  documentation: `RBC Transactions and ISO20022 Messages`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
  ],

  properties: [
    {
      name: 'transactions',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      transient: true,
      javaFactory: 'return new Transaction[0];'
    },
    {
      name: 'file',
      class: 'Reference',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcISO20022File'
    },
    {
      name: 'fileCreationTimeEDT',
      class: 'String'
    },
    {
      name: 'transmissionHeader',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcTransmissionHeader',
      transient: true
    },
  ],
});

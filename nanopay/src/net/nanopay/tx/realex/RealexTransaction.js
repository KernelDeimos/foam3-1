foam.CLASS({
  package: 'net.nanopay.tx.realex',
  name: 'RealexTransaction',
  extends: 'net.nanopay.tx.model.TopUpTransaction',

  properties: [
    {
      documentation: `Payment Platform specific data.`,
      class: 'FObjectProperty',
      name: 'paymentAccountInfo',
      of: 'net.nanopay.cico.model.PaymentAccountInfo'
    }
  ]
});

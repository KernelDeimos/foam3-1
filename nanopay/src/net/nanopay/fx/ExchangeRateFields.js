foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ExchangeRateFields',

  properties: [
      {
        class: 'Double',
        name: 'rate'
      },
      {
        class: 'String',
        name: 'dealReferenceNumber',
      },
      {
        class: 'String',
        name: 'fxStatus',
      },
      {
        class: 'DateTime',
        name: 'expirationTime'
      },
      {
        class: 'DateTime',
        name: 'valueDate'
      },
      {
        class: 'Reference',
        of: 'foam.core.Currency',
        name: 'sourceCurrency'
      },
      {
        class: 'Reference',
        of: 'foam.core.Currency',
        name: 'targetCurrency'
      },
      {
        class: 'Double',
        name: 'sourceAmount',
        value: 0
      },
      {
        class: 'Double',
        name: 'targetAmount',
        value: 0
      }
  ]
});

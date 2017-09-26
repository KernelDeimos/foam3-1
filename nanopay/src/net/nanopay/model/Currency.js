foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Currency',

  documentation: 'Currency information.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      required: true
    },
    {
      class: 'String',
      name: 'code',
      required: true
    },
    {
      class: 'Long',
      name: 'precision',
      required: true
    },
    {
      class: 'String',
      name: 'symbol',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country'
    },
    {
      class: 'String',
      name: 'delimiter'
    },
    {
      class: 'String',
      name: 'leftOrRight'
    }
  ]
});
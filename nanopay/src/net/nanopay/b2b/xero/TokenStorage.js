foam.CLASS({
  package: 'net.nanopay.b2b.xero',
  name: 'TokenStorage',

  properties:[
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'token'
    },
    {
      class: 'String',
      name: 'tokenSecret'
    },
    {
      class: 'String',
      name: 'sessionHandle'
    },
    {
      class: 'String',
      name: 'tokenTimestamp'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PurposeCode',
  documentation: 'Purpose code for Indian payments.',

  ids: ['code'],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeGroup',
      name: 'group'
    },
    {
      class: 'String',
      name: 'code',
      validateObj: function(code) {
        if ( code == '' ) {
          return 'Please enter a purpose code.';
        }
      }
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'send',
      documentation: 'Whether purpose code is used in sending / receiving payment'
    },
  ]
});

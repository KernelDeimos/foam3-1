foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Payee',
  documentation: 'Transaction recipient',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'middleName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name:  'nationalId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Phone',
      name:  'phone'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name:  'address'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Account',
      name:  'account'
    }
  ]
});

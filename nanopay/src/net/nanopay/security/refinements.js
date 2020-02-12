foam.CLASS({
  package: 'net.nanopay.security',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Short',
      name: 'loginAttempts',
      value: 0,
      createVisibility: 'HIDDEN',
      section: 'administrative'
    },
    {
      documentation: 'Visibility in Global Directory / Parners lookup',
      name: 'isPublic',
      class: 'Boolean',
      value: true,
      section: 'administrative'
    },
    {
      class: 'DateTime',
      name: 'nextLoginAttemptAllowedAt',
      type: 'Date',
      javaFactory: 'return new Date();',
      section: 'administrative'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'TransactionRefine',
  refines: 'net.nanopay.tx.model.Transaction',
  properties: [
    {
      class: 'List',
      name: 'signatures',
      documentation: 'List of signatures for a given transaction',
      javaType: 'java.util.ArrayList<net.nanopay.security.Signature>',
      includeInSignature: false,
      visibilityExpression: function(signatures) {
        return signatures ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'TransferRefine',
  refines: 'net.nanopay.tx.Transfer',
  properties: [
    {
      class: 'List',
      name: 'signatures',
      documentation: 'List of signatures for a given transaction',
      javaType: 'java.util.ArrayList<net.nanopay.security.Signature>',
      includeInSignature: false,
    }
  ]
});

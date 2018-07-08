foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Branch',
  // relationship: Institution
  documentation: 'Bank/Institution Branch Information.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      required: true,
      visibility: foam.u2.Visibility.RO
   },
    {
      class: 'String',
      name: 'branchId',
      required: true,
      documentation: 'Institution Branch identifier - such as the Indian Financial System Code',
    },
    {
      class: 'String',
      name: 'clearingSystemIdentification'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Bank branch address',
      factory: function() {
        return new foam.nanos.auth.Address();
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionPurpose',
  documentation: 'Purpose of the transaction',
  // relationships: Processor
  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'purposeCode',
      documentation: 'A code indicating the purpose of a transaction.',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: 'Country associated with transaction purpose. If the format type is "Proprietary", assign it to the country it belongs to'
    },
    {
      class: 'String',
      name: 'formatType',
      documentation: 'Determines if ISO20022 or proprietary',
      required: true
    },
    {
      class: 'String',
      name: 'classificationName',
      documentation: 'Group in which the transaction purpose belongs to.'
    },
    {
      class: 'String',
      name: 'classificationNumber',
      documentation: 'Number associated to classification group.'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the the transaction purpose.',
      required: true,
      swiftName: 'desc'
    },
    {
      class: 'Boolean',
      name: 'isB2B',
      documentation: 'Determines if purpose type applied to B2B users.',
      required: true,
      factory: function() {
        return true;
      }
    },
    {
      class: 'Boolean',
      name: 'isP2P',
      documentation: 'Determines if purpose type applies to P2P users.',
      required: true,
      factory: function() {
        return true;
      }
    },
    {
      documentation: 'Should this purpose code be sent to Interac?',
      class: 'Boolean',
      name: 'interacApplicable',
      value: false
    },
  ]
});

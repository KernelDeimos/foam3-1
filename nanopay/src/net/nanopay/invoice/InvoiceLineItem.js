foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'InvoiceLineItem',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
      hidden: true
    },
    {
      class: 'String',
      name: 'group',
      label: 'Type'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'UnitValue',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'currency',
      value: 'CAD'
    }
  ],

  methods: [
    function toSummary() {
      return this.description;
    }
  ]
});

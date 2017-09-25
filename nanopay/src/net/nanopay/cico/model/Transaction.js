foam.CLASS({
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.TransactionStatus',
      name: 'status'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.TransactionType',
      name: 'type'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.cico.model.ServiceProvider',
      name: 'providerId'
    }
  ]
});
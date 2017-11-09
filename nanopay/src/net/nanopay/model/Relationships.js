foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.BankAccount',
  targetModel: 'net.nanopay.model.Branch',
  forwardName: 'bankAccount',
  inverseName: 'bankNumber'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Broker',
  targetModel: 'foam.nanos.auth.Country',
  forwardName: 'countries',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Broker',
  targetModel: 'net.nanopay.model.Currency',
  forwardName: 'currencies',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.model.Account',
  forwardName: 'accounts',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.model.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'owner',
  cardinality: '1:*'
});

/*
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.tx.model.TransactionLimit',
  forwardName: 'transactionLimits',
  inverseName: 'owner'
});
*/

// Store Transaction Limits as an internal array rather than as an external DAO
foam.CLASS({
  refines: 'foam.nanos.auth.User',
  properties: [
    {
      class: 'Boolean',
      name: 'emailVerified',
      documentation: 'Email verified flag'
    },
    {
      class: 'FObjectArray',
      name: 'transactionLimits',
      of: 'net.nanopay.tx.model.TransactionLimit'
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.retail.model.Device',
  forwardName: 'devices',
  inverseName: 'user'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.cico.model.ServiceProvider',
  targetModel: 'foam.nanos.auth.Country',
  forwardName: 'countries',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.cico.model.ServiceProvider',
  targetModel: 'net.nanopay.model.Currency',
  forwardName: 'currencies',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.invoice.model.RecurringInvoice',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'invoices',
  inverseName: 'recurringInvoice'
});

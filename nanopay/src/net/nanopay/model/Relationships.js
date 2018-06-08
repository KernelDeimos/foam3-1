// foam.RELATIONSHIP({
//   sourceModel: 'net.nanopay.model.BankAccount',
//   targetModel: 'net.nanopay.model.Branch',
//   forwardName: 'bankAccount',
//   inverseName: 'bankNumber'
// });

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Branch',
  targetModel: 'net.nanopay.model.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'branch',
  cardinality: '1:*',
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.TransactionPurpose',
  targetModel: 'net.nanopay.payment.InstitutionPurposeCode',
  forwardName: 'institutions',
  inverseName: 'transactionPurposeId',
  cardinality: '1:*',
});

// foam.RELATIONSHIP({
//   sourceModel: 'net.nanopay.payment.Institution',
//   targetModel: 'net.nanopay.tx.TransactionPurpose',
//   forwardName: 'purposes',
//   inverseName: 'institution',
//   cardinality: '1:*',
// });

// foam.RELATIONSHIP({
//   sourceModel: 'net.nanopay.payment.Institution',
//   targetModel: 'net.nanopay.model.Branch',
//   forwardName: 'branches',
//   inverseName: 'owner',
//   cardinality: '1:*',
// });

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.model.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceProperty: {
    hidden: true
  }
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
  targetModel: 'net.nanopay.model.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'owner',
  cardinality: '1:*'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.cico.paymentCard.model.PaymentCard',
  forwardName: 'paymentCards',
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
      class: 'FObjectArray',
      name: 'transactionLimits',
      of: 'net.nanopay.tx.model.TransactionLimit'
    }
  ]
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

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.liquidity.model.Threshold',
  forwardName: 'thresholds',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.liquidity.model.BalanceAlert',
  forwardName: 'balanceAlerts',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'partners',
  inverseName: 'partners'
});


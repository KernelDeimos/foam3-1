foam.CLASS({
  package: 'net.nanopay.tx.stripe',
  name: 'StripeTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  javaImports: [
    'net.nanopay.tx.Transfer',
    'java.util.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'stripeTokenId',
      documentation: 'For most Stripe users, the source of every charge is a' +
        ' credit or debit card. Stripe Token ID is the hash of the card' +
        ' object describing that card. Token IDs cannot be stored or used' +
        ' more than once.'
    },
    {
      class: 'String',
      name: 'stripeChargeId',
      documentation: 'Stripe charge id is a unique identifier for every' +
        ' Charge object.'
    },
    {
      class: 'String',
      name: 'notes',
      visibility: foam.u2.Visibility.RO,
      documentation: 'Transaction notes'
    },
    {
      class: 'Long',
      name: 'fee'
    },
    {
      class: 'String',
      name: 'mobileToken'
    },
    {
      class: 'Long',
      name: 'paymentCardId'
    },
    {
      class: 'Boolean',
      name: 'isRequestingFee'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.CICOPaymentType',
      name: 'paymentType'
    },
    {
      class: 'Reference',
      name: 'currencyId',
      of: 'net.nanopay.model.Currency'
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public HashMap<String, Transfer[]> mapTransfers() {

              HashMap<String, Transfer[]> hm = new HashMap<String, Transfer[]>();
              if ( ! isActive() ) return hm;
              hm.put(getSourceCurrency(), new Transfer[]{
                new Transfer((Long) getDestinationAccount(),  getTotal())
              });
              return hm;
            }
        `}));
      }
    }
  ],
});

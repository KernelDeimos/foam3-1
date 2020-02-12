foam.CLASS({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  implements: [
    'net.nanopay.tx.bmo.cico.BmoTransaction'
  ],

  properties: [
    {
      name: 'bmoReferenceNumber',
      class: 'String'
    },
    {
      name: 'bmoFileCreationNumber',
      class: 'Int'
    },
    {
      name: 'rejectReason',
      class: 'String'
    },
    {
      name: 'settled',
      class: 'Boolean'
    }
  ],

  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        if ( other instanceof BmoCOTransaction ) {
          setBmoReferenceNumber( ((BmoCOTransaction) other).getBmoReferenceNumber() );
          setBmoFileCreationNumber( ((BmoCOTransaction) other).getBmoFileCreationNumber() );
          setRejectReason( ((BmoCOTransaction) other).getRejectReason() );
          setSettled( ((BmoCOTransaction) other).getSettled() );
        }
      `
    }
  ]
});

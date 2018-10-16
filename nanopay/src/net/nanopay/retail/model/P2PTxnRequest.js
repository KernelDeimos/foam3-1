foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'P2PTxnRequest',
  documentation: `This is the request object that is created when a peer request money from another peer.`,

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO,
    },
    {
      class: 'EMail',
      name: 'requesterEmail',
      label: `Requester's Email`,
      visibility: foam.u2.Visibility.RO,
    },
    {
      class: 'EMail',
      name: 'requesteeEmail',
      label: `Requestee's email`,
      visibility: foam.u2.Visibility.RO,
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'requester',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'requestee',
      storageTransient: true
    },
    {
      class: 'DateTime',
      name: 'dateRequested',
      label: 'Date Requested'
    },
    {
      class: 'DateTime',
      name: 'lastUpdated',
      label: 'Last Updated',
    },
    {
      class: 'Currency',
      name: 'amount',
      label: 'Amount',
      visibility: foam.u2.Visibility.RO,
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.retail.model.P2PTxnRequestStatus',
      name: 'status'
    }
  ]

});

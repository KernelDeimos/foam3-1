foam.ENUM({
  package: 'net.nanopay.model',
  name: 'InvitationStatus',

  documentation: 'Invitation status (open, accepted, ignored, completed, cancelled)',

  values: [
    { name: 'SENT', label: 'Sent' },
    { name: 'ACCEPTED', label: 'Accepted' },
    { name: 'IGNORED', label: 'Ignored' },
    { name: 'COMPLETED', label: 'Completed' },
    { name: 'CANCELLED', label: 'Cancelled' }
  ]
});

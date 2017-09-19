foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'Device',
  ids: ['serialNumber'],

  tableColumns: ['name', 'type', 'serialNumber', 'status'],

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'type',
      required: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.retail.model.DeviceStatus',
      name: 'status'
    },
    {
      class: 'String',
      name: 'serialNumber',
      label: 'Serial No.',
      required: true
    }
  ]
});

// foam.RELATIONSHIP({
//   sourceModel: 'foam.nanos.auth.User',
//   targetModel: 'net.nanopay.retail.model.Device',
//   forwardName: 'devices',
//   inverseName: 'user'
// });
foam.CLASS({
  refines: 'foam.nanos.app.AppConfig',
  properties: [
    {
      class: 'String',
      name: 'appLink',
      value: 'https://itunes.apple.com/ca/app/mintchip/id1051748158?mt=8'
    },
    {
      class: 'String',
      name: 'playLink',
      value: 'https://play.google.com/store/apps/details?id=net.nanopay.mintchip_android'  
    },
    {
      class: 'Boolean',
      name: 'whiteListEnabled',
      documentation: `Enables white labeling on ablii sign up.`
    }
  ]
});

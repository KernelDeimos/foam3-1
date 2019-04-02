foam.CLASS({
  package: 'net.nanopay.accounting.quickbooks',
  name: 'QuickbooksToken',

  documentation: 'Model to hold the token data for QuickBooks users.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'csrf',
      documentation: 'Cross-site request forgery token.'
    },
    {
      class: 'String',
      name: 'realmId'
    },
    {
      class: 'String',
      name: 'businessName'
    },
    {
      class: 'String',
      name: 'authCode'
    },
    {
      class: 'String',
      name: 'accessToken'
    },
    {
      class: 'String',
      name: 'refreshToken'
    },
    {
      class: 'String',
      name: 'appRedirect'
    },
    {
      class: 'String',
      name: 'portalRedirect'
    },
    {
      class: 'String',
      name: 'quickBank',
    }
  ]
});

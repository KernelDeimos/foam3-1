foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'PaymentPlatformUserReference',
  documentation: `The model use to store user reference that record in a specified payment platform.
                  We do not store payment card info in our system, so we need to store payment card info in the payment platform that user will use.
                  Then, we need to let payment platform to create a user and store the cards.
                  The user reference use to specify user in the payment platform`,

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'realexUserReference'
    }
  ]
})
foam.CLASS({
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input merchant information',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  css:`
    ^ .labelTitle {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #093649;
      margin-bottom: 20px;
    }
    ^ .topMargin {
      margin-top: 20px;
    }
    ^ .rightMargin {
      margin-right: 10px;
    }
    ^ .infoContainer{
      height: 185px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'firstName',
      postSet: function(oldValue, newValue) {
        this.viewData.firstName = newValue;
      }
    },
    {
      class: 'String',
      name: 'lastName',
      postSet: function(oldValue, newValue) {
        this.viewData.lastName = newValue;
      }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      postSet: function(oldValue, newValue) {
        this.viewData.phoneNumber = newValue;
      }
    },
    {
      class: 'Password',
      name: 'password',
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Fill in merchant\'s information and create a password.' },
    { name: 'MerchantInformationLabel', message: 'Merchant Information' },
    { name: 'FirstNameLabel', message: 'First Name *' },
    { name: 'LastNameLabel', message: 'Last Name *' },
    { name: 'PhoneNumberLabel', message: 'Phone Number *' },
    { name: 'PasswordLabel', message: 'Password *' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').addClass('pDefault stepTopMargin').add(this.Step).end()
          .start().addClass('infoContainer')
            .start().add(this.MerchantInformationLabel).addClass('labelTitle').end()
            .start().addClass('inline')
              .start().add(this.FirstNameLabel).addClass('infoLabel').end()
              .start(this.FIRST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(this.LastNameLabel).addClass('infoLabel').end()
              .start(this.LAST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline topMargin')
              .start().add(this.PhoneNumberLabel).addClass('infoLabel').end()
              .start(this.PHONE_NUMBER).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right topMargin')
              .start().add(this.PasswordLabel).addClass('infoLabel').end()
              .start(this.PASSWORD).addClass('inputLarge').end()
            .end()
          .end()
        .end();
    }
  ]
});
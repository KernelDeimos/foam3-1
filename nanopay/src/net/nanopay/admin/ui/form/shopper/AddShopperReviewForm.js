foam.CLASS({
  package: 'net.nanopay.admin.ui.form.shopper',
  name: 'AddShopperReviewForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to review shopper information to make sure its correct',

  imports: [
    'formatCurrency',
    'goBack',
    'goNext',
    'viewData'
  ],

  css:`
    ^ .greenLabel {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #2cab70;
    }
    ^ .shopperImage {
      width: 53px;
      height: 53px;
      margin-top: 10px;
      display: inline-block;
    }
    ^ .shopperName {
      position: relative;
      bottom: 20;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      display: inline-block;
      margin-left: 25px;
    }
    ^ .boldLabel {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.3px;
      color: #093649;
      margin-bottom: 15px;
    }
    ^ .infoText {
      font-size: 12px;
      letter-spacing: 0.3px;
      color: #093649;
    }
    ^ .rightMargin {
      margin-right: 80px;
    }
    ^ .alignTopWithMargin {
      vertical-align: top;
      margin-left: 160px;
    }
  `,

  messages: [
    { name: 'Step', message: 'Step 2: Please review all the information details of the user.' },
    { name: 'ShopperInfoLabel', message: 'Shopper Info' },
    { name: 'EmailLabel', message: 'Email' },
    { name: 'PhoneNumberLabel', message: 'Phone No.' },
    { name: 'BirthdayLabel', message: 'Birthday' },
    { name: 'AddressLabel', message: 'Address' },
    { name: 'PasswordLabel', message: 'Password' },
    { name: 'SendMoneyLabel', message: 'Send Money' },
    { name: 'AmountLabel', message: 'Sending Amount' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var formattedBirthday = this.viewData.birthday.toISOString().substring(0, 10);

      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Step).addClass('pDefault stepTopMargin').end()
          .start().addClass('infoContainer')
            .start().add(this.ShopperInfoLabel).addClass('greenLabel').end()
            .start().addClass('bottomMargin')
              .start().addClass('shopperImage')
                .tag({
                  class: 'foam.nanos.auth.ProfilePictureView',
                  data: this.viewData.profilePicture,
                  uploadHidden: true
                })
              .end()
              .start().add(this.viewData.firstName + ' ' + this.viewData.lastName).addClass('shopperName').end()
            .end()
            .start().addClass('inline')
              .start().add(this.EmailLabel).addClass('boldLabel').end()
              .start().add(this.viewData.emailAddress).addClass('infoText bottomMargin').end()
              .start().add(this.BirthdayLabel).addClass('boldLabel').end()
              .start().add(formattedBirthday).addClass('infoText bottomMargin').end()
            .end()
            .start().addClass('inline alignTopWithMargin')
              .start().add(this.PhoneNumberLabel).addClass('boldLabel').end()
              .start().add(this.viewData.phoneNumber).addClass('infoText bottomMargin').end()
              .start().add(this.AddressLabel).addClass('boldLabel').end()
              .start().add(this.viewData.streetNumber + ' ' + this.viewData.streetName).addClass('infoText').end()
              .start().add(this.viewData.postalCode).addClass('infoText').end()
              .start().add(this.viewData.addressLine).addClass('infoText').end()
              .start().add(this.viewData.city + ' ' + this.viewData.province).addClass('infoText').end()
            .end()
            .start().add(this.SendMoneyLabel).addClass('greenLabel bottomMargin').end()
            .start().addClass('inline')
              .start().add(this.AmountLabel).addClass('boldLabel').end()
              .start().add(this.formatCurrency(this.viewData.amount/100)).addClass('infoText bottomMargin').end()
            .end()
          .end()
        .end();
    }
  ]
});

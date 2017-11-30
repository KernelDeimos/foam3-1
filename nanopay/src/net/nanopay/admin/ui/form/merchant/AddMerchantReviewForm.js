foam.CLASS({
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantReviewForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to review merchant information to make sure its correct',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .greenLabel {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
          color: #2cab70;
        }
        ^ .businessImage {
          width: 53px;
          height: 53px;
          margin-top: 20px;
          display: inline-block;
        }
        ^ .businessName {
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
          width: 150px;
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
      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 3: Please scroll down and review all the details of the merchant.' },
    { name: 'MerchantInfoLabel', message: 'Merchant Info' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'EmailLabel', message: 'Email' },
    { name: 'PhoneLabel', message: 'Phone' },
    { name: 'PasswordLabel', message: 'Password' },
    { name: 'BusinessProfileLabel', message: 'Business Profile' },
    { name: 'CompanyEmailLabel', message: 'Company Email' },
    { name: 'CompanyTypeLabel', message: 'Company Type' },
    { name: 'RegistrationNumberLabel', message: 'Registration Number' },
    { name: 'BusinessSectorLabel', message: 'Business Sector' },
    { name: 'WebsiteLabel', message: 'Website' },
    { name: 'AddressLabel', message: 'Address' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Step).addClass('pDefault stepTopMargin').end()
          .start().addClass('infoContainer')
            .start().add(this.MerchantInfoLabel).addClass('greenLabel bottomMargin').end()
            .start().addClass('inline')
              .start().add(this.FirstNameLabel).addClass('boldLabel').end()
              .start().add(this.viewData.firstName).addClass('infoText bottomMargin').end()
              .start().add(this.EmailLabel).addClass('boldLabel').end()
              .start().add(this.viewData.companyEmail).addClass('infoText bottomMargin').end()
              .start().add(this.PasswordLabel).addClass('boldLabel').end()
              .start().add(this.viewData.password).addClass('infoText bottomMargin').end()
            .end()
            .start().addClass('inline alignTopWithMargin')
              .start().add(this.LastNameLabel).addClass('boldLabel').end()
              .start().add(this.viewData.lastName).addClass('infoText bottomMargin').end()
              .start().add(this.PhoneLabel).addClass('boldLabel').end()
              .start().add(this.viewData.phoneNumber).addClass('infoText').end()
            .end()
            .start().add(this.BusinessProfileLabel).addClass('greenLabel').end()
            .start().addClass('bottomMargin')
              .start({ class: 'foam.u2.tag.Image', data: 'images/business-placeholder.png' }).addClass('businessImage').end()
              .start().add(this.viewData.businessName).addClass('businessName').end()
            .end()
            .start().addClass('inline')
              .start().add(this.CompanyEmailLabel).addClass('boldLabel').end()
              .start().add(this.viewData.companyEmail).addClass('infoText bottomMargin').end()
              .start().add(this.RegistrationNumberLabel).addClass('boldLabel').end()
              .start().add(this.viewData.registrationNumber).addClass('infoText bottomMargin').end()
              .start().add(this.WebsiteLabel).addClass('boldLabel').end()
              .start().add(this.viewData.website).addClass('infoText').end()
            .end()
            .start().addClass('inline alignTopWithMargin')
              .start().add(this.CompanyTypeLabel).addClass('boldLabel').end()
              .start().add(this.viewData.businessType).addClass('infoText bottomMargin').end()
              .start().add(this.BusinessSectorLabel).addClass('boldLabel').end()
              .start().add(this.viewData.businessSector).addClass('infoText bottomMargin').end()
              .start().add(this.AddressLabel).addClass('boldLabel').end()
              .start().add(this.viewData.streetNumber + ' ' + this.viewData.streetName).addClass('infoText').end()
              .start().add(this.viewData.postalCode).addClass('infoText').end()
              .start().add(this.viewData.addressLine).addClass('infoText').end()
              .start().add(this.viewData.city + ' ' + this.viewData.province + ' ' + this.viewData.country).addClass('infoText').end()
            .end()

          .end()
        .end();
    }
  ]
}); 
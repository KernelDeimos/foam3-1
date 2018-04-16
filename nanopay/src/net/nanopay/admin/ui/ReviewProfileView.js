foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'ReviewProfileView',
  extends: 'foam.u2.View',

  documentation: 'View that holds user profile information',

  imports: [
    'businessTypeDAO'
  ],

  css: `
    ^ .container {
      width: 540px;
      margin: 0 auto;
    }
    ^ h2 {
      height: 20px;
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
    }
    ^ .principalOwnerLabel {
      margin: 0 auto;
      margin-top: 20px;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: 0.2px;
      color: #093649;
      width: 540px;
    }
    ^ .principalOwnerContainer {
      padding-left: 25px;
      width: 540px;
      margin: 0 auto;
    }
    ^ .net-nanopay-invoice-ui-InvoiceFileView {
      min-width: 520px;
      height: 30px;
      padding-top: 10px;
    }
  `,

  messages: [
    { name: 'BoxTitle1', message: 'Previously Submitted Additional Documents' },
    { name: 'BoxTitle2', message: '1. Business Profile' },
    { name: 'BoxTitle3', message: "2. Principal Owner's Profile" },
    { name: 'BoxTitle4', message: '3. Questionnaire' },
    { name: 'CloseLabel', message: 'Close' },
    { name: 'BusiNameLabel', message: 'Registered Business Name' },
    { name: 'BusiPhoneLabel', message: 'Business Phone' },
    { name: 'BusiWebsiteLabel', message: 'Website (optional)' },
    { name: 'BusiTypeLabel', message: 'Business Type' },
    { name: 'BusiRegNumberLabel', message: 'Business Registration Number' },
    { name: 'BusiRegAuthLabel', message: 'Registration Authority'},
    { name: 'BusiRegDateLabel', message: 'Registration Date' },
    { name: 'BusiAddressLabel', message: 'Business Address' },
    { name: 'BusiLogoLabel', message: 'Business Logo (optional)' }
  ],

  properties: [
    'businessTypeName',
    'data'
  ],

  methods: [
    function initE() {

      var self = this;

      this.businessTypeDAO.find(this.data.businessTypeId).then(function(a) {
        self.businessTypeName = a.name;
      });

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            // Additional Documents
            .callIf(this.data.additionalDocuments.length > 0, function () {
              this.start().addClass('wizardBoxTitleContainer')
              .start().add(self.BoxTitle1).addClass('wizardBoxTitleLabel').end()
              .end()
              .add(this.slot(function (documents) {
                if ( documents.length <= 0 ) return;
      
                var e = this.E()
                  .start('span')
                  .end();
      
                for ( var i = 0 ; i < documents.length ; i++ ) {
                  e.tag({
                    class: 'net.nanopay.invoice.ui.InvoiceFileView',
                    data: documents[i],
                    fileNumber: i + 1,
                  });
                }
                return e;
              }, self.data.additionalDocuments$))
            })

            // Business Profile
            .start().addClass('wizardBoxTitleContainer')
              .start().add(this.BoxTitle2).addClass('wizardBoxTitleLabel').end()
            .end()
            .start('p').add(this.BusiNameLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessName$).end()
            .start('p').add(this.BusiPhoneLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessPhone.number$).end()
            .start('p').add(this.BusiWebsiteLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.website$).end()
            .start('p').add(this.BusiTypeLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.businessTypeName$).end()
            .start('p').add(this.BusiRegNumberLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessRegistrationNumber$).end()
            .start('p').add(this.BusiRegAuthLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessRegistrationAuthority$).end()
            .start('p').add(this.BusiRegDateLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessRegistrationDate$.map(function (date) {
              return ( date ) ? date.toISOString().substring(0, 10) : '';
            })).end()
            .start('p').add(this.BusiAddressLabel).addClass('wizardBoldLabel').end()
            .start('p').add(
              this.data.businessAddress.streetNumber + ' '
              + this.data.businessAddress.streetName + ', '
              + this.data.businessAddress.address2 + ' '
              + this.data.businessAddress.city + ', '
              + this.data.businessAddress.regionId + ', '
              + this.data.businessAddress.postalCode
            ).addClass('addressDiv').end()
            .start('p').add(this.BusiLogoLabel).addClass('wizardBoldLabel').end()
            .tag({
              class: 'foam.nanos.auth.ProfilePictureView',
              data: this.data.businessProfilePicture,
              placeholderImage: 'images/business-placeholder.png',
              uploadHidden: true
            })

            // Principal Owner's Profile
            
            .callIf(this.data.principalOwners.length > 0, function () {
              self.start().addClass('container')
                .start().addClass('wizardBoxTitleContainer')
                  .start().add(self.BoxTitle3).addClass('wizardBoxTitleLabel').end()
                .end()
                .start()
                  .forEach(self.data.principalOwners, function (data, index) {
                    self
                    .start('p').add('Principal Owner ' + (index+1).toString()).addClass('principalOwnerLabel').end()
                    .start().addClass('principalOwnerContainer')
                      .start('p').add('Legal Name').addClass('wizardBoldLabel').end()
                      .start('p').add(data.middleName ? data.firstName + ' ' + data.middleName + ' ' + data.lastName : data.firstName + ' ' + data.lastName).end()
                      .start('p').add('Job Title').addClass('wizardBoldLabel').end()
                      .start('p').add(data.jobTitle).end()
                      .start('p').add('Email Address').addClass('wizardBoldLabel').end()
                      .start('p').add(data.email).end()
                      .start('p').add('Phone Number').addClass('wizardBoldLabel').end()
                      .start('p').add(data.phone.number).end()
                      .start('p').add('Principal Type').addClass('wizardBoldLabel').end()
                      .start('p').add(data.principleType).end()
                      .start('p').add('Date of Birth').addClass('wizardBoldLabel').end()
                      .start('p').add(data.birthday.toISOString().substring(0,10)).end()
                      .start('p').add('Residential Address').addClass('wizardBoldLabel').end()
                      .start('p').add(
                          data.address.streetNumber + ' '
                        + data.address.streetName + ', '
                        + data.address.address2 + ' '
                        + data.address.city + ', '
                        + data.address.regionId + ', '
                        + data.address.postalCode
                      ).addClass('addressDiv').end()
                    .end()
                  })
                .end()
              .end()
            })
          
            // Questionaire

            .callIf(this.data.questionnaire, function () {
              self
              .start().addClass('container')
                .start().addClass('wizardBoxTitleContainer')
                  .start().add(self.BoxTitle4).addClass('wizardBoxTitleLabel').end()
                .end()
                .start()
                  .forEach(self.data.questionnaire.questions, function (question) {
                    self
                    .start().addClass('container')
                      .start('p').add(question.question).addClass('wizardBoldLabel').end()
                      .start('p').add(question.response).end()
                    .end()
                  })
                .end()
              .end()
            })
            .br()
            .br()
          .end()
        .end();
      
    }
  ]


  
});
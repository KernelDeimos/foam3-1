foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'ReviewAndSubmitForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form for reviewing details of a new user before adding',

  imports: [
    'businessTypeDAO',
    'countryDAO',
    'regionDAO',
    'user'
  ],

  css: `
    ^ .editImage {
      background-color: %PRIMARYCOLOR%;
      width: fit-content;
      height: 20px;
      float: right;
      position: relative;
      bottom: 19;
      right: 10;
      cursor: pointer;
    }
    ^ .editLabel {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #ffffff;
      line-height: 20px;
    }
    ^ .editImage img {
      vertical-align: middle;
    }
    ^ .editLabel span {
      margin-left: 8px;
      vertical-align: middle;
    }
    ^ .principalOwnerLabel {
      margin-top: 20px;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: 0.2px;
      color: #093649;
    }
    ^ .principalOwnerContainer {
      padding-left: 25px;
    }
    ^ .addressDiv {
      width: 220px;
    }
    ^ .busiLogo {
      border: none;
      padding: 0;
      height: inherit;
    }
    ^ .foam-nanos-auth-ProfilePictureView{
      width: 150px;
    }
  `,

  messages: [
    { name: 'Title', message: 'Review and Submit' },
    { name: 'Description', message: 'Please review your profile details before submitting.' },
    { name: 'BoxTitle1', message: '1. Business Profile' },
    { name: 'BoxTitle2', message: '2. Principal Owner(s) Profile' },
    { name: 'BoxTitle3', message: '3. Questionaire' },
    { name: 'EditLabel', message: 'Edit'},
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
    'businessRegion',
    'businessCountry'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.businessTypeDAO.find(this.viewData.user.businessTypeId).then(function(a) {
        self.businessTypeName = a.name;
      });

      this.regionDAO.find(this.viewData.user.businessAddress.regionId).then(function(a) {
        self.businessRegion = a.name;
      });

      this.countryDAO.find(this.viewData.user.businessAddress.countryId).then(function(a) {
        self.businessCountry = a.name;
      });

      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Description).addClass('wizardDescription').end()

          // Business Profile
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle1).addClass('wizardBoxTitleLabel').end()
            .start(this.EDIT_BUSINESS_PROFILE, { showLabel: true }).addClass('editImage').addClass('editLabel').end()
          .end()
          .start('p').add(this.BusiNameLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessName).end()
          .start('p').add(this.BusiPhoneLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessPhone.number).end()
          .start('p').add(this.BusiWebsiteLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.website).end()
          .start('p').add(this.BusiTypeLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.businessTypeName$).end()
          .start('p').add(this.BusiRegNumberLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessRegistrationNumber).end()
          .start('p').add(this.BusiRegAuthLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessRegistrationAuthority).end()
          .start('p').add(this.BusiRegDateLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessRegistrationDate.toISOString().substring(0, 10)).end()
          .start('p').add(this.BusiAddressLabel).addClass('wizardBoldLabel').end()
          .start('p').add(
            this.viewData.user.businessAddress.streetNumber + ' '
            + this.viewData.user.businessAddress.streetName + ', '
            + this.viewData.user.businessAddress.address2 + ' '
            + this.viewData.user.businessAddress.city + ', '
            + this.viewData.user.businessAddress.regionId + ', '
            + this.viewData.user.businessAddress.countryId + ', '
            + this.viewData.user.businessAddress.postalCode
          ).addClass('addressDiv').end()
          .start('p').add(this.BusiLogoLabel).addClass('wizardBoldLabel').end()
          .tag({
            class: 'foam.nanos.auth.ProfilePictureView',
            data: this.viewData.user.businessProfilePicture,
            placeholderImage: 'images/business-placeholder.png',
            uploadHidden: true
          })

          // Principal Owner's Profile
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle2).addClass('wizardBoxTitleLabel').end()
            .start(this.EDIT_PRINCIPAL_OWNER, { showLabel: true }).addClass('editImage').addClass('editLabel').end()
          .end()
          .start('div')
            .forEach(this.viewData.user.principalOwners, function (data, index) {
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
                  + data.address.address2 + ', '
                  + data.address.city + ', '
                  + data.address.regionId + ', '
                  + data.address.postalCode
                ).addClass('addressDiv').end()
              .end()
            }).end()
          .end()

          // Questionaire
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle3).addClass('wizardBoxTitleLabel').end()
            .start(this.EDIT_QUESTIONAIRE, { showLabel: true }).addClass('editImage').addClass('editLabel').end()
          .end()
          .start('div')
          .forEach(this.viewData.user.questionnaire.questions, function (question) {
            self
              .start('p').add(question.question).addClass('wizardBoldLabel').end()
              .start('p').add(question.response).end()
          }).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'editBusinessProfile',
      icon: 'images/ic-draft.svg',
      label: 'Edit',
      code: function(X) {
        this.goTo(1);
      }
    },
    {
      name: 'editPrincipalOwner',
      icon: 'images/ic-draft.svg',
      label: 'Edit',
      code: function(X) {
        this.goTo(2);
      }
    },
    {
      name: 'editQuestionaire',
      icon: 'images/ic-draft.svg',
      label: 'Edit',
      code: function(X) {
        this.goTo(3);
      }
    }

  ]

});

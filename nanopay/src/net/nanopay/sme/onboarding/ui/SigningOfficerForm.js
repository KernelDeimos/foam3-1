foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'SigningOfficerForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: ` Fourth step in the business registration wizard,
    responsible for collecting signing officer information.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'net.nanopay.model.PersonalIdentification',
    'foam.u2.dialog.Popup',
    'net.nanopay.documents.AcceptanceDocumentService',
    'net.nanopay.documents.AcceptanceDocument'
  ],

  imports: [
    'user',
    'menuDAO',
    'viewData',
    'acceptanceDocumentService',
  ],

  css: `
    ^ {
      width: 488px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-top: 5px;
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
      padding-left: 5px;
    }
    ^ .foam-u2-view-RadioView {
      display: inline-block;
      margin-right: 5px;
      float: right;
      margin-top: 8px;
    }
    ^ .foam-u2-md-CheckBox-label {
      margin-top: -5px;
      margin-left: 10px;
      position: absolute;
      width: 450px;
    }
    ^ .inline {
      margin: 5px;
    }
    ^ .blue-box {
      width: 100%;
      padding: 15px;
      background: #e6eff5;
    }
    ^ .label-width {
      width: 200px;
      margin-left: 0px;
      margin-bottom: 20px;
    }
    ^ .question-container {
      width: 200px;
      margin-left: 0;
      margin-bottom: 40px;
    }
    ^ .radio-button {
      margin-top: 50px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .net-nanopay-ui-ActionView-uploadButton {
      margin-top: 20px;
    }

    ^ .net-nanopay-ui-ActionView-addUsers {
      height: 40px;
      width: 250px;
      background: none;
      color: #8e9090;
      font-size: 16px;
      text-align: left;
    }

    ^ .net-nanopay-ui-ActionView-addUsers:hover {
      background: none;
      color: #8e9090;
    }

    ^ .termsAndConditionsBox {
      position: relative;
      padding: 13px 0;
      width: 200px;
      top: 15px;
    }

    ^ .net-nanopay-sme-ui-fileDropZone-FileDropZone {
      background-color: white;
      margin-top: 16px;
      min-height: 264px;
    }

    ^ .checkBoxes {
      padding-top: 30px;
      padding-bottom: 30px;
    }

    ^ .property-birthdayField {
      width: 100%;
    }

    ^ input[type='checkbox']:checked:after {
      width: 16px;
      height: 18px;
      left: -2px;
      top: -2px;
    }

    ^ input[type='checkbox']:focus{
      border: solid 2px #5a5a5a;
    }

    ^terms-link {
      font-size: 14px !important;
      margin-left: 5px;
      text-decoration: none;
    }
    ^ .link {
      margin-right: 5px;
    }
  `,

  properties: [
    {
      name: 'signingOfficer',
      documentation: 'Radio button determining if user is the signing officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ]
      },
      factory: function() {
        this.nextLabel = this.viewData.agent.signingOfficer ? 'Next' : 'Complete';
        return this.viewData.agent.signingOfficer ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.nextLabel = n === 'Yes' ? 'Next' : 'Complete';
        this.viewData.agent.signingOfficer = n === 'Yes';
      }
    },
    {
      name: 'politicallyExposed',
      documentation: 'Radio button determining if user is the sigining officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ],
        value: 'No'
      },
      factory: function() {
        return this.viewData.agent.PEPHIORelated ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.viewData.agent.PEPHIORelated = n == 'Yes';
      }
    },
    {
      class: 'String',
      name: 'firstNameField',
      documentation: 'First name field.',
      postSet: function(o, n) {
        this.viewData.agent.firstName = n;
      },
      factory: function() {
        return this.viewData.agent.firstName;
      },
    },
    {
      class: 'String',
      name: 'lastNameField',
      documentation: 'Last name field.',
      postSet: function(o, n) {
        this.viewData.agent.lastName = n;
      },
      factory: function() {
        return this.viewData.agent.lastName;
      },
    },
    {
      class: 'String',
      name: 'jobTitleField',
      documentation: 'Job title field.',
      postSet: function(o, n) {
        this.viewData.agent.jobTitle = n;
      },
      factory: function() {
        return this.viewData.agent.jobTitle;
      },
    },
    {
      class: 'String',
      name: 'phoneNumberField',
      documentation: 'Phone number field.',
      postSet: function(o, n) {
        this.viewData.agent.phone.number = n;
      },
      factory: function() {
        return this.viewData.agent.phone.number;
      },
    },
    {
      class: 'String',
      name: 'emailField',
      documentation: 'Email address field.',
      postSet: function(o, n) {
        this.viewData.agent.email = n;
      },
      factory: function() {
        return this.viewData.agent.email;
      },
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocs',
      documentation: 'Additional documents for identification of an agent.',
      factory: function() {
        return this.viewData.agent.additionalDocuments ? this.viewData.agent.additionalDocuments : [];
      },
      postSet: function(o, n) {
        this.viewData.agent.additionalDocuments = n;
      }
    },
    {
      name: 'principalTypeField',
      value: 'Shareholder',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: ['Shareholder', 'Owner', 'Officer']
      },
      postSet: function(o, n) {
        this.viewData.agent.principleType = n;
      },
      factory: function() {
        return this.viewData.agent.principleType.trim() !== '' ? this.viewData.agent.principleType :
          'Shareholder';
      },
    },
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      view: { class: 'net.nanopay.ui.PersonalIdentificationView' },
      factory: function() {
        return this.viewData.agent.identification ? this.viewData.agent.identification : this.PersonalIdentification.create({});
      },
      postSet: function(o, n) {
        this.viewData.agent.identification = n;
      },
    },
    {
      class: 'Boolean',
      name: 'termsCheckBox',
      factory: function() {
        return this.viewData.termsCheckBox;
      },
      postSet: function(o, n) {
        this.viewData.termsCheckBox = n;
      }
    },
    {
      class: 'Date',
      name: 'birthdayField',
      factory: function() {
        return this.viewData.agent.birthday;
      },
      postSet: function(o, n) {
        this.viewData.agent.birthday = n;
      }
    },
    {
      class: 'Boolean',
      name: 'canadianScrollBoxOne',
      postSet: function(o, n) {
        this.viewData.canadianScrollBoxOne = n;
        if ( this.triPartyAgreementCad ) {
          this.updateUserAcceptance(this.triPartyAgreementCad.id, n);
        }
      },
      factory: function() {
        return this.viewData.canadianScrollBoxOne = false;
      }
    },
    {
      class: 'Boolean',
      name: 'canadianScrollBoxTwo',
      postSet: function(o, n) {
        this.viewData.canadianScrollBoxTwo = n;
        if ( this.dualPartyAgreementCad ) {
            this.updateUserAcceptance(this.dualPartyAgreementCad.id, n);
        }
      },
      factory: function() {
        return this.viewData.canadianScrollBoxTwo = false;
      }
    },
    {
      class: 'Boolean',
      name: 'americanScrollBox',
      postSet: function(o, n) {
        this.viewData.americanScrollBox = n;
        if ( this.triPartyAgreementUsd ) {
            this.updateUserAcceptance(this.triPartyAgreementUsd.id, n);
        }
      },
      factory: function() {
        return this.viewData.americanScrollBox = false;
      }
    },
    {
      class: 'Boolean',
      name: 'isCanadian',
      expression: function(viewData) {
        return foam.util.equals(viewData.user.businessAddress.countryId, 'CA');
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'triPartyAgreementCad',
      view: function(args, x) {
        var data = x.data$.dot('triPartyAgreementCad').dot('body');
        return foam.u2.HTMLElement.create({ nodeName: 'div' }).
        style({ 'max-height': '200px', 'overflow-y': 'scroll', border: '1px inset', background: 'lightgray', 'border-radius': '5px', padding: '10px'}).
        add(data);
      },
      displayWidth: 60,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'triPartyAgreementUsd',
      view: function(args, x) {
        var data = x.data$.dot('triPartyAgreementUsd').dot('body');
        return foam.u2.HTMLElement.create({ nodeName: 'div' }).
        style({ 'max-height': '200px', 'overflow-y': 'scroll', border: '1px inset', background: 'lightgray', 'border-radius': '5px', padding: '10px'}).
        add(data);
      },
      displayWidth: 60,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'dualPartyAgreementCad',
      view: function(args, x) {
        var data = x.data$.dot('dualPartyAgreementCad').dot('body');
        return foam.u2.HTMLElement.create({ nodeName: 'div' }).
        style({ 'max-height': '200px', 'overflow-y': 'scroll', border: '1px inset', background: 'lightgray', 'border-radius': '5px', padding: '10px'}).
        add(data);
      },
      displayWidth: 60,
    },
  ],

  messages: [
    { name: 'TITLE', message: 'Signing officer information' },
    { name: 'SIGNING_OFFICER_QUESTION', message: 'Are you a signing officer of your company?' },
    { name: 'INFO_MESSAGE', message: `A signing officer must complete the rest of your business profile. You're all done!` },
    { name: 'INVITE_TITLE', message: 'Invite users to your business' },
    { name: 'FIRST_NAME_LABEL', message: 'First Name' },
    { name: 'LAST_NAME_LABEL', message: 'Last Name' },
    { name: 'PRINCIPAL_LABEL', message: 'Principal Type' },
    { name: 'JOB_LABEL', message: 'Job Title' },
    { name: 'PHONE_NUMBER_LABEL', message: 'Phone Number' },
    { name: 'EMAIL_LABEL', message: 'Email Address' },
    { name: 'BIRTHDAY_LABEL', message: 'Date of birth' },
    { name: 'ADDRESS_HEADING', message: 'Signing officer contact information' },
    { name: 'IDENTIFICATION_TITLE', message: 'Identification' },
    { name: 'SUPPORTING_TITLE', message: 'Add supporting files' },
    {
      name: 'DOMESTIC_QUESTION',
      message: `Are you a domestic or foreign Politically Exposed Person (PEP),
          Head of an International Organization (HIO), or a close associate or
          family member of any such person?`
    },
    {
      name: 'INVITE_INFO',
      message: `Invite a signing officer or other employees in your business.
          Recipients will receive a link to join your business on Ablii`
    },
    {
      name: 'SIGNING_INFORMATION',
      message: `A signing officer is a person legally authorized to act
          on behalf of the business. (e.g. CEO, COO, board director)`
    },
    {
      name: 'ADD_USERS_LABEL',
      message: '+ Add Users'
    },
    {
      name: 'INVITE_USERS_HEADING',
      message: 'Invite users to your business'
    },
    {
      name: 'INVITE_USERS_EXP',
      message: `Invite a signing officer or other employees in your business.
          Recipients will receive a link to join your business on Ablii`
    },
    {
      name: 'SIGNING_OFFICER_UPLOAD_DESC',
      message: `Please provide a copy of your government issued drivers license or passport. 
          The image must be clear, or will require resubmission. If your name differs from what 
          the ID shows, please provide sufficient documentation (marriage certificate, name change documentation, etc)`
    }
  ],

  methods: [
    function init() {
      this.loadAcceptanceDocuments();
    },
    function initE() {
      this.nextLabel = 'Next';
      this.addClass(this.myClass())
      .start()
        .start().addClass('medium-header').add(this.TITLE).end()
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.SIGNING_INFORMATION })
        .start().addClass('label-input')
          .start().addClass('inline').addClass('question-container').add(this.SIGNING_OFFICER_QUESTION).end()
          .start(this.SIGNING_OFFICER).end()
        .end()
        .start().show(this.signingOfficer$.map(function(v) {
          return v == 'Yes';
        }))
          .start().addClass('label-input')
            .start().addClass('label').add(this.FIRST_NAME_LABEL).end()
            .start(this.FIRST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.LAST_NAME_LABEL).end()
            .start(this.LAST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PRINCIPAL_LABEL).end()
            .start(this.PRINCIPAL_TYPE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.JOB_LABEL).end()
            .start(this.JOB_TITLE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PHONE_NUMBER_LABEL).end()
            .start(this.PHONE_NUMBER_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.EMAIL_LABEL).end()
            .start(this.EMAIL_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.BIRTHDAY_LABEL).end()
            .start(this.BIRTHDAY_FIELD).end()
          .end()
          .start().addClass('label').add(this.RESIDENTIAL_ADDRESS_LABEL).end()
          .startContext({ data: this.viewData.agent })
            .tag(this.viewData.agent.ADDRESS.clone().copyFrom({
              view: 'net.nanopay.sme.ui.AddressView'
            }))
          .endContext()
          .start().addClass('label-input')
            .start().addClass('inline').addClass('label-width').add(this.DOMESTIC_QUESTION).end()
            .start(this.POLITICALLY_EXPOSED).addClass('radio-button').end()
          .end()
          .start().addClass('medium-header').add(this.IDENTIFICATION_TITLE).end()
          .start(this.IDENTIFICATION).end()
          // Terms and Services and Compliance stuff
            .start(this.TRI_PARTY_AGREEMENT_CAD).style({ 'margin-top': '30px', 'margin-bottom': '30px' })
              .show(this.isCanadian$)
              .start('a').addClass('sme').addClass('link')
                .addClass(this.myClass('terms-link'))
                .add('Download or Print this Agreement Here')
                .on('click', () => {
                  var link = this.triPartyAgreementCad ? this.triPartyAgreementCad.link : '';
                  window.open(link);
                })
              .end()
            .end()
            .start(this.DUAL_PARTY_AGREEMENT_CAD).style({ 'margin-top': '30px' })
              .show(this.isCanadian$)
              .start('a').addClass('sme').addClass('link')
                .addClass(this.myClass('terms-link'))
                .add('Download or Print this Agreement Here')
                .on('click', () => {
                  var link = this.dualPartyAgreementCad ? this.dualPartyAgreementCad.link : '';
                  window.open(link);
                })
              .end()
            .end()
            .start(this.TRI_PARTY_AGREEMENT_USD).style({ 'margin-top': '30px' })
              .hide(this.isCanadian$)
              .start('a').addClass('sme').addClass('link')
                .addClass(this.myClass('terms-link'))
                .add('Download or Print this Agreement Here')
                .on('click', () => {
                  var link = this.triPartyAgreementUsd ? this.triPartyAgreementUsd.link : '';
                  window.open(link);
                })
              .end()
            .end()
            .start().addClass('checkBoxes').show(this.isCanadian$)
              .start({ class: 'foam.u2.md.CheckBox', label: '', data$: this.canadianScrollBoxOne$ }).add(this.triPartyAgreementCad$.dot('checkboxText')).end()
            .end()
            .start().addClass('checkBoxes').show(this.isCanadian$)
              .start({ class: 'foam.u2.md.CheckBox', label: '', data$: this.canadianScrollBoxTwo$ }).add(this.dualPartyAgreementCad$.dot('checkboxText')).end()
            .end()
            .start().addClass('checkBoxes').hide(this.isCanadian$)
              .start({ class: 'foam.u2.md.CheckBox', label: '', data$: this.americanScrollBox$ }).add(this.triPartyAgreementUsd$.dot('checkboxText')).end()
            .end()
          // End of Terms and Services and Compliance stuff
          .start().addClass('medium-header').add(this.SUPPORTING_TITLE).end()
          .start().add(this.SIGNING_OFFICER_UPLOAD_DESC).end()
          .start({
            class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
            files$: this.additionalDocs$,
            supportedFormats: {
              'image/jpg': 'JPG',
              'image/jpeg': 'JPEG',
              'image/png': 'PNG',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
              'application/msword': 'DOC',
              'application/pdf': 'PDF'
            }
          }).end()
        .end()
      .end()
      .start() .hide(this.signingOfficer$.map(function(v) {
        return v == 'Yes';
      }))
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.INFO_MESSAGE })
        .start().addClass('borderless-container')
          .start().addClass('medium-header').add(this.INVITE_USERS_HEADING).end()
          .start().addClass('body-paragraph').addClass('subdued-text')
            .add(this.INVITE_USERS_EXP)
          .end()
        .end()
          .tag(this.ADD_USERS, { label: this.ADD_USERS_LABEL })
      .end();
    },
    async function updateUserAcceptance(id, val) {
      try {
        this.acceptanceDocumentService
          .updateUserAcceptanceDocument(this.user.id, id, val);
      } catch (error) {
        console.warn('Error updating user accepted document: ', error);
      }
    }
  ],

  listeners: [
    async function loadAcceptanceDocuments() {
      try {
        this.triPartyAgreementCad = await this.acceptanceDocumentService.getAcceptanceDocument('triPartyAgreementCAD', '');
      } catch (error) {
        console.warn('Error occured finding Tri-Party Agreement CAD: ', error);
      }

      try {
        this.triPartyAgreementUsd = await this.acceptanceDocumentService.getAcceptanceDocument('triPartyAgreementUSD', '');
      } catch (error) {
        console.warn('Error occured finding Tri-Party Agreement USD: ', error);
      }

      try {
        this.dualPartyAgreementCad = await this.acceptanceDocumentService.getAcceptanceDocument('dualPartyAgreementCAD', '');
      } catch (error) {
        console.warn('Error occured finding Dual-Party Agreement CAD: ', error);
      }
    },
  ],

  actions: [
    {
      name: 'addUsers',
      isEnabled: (signingOfficer) => signingOfficer === 'No',
      code: function() {
        this.add(this.Popup.create().tag({ class: 'net.nanopay.sme.ui.AddUserToBusinessModal' }));
      }
    },
  ]
});

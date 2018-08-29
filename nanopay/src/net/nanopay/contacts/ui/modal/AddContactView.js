// FUTURE: make send email invite
// FUTURE: Assuming any counrty code, but specifically Canada & US phone numbers 'format: 000-000-0000'
//          --Suggested Fix: could add a Counrty drop down which would then format phone number and counrty code formats
// FUTURE: FIX addContact(Boolean{true if updating, false if new Contact}) - need to put correctly into DAO
//         waiting on final plans for class location before setting data.
// FUTURE: FIX editStart(), which is function that restores data into fields from some table view of contacts - for edit
// NOTE:   To build edit view:  'this.add(this.Popup.create().tag({ class: 'net.nanopay.contacts.ui.modal.AddContactView', data: user, isEdit: true }));'
// NOTE:   To build Add view:   'this.add(this.Popup.create().tag({ class: 'net.nanopay.contacts.ui.modal.AddContactView' }));'
// FUTURE: Consider properties: AccountStatus(PENDING ?) and ComplianceStatus (REQUESTED ?)

foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactView',
  extends: 'foam.u2.Controller',

  documentation: 'View for adding a Contact',

  requires: [
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.u2.CheckBox',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.contacts.Contact'
  ],

  imports: [
    'user',
    'contactDAO',
    'validateEmail',
    'validateNorthAmericanPhoneNumber',
    'validatePhone',
    'validatePhoneCountryCode',
    'validateTitleNumOrAuth'
  ],

  export: [
    'isEdit'
  ],

  css: `
    ^ .container {
       width: 570px;
    }
    ^ .innerContainer {
      width: 540px;
      margin: 10px;
    }
    ^ .nameContainer {
      position: relative;
      height: 64px;
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 30px;
    }
    ^ .header {
      font-size: 30px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
    }
    ^ .description {
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: 0.2px;
      text-align: center;
      color: #093649;
    }
    ^ .label {
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: 0;
      margin-bottom: -1.5px;
    }
    ^ .nameDisplayContainer {
      position: absolute;
      top: 15px;
      left: 0;
      height: 64px;
      width: 100%;
      opacity: 1;
      box-sizing: border-box;
      transition: all 0.15s linear;
      z-index: 10;
    }
    ^ .nameDisplayContainer.hidden {
      left: 540px;
      opacity: 0;
    }
    ^ .nameDisplayContainer p {
      //margin: 0;
      margin-bottom: 8px;
    }
    ^ .legalNameDisplayField {
      width: 100%;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      padding: 12px 13px;
      box-sizing: border-box;
    }
    ^ .nameInputContainer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 64px;
      opacity: 1;
      box-sizing: border-box;
      z-index: 9;
      margin-top: 15px;
    }
    ^ .nameInputContainer.hidden {
      pointer-events: none;
      opacity: 0;
    }
    ^ .phoneFieldsCol {
      display: inline-block;
      vertical-align: middle;
      height: 64px;
      opacity: 1;
      box-sizing: border-box;
      margin-right: 20px;
      margin-bottom: 25px;
      transition: all 0.15s linear;
    }
    ^ .nameFieldsCol {
      display: inline-block;
      vertical-align: middle;
      /* 100% minus 2x 20px padding equally divided by 3 fields */
      width: calc((100% - 40px) / 3);
      height: 64px;
      opacity: 1;
      box-sizing: border-box;
      margin-right: 20px;
      transition: all 0.15s linear;
    }
    ^ .nameFieldsCol:last-child {
      margin-right: 0;
    }
    ^ .nameFieldsCol p {
      margin: 0;
    }
    ^ .nameFieldsCol.first {
      opacity: 0;
    }
    ^ .nameFieldsCol.middle {
      opacity: 0;
      transform: translateX(-166.66px);
    }
    ^ .nameFieldsCol.lastName {
      opacity: 0;
      transform: translateX(-166.66px);
    }
    ^ .nameFields {
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px 13px;
      width: 100%;
      height: 40px;
      box-sizing: border-box;
      outline: none;
    }
    ^ .largeInput {
      height: 40px;
      width: 100%;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .countryCodeInput {
      width: 105px;
      height: 40px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .phoneNumberInput {
      width: 415px;
      height: 40px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .net-nanopay-ui-ActionView-closeButton {
      width: 24px;
      height: 24px;
      margin: 0;
      margin-top: 7px;
      margin-right: 50px;
      cursor: pointer;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      background: transparent;
      box-shadow: none;
    }
    ^ .net-nanopay-ui-ActionView-closeButton:hover {
      background: transparent;
      background-color: transparent;
    }
    ^ .net-nanopay-ui-ActionView-addButton {
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      width: 100%;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-addButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-saveButton {
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      width: 100%;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-deleteButton {
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      width: 100%;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-deleteButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-redDeleteButton {
      border-radius: 2px;
      background-color: red; // %SECONDARYCOLOR%;
      color: white;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
      margin-right: 40px;
      margin-left: 20px;
    }
    ^ .net-nanopay-ui-ActionView-redDeleteButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-cancelDeleteButton {
      border-radius: 2px;
      background-color: green; // %SECONDARYCOLOR%;
      color: white;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
      margin-left: 40px;
      margin-right: 20px;
    }
    ^ .net-nanopay-ui-ActionView-cancelDeleteButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .navigationBar {
      position: fixed;
      width: 100%;
      height: 60px;
      left: 0;
      bottom: 0;
      background-color: white;
      z-index: 100;
    }
    ^ .foam-u2-TextField:focus {
      border: solid 1px #59A5D5;
    }
    ^ .popUpTitle {
      width: 198px;
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      line-height: 40.5px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #ffffff;
      margin-left: 20px;
      display: inline-block;
    }
    ^ .popUpHeader {
      width: 100%;
      height: 6%;
      background-color: %PRIMARYCOLOR%;
    }
    ^ .styleMargin {
      margin-top: 8%;
    }
    ^ .styleReq {
      font-family: Roboto;
      font-size: 10px;
      color: red;
      margin-left: 10px;
    }
  `,

  properties: [
    'data',
    'codeFieldElement',
    'nameFieldElement',
    'phoneFieldElement',
    {
      class: 'Boolean',
      name: 'isEditingName',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedLegalName = '';
        if ( this.firstNameField ) {
          this.displayedLegalName += this.firstNameField;
        }
        if ( this.middleNameField ) {
          this.displayedLegalName += ' ' + this.middleNameField;
        }
        if ( this.lastNameField ) {
          this.displayedLegalName += ' ' + this.lastNameField;
        }
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingPhone',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedPhoneNumber = '';
        if ( this.countryCode ) {
          this.displayedPhoneNumber = this.
            checkCountryCodeFormat(this.countryCode);
        }
        if ( this.phoneNumber ) {
          this.displayedPhoneNumber += ' ' + this.phoneNumber;
        }
      }
    },
    {
      class: 'Boolean',
      name: 'sendEmail'
    },
    {
      class: 'String',
      name: 'displayedLegalName',
      value: ''
    },
    {
      class: 'String',
      name: 'firstNameField',
      value: ''
    },
    {
      class: 'String',
      name: 'middleNameField',
      value: ''
    },
    {
      class: 'String',
      name: 'lastNameField',
      value: ''
    },
    {
      class: 'String',
      name: 'emailAddress'
    },
    {
      class: 'String',
      name: 'displayedPhoneNumber',
      value: '+1'
    },
    {
      class: 'String',
      name: 'countryCode',
      value: '+1'
    },
    {
      class: 'String',
      name: 'phoneNumber'
    },
    {
      class: 'String',
      name: 'companyName'
    },
    {
      class: 'Boolean',
      name: 'isEdit'
    },
    {
      class: 'Boolean',
      name: 'completeSoClose'
    },
    {
      class: 'Boolean',
      name: 'confirmDelete'
    }
  ],

  messages: [
    { name: 'Title', message: 'Add a Contact' },
    { name: 'TitleEdit', message: 'Edit a Contact' },
    { name: 'Description', message: 'Please Fill Contact Details' },
    { name: 'LegalNameLabel', message: 'Name' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'MiddleNameLabel', message: 'Middle Initials (optional)' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'EmailLabel', message: 'Email' },
    { name: 'ConfirmDelete1', message: 'Are you sure you want to delete ' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Num.' },
    { name: 'ConfirmDelete2', message: ' from your contacts list?' },
    { name: 'SendEmailLabel', message: 'Send an Email Invitation' },
    { name: 'Job', message: 'Company Name' },
    { name: 'Req', message: '* Required Field' }

  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      if ( this.isEdit ) this.editStart();
      this
        .addClass(this.myClass())
        .start().hide(self.confirmDelete$)
          .start().addClass('container')
          // Top banner Title and Close [X]
            .start().addClass('popUpHeader')
              .start().add(this.TitleEdit).show(this.isEdit).addClass('popUpTitle').end()
              .start().add(this.Title).show( ! this.isEdit).addClass('popUpTitle').end()
              .add(this.CLOSE_BUTTON)
            .end()
            // SubTitle
            .start().addClass('innerContainer')
              .start('p').add(this.Description).addClass('description').end()
              // Company Name Field - Required
              .start()
                .start('span').add(this.Job).addClass('label').end()
                .start('span').add(this.Req).addClass('styleReq').end()
                .start(this.COMPANY_NAME).addClass('largeInput')
                  .on('focus', function() {
                    self.isEditingPhone = false;
                    self.isEditingName = false;
                  })
                .end()
              .end()
              // Name Field - Required
              .start().addClass('nameContainer')
                .start()
                  .addClass('nameDisplayContainer')
                  .hide(this.isEditingName$)
                  .start('span').add(this.LegalNameLabel).addClass('infoLabel').end()
                  .start('span').add(this.Req).addClass('styleReq').end()
                    .start(this.DISPLAYED_LEGAL_NAME)
                      .addClass('legalNameDisplayField')
                        .on('focus', function() {
                          self.blur();
                          self.nameFieldElement && self.nameFieldElement.focus();
                          self.isEditingName = true;
                          self.isEditingPhone = false;
                        })
                    .end()
                  .end()
                  .start()
                  // Edit Name: on focus seperates First, Middle, Last names Fields
                  // First and Last Name - Required
                    .addClass('nameInputContainer')
                    .enableClass('hidden', this.isEditingName$, true)
                    .start()
                      .addClass('nameFieldsCol')
                      .enableClass('first', this.isEditingName$, true)
                      .start('span').add(this.FirstNameLabel).addClass('infoLabel').end()
                      .start('span').add(this.Req).addClass('styleReq').end()
                      .start(this.FIRST_NAME_FIELD, this.nameFieldElement$)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                    .end()
                    .start()
                      .addClass('nameFieldsCol')
                      .enableClass('middle', this.isEditingName$, true)
                      .start('p').add(this.MiddleNameLabel).addClass('infoLabel').end()
                      .start(this.MIDDLE_NAME_FIELD)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                    .end()
                    .start()
                      .addClass('nameFieldsCol')
                      .enableClass('lastName', this.isEditingName$, true)
                      .start('span').add(this.LastNameLabel).addClass('infoLabel').end()
                      .start('span').add(this.Req).addClass('styleReq').end()
                      .start(this.LAST_NAME_FIELD)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                    .end()
                .end()
              .end()
              .start()
                .on('click', function() {
                  self.isEditingName = false;
                  self.isEditingPhone = false;
                })
                // Email field - Required
                .start()
                  .start('span').add(this.EmailLabel).addClass('label').end()
                  .start('span').add(this.Req).addClass('styleReq').end()
                  .start(this.EMAIL_ADDRESS).addClass('largeInput').end()
                .end()
              .end()
              .start()
              // Phone number Field
                .addClass('nameContainer')
                .start()
                  .addClass('nameDisplayContainer')
                  .hide(this.isEditingPhone$)
                  .start('p').add(this.PhoneNumberLabel).addClass('label').end()
                  .start(this.DISPLAYED_PHONE_NUMBER)
                    .addClass('legalNameDisplayField')
                    .on('focus', function() {
                      self.blur();
                      self.phoneFieldElement && self.phoneFieldElement.focus();
                      self.codeFieldElement && self.codeFieldElement.focus();
                      self.isEditingPhone = true;
                      self.isEditingName = false;
                    })
                  .end()
                .end()
                .start()
                .addClass('nameInputContainer')
                .enableClass('hidden', this.isEditingPhone$, true)
                // Edit phoneNumber: on focus seperates CountryCode and Phone number
                .start()
                  .addClass('phoneFieldsCol')
                  .enableClass('first', this.isEditingPhone$, true)
                  .start('p').add(this.CountryCodeLabel).addClass('label').end()
                  .start(this.COUNTRY_CODE, { placeholder: '+1' }, this.codeFieldElement$).addClass('countryCodeInput')
                    .on('click', function() {
                      self.isEditingPhone = true;
                    })
                  .end()
                .end()
                .start()
                  .addClass('nameFieldsCol')
                  .enableClass('last', this.isEditingPhone$, true)
                  .start('p').add(this.PhoneNumberLabel).addClass('label').end()
                  .start(this.PHONE_NUMBER, { placeholder: 'format: 000-000-0000' }, this.phoneFieldElement$)
                    .addClass('phoneNumberInput')
                    .on('click', function() {
                      self.isEditingPhone = true;
                    })
                    .on('focusout', function() {
                      self.isEditingPhone = false;
                    })
                  .end()
                .end()
              .end()
            .end()
            .start().show( ! this.isEdit ).addClass('styleMargin')
              .start()
                .tag({ class: 'foam.u2.CheckBox', data$: this.sendEmail$ })
                .add(this.SendEmailLabel)
              .end()
              .add(this.ADD_BUTTON)
            .end()
            .start().show( this.isEdit )
              .start().add(this.SAVE_BUTTON).end()
              .start().add(this.DELETE_BUTTON).end()
            .end()
          .end()
        .end();

        // Confirm DeleteView Below - dependent on property: confirmDelete(boolean)
        this
        .start().addClass(this.myClass()).show(this.confirmDelete$)
          .start().addClass('container')
            .start().addClass('popUpHeader')
              .add(this.CLOSE_BUTTON)
            .end()
            .start().addClass('innerContainer')
              .add(this.ConfirmDelete1 + this.displayedLegalName + this.ConfirmDelete2)
            .end()
            .add(this.CANCEL_DELETE_BUTTON)
            .add(this.RED_DELETE_BUTTON)
          .end()
        .end();
    },

    function validations() {
      if ( this.companyName > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Company Name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( this.firstNameField.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( /\d/.test(this.firstNameField) ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot contain numbers', type: 'error' }));
        return false;
      }
      if ( this.middleNameField ) {
        if ( this.middleNameField.length > 70 ) {
          this.add(this.NotificationMessage.create({ message: 'Middle initials cannot exceed 70 characters.', type: 'error' }));
          return false;
        }
        if ( /\d/.test(this.middleNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'Middle initials cannot contain numbers', type: 'error' }));
          return false;
        }
      }
      if ( this.lastNameField.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( /\d/.test(this.lastNameField) ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot contain numbers.', type: 'error' }));
        return false;
      }
      if ( ! this.validateEmail(this.emailAddress) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
        return false;
      }
      if ( ! this.isPhoneEmptyField() ) {
        // phoneNum is optional, so if empty -> accept, if not then check phone number validity
        if ( ! this.validateNorthAmericanPhoneNumber(this.phoneNumber) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
          return false;
        }
        if ( ! this.validatePhoneCountryCode(this.countryCode) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid Country Code: Format is digits only, with an optional "+" character', type: 'error' }));
          return false;
        }
      }
      return true;
    },

    function extractPhoneNumber(phone) {
      var phoneLength = phone.number.length;
      return phone.number.substring(phoneLength-10);
    },

    function extractCtryCode(phone) {
      var phoneLength = phone.number.length;
      return this.
        checkCountryCodeFormat(phone.number.substring(0, phoneLength-10));
    },

    function editStart() {
      // TODO: NEEDS TO BE SET BASED OFF OF WHERE CODE IS CALLED
      var contact = this.data.contacts.find(this.data.id);
      this.firstNameField  = contact.firstName;
      this.middleNameField = contact.middleName;
      this.lastNameField   = contact.lastName;
      this.isEditingName   = false;
      this.companyName     = contact.organization;
      this.emailAddress    = contact.email;
      this.isEditingPhone  = false;
      this.phoneNumber     = this.extractPhoneNumber(contact.phone);
      this.countryCode     = this.extractCtryCode(contact.phone);
      this.displayedPhoneNumber = contact.phoneNumber;
    },

    function deleteContact() {
      // part of editView
      this.user.contacts.remove(this.data).then(function(result) {
        if ( ! result ) throw new Error();
      }).catch(function(error) {
        if ( error.message ) {
          this.add(this.NotificationMessage.create({ message: error.message, type: 'error' }));
          return;
        }
        this.add(this.NotificationMessage.create({ message: 'Adding the Contact failed.', type: 'error' }));
      });
    },

    function isPhoneEmptyField() {
      if ( this.phoneNumber == null || this.phoneNumber.trim() == '' ) return true;
      return false;
    },

    function checkCountryCodeFormat(number) {
      var num = number.trim();
      if ( num.startsWith('+') ) return num;
      else return ('+' + num);
    },

    function isEmptyFields() {
      // Not verifying phone number, because it is an optional field
      if ( ( this.firstNameField == null || this.firstNameField.trim() == '' ) ||
      ( this.lastNameField == null || this.lastNameField.trim() == '' ) ||
      ( this.companyName == null || this.companyName.trim() == '' ) ||
      ( this.emailAddress == null || this.emailAddress.trim() == '' ) ) {
        this.add(this.NotificationMessage.create({ message: 'Please fill out all fields before proceeding.', type: 'error' }));
        return true;
      }
      return false;
    },

    function addContact(onSave) {
      // part of addContactView
      this.completeSoClose = false;

      if ( this.isEmptyFields() ) return;
      if ( ! this.validations() ) return;

      var contactPhone;
      if ( ! this.isPhoneEmptyField() ) {
        contactPhone = this.Phone.create({ number: this.countryCode + ' ' + this.phoneNumber });
      } else contactPhone = '';

      // TODO: confirm data set
      var newContact = this.Contact.create({
        firstName: this.firstNameField,
        middleName: this.middleNameField,
        lastName: this.lastNameField,
        email: this.emailAddress,
        organization: this.companyName,
        userId: this.user.spid,
        phone: contactPhone
      });

      if ( onSave ) newContact.id = this.data.id;

      if ( newContact.errors_ ) {
        this.add(this.NotificationMessage.create({ message: newContact.errors_[0][1], type: 'error' }));
        return;
      }
      if ( contactPhone.errors_ ) {
        this.add(this.NotificationMessage.create({ message: contactPhone.errors_[0][1], type: 'error' }));
        return;
      }

      // TODO: DATA MAY NEED ADJUSTMENT BASED ON FINAL CONTACT USAGE
      if ( this.sendEmail ) {
        // TODO: send email invite
        this.user.contacts.put(newContact);
      } else {
        this.user.contacts.put(newContact);
      }

      this.inClass = true;
      this.completeSoClose = true;
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
        this.inClass = true;
      }
    },
    {
      name: 'addButton',
      label: 'Add',
      code: function(X) {
        this.addContact(false);
        if ( this.completeSoClose ) X.closeDialog();
      }
    },
    {
      name: 'saveButton',
      label: 'Save',
      code: function(X) {
        this.addContact(true);
        if ( this.completeSoClose ) X.closeDialog();
      }
    },
    {
      name: 'deleteButton',
      label: 'Delete Contact',
      code: function(X) {
        this.confirmDelete = true;
      }
    },
    {
      name: 'redDeleteButton',
      label: 'Yes, delete it',
      code: function(X) {
        this.deleteContact();
        X.closeDialog();
      }
    },
    {
      name: 'cancelDeleteButton',
      label: 'Nevermind',
      code: function(X) {
        this.confirmDelete = false;
      }
    }
  ]
});

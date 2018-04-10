foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'AddPrincipalOwnersForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input Principal Owner(s)',

  imports: [
    'countryDAO',
    'regionDAO',
    'validateEmail',
    'validatePostalCode',
    'validatePhone',
    'validateAge',
    'validateCity',
    'validateStreetNumber',
    'validateAddress'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Region',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Address',
    'foam.dao.ArrayDAO'
  ],

  css:`
    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;

      margin-top: 30px;
      margin-bottom: 20px;
    }

    ^ .fullWidthField.hideTable {
      height: 0 !important;
      overflow: hidden;
      margin-bottom: 0 !important;
      transform: translateY(-40px);
      opacity: 0;
    }

    ^ table {
      width: 540px;
      margin-bottom: 30px;
    }

    ^ thead > tr > th {
      height: 30px;
    }

    ^ .foam-u2-view-TableView tbody > tr {
      height: 30px;
    }

    ^ .foam-u2-view-TableView tbody > tr:hover {
      background: #e9e9e9;
    }

    ^ .foam-u2-view-TableView-selected {
      background-color: rgba(89, 165, 213, 0.3) !important;
    }

    ^ .foam-u2-view-TableView-selected:hover {
      background-color: rgba(89, 165, 213, 0.3) !important;
    }

    ^ .animationContainer {
      position: relative;
      width: 540px;
      height: 64px;
      overflow: hidden;
      box-sizing: border-box;
    }

    ^ .displayContainer {
      position: absolute;
      top: 0;
      left: 0;

      width: 540px;
      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;

      z-index: 10;
    }

    ^ .displayContainer.hidden {
      left: 540px;
      opacity: 0;
    }

    ^ .displayContainer p {
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .fullWidthField {
      width: 540px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .fullWidthField:focus {
      border: solid 1px #59A5D5;
      outline: none;
    }

    ^ .noPadding {
      padding: 0
    }

    ^ .caret {
      position: relative;
      pointer-events: none;
    }

    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 510px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }

    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }

    ^ .displayOnly {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
    }

    ^ .inputContainer {
      position: absolute;
      top: 0;
      left: 0;

      width: 540px;
      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      z-index: 9;
    }

    ^ .inputContainer.hidden {
      pointer-events: none;
      opacity: 0;
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

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .nameFieldsCol:last-child {
      margin-right: 0;
    }

    ^ .nameFieldsCol p {
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .nameFieldsCol.firstName {
      opacity: 0;
      // transform: translateX(64px);
    }
    ^ .nameFieldsCol.middleName {
      opacity: 0;
      transform: translateX(-166.66px);
    }
    ^ .nameFieldsCol.lastName {
      opacity: 0;
      transform: translateX(-166.66px);
    }

    ^ .fields {
      width: 100%;
    }

    ^ .phoneNumberFieldsCol {
      display: inline-block;
      vertical-align: middle;

      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      margin-right: 20px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .phoneNumberFieldsCol:last-child {
      margin-right: 0;
    }

    ^ .phoneNumberFieldsCol p {
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .phoneNumberFieldsCol.out {
      opacity: 0;
      transform: translateX(-166.66px);
    }

    ^ .phoneCountryCodeCol {
      width: 105px;
      pointer-events: none;
    }

    ^ .phoneNumberCol {
      width: 415px;
    }

    ^ .streetContainer {
      width: 540px;
    }

    ^ .streetFieldCol {
      display: inline-block;
      margin-right: 20px;
    }

    ^ .streetFieldCol:last-child {
      margin-right: 0;
    }

    ^ .streetNumberField {
      width: 125px;
    }

    ^ .streetNameField {
      width: 395px;
    }

    ^ .net-nanopay-ui-ActionView-addPrincipalOwner {
      width: 540px;
      height: 40px;

      font-size: 14px;
    }

    ^ .updateButton {
      display: inline-block;
      vertical-align: top;

      margin-left: 19px;

      width: 384px !important;
    }

    ^ .deleteButton, ^ .editButton {
      width: 64px;
      height: 24px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      border: solid 1px rgba(164, 179, 184, 0.3);
      color: #093649;
      padding: 1px 5px;

      box-sizing: border-box;
    }

    ^ .deleteButton img, ^ .editButton img {
      display: inline-block;
      vertical-align: middle;
    }

    ^ .deleteButton .buttonLabel, ^ .editButton .buttonLabel {
      width: 29px;

      font-size: 10px;
      color: #093649;

      display: inline-block;
      vertical-align: middle;

      text-align: center;

      margin: 0;
    }

    ^ .deleteButton:hover, ^ .editButton:hover,
    ^ .deleteButton:focus, ^ .editButton:focus {
      cursor: pointer;
      background-color: rgba(164, 179, 184, 0.3) !important;
    }

    ^ .net-nanopay-ui-ActionView-cancelEdit {
      width: 135px;
      height: 40px;

      color: black !important;

      background-color: rgba(164, 179, 184, 0.1) !important;
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8) !important;

      margin-left: 1px;
      display: inline-block;
    }

    ^ .net-nanopay-ui-ActionView-cancelEdit.hidden {
      width: 0 !important;
      margin-left: 0 !important;
      opacity: 0;
    }

    ^ .net-nanopay-ui-ActionView-cancelEdit:hover,
    ^ .net-nanopay-ui-ActionView-cancelEdit:focus {
      background-color: rgba(164, 179, 184, 0.3) !important;
    }

    ^ .net-nanopay-ui-ActionView {
      color: white;
      font-size: 12px;
      outline: none;
      background-color: #59a5d5;
    }

    ^ .net-nanopay-ui-ActionView:hover,
    ^ .net-nanopay-ui-ActionView:focus {
      background-color: #3783b3;
    }

    ^ .dropdownContainer {
      width: 540px;
      outline: none;
    }

    ^ .foam-u2-tag-Select {
      width: 540px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding-right: 35px;

      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .foam-u2-TextField, ^ .foam-u2-DateView, ^ .foam-u2-tag-Select {
      height: 40px;

      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);

      padding: 12px 13px;

      box-sizing: border-box;
      outline: none;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .foam-u2-TextField:focus,
    ^ .foam-u2-DateView:focus,
    ^ .foam-u2-tag-Select:focus,
    ^ .net-nanopay-ui-ActionView:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-TextField:disabled,
    ^ .foam-u2-DateView:disabled,
    ^ .foam-u2-tag-Select:disabled,
    ^ .net-nanopay-ui-ActionView:disabled {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      color: #a4b3b8 !important;
    }

    ^ .foam-u2-view-TableView-row td {
      position: relative;
    }

    ^ .foam-u2-view-TableView tbody > tr:hover {
      background: #f6f9f9 !important;
      cursor: auto;
    }

    ^ .foam-u2-view-TableView-selected {
      background-color: #f6f9f9 !important;
    }
  `,

  messages: [
    { name: 'BasicInfoLabel', message: 'Basic Information' },
    { name: 'LegalNameLabel', message: 'Legal Name' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'MiddleNameLabel', message: 'Middle Initials (optional)' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'JobTitleLabel', message: 'Job Title' },
    { name: 'EmailAddressLabel', message: 'Email Address' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' },
    { name: 'PrincipalTypeLabel', message: 'Principal Type' },
    { name: 'DateOfBirthLabel', message: 'Date of Birth' },
    { name: 'ResidentialAddressLabel', message: 'Residential Address' },
    { name: 'CountryLabel', message: 'Country' },
    { name: 'StreetNumberLabel', message: 'Street Number' },
    { name: 'StreetNameLabel', message: 'Street Name' },
    { name: 'AddressLabel', message: 'Address' },
    { name: 'ProvinceLabel', message: 'Province' },
    { name: 'CityLabel', message: 'City' },
    { name: 'PostalCodeLabel', message: 'Postal Code' }
  ],

  properties: [
    {
      name: 'principalOwnersDAO',
      factory: function() {
        if ( this.viewData.user.principalOwners ) {
          if ( this.viewData.user.principalOwners.length > 0) this.addLabel = 'Add Another Principal Owner';
          return foam.dao.ArrayDAO.create({ array: this.viewData.user.principalOwners, of: 'foam.nanos.auth.User' });
        }
        return foam.dao.ArrayDAO.create({ of: 'foam.nanos.auth.User' });
      }
    },
    {
      name: 'editingPrincipalOwner',
      postSet: function(oldValue, newValue) {
        if ( newValue != null ) this.editPrincipalOwner(newValue, true);
      }
    },
    {
      class: 'Boolean',
      name: 'principalOwnersCount',
      factory: function() {
        // In case we load from a save state
        this.principalOwnersDAO.select(foam.mlang.sink.Count.create()).then(function(c) {
          return c.value;
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingName',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedLegalName = '';
        if ( this.firstNameField ) this.displayedLegalName += this.firstNameField;
        if ( this.middleNameField ) this.displayedLegalName += ' ' + this.middleNameField;
        if ( this.lastNameField ) this.displayedLegalName += ' ' + this.lastNameField;
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingPhone',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedPhoneNumber = '';
        if ( this.phoneCountryCodeField ) this.displayedPhoneNumber += this.phoneCountryCodeField;
        if ( this.phoneNumberField ) this.displayedPhoneNumber += ' ' + this.phoneNumberField;
      }
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
    'firstNameFieldElement',
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
      name: 'jobTitleField',
      value: ''
    },
    {
      class: 'String',
      name: 'emailAddressField',
      value: ''
    },
    {
      class: 'String',
      name: 'displayedPhoneNumber',
      value: '+1'
    },
    {
      class: 'String',
      name: 'phoneCountryCodeField',
      value: '+1'
    },
    'phoneNumberFieldElement',
    {
      name: 'phoneNumberField',
      class: 'String',
      value: ''
    },
    {
      name: 'principleTypeField',
      value: 'Shareholder',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'Shareholder', 'Owner', 'Officer', 'To Be Filled Out' ] },
    },
    {
      class: 'Date',
      name: 'birthdayField',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    },
    {
      name: 'countryField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        return this.viewData.country || 'CA';
      }
    },
    {
      class: 'String',
      name: 'streetNumberField',
      value: ''
    },
    {
      class: 'String',
      name: 'streetNameField',
      value: ''
    },
    {
      class: 'String',
      name: 'addressField',
      value: ''
    },
    {
      name: 'provinceField',
      view: function(_, X) {
        var choices = X.data.slot(function (countryField) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryField || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      }
    },
    {
      class: 'String',
      name: 'cityField',
      value: ''
    },
    {
      class: 'String',
      name: 'postalCodeField',
      value: ''
    },
    {
      class: 'String',
      name: 'addLabel',
      value: 'Add'
    },
    'addButtonElement',
    {
      class: 'Boolean',
      name: 'isDisplayMode',
      value: false
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.principalOwnersDAO.on.sub(this.onDAOChange);
      this.onDAOChange();
    },

    function initE() {
      this.SUPER();
      var self = this;
      var modeSlot = this.isDisplayMode$.map(function(b) { return b ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW; });
      this.addClass(this.myClass())
        .start('div')
          // TODO: TABLE SHOULD GO HERE
          .start('div')
            .addClass('fullWidthField')
            .enableClass('hideTable', this.principalOwnersCount$.map(function(c) { return c > 0; }), true)
            .start({
              class: 'foam.u2.view.TableView',
              data$: this.principalOwnersDAO$,
              editColumnsEnabled: false,
              columns: [
                'legalName', 'jobTitle', 'principleType',
                foam.core.Property.create({
                  name: 'delete',
                  label: '',
                  tableCellFormatter: function(value, obj, axiom) {
                    this.start('div').addClass('deleteButton')
                      .start({ class: 'foam.u2.tag.Image', data: 'images/ic-trash.svg'}).end()
                      .start('p').addClass('buttonLabel').add('Delete').end()
                      .on('click', function(evt) {
                        evt.stopPropagation();
                        this.blur();
                        if ( self.editingPrincipalOwner === obj ) self.clearFields();
                        self.deletePrincipalOwner(obj);
                      })
                    .end();
                  }
                }),
                foam.core.Property.create({
                  name: 'edit',
                  label: '',
                  factory: function() { return {}; },
                  tableCellFormatter: function(value, obj, axiom) {
                    this.start('div').addClass('editButton')
                      .start({ class: 'foam.u2.tag.Image', data: 'images/ic-edit.svg'}).end()
                      .start('p').addClass('buttonLabel').add('Edit').end()
                      .on('click', function(evt) {
                        evt.stopPropagation();
                        this.blur();
                        self.editingPrincipalOwner = obj;
                      })
                    .end();
                  }
                })
              ]
            }).end()
          .end()

          .start('p').add(this.BasicInfoLabel).addClass('sectionTitle').style({'margin-top':'0'}).end()

          .start('div').addClass('animationContainer')
            .start('div')
              .addClass('displayContainer')
              .enableClass('hidden', this.isEditingName$)
                .start('p').add(this.LegalNameLabel).addClass('infoLabel').end()
                .start(this.DISPLAYED_LEGAL_NAME, { mode$: modeSlot })
                  .addClass('fullWidthField')
                  .addClass('displayOnly')
                  .on('focus', function() {
                    this.blur();
                    self.firstNameFieldElement && self.firstNameFieldElement.focus();
                    self.isEditingName = true;
                  })
                  .end()
            .end()
            .start('div')
              .addClass('inputContainer')
              .enableClass('hidden', this.isEditingName$, true)
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('firstName', this.isEditingName$, true)
                    .start('p').add(this.FirstNameLabel).addClass('infoLabel').end()
                    .start(this.FIRST_NAME_FIELD, { mode$: modeSlot }, this.firstNameFieldElement$)
                      .addClass('fields')
                    .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('middleName', this.isEditingName$, true)
                    .start('p').add(this.MiddleNameLabel).addClass('infoLabel').end()
                    .start(this.MIDDLE_NAME_FIELD, { mode$: modeSlot })
                      .addClass('fields')
                    .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('lastName', this.isEditingName$, true)
                    .start('p').add(this.LastNameLabel).addClass('infoLabel').end()
                    .start(this.LAST_NAME_FIELD, { mode$: modeSlot })
                      .addClass('fields')
                    .end()
                .end()
            .end()
          .end()

          .start('div')
            .on('click', function() {
              self.isEditingName = false;
            })
            .start('p').add(this.JobTitleLabel).addClass('infoLabel').end()
            .start(this.JOB_TITLE_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()
            .start('p').add(this.EmailAddressLabel).addClass('infoLabel').end()
            .start(this.EMAIL_ADDRESS_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()

            .start('div')
              .style({ 'margin-top': '20px' })
              .addClass('animationContainer')
              .start('div')
                .addClass('displayContainer')
                .enableClass('hidden', this.isEditingPhone$)
                .start('p').add(this.PhoneNumberLabel).addClass('infoLabel').end()
                .start(this.DISPLAYED_PHONE_NUMBER, { mode$: modeSlot })
                  .addClass('fullWidthField')
                  .addClass('displayOnly')
                  .on('focus', function() {
                    this.blur();
                    self.phoneNumberFieldElement && self.phoneNumberFieldElement.focus();
                    self.isEditingPhone = true;
                  })
                .end()
              .end()
              .start('div')
                .addClass('inputContainer')
                .enableClass('hidden', this.isEditingPhone$, true)
                .start('div')
                  .addClass('phoneNumberFieldsCol')
                  .addClass('phoneCountryCodeCol')
                  .enableClass('out', this.isEditingPhone$, true)
                  .start('div').add(this.CountryCodeLabel).addClass('infoLabel').style({ 'margin-bottom': '8px' }).end()
                  .start(this.PHONE_COUNTRY_CODE_FIELD, { mode: foam.u2.DisplayMode.DISABLED })
                    .addClass('fields')
                    .on('focus', function() {
                      this.blur();
                      self.phoneNumberFieldElement && self.phoneNumberFieldElement.focus();
                    })
                  .end()
                .end()
                .start('div')
                  .addClass('phoneNumberFieldsCol')
                  .addClass('phoneNumberCol')
                  .enableClass('out', this.isEditingPhone$, true)
                  .start('p').add(this.PhoneNumberLabel).addClass('infoLabel').end()
                  .start(this.PHONE_NUMBER_FIELD, { mode$: modeSlot }, this.phoneNumberFieldElement$)
                    .addClass('fields')
                    .on('focus', function() {
                      self.isEditingPhone = true;
                    })
                    .on('focusout', function() {
                      self.isEditingPhone = false;
                    })
                  .end()
                .end()
              .end()
            .end()

            .start('p').add(this.PrincipalTypeLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .tag(this.PRINCIPLE_TYPE_FIELD, { mode$: modeSlot })
              .start('div').addClass('caret').end()
            .end()
            .start('p').add(this.DateOfBirthLabel).addClass('infoLabel').end()
            .start(this.BIRTHDAY_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()

            // ADDRESS INFO
            .start('p').add(this.ResidentialAddressLabel).addClass('sectionTitle').end()
            .start('p').add(this.CountryLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .start(this.COUNTRY_FIELD, { mode$: modeSlot }).end()
              .start('div').addClass('caret').end()
            .end()
            .start('div').addClass('streetContainer')
              .start('div').addClass('streetFieldCol')
                .start('p').add(this.StreetNumberLabel).addClass('infoLabel').end()
                .start(this.STREET_NUMBER_FIELD, { mode$: modeSlot }).addClass('fullWidthField').addClass('streetNumberField').end()
              .end()
              .start('div').addClass('streetFieldCol')
                .start('p').add(this.StreetNameLabel).addClass('infoLabel').end()
                .start(this.STREET_NAME_FIELD, { mode$: modeSlot }).addClass('fullWidthField').addClass('streetNameField').end()
              .end()
            .end()
            .start('p').add(this.AddressLabel).addClass('infoLabel').end()
            .start(this.ADDRESS_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()
            .start('p').add(this.ProvinceLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .start(this.PROVINCE_FIELD, { mode$: modeSlot }).end()
              .start('div').addClass('caret').end()
            .end()
            .start('p').add(this.CityLabel).addClass('infoLabel').end()
            .start(this.CITY_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()
            .start('p').add(this.PostalCodeLabel).addClass('infoLabel').end()
            .start(this.POSTAL_CODE_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()

            .start('div').style({ 'margin-top': '50px' })
              .start(this.CANCEL_EDIT)
                .enableClass('hidden', this.editingPrincipalOwner$, true)
                .on('focus', function() {
                  if ( ! self.editingPrincipalOwner ) self.addButtonElement.focus();
                })
              .end()
              .start(this.ADD_PRINCIPAL_OWNER, { label$: this.addLabel$ }, this.addButtonElement$)
                .enableClass('updateButton', this.editingPrincipalOwner$)
              .end()
            .end()

          .end()
        .end();
    },

    function clearFields() {
      this.firstNameField = '';
      this.middleNameField = '';
      this.lastNameField = '';
      this.isEditingName = false; // This will change displayedLegalName as well
      this.jobTitleField = '';
      this.emailAddressField = '';
      this.phoneNumberField = '';
      this.isEditingPhone = false;
      this.principleTypeField = 'Shareholder';
      this.birthdayField = null;

      this.countryField = 'CA';
      this.streetNumberField = '';
      this.streetNameField = '';
      this.addressField = '';
      this.provinceField = 'AB';
      this.cityField = '';
      this.postalCodeField = '';

      this.addLabel = 'Add Another Principal Owner';
      this.selectedPrincipalOwner = undefined;
      this.isDisplayMode = false;

      this.document.getElementsByClassName('stackColumn')[0].scrollTop = 0;
      this.document.body.scrollTop = 0; // For Safari
      this.document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    },

    function editPrincipalOwner(user, editable) {
      this.firstNameField = user.firstName;
      this.middleNameField = user.middleName;
      this.lastNameField = user.lastName;
      this.isEditingName = false; // This will change displayedLegalName as well
      this.jobTitleField = user.jobTitle;
      this.emailAddressField = user.email;
      this.phoneNumberField = this.extractPhoneNumber(user.phone);
      this.isEditingPhone = false;
      this.principleTypeField = user.principleType;
      this.birthdayField = user.birthday;

      this.countryField = user.address.countryId;
      this.streetNumberField = user.address.streetNumber;
      this.streetNameField = user.address.streetName;
      this.addressField = user.address.address2;
      this.provinceField = user.address.regionId;
      this.cityField = user.address.city;
      this.postalCodeField = user.address.postalCode;

      this.addLabel = 'Update';

      this.isDisplayMode = !editable;
    },

    function extractPhoneNumber(phone) {
      return phone.number.substring(2);
    },

    function sameAsAdmin(flag) {
      this.clearFields();
      if ( flag ) {
        this.firstNameField = this.user.firstName;
        this.middleNameField = this.user.middleName;
        this.lastNameField = this.user.lastName;
        this.isEditingName = false;

        this.jobTitleField = this.user.jobTitle;
        this.emailAddressField = this.user.email;
        this.phoneNumberField = this.extractPhoneNumber(this.user.phone);
        this.isEditingPhone = false;
      }
    },

    function deletePrincipalOwner(obj) {
      var self = this;
      this.principalOwnersDAO.remove(obj).then(function(deleted){
        self.prevDeletedPrincipalOwner = deleted;
      });
    }
  ],

  actions: [
    {
      name: 'cancelEdit',
      label: 'Cancel',
      code: function() {
        this.editingPrincipalOwner = null;
        this.clearFields();
      }
    },
    {
      name: 'addPrincipalOwner',
      isEnabled: function(isDisplayMode) {
        return ! isDisplayMode;
      },
      code: function() {
        if ( ! this.firstNameField || ! this.lastNameField ) {
          this.add(this.NotificationMessage.create({ message: 'First and last name fields must be populated.', type: 'error' }));
          return;
        }

        if ( ! this.jobTitleField ) {
          this.add(this.NotificationMessage.create({ message: 'Job title field must be populated.', type: 'error' }));
          return;
        }

        if ( ! this.validateEmail(this.emailAddressField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
          return;
        }

        if ( ! this.validatePhone(this.phoneCountryCodeField + this.phoneNumberField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
          return;
        }

        if ( ! this.validateAge(this.birthdayField) ) {
          this.add(this.NotificationMessage.create({ message: 'Principal owner must be at least 16 years of age.', type: 'error' }));
          return;
        }

        if ( ! this.validateStreetNumber(this.streetNumberField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid street number.', type: 'error' }));
          return;
        }
        if ( ! this.validateAddress(this.streetNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid street name.', type: 'error' }));
          return;
        }
        if ( this.addressField.length > 0 && ! this.validateAddress(this.addressField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid address line.', type: 'error' }));
          return;
        }
        if ( ! this.validateCity(this.cityField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid city name.', type: 'error' }));
          return;
        }
        if ( ! this.validatePostalCode(this.postalCodeField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid postal code.', type: 'error' }));
          return;
        }

        var self = this;

        var principleOwner;

        if ( this.editingPrincipalOwner ) {
          principleOwner = this.editingPrincipalOwner;
        } else {
          principleOwner = this.User.create({
            id: this.principalOwnersCount + 1
          });
        }

        principleOwner.firstName = this.firstNameField,
        principleOwner.middleName = this.middleNameField,
        principleOwner.lastName = this.lastNameField,
        principleOwner.email = this.emailAddressField,
        principleOwner.phone = this.Phone.create({
          number: this.phoneCountryCodeField + this.phoneNumberField
        }),
        principleOwner.birthday = this.birthdayField,
        principleOwner.address = this.Address.create({
          streetNumber: this.streetNumberField,
          streetName: this.streetNameField,
          address2: this.addressField,
          city: this.cityField,
          postalCode: this.postalCodeField,
          countryId: this.countryField,
          regionId: this.provinceField
        }),
        principleOwner.jobTitle = this.jobTitleField,
        principleOwner.principleType = this.principleTypeField

        // TODO?: Maybe add a loading indicator?
        this.principalOwnersDAO.put(principleOwner).then(function(npo) {
          self.editingPrincipalOwner = null;
          self.clearFields();
        });
      }
    }
  ],

  listeners: [
    function onDAOChange() {
      var self = this;
      this.principalOwnersDAO.select().then(function(principalOwners) {
        self.viewData.principalOwners = principalOwners.array;
        self.principalOwnersCount = principalOwners.array.length;
        if ( self.principalOwnersCount > 0) self.addLabel = 'Add Another Principal Owner';
        else self.addLabel = 'Add';
      });
    }
  ]
});

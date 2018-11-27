foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BeneficialOwnershipForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: ` Fifth step in the business registration wizard,
  responsible for collecting beneficial owner information.
`,

imports: [
  'wizard',
  'countryDAO',
  'regionDAO',
  'validateEmail',
  'validatePostalCode',
  'validatePhone',
  'validateAge',
  'validateCity',
  'validateStreetNumber',
  'validateAddress',
  'user'
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

css: `
    ^ {
      width: 550px;
    }
    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;
      display: inline-block;
      width: 200px;
      margin-top: 30px;
      margin-bottom: 20px;
    }

    ^ .hideTable {
      height: 0 !important;
      overflow: hidden;
      margin-bottom: 0 !important;
      transform: translateY(-40px);
      opacity: 0;
    }

    ^ table {
      width: 525px;
      margin: 0px;
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

    ^ .fields {
      width: 100%;
    }

    ^ .net-nanopay-ui-ActionView-addPrincipalOwner {
      height: 40px;
      width: 250px;
      background: none;
      color: #8e9090;
      font-size: 16px;
      position: relative;
      bottom: 30px;
    }

    ^ .net-nanopay-ui-ActionView-addPrincipalOwner:hover {
      background: none;
      color: #8e9090;
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

    ^ .dropdownContainer {
      width: 540px;
      outline: none;
    }

    ^ .checkBoxContainer {
      position: relative;
      padding: 13px 0;
      width: 200px;
      top: 15px;
      float: right;
    }

    ^ .checkBoxContainer .foam-u2-md-CheckBox {
      display: inline-block;
      vertical-align: middle;
    }

    ^ .checkBoxContainer .foam-u2-md-CheckBox-label {
      display: inline-block;
      vertical-align: middle;

      margin: 0;
      position: relative;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .label {
      margin-left: 0px;
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

    ^ .foam-u2-view-TableView {
      width: 100% !important;
    }

    ^ .foam-u2-view-TableView tbody > tr:hover {
      cursor: auto;
    }

    ^ .address2Hint {
      height: 14px;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.17;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-top: 5px;
      margin-bottom: 0px;
    }
    ^ .net-nanopay-sme-ui-AddressView .foam-u2-TextField {
      margin-bottom: 0px;
    }

    ^ .net-nanopay-sme-ui-InfoMessageContainer {
      width: 475px;
      margin: 25px 0px;
    }
    ^ .foam-u2-tag-Select,
    ^ .foam-u2-TextField,
    ^ .foam-u2-DateView {
      width: 95%;
    }

    ^ .left-of-container {
      margin-right: 20px;
    }
    ^ .label {
      margin-top: 15px;
    }

    input[type='checkbox']:checked:after {
      top: 0px;
      left: 0px;
    }
  `,

properties: [
  {
    name: 'principalOwnersDAO',
    factory: function() {
      if ( this.viewData.user.principalOwners ) {
        return foam.dao.ArrayDAO.create({ array: this.viewData.user.principalOwners, of: 'foam.nanos.auth.User' });
      }
      return foam.dao.ArrayDAO.create({ of: 'foam.nanos.auth.User' });
    }
  },
  {
    name: 'editingPrincipalOwner',
    postSet: function(oldValue, newValue) {
      if ( newValue != null ) this.editPrincipalOwner(newValue, true);
      this.tableViewElement.selection = newValue;
    }
  },
  {
    name: 'addPrincipalOwnerLabel',
    expression: function(editingPrincipalOwner) {
      if ( editingPrincipalOwner ) {
        return 'Update';
      } else {
        return '+ Add Another Owner';
      }
    }
  },
  {
    class: 'Long',
    name: 'principalOwnersCount',
    factory: function() {
      // In case we load from a save state
      this.principalOwnersDAO.select(foam.mlang.sink.Count.create()).then(function(c) {
        return c.value;
      });
    }
  },
  'tableViewElement',
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
    name: 'phoneNumberField',
    class: 'String',
    value: ''
  },
  {
    name: 'principleTypeField',
    value: 'Shareholder',
    view: {
      class: 'foam.u2.view.ChoiceView',
      choices: ['Shareholder', 'Owner', 'Officer']
    }
  },
  {
    class: 'Date',
    name: 'birthdayField',
    tableCellFormatter: function(date) {
      this.add(date ? date.toISOString().substring(0,10) : '');
    }
  },
  {
    class: 'FObjectProperty',
    name: 'addressField',
    factory: function() {
      return this.Address.create({});
    },
    view: { class: 'net.nanopay.sme.ui.AddressView' }
  },
  {
    class: 'Boolean',
    name: 'isDisplayMode',
    value: false
  },
  {
    class: 'Boolean',
    name: 'isSameAsAdmin',
    value: false,
    postSet: function(oldValue, newValue) {
      if ( newValue ) this.editingPrincipalOwner = null;
      this.sameAsAdmin(newValue);
    }
  }
],

messages: [
  { name: 'TITLE', message: 'Beneficial Ownership' },
  { name: 'OWNER_LABEL', message: 'Owner' },
  { name: 'LEGAL_NAME_LABEL', message: 'Legal Name' },
  { name: 'FIRST_NAME_LABEL', message: 'First Name' },
  { name: 'MIDDLE_NAME_LABEL', message: 'Middle Initials (optional)' },
  { name: 'LAST_NAME_LABEL', message: 'Last Name' },
  { name: 'JOB_TITLE_LABEL', message: 'Job Title' },
  { name: 'EMAIL_ADDRESS_LABEL', message: 'Email Address' },
  { name: 'COUNTRY_CODE_LABEL', message: 'Country Code' },
  { name: 'PHONE_NUMBER_LABEL', message: 'Phone Number' },
  { name: 'PRINCIPLE_TYPE_LABEL', message: 'Principal Type' },
  { name: 'DATE_OF_BIRTH_LABEL', message: 'Date of Birth' },
  { name: 'RESIDENTIAL_ADDRESS_LABEL', message: 'Residential Address' },
  { name: 'PRINCIPAL_OWNER_LABEL', message: 'A beneficial owner with that name already exists.' },
  { name: 'DELETE_LABEL', message: 'Delete' },
  { name: 'EDIT_LABEL', message: 'Edit' },
  { name: 'SAME_AS_SIGNING', message: 'Same as Signing Officer' },
  { name: 'FIRST_NAME_ERROR', message: 'First and last name fields must be populated.' },
  { name: 'JOB_TITLE_ERROR', message: 'Job title field must be populated.' },
  { name: 'EMAIL_ADDRESS_ERROR', message: 'Invalid email address.' },
  { name: 'PHONE_NUMBER_ERROR', message: 'Invalid phone number.' },
  { name: 'BIRTHDAY_ERROR', message: 'Please Enter Valid Birthday yyyy-mm-dd.' },
  { name: 'BIRTHDAY_ERROR_2', message: 'Principal owner must be at least 16 years of age.' },
  { name: 'ADDRESS_STREET_NUMBER_ERROR', message: 'Invalid street number.' },
  { name: 'ADDRESS_STREET_NAME_ERROR', message: 'Invalid street name.' },
  { name: 'ADDRESS_LINE_ERROR', message: 'Invalid address line.' },
  { name: 'ADDRESS_CITY_ERROR', message: 'Invalid city name.' },
  { name: 'ADDRESS_POSTAL_CODE_ERROR', message: 'Invalid postal code.' },
  {
    name: 'ADVISORY_NOTE',
    message: `If your business has beneficial owners who, directly or indirectly,
        own 25% or more of the business, please provide the information below for each owner.`
  }
],


methods: [
  function init() {
    this.SUPER();
    this.principalOwnersDAO.on.sub(this.onDAOChange);
    this.onDAOChange();
    // Gives the onboarding wizard access to the validations
    this.wizard.addPrincipalOwnersForm = this;
  },

  function initE() {
    var self = this;
    this.nextLabel = 'Complete';
    this.principleTypeField = 'Shareholder';
    var modeSlotSameAsAdmin = this.slot(function(isSameAsAdmin, isDisplayMode) {
      return ( isSameAsAdmin || isDisplayMode ) ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
    });
    this.scrollToTop();

    this.addClass(this.myClass())
      .start().addClass('medium-header').add(this.TITLE).end()
      .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.ADVISORY_NOTE })
      .start()
        .start()
          .enableClass('hideTable', this.principalOwnersCount$.map(function(c) { return c > 0; }), true)
          .start({
            class: 'foam.u2.view.TableView',
            data$: this.principalOwnersDAO$,
            editColumnsEnabled: false,
            disableUserSelection: true,
            columns: [
              'legalName', 'jobTitle', 'principleType',
              foam.core.Property.create({
                name: 'delete',
                label: '',
                tableCellFormatter: function(value, obj, axiom) {
                  this.start().addClass('deleteButton')
                    .start({ class: 'foam.u2.tag.Image', data: 'images/ic-trash.svg' }).end()
                    .start('p').addClass('buttonLabel').add('Delete').end()
                    .on('click', function(evt) {
                      evt.stopPropagation();
                      this.blur();
                      if ( self.editingPrincipalOwner === obj ) {
                        self.editingPrincipalOwner = null;
                        self.clearFields();
                      }
                      self.deletePrincipalOwner(obj);
                    })
                  .end();
                }
              }),
              foam.core.Property.create({
                name: 'edit',
                label: '',
                factory: function() {
                  return {};
                },
                tableCellFormatter: function(value, obj, axiom) {
                  this.start().addClass('editButton')
                    .start({ class: 'foam.u2.tag.Image', data: 'images/ic-edit.svg' }).end()
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
          }, {}, this.tableViewElement$).end()
        .end()

        .start().add(this.OWNER_LABEL, ' ', this.principalOwnersCount$.map(function(p) { return p + 1; })).addClass('sectionTitle').end()

        .start().addClass('checkBoxContainer')
          .start({ class: 'foam.u2.md.CheckBox', label: this.SAME_AS_SIGNING, data$: this.isSameAsAdmin$ }).end()
        .end()

        .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
          .start().addClass('label').add(this.FIRST_NAME_LABEL).end()
          .start().add(this.FIRST_NAME_FIELD).end()
        .end()
        .start().addClass('label-input').addClass('half-container')
          .start().addClass('label').add(this.LAST_NAME_LABEL).end()
          .start().add(this.LAST_NAME_FIELD).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.PRINCIPLE_TYPE_LABEL).end()
          .start().add(this.PRINCIPLE_TYPE_FIELD).end()
        .end()

        .start()
          .on('click', function() {
            self.isEditingName = false;
          })
          .start().addClass('label-input')
            .start().addClass('label').add(this.JOB_TITLE_LABEL).end()
            .start(this.JOB_TITLE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.EMAIL_ADDRESS_LABEL).end()
            .start(this.EMAIL_ADDRESS_FIELD, { mode$: modeSlotSameAsAdmin }).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PHONE_NUMBER_LABEL).end()
            .start().add(this.PHONE_NUMBER_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.DATE_OF_BIRTH_LABEL).end()
            .start().add(this.BIRTHDAY_FIELD).end()
          .end()

          .start(this.ADDRESS_FIELD).end()
          .start().style({ 'margin-top': '50px' })
            .start(this.CANCEL_EDIT)
              .enableClass('hidden', this.editingPrincipalOwner$, true)
            .end()
            .start(this.ADD_PRINCIPAL_OWNER, { label$: this.addPrincipalOwnerLabel$ })
              .enableClass('updateButton', this.editingPrincipalOwner$)
            .end()
          .end()

        .end()
      .end();
  },

  function clearFields(scrollToTop) {
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
    this.suiteField = '';
    this.provinceField = 'AB';
    this.cityField = '';
    this.postalCodeField = '';

    this.isDisplayMode = false;

    if ( scrollToTop ) {
      this.scrollToTop();
    }
  },

  function editPrincipalOwner(user, editable) {
    var formHeaderElement = this.document.getElementsByClassName('sectionTitle')[0];
    formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.isSameAsAdmin = false;

    this.firstNameField = user.firstName;
    this.middleNameField = user.middleName;
    this.lastNameField = user.lastName;
    this.isEditingName = false; // This will change displayedLegalName as well
    this.jobTitleField = user.jobTitle;
    this.emailAddressField = user.email;
    this.phoneNumberField = user.phone.number;
    this.isEditingPhone = false;
    this.principleTypeField = user.principleType;
    this.birthdayField = user.birthday;

    this.addressField = user.address;

    this.isDisplayMode = ! editable;
  },

  function sameAsAdmin(flag) {
    this.clearFields();
    if ( flag ) {
      var formHeaderElement = this.document.getElementsByClassName('sectionTitle')[0];
      formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.firstNameField = this.viewData.user.firstName;
      this.middleNameField = this.viewData.user.middleName;
      this.lastNameField = this.viewData.user.lastName;
      this.isEditingName = false;

      this.jobTitleField = this.viewData.user.jobTitle;
      this.emailAddressField = this.viewData.user.email;
      this.phoneNumberField = this.viewData.user.phone.number;
      this.isEditingPhone = false;
    }
  },

  function isFillingPrincipalOwnerForm() {
    if ( this.firstNameField ||
         this.middleNameField ||
         this.lastNameField ||
         this.jobTitleField ||
         this.emailAddressField ||
         this.phoneNumberField ||
         this.birthdayField ||
         this.addressField ) {
      return true;
    }
    return false;
  },

  function deletePrincipalOwner(obj) {
    var self = this;
    this.principalOwnersDAO.remove(obj).then(function(deleted) {
      self.prevDeletedPrincipalOwner = deleted;
    });
  },

  function validatePrincipalOwner() {
    if ( ! this.firstNameField || ! this.lastNameField ) {
      this.add(this.NotificationMessage.create({ message: this.FIRST_NAME_ERROR, type: 'error' }));
      return false;
    }

    if ( ! this.jobTitleField ) {
      this.add(this.NotificationMessage.create({ message: this.JOB_TITLE_ERROR, type: 'error' }));
      return false;
    }

    if ( ! this.validateEmail(this.emailAddressField) ) {
      this.add(this.NotificationMessage.create({ message: this.EMAIL_ADDRESS_ERROR, type: 'error' }));
      return false;
    }

    if ( ! this.validatePhone(this.phoneNumberField) ) {
      this.add(this.NotificationMessage.create({ message: this.PHONE_NUMBER_ERROR, type: 'error' }));
      return false;
    }

    // By pass for safari & mozilla type='date' on input support
    // Operator checking if dueDate is a date object if not, makes it so or throws notification.
    if ( isNaN(this.birthdayField) && this.birthdayField != null ) {
      this.add(foam.u2.dialog.NotificationMessage.create({ message: this.BIRTHDAY_ERROR, type: 'error' }));
      return;
    }
    if ( ! this.validateAge(this.birthdayField) ) {
      this.add(this.NotificationMessage.create({ message: this.BIRTHDAY_sERROR_2, type: 'error' }));
      return false;
    }
    var address = this.addressField;
    if ( ! this.validateStreetNumber(address.streetNumber) ) {
      this.add(this.NotificationMessage.create({ message: this.ADDRESS_STREET_NUMBER_ERROR, type: 'error' }));
      return false;
    }
    if ( ! this.validateAddress(address.streetName) ) {
      this.add(this.NotificationMessage.create({ message: this.ADDRESS_STREET_NAME_ERROR, type: 'error' }));
      return false;
    }
    if ( address.suite.length > 0 && ! this.validateAddress(address.suite) ) {
      this.add(this.NotificationMessage.create({ message: this.ADDRESS_LINE_ERROR, type: 'error' }));
      return false;
    }
    if ( ! this.validateCity(address.city) ) {
      this.add(this.NotificationMessage.create({ message: this.ADDRESS_CITY_ERROR, type: 'error' }));
      return false;
    }
    if ( ! this.validatePostalCode(address.postalCode) ) {
      this.add(this.NotificationMessage.create({ message: this.ADDRESS_POSTAL_CODE_ERROR, type: 'error' }));
      return false;
    }

    return true;
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
    code: async function() {
      if ( ! this.validatePrincipalOwner() ) return;

      var principalOwner;

      if ( this.editingPrincipalOwner ) {
        principalOwner = this.editingPrincipalOwner;
      } else {
        principalOwner = this.User.create({
          id: this.principalOwnersCount + 1
        });
      }

      principalOwner.firstName = this.firstNameField;
      principalOwner.middleName = this.middleNameField;
      principalOwner.lastName = this.lastNameField;
      principalOwner.email = this.emailAddressField;
      principalOwner.phone = this.Phone.create({
        number: this.phoneNumberField
      });
      principalOwner.birthday = this.birthdayField;
      principalOwner.address = this.addressField;
      principalOwner.jobTitle = this.jobTitleField;
      principalOwner.principleType = this.principleTypeField;

      if ( ! this.editingPrincipalOwner ) {
        var owners = (await this.principalOwnersDAO.select()).array;
        var nameTaken = owners.some((owner) => {
          var ownerFirst = owner.firstName.toLowerCase();
          var ownerLast = owner.lastName.toLowerCase();
          var formFirst = this.firstNameField.toLowerCase();
          var formLast = this.lastNameField.toLowerCase();
          return ownerFirst === formFirst && ownerLast === formLast;
        });
        if ( nameTaken ) {
          this.add(this.NotificationMessage.create({
            message: this.PrincipalOwnerError,
            type: 'error'
          }));
          return;
        }
      }

      await this.principalOwnersDAO.put(principalOwner);
      this.editingPrincipalOwner = null;
      this.tableViewElement.selection = null;
      this.clearFields(true);
      this.isSameAsAdmin = false;

      return true;
    }
  }
],

listeners: [
  function onDAOChange() {
    var self = this;
    this.principalOwnersDAO.select().then(function(principalOwners) {
      self.viewData.user.principalOwners = principalOwners.array;
      self.principalOwnersCount = principalOwners.array.length;
    });
  }
]
});

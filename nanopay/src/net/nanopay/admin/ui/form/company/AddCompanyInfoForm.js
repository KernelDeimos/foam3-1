foam.CLASS({
  package: 'net.nanopay.admin.ui.form.company',
  name: 'AddCompanyInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input Admin information',

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
      height: 330px;
    }
    ^ .full-width-input-1{
      width: 555px;
      left: -30px;
      position: relative;
      font-size: 14px;
    }
    ^ .inputLarge{
      margin-bottom: 20px;
      font-size: 14px;
    }
    ^ .position-label{
      margin-bottom: 10px;
      position: relative;
      left: 30px;
    }
    ^ .margin-left{
      margin-left: 60px;
    }
  `,
  
  properties: [
    {
      class: 'String',
      name: 'firstName',
      factory: function() {
        return this.viewData.firstName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.firstName = newValue;
      }
    },
    {
      class: 'String',
      name: 'lastName',
      factory: function() {
        return this.viewData.lastName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.lastName = newValue;
      }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      factory: function() {
        return this.viewData.phoneNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.phoneNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      factory: function() {
        return this.viewData.jobTitle;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.jobTitle = newValue;
      }
    },
    {
      class: 'String',
      name: 'email',
      factory: function() {
        return this.viewData.email;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.email = newValue;
      }
    },
    {
      class: 'Password',
      name: 'password',
      factory: function() {
        return this.viewData.password;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      }
    },
    {
      class: 'String',
      name: 'confirmPassword',
      factory: function() {
        return this.viewData.confirmPassword;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.confirmPassword = newValue;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Fill in Admin\'s information and create account password.' },
    { name: 'FirstNameLabel', message: 'First Name *' },
    { name: 'LastNameLabel', message: 'Last Name *' },
    { name: 'JobTitleLabel', message: 'Job Title *' },
    { name: 'PhoneNumberLabel', message: 'Phone Number *' },
    { name: 'EmailLabel', message: 'Email *' },
    { name: 'PasswordLabel', message: 'Password *' },
    { name: 'ConfirmPasswordLabel', message: 'Confirm Password *' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').addClass('pDefault stepTopMargin').add(this.Step).end()
          .start().addClass('infoContainer')
            .start().addClass('inline')
              .start().add(this.FirstNameLabel).addClass('infoLabel').end()
              .start(this.FIRST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(this.LastNameLabel).addClass('infoLabel').end()
              .start(this.LAST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline')
              .start().add(this.JobTitleLabel).addClass('infoLabel').end()
              .start(this.JOB_TITLE).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(this.EmailLabel).addClass('infoLabel').end()
              .start(this.EMAIL).addClass('inputLarge').end()
            .end()
            .start().addClass('full-width-input-1')
              .start().add(this.PhoneNumberLabel).addClass('infoLabel position-label').end()
              .start(this.PHONE_NUMBER).addClass('full-width-input').end()
            .end()
            .start().addClass('full-width-input-1')
              .start().add(this.PasswordLabel).addClass('infoLabel position-label').end()
              .start(this.PASSWORD).addClass('full-width-input').end()
            .end()
            .start()
              .start().add(this.ConfirmPasswordLabel).addClass('infoLabel').end()
              .start(this.CONFIRM_PASSWORD).addClass('inputExtraLarge').end()
            .end()
          .end()
        .end();
    }
  ]
});
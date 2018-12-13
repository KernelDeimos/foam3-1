foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessRegistrationWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo'
  ],

  imports: [
    'ctrl',
    'stack',
    'validatePostalCode',
    'validatePhone',
    'validateCity',
    'validateStreetNumber',
    'validateAddress',
    'validateEmail',
    'validateAge',
    'user',
    'agent',
    'businessDAO',
    'userDAO',
    'menuDAO'
  ],

  exports: [
    'viewData'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: #f9fbff;
    }
    ^ .wizardBody {
      width: 1000px;
      margin: auto;
      padding: 50px 0px 100px 0px;
    }
    ^ .net-nanopay-sme-onboarding-ui-BusinessForm {
      padding-bottom: 150px;
    }
    ^ .net-nanopay-sme-onboarding-ui-UserTransactionEstimateForm {
      padding-bottom: 150px;
    }
    ^ .net-nanopay-sme-onboarding-ui-SigningOfficerForm {
      padding-bottom: 150px;
    }
    ^ .net-nanopay-sme-onboarding-ui-BeneficialOwnershipForm {
      padding-bottom: 150px;
    }
    ^ .net-nanopay-ui-ActionView-goNext {
      border-radius: 4px !important;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #604aff !important;
    }
    ^ .stackColumn {
      display: inline-block;
      width: calc(100% - 300px);
      height: calc(100% - 65px);
      box-sizing: border-box;
      position: relative;
      top: -20px;
      overflow-y: scroll;
      vertical-align: top;
      -ms-overflow-style: none;  // IE 10+
      overflow: -moz-scrollbars-none;  // Firefox
    }
    ^ .stackColumn::-webkit-scrollbar {
      display: none;  // Safari and Chrome
    }
    ^ .title {
      font-size: 32px;
      line-height: 48px;
      font-weight: 900;
    }
    ^ .foam-u2-view-RadioView {
      margin-left: 50px;
    }
    ^ .net-nanopay-ui-ActionView-uploadButton {
      background: #604aff !important;
    }
  `,

  messages: [
    { name: 'SAVE_SUCCESSFUL_MESSAGE', message: 'Progress saved.' },
    { name: 'SAVE_FAILURE_MESSAGE', message: 'Could not save your changes. Please try again.' },
    { name: 'SUBMIT_SUCCESS_MESSAGE', message: 'Registration submitted successfully! You will receive a confirmation email in your mailbox.' },
    { name: 'SUBMIT_FAILURE_MESSAGE', message: 'Registration submission failed. Please try again later.' },
    { name: 'ERROR_MISSING_FIELDS', message: 'Please fill out all necessary fields before proceeding.' },
    { name: 'ERROR_ADMIN_JOB_TITLE_MESSAGE', message: 'Job title required.' },
    { name: 'ERROR_ADMIN_NUMBER_MESSAGE', message: 'Invalid phone number.' },
    { name: 'ERROR_BUSINESS_PROFILE_NAME_MESSAGE', message: 'Business name required.' },
    { name: 'ERROR_BUSINESS_PROFILE_PHONE_MESSAGE', message: 'Invalid business phone number.' },
    { name: 'ERROR_BUSINESS_PROFILE_TYPE_MESSAGE', message: 'Business type required.' },
    { name: 'ERROR_BUSINESS_PROFILE_REGISTRATION_NUMBER_MESSAGE', message: 'Business registration number required.' },
    { name: 'ERROR_BUSINESS_PROFILE_REGISTRATION_AUTHORITY_MESSAGE_ERROR', message: 'Business registration authority required.' },
    { name: 'ERROR_BUSINESS_PROFILE_REGISTRATION_DATE_MESSAGE', message: 'Invalid business registration date.' },
    { name: 'ERROR_BUSINESS_PROFILE_STREET_NUMBER_MESSAGE', message: 'Invalid street number.' },
    { name: 'ERROR_BUSINESS_PROFILE_STREET_NAME_MESSAGE', message: 'Invalid street name.' },
    { name: 'ERROR_BUSINESS_PROFILE_STREET_2_NAME_MESSAGE', message: 'Address line 2 is invalid.' },
    { name: 'ERROR_BUSINESS_PROFILE_CITY_MESSAGE', message: 'Invalid city name.' },
    { name: 'ERROR_BUSINESS_PROFILE_POSTAL_CODE_MESSAGE', message: 'Invalid postal code.' },
    { name: 'ERROR_QUESTIONNAIRE_MESSAGE', message: 'You must answer each question.' },
    { name: 'ERROR_FIRST_NAME_TOO_LONG', message: 'First name cannot exceed 70 characters.' },
    { name: 'ERROR_FIRST_NAME_DIGITS', message: 'First name cannot contain numbers.' },
    { name: 'ERROR_MIDDLE_NAME_TOO_LONG', message: 'Middle name cannot exceed 70 characters.' },
    { name: 'ERROR_MIDDLE_NAME_DIGITS', message: 'Middle name cannot contain numbers.' },
    { name: 'ERROR_LAST_NAME_TOO_LONG', message: 'Last name cannot exceed 70 characters.' },
    { name: 'ERROR_LAST_NAME_DIGITS', message: 'Last name cannot contain numbers.' },
    { name: 'ERROR_TERMS_AND_CONDITIONS_MESSAGE', message: 'Please accept the terms and conditions.' },
    { name: 'ERROR_BASE_CURRENCY_MESSAGE', message: 'Base currency required.' },
    { name: 'ERROR_ANNUAL_REVENUE_MESSAGE', message: 'Annual revenue required.' },
    { name: 'ERROR_INTERNATIONAL_PAYMENTS_MESSAGE', message: 'International payments required.' },
    { name: 'ERROR_TRANSACTION_PURPOSE_MESSAGE', message: 'Transaction purpose required.' },
    { name: 'ERROR_ANNUAL_TRANSACTION_MESSAGE', message: 'Annual transaction required.' },
    { name: 'ERROR_ANNUAL_VOLUME_MESSAGE', message: 'Annual volume required.' },
    { name: 'ERROR_TAX_ID_REQUIRED', message: 'Tax Identification Number is required.' },
    { name: 'ERROR_TAX_ID_INVALID', message: 'Tax Identification Number should be 9 digits.' },
    { name: 'ERROR_ADD_BUSINESS_DOCS', message: 'Please upload at least one proof of registration file for your business type.' },
    { name: 'ERROR_ADD_SIGNING_DOCS', message: 'Please upload at least one identification file for the signing officer.' },
    { name: 'ERROR_NO_BENEFICIAL_OWNERS', message: 'Please add a beneficial owner to continue, if you have none then please select either of the checkboxs at the top of the page' },
    { name: 'ERROR_TERMS_NOT_CHECKED', message: 'Please agree to the Ablii terms and conditions by clicking on the checkbox' },

    {
      name: 'NON_SUCCESS_REGISTRATION_MESSAGE',
      message: `Your finished with the registration process. A signing officer
          of your company must complete the rest of the registration.`
    },
    {
      name: 'SUCCESS_REGISTRATION_MESSAGE',
      message: `Business profile completed. Admins can change profile information in Business Settings`
    }
  ],

  methods: [
    function init() {
      this.hasSaveOption = true;
      this.hasBackOption = false;
      this.viewData.user = this.user;
      this.viewData.agent = this.agent;
      this.title = 'Your business profile';

      this.saveLabel = 'Close';
      this.nextLabel = 'Get started';

      this.views = [
        { id: 'business-registration-introduction', label: 'Getting Started', subtitle: 'Additional information', view: { class: 'net.nanopay.sme.onboarding.ui.IntroductionView' }, isHiddenInOverview: true },
        { id: 'business-registration-business-form', label: 'Your Business', subtitle: 'Additional information', view: { class: 'net.nanopay.sme.onboarding.ui.BusinessForm' } },
        { id: 'business-registration-transaction-estimate-form', label: 'Your Transactions', subtitle: 'Additional information', view: { class: 'net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm' } },
        { id: 'business-registration-signing-officer-form', label: 'Signing Officer', subtitle: 'Additional information', view: { class: 'net.nanopay.sme.onboarding.ui.SigningOfficerForm' } },
        { id: 'business-registration-beneficial-owner-form', label: 'Beneficial Ownership', subtitle: 'Additional information', view: { class: 'net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm' } }
      ];
      this.viewData.user.suggestedUserTransactionInfo =
        this.user.suggestedUserTransactionInfo ?
          this.user.suggestedUserTransactionInfo :
          this.SuggestedUserTransactionInfo.create({});

      this.SUPER();
    },

    function validateSigningOfficerInfo() {
      var editedUser = this.viewData.agent;

      if ( ! editedUser.firstName ) {
        this.notify(this.ERROR_MISSINGS_FIELDS, 'error');
        return false;
      }
      if ( editedUser.firstName.length > 70 ) {
        this.notify(this.ERROR_FIRST_NAME_TOO_LONG, 'error');
        return false;
      }
      if ( /\d/.test(editedUser.firstName) ) {
        this.notify(this.ERROR_FIRST_NAME_DIGITS, 'error');
        return false;
      }

      if ( ! editedUser.lastName ) {
        this.notify(this.ERROR_MISSING_FIELDS, 'error');
        return false;
      }
      if ( editedUser.lastName.length > 70 ) {
        this.notify(this.ERROR_LAST_NAME_TOO_LONG, 'error');
        return false;
      }
      if ( /\d/.test(editedUser.lastName) ) {
        this.notify(this.ERROR_LAST_NAME_DIGITS, 'error');
        return false;
      }

      if ( ! editedUser.jobTitle ) {
        this.notify(this.ERROR_ADMIN_JOB_TITLE_MESSAGE, 'error');
        return false;
      }

      if ( ! this.validatePhone(editedUser.phone.number) ) {
        this.notify(this.ERROR_ADMIN_NUMBER_MESSAGE, 'error');
        return false;
      }

      editedUser.identification.validate();
      if ( editedUser.identification.errors_ ) {
        this.notify(editedUser.identification.errors_[0][1], 'error');
        return false;
      }

      if ( editedUser.additionalDocuments.length <= 0 ) {
        this.notify(this.ERROR_ADD_SIGNING_DOCS, 'error');
        return false;
      }

      if ( ! this.viewData.termsCheckBox ) {
        this.notify(this.ERROR_TERMS_NOT_CHECKED, 'error');
        return false;
      }

      return true;
    },

    function validateTransactionInfo() {
      var transactionInfo = this.viewData.user.suggestedUserTransactionInfo;

      if ( ! transactionInfo.baseCurrency ) {
        this.notify(this.ERROR_BASE_CURRENCY_MESSAGE, 'error');
        return false;
      }

      if ( ! transactionInfo.annualRevenue ) {
        this.notify(this.ERROR_ANNUAL_REVENUE_MESSAGE, 'error');
        return false;
      }

      if ( transactionInfo.internationalPayments ) {
        if ( ! transactionInfo.transactionPurpose ) {
          this.notify(this.ERROR_TRANSACTION_PURPOSE_MESSAGE, 'error');
          return false;
        }

        if ( ! transactionInfo.annualTransactionAmount ) {
          this.notify(this.ERROR_ANNUAL_TRANSACTION_MESSAGE, 'error');
          return false;
        }

        if ( ! transactionInfo.annualVolume ) {
          this.notify(this.ERROR_ANNUAL_VOLUME_MESSAGE, 'error');
          return false;
        }
      }

      return true;
    },

    function validateBusinessProfile() {
      var businessProfile = this.viewData.user;

      if ( ! businessProfile.organization ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_NAME_MESSAGE, 'error');
        return false;
      }

      if ( ! this.validatePhone(businessProfile.businessPhone.number) ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_PHONE_MESSAGE, 'error');
        return false;
      }

      var businessAddress = businessProfile.businessAddress;
      if ( ! this.validateStreetNumber(businessAddress.streetNumber) ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_STREET_NUMBER_MESSAGE, 'error');
        return false;
      }

      if ( ! this.validateAddress(businessAddress.streetName) ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_STREET_NAME_MESSAGE, 'error');
        return false;
      }

      if ( businessAddress.suite && !
         this.validateAddress(businessAddress.suite) ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_STREET_2_NAME_MESSAGE, 'error');
        return false;
      }

      if ( ! this.validateCity(businessAddress.city) ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_CITY_MESSAGE, 'error');
        return false;
      }

      if ( ! this.validatePostalCode(businessAddress.postalCode) ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_POSTAL_CODE_MESSAGE, 'error');
        return false;
      }

      if ( businessProfile.address.countryId === 'US' ) {
        if ( ! businessProfile.taxIdentificationNumber ) {
          this.notify(this.ERROR_TAX_ID_REQUIRED, 'error');
          return false;
        }
        if ( businessProfile.taxIdentificationNumber.length !== 9 ) {
          this.notify(this.ERROR_TAX_ID_INVALID, 'error');
          return false;
        }
      }

      if ( businessProfile.additionalDocuments.length <= 0 ) {
        this.notify(this.ERROR_ADD_BUSINESS_DOCS, 'error');
        return false;
      }

      return true;
    },

     function validatePrincipalOwners() {
      var principalOwnersCount = this.viewData.user.principalOwners.length;
      if ( ! this.viewData.noPrincipalOwners && ! this.viewData.publiclyTradedEntity ) {
        if ( principalOwnersCount <= 0 ) {
          this.notify(this.ERROR_NO_BENEFICIAL_OWNERS, 'error');
          return false;
        }
      }
      return true;
    },

    async function saveBusiness() {
      this.user = this.viewData.user;
      try {
        var result = await this.businessDAO.put(this.user);
        this.user.copyFrom(result);
        this.viewData.user = this.user;
      } catch (exp) {
        this.notify(this.SAVE_FAILURE_MESSAGE, 'error');
        return false;
      }
      return true;
    },

    async function saveAgent() {
      this.agent = this.viewData.agent;
      try {
        var result = await this.userDAO.put(this.agent);
        this.agent.copyFrom(result);
        this.viewData.agent = this.agent;
      } catch (exp) {
        this.notify(this.SAVE_FAILURE_MESSAGE, 'error');
        return false;
      }

      return true;
    },

    async function saveProgress(andLogout) {
      var isSaved;
      if ( this.position === 3 ) {
        isSaved = await this.saveAgent();
      } else {
        isSaved = await this.saveBusiness();
      }
      if ( isSaved ) {
        this.notify(self.SAVE_SUCCESSFUL_MESSAGE);
        this.stack.back();
      } else {
        this.notify(self.SAVE_FAILURE_MESSAGE, 'error');
      }
    },
    function notify(message, type) {
      this.add(this.NotificationMessage.create({
        message,
        type
      }));
    }
  ],

  actions: [
    {
      name: 'save',
      isAvailable: function(position) {
        return ( position < this.views.length - 1 );
      },
      code: function() {
        this.saveProgress();
      }
    },
    {
      name: 'goNext',
      isAvailable: function(position) {
        return ( position < this.views.length );
      },
      code: async function() {
        // move to next screen
        if ( this.position < this.views.length ) {
          if ( this.position === 1 ) {
            // validate Business Profile
            if ( ! this.validateBusinessProfile() ) return;
            var isSaved = await this.saveBusiness();
            if ( ! isSaved ) {
              return;
            }
          }
          if ( this.position === 2 ) {
            // validate transaction info
            if ( ! this.validateTransactionInfo() ) return;
            var isSaved = await this.saveBusiness();
            if ( ! isSaved ) {
              return;
            }
          }
          if ( this.position === 3 ) {
            // validate principal owner or push stack back to complete registration.
            if ( this.viewData.agent.signingOfficer ) {
              if ( ! this.validateSigningOfficerInfo() ) return;
              var isAgentSaved = await this.saveAgent();
              if ( ! isAgentSaved ) {
                return;
              }
            } else {
              // if not signing officer then exit wizard
              var isAgentSaved = await this.saveAgent();
              if ( isAgentSaved ) {
                this.notify(this.SUCCESS_REGISTRATION_MESSAGE);
                this.stack.back();
              }
              return;
            }
          }
          if ( this.position === 4 ) {
            // validate principal owners info
            if ( ! this.validatePrincipalOwners() ) return;
            this.notify(this.SUCCESS_REGISTRATION_MESSAGE);
            this.user.onboarded = true;
            this.user.compliance = this.ComplianceStatus.REQUESTED;
            this.ctrl.bannerizeCompliance();
            var isBusinessSaved = await this.saveBusiness();
            if ( isBusinessSaved ) {
              this.notify(this.SUCCESS_REGISTRATION_MESSAGE);
              var menu = await this.menuDAO.find('sme.accountProfile.business-settings');
              if ( menu ) {
                menu.launch();
              } else {
                this.stack.back();
              }
            }
            return;
          }

          this.subStack.push(this.views[this.subStack.pos + 1].view);
        }
      }
    }
  ]
});

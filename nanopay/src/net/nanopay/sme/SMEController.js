foam.CLASS({
  package: 'net.nanopay.sme',
  name: 'SMEController',
  extends: 'net.nanopay.ui.Controller',

  documentation: 'SME Top-Level Application Controller.',

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.accounting.AccountingIntegrationUtil',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',
    'net.nanopay.model.Business',
    'net.nanopay.sme.ui.AbliiActionView',
    'net.nanopay.sme.ui.AbliiOverlayActionListView',
    'net.nanopay.sme.ui.banner.ComplianceBannerData',
    'net.nanopay.sme.ui.banner.ComplianceBannerMode',
    'net.nanopay.sme.ui.ChangePasswordView',
    'net.nanopay.sme.ui.ResendPasswordView',
    'net.nanopay.sme.ui.ResetPasswordView',
    'net.nanopay.sme.ui.SMEModal',
    'net.nanopay.sme.ui.SMEStyles',
    'net.nanopay.sme.ui.SMEWizardOverview',
    'net.nanopay.sme.ui.SuccessPasswordView',
    'net.nanopay.sme.ui.ToastNotification as NotificationMessage',
    'net.nanopay.sme.ui.TwoFactorSignInView',
    'net.nanopay.sme.ui.VerifyEmailView',
    'foam.u2.Element',
  ],

  exports: [
    'accountingIntegrationUtil',
    'agent',
    'appConfig',
    'as ctrl',
    'bannerData',
    'bannerizeCompliance',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'currentAccount',
    'privacyUrl',
    'termsUrl',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  css: `
  ^ .foam-u2-view-TableView tbody > tr > td {
    white-space: nowrap;
    max-width: 280px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-auth-ui-UserSelectionView .styleHolder_NameField {
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-auth-ui-UserSelectionView .styleHolder_EmailField {
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-sme-ui-InvoiceDetails .medium-header {
    overflow: hidden;
    white-space: nowrap;
    max-width: 300px;
    text-overflow: ellipsis;
  }
  /* Side Menu Name format length */
  ^ .net-nanopay-sme-ui-SideNavigationView .account-button-info-detail {
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-sme-ui-SideNavigationView .account-button-info-detail-small {
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-sme-ui-CompanyInformationView .table-content {
    overflow: hidden;
    white-space: nowrap;
    max-width: 240px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-sme-ui-AddUserToBusinessModal .medium-header {
    overflow: hidden;
    white-space: nowrap;
    max-width: 450px;
    text-overflow: ellipsis;
  }
  ^ .toast-link {
    color: #604aff;
    cursor: pointer;
    margin-left: 5px;
    text-decoration: underline;
  }
  `,

  messages: [
    {
      name: 'COMPLIANCE_NOT_REQUESTED_NO_BANK',
      message: 'Please complete your business profile and add a bank account.'
    },
    {
      name: 'COMPLIANCE_NOT_REQUESTED_BANK_NEED_VERIFY',
      message: 'Please verify your bank account and complete your business profile to submit your account for review.'
    },
    {
      name: 'COMPLIANCE_NOT_REQUESTED_BANK_VERIFIED',
      message: 'Please complete your business profile to submit your account for review.'
    },
    {
      name: 'COMPLIANCE_REQUESTED_NO_BANK',
      message: 'Please add a bank account to submit your account for review.'
    },
    {
      name: 'COMPLIANCE_REQUESTED_BANK_NEED_VERIFY',
      message: 'Please verify your bank account to submit your account for review.'
    },
    {
      name: 'BUSINESS_INFO_UNDER_REVIEW',
      message: 'Our compliance team is reviewing the information you have submitted. Your account will be updated in 1-3 business days.'
    },
    {
      name: 'PASSED_BANNER',
      message: 'Congratulations! Your business is now fully verified and ready to make domestic payments!'
    },
    {
      name: 'TWO_FACTOR_REQUIRED_ONE',
      message: 'For your security, two factor authentication is required to send payment.'
    },
    {
      name: 'TWO_FACTOR_REQUIRED_TWO',
      message: 'Click here to set up.'
    },
    {
      name: 'HAS_NOT_PASSED_COMPLIANCE',
      message: `Our team is reviewing your account. Once it is approved, you can complete this action.`
    },
    {
      name: 'QUERY_BANK_AMOUNT_ERROR',
      message: 'An unexpected error occurred while counting the number of bank accounts the user has: '
    },
    {
      name: 'ADDED_TO_BUSINESS_1',
      message: "You've been successfully added to "
    },
    {
      name: 'ADDED_TO_BUSINESS_2',
      message: '. Welcome to Ablii!'
    },
    {
      name: 'ABILITY_TO_PAY_ERROR',
      message: 'Error occurred when checking the ability to send payment'
    },
    {
      name: 'ABILITY_TO_RECEIVE_ERROR',
      message: 'Error occurred when checking the ability to receive payment'
    }
  ],

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'agent',
      documentation: `
        If a user acts as a Business, this will be set to the user acting as
        the business.
      `
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.model.Business',
      name: 'user',
      factory: function() {
        return this.Business.create({});
      },
      documentation: `
        If a user acts as a Business, this will be set to the Business.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.sme.ui.banner.ComplianceBannerData',
      name: 'bannerData',
      factory: function() {
        return this.ComplianceBannerData.create({
          isDismissed: true
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.accounting.AccountingIntegrationUtil',
      name: 'accountingIntegrationUtil',
      factory: function() {
        return this.AccountingIntegrationUtil.create();
      }
    },
    {
      class: 'Array',
      name: 'complianceStatusArray',
      documentation: `
        A customized array contains objects for the toast notification 
        and banner to handle different cases of the business onboarding status
        and the bank account status.
      `,
      factory: function() {
        var self = this;
        return [
          {
            msg: this.COMPLIANCE_NOT_REQUESTED_NO_BANK,
            bannerMode: this.ComplianceBannerMode.NOTICE,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.NOTREQUESTED
                && accountArray.length === 0;
            },
            passed: false,
            showBanner: false
          },
          {
            msg: this.COMPLIANCE_NOT_REQUESTED_BANK_NEED_VERIFY,
            bannerMode: this.ComplianceBannerMode.NOTICE,
            condition: function(user, accountArray) {
              if ( accountArray.length === 0 ) {
                return false;
              } else {
                return user.compliance === self.ComplianceStatus.NOTREQUESTED
                  && accountArray[0].status === self.BankAccountStatus.UNVERIFIED;
              }
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_NOT_REQUESTED_BANK_VERIFIED,
            bannerMode: this.ComplianceBannerMode.NOTICE,
            condition: function(user, accountArray) {
              if ( accountArray.length === 0 ) {
                return false;
              } else {
                return user.compliance === self.ComplianceStatus.NOTREQUESTED
                && accountArray[0].status === self.BankAccountStatus.VERIFIED;
              }
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_REQUESTED_NO_BANK,
            bannerMode: this.ComplianceBannerMode.NOTICE,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.REQUESTED
                && accountArray.length === 0;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_REQUESTED_BANK_NEED_VERIFY,
            bannerMode: this.ComplianceBannerMode.NOTICE,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.REQUESTED
                && accountArray[0].status === self.BankAccountStatus.UNVERIFIED;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.BUSINESS_INFO_UNDER_REVIEW,
            bannerMode: this.ComplianceBannerMode.NOTICE,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.REQUESTED
                && accountArray[0].status === self.BankAccountStatus.VERIFIED;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.PASSED_BANNER,
            bannerMode: this.ComplianceBannerMode.ACCOMPLISHED,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.PASSED
                && accountArray[0].status === self.BankAccountStatus.VERIFIED;
            },
            passed: true,
            showBanner: true
          }
        ];
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      // Enable session timer.
      this.sessionTimer.enable = true;
      this.sessionTimer.onSessionTimeout = this.onSessionTimeout.bind(this);

      window.onpopstate = async (event) => {
        var menu;

        // Redirect user to switch business if agent doesn't exist.
        if ( ! this.agent ) {
          menu = await this.client.menuDAO.find('sme.accountProfile.switch-business');
          menu.launch(this);
          return;
        }

        var hash = location.hash.substr(1);
        menu = await this.client.menuDAO.find(hash);

        // Any errors in finding the menu location to redirect
        // will result in a redirect to dashboard.
        if ( menu ) {
          menu.launch(this);
        }

        this.bannerizeCompliance();
      };
    },

    function onSessionTimeout() {
      if ( this.user.emailVerified ) {
        this.add(this.SMEModal.create({ closeable: false }).tag({
          class: 'net.nanopay.ui.modal.SessionTimeoutModal',
        }));
      }
    },

    function initE() {
      var self = this;

      self.clientPromise.then(function() {
        self.client.nSpecDAO.find('appConfig').then(function(config) {
          self.appConfig.copyFrom(config.service);
        });
        self.fetchAgent();

        self.AppStyles.create();
        self.SMEStyles.create();
        self.InvoiceStyles.create();
        self.ModalStyling.create();

        // TODO & NOTE: This is a workaround. This prevents the CSS from breaking when viewing it in a subclass first before the parent class.
        self.BankPadAuthorization.create();

        self.__subContext__.register(self.AbliiActionView, 'foam.u2.ActionView');
        self.__subContext__.register(self.SMEWizardOverview, 'net.nanopay.ui.wizard.WizardOverview');
        self.__subContext__.register(self.SMEModal, 'foam.u2.dialog.Popup');
        self.__subContext__.register(self.ResetPasswordView, 'foam.nanos.auth.resetPassword.EmailView');
        self.__subContext__.register(self.ResendPasswordView, 'foam.nanos.auth.resetPassword.ResendView');
        self.__subContext__.register(self.ChangePasswordView, 'foam.nanos.auth.resetPassword.ResetView');
        self.__subContext__.register(self.SuccessPasswordView, 'foam.nanos.auth.resetPassword.SuccessView');
        self.__subContext__.register(self.VerifyEmailView, 'foam.nanos.auth.ResendVerificationEmail');
        self.__subContext__.register(self.NotificationMessage, 'foam.u2.dialog.NotificationMessage');
        self.__subContext__.register(self.TwoFactorSignInView, 'foam.nanos.auth.twofactor.TwoFactorSignInView');
        self.__subContext__.register(self.AbliiOverlayActionListView, 'foam.u2.view.OverlayActionListView');

        self.findBalance();
        self.addClass(self.myClass())
          .tag('div', null, self.topNavigation_$)
          .start()
            .addClass('stack-wrapper')
            .start({
              class: 'net.nanopay.sme.ui.banner.ComplianceBanner',
              data$: self.bannerData$
            })
            .end()
            .tag({
              class: 'foam.u2.stack.StackView',
              data: self.stack,
              showActions: false
            })
          .end()
          .tag('div', null, self.footerView_$);

          /*
            This is mandatory.
            'topNavigation_' & 'footerView' need empty view when initialize,
            otherwise they won't toggle after signin.
          */
          self.topNavigation_.add(foam.u2.View.create());
          self.footerView_.hide();
      });
    },

    function requestLogin() {
      var self = this;
      var locHash = location.hash;
      var view = { class: 'net.nanopay.sme.ui.SignInView' };

      if ( locHash ) {
        // Don't go to log in screen if going to reset password screen.
        if ( locHash === '#reset' ) {
          view = { class: 'foam.nanos.auth.resetPassword.ResetView' };
        }

        var searchParams = new URLSearchParams(location.search);

        // Don't go to log in screen if going to sign up password screen.
        if ( locHash === '#sign-up' && ! self.loginSuccess ) {
          view = {
            class: 'net.nanopay.sme.ui.SignUpView',
            emailField: searchParams.get('email'),
            disableEmail: !! searchParams.get('email'),
            signUpToken: searchParams.get('token'),
            companyNameField: searchParams.has('companyName')
              ? searchParams.get('companyName')
              : '',
            disableCompanyName: searchParams.has('companyName')
          };
        }
      }

      return new Promise(function(resolve, reject) {
        self.stack.push(view);
        self.loginSuccess$.sub(resolve);
      });
    },

    /**
     * This function is to set up the banner based on the condition of
     * business onboarding status and bank account status.
     */
    async function bannerizeCompliance() {
      var user = await this.client.userDAO.find(this.user.id);
      var accountArray = await this.getBankAccountArray();

      /*
       * Get the complianceStatus object from the complianceStatusArray
       * when it matches the condition of business onboarding status
       * and bank account status, also when showBanner is true.
       */
      var bannerElement = this.complianceStatusArray.find((complianceStatus) => {
        return complianceStatus.condition(user, accountArray) && complianceStatus.showBanner;
      });

      if ( bannerElement ) {
        this.setBanner(bannerElement.bannerMode, bannerElement.msg);
      }
    },

    function setBanner(bannerMode, message) {
      this.bannerData.isDismissed = false;
      this.bannerData.mode = bannerMode;
      this.bannerData.message = message;
    },

    async function checkComplianceAndBanking() {
      var user = await this.client.userDAO.find(this.user.id);
      var accountArray = await this.getBankAccountArray();

      var toastElement = this.complianceStatusArray.find((complianceStatus) => {
        return complianceStatus.condition(user, accountArray);
      });

      if ( toastElement ) {
        if ( ! toastElement.passed ) {
          this.notify(toastElement.msg, 'warning');
        }
        return toastElement.passed;
      } else {
        return false;
      }
    },

    /**
     * This function is to check if the user enable the 2FA when the user
     * have the permission to send a payable.
     * It is only required for payables.
     */
    async function check2FAEnalbed() {
      var canPayInvoice = await this.client.auth.check(null, 'invoice.pay');

      if ( canPayInvoice && ! this.agent.twoFactorEnabled ) {
        var TwoFactorNotificationDOM = this.Element.create()
          .start().style({ 'display': 'inline-block' })
            .add(this.TWO_FACTOR_REQUIRED_ONE)
          .end()
          .start('a').addClass('toast-link')
            .add(this.TWO_FACTOR_REQUIRED_TWO)
            .on('click', () => {
              this.pushMenu('sme.accountProfile.personal-settings');
            })
          .end();

        // Pass the customized DOM element into the toast notification
        this.notify(TwoFactorNotificationDOM, 'warning');
        return false;
      }
      return true;
    },

    async function checkAndNotifyAbilityToPay() {
      try {
        var result = await this.checkComplianceAndBanking();
        return result ? await this.check2FAEnalbed() : result;
      } catch (err) {
        console.warn(`${this.ABILITY_TO_PAY_ERROR}: `, err);
        this.notify(`${this.ABILITY_TO_PAY_ERROR}.`, 'error');
      }
    },

    async function checkAndNotifyAbilityToReceive() {
      try {
        return await this.checkComplianceAndBanking();
      } catch (err) {
        console.warn(`${this.ABILITY_TO_RECEIVE_ERROR}: `, err);
        this.notify(`${this.ABILITY_TO_RECEIVE_ERROR}.`, 'error');
      }
    },

    /**
     * Returns an array containing all the Canadian and US bank accounts
     * that user owns.
     */
    async function getBankAccountArray() {
      try {
        return (await this.user.accounts
          .where(this.OR(
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          ))
          .select()).array;
      } catch (err) {
        console.warn(this.QUERY_BANK_AMOUNT_ERROR, err);
      }
    }
  ],

  listeners: [
    function onUserAgentAndGroupLoaded() {
      if ( ! this.user.emailVerified ) {
        this.loginSuccess = false;
        this.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
        return;
      }

      this.bannerizeCompliance();
      this.setPortalView(this.group);

      for ( var i = 0; i < this.MACROS.length; i++ ) {
        var m = this.MACROS[i];
        if ( this.group[m] ) this[m] = this.group[m];
      }

      var hash = this.window.location.hash;
      if ( hash ) hash = hash.substring(1);

      if ( hash ) {
        window.onpopstate();
      } else if ( this.group ) {
        this.window.location.hash = this.group.defaultMenu;
      }
    }
  ]
});

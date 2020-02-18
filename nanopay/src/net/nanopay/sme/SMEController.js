foam.CLASS({
  package: 'net.nanopay.sme',
  name: 'SMEController',
  extends: 'net.nanopay.ui.Controller',

  documentation: 'SME Top-Level Application Controller.',

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.accounting.AccountingIntegrationUtil',
    'net.nanopay.util.OnboardingUtil',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction',
    'net.nanopay.model.SignUp',
    'net.nanopay.sme.ui.AbliiActionView',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.sme.ui.AbliiOverlayActionListView',
    'net.nanopay.sme.ui.SMEModal',
    'net.nanopay.sme.ui.SMEStyles',
    'net.nanopay.sme.ui.SMEWizardOverview',
    'net.nanopay.sme.ui.SuccessPasswordView',
    'net.nanopay.sme.ui.ToastNotification as NotificationMessage',
    'net.nanopay.sme.ui.TwoFactorSignInView',
    'net.nanopay.sme.ui.VerifyEmailView',
    'net.nanopay.ui.banner.BannerData',
    'net.nanopay.ui.banner.BannerMode',
    'foam.u2.Element'
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
    'isIframe',
    'onboardingUtil',
    'privacyUrl',
    'termsUrl'
  ],

  imports: [
    'canadaUsBusinessOnboardingDAO',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  css: `
  ^ {
    height: 100%;
    display: flex;
  }
  ^ > .stack-wrapper {
    flex-grow: 1;
  }
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
  ^ .net-nanopay-sme-ui-AbliiActionView-large {
    width: 160px;
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
      name: 'COMPLIANCE_PASSED_NO_BANK',
      message: 'Please add a bank account.'
    },
    {
      name: 'COMPLIANCE_PASSED_BANK_NEED_VERIFY',
      message: 'Please verify your bank account.'
    },
    {
      name: 'BUSINESS_INFO_UNDER_REVIEW',
      message: 'Our compliance team is reviewing the information you have submitted. Your account will be updated in 1-3 business days.'
    },
    {
      name: 'PASSED_BANNER',
      message: 'Congratulations, your business is now fully verified! You\'re now ready to make domestic payments!'
    },
    {
      name: 'PASSED_BANNER_DOMESTIC_US',
      message: 'Congratulations, your business is now fully verified! You\'re now ready to send and receive payments between Canada and the US!'
    },
    {
      name: 'PASSED_BANNER_INTERNATIONAL',
      message: 'Congratulations, your business is now fully verified! You\'re now ready to make domestic and international payments to USA!'
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
    },
    {
      name: 'QUERY_SIGNING_OFFICERS_ERROR',
      message: 'An unexpected error occurred while querying signing officers: '
    },
    {
      name: 'SELECT_BUSINESS_WARNING',
      message: 'Please select a business before proceeding'
    }
  ],

  properties: [
    {
      name: 'loginVariables',
      expression: function(client$smeBusinessRegistrationDAO) {
        return {
          dao_: client$smeBusinessRegistrationDAO || null,
          imgPath: 'images/sign_in_illustration.png',
          group_: 'sme',
          countryChoices_: ['CA', 'US']
        };
      }
    },
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
      of: 'foam.nanos.auth.User',
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
      of: 'net.nanopay.ui.banner.BannerData',
      name: 'bannerData',
      factory: function() {
        return this.BannerData.create({
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
      class: 'FObjectProperty',
      of: 'net.nanopay.util.OnboardingUtil',
      name: 'onboardingUtil',
      factory: function() {
        return this.OnboardingUtil.create();
      }
    },
    {
      class: 'Boolean',
      name: 'caUsOnboardingComplete'
    },
    {
      class: 'Boolean',
      name: 'verifiedAccount'
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
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.NOTREQUESTED
                && accountArray.length === 0;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_NOT_REQUESTED_BANK_NEED_VERIFY,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.NOTREQUESTED
                && ! verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_NOT_REQUESTED_BANK_VERIFIED,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.NOTREQUESTED
                && verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_REQUESTED_NO_BANK,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.REQUESTED
                && accountArray.length === 0;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_REQUESTED_BANK_NEED_VERIFY,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.REQUESTED
                && ! verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_PASSED_NO_BANK,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray) {
              return accountArray.length === 0
                && user.compliance === self.ComplianceStatus.PASSED;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_PASSED_BANK_NEED_VERIFY,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.PASSED
                && ! verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.BUSINESS_INFO_UNDER_REVIEW,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.REQUESTED
                && verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.PASSED_BANNER,
            bannerMode: this.BannerMode.ACCOMPLISHED,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
              && user.compliance === self.ComplianceStatus.PASSED
              && verifiedAccount
              && user.address.countryId === 'CA'
              && ! self.caUsOnboardingComplete;
            },
            passed: true,
            showBanner: true
          },
          {
            msg: this.PASSED_BANNER_INTERNATIONAL,
            bannerMode: this.BannerMode.ACCOMPLISHED,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
              && user.compliance === self.ComplianceStatus.PASSED
              && verifiedAccount
              && user.address.countryId === 'CA'
              && self.caUsOnboardingComplete;
            },
            passed: true,
            showBanner: true
          },
          {
            msg: this.PASSED_BANNER_DOMESTIC_US,
            bannerMode: this.BannerMode.ACCOMPLISHED,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.PASSED
                && verifiedAccount
                && user.address.countryId === 'US';
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
      if ( (this.user && this.user.emailVerified) ||
           (this.agent && this.agent.emailVerified) ) {
        this.add(this.SMEModal.create({ closeable: false }).tag({
          class: 'net.nanopay.ui.modal.SessionTimeoutModal',
        }));
      }
    },

    function initE() {
      var self = this;
      // Prevent action within platform if user is not a business. Redirect regular users to
      // switch business menu screen to select a business.
      this.stack$.dot('pos').sub(function() {
        if ( self.user.cls_ == net.nanopay.model.Business && self.loginSuccess ) {
          return;
        } else if (
          self.user.cls_ != self.Business &&
          self.loginSuccess &&
          location.hash != '#sme.accountProfile.switch-business'
        ) {
          self.pushMenu('sme.accountProfile.switch-business');
          self.notify(self.SELECT_BUSINESS_WARNING, 'warning');
        }
      });

      this.clientPromise.then(() => {
        this.fetchTheme().then(() => {
          this.client.nSpecDAO.find('appConfig').then((config) => {
            this.appConfig.copyFrom(config.service);
          });
          this.fetchAgent();

          this.AppStyles.create();
          this.SMEStyles.create();
          this.InvoiceStyles.create();
          this.ModalStyling.create();

          // TODO & NOTE: This is a workaround. This prevents the CSS from breaking when viewing it in a subclass first before the parent class.
          this.BankPadAuthorization.create();

          this.__subContext__.register(this.AbliiActionView, 'foam.u2.ActionView');
          this.__subContext__.register(this.SMEWizardOverview, 'net.nanopay.ui.wizard.WizardOverview');
          this.__subContext__.register(this.SMEModal, 'foam.u2.dialog.Popup');
          this.__subContext__.register(this.SuccessPasswordView, 'foam.nanos.auth.resetPassword.SuccessView');
          this.__subContext__.register(this.VerifyEmailView, 'foam.nanos.auth.ResendVerificationEmail');
          this.__subContext__.register(this.NotificationMessage, 'foam.u2.dialog.NotificationMessage');
          this.__subContext__.register(this.TwoFactorSignInView, 'foam.nanos.auth.twofactor.TwoFactorSignInView');
          this.__subContext__.register(this.AbliiOverlayActionListView, 'foam.u2.view.OverlayActionListView');
          this.__subContext__.register(this.SignUp, 'foam.nanos.u2.navigation.SignUp');

          if ( this.loginSuccess ) {
            this.findBalance();
          }
          if ( ! this.isIframe() ) {
            this.addClass(this.myClass())
            .add(this.loginSuccess$.map((loginSuccess) => {
              if ( ! loginSuccess ) return null;
              return this.E().tag(this.topNavigation_);
            }))
            .start()
              .addClass('stack-wrapper')
              .start({
                class: 'net.nanopay.ui.banner.Banner',
                data$: this.bannerData$
              })
              .end()
              .tag({
                class: 'foam.u2.stack.StackView',
                data: this.stack,
                showActions: false
              })
            .end();
          } else {
          this.addClass(this.myClass())
          .start()
            .addClass('stack-wrapper')
            .start({
              class: 'net.nanopay.ui.banner.Banner',
              data$: this.bannerData$
            })
            .end()
            .tag({
              class: 'foam.u2.stack.StackView',
              data: this.stack,
              showActions: false
            })
          .end();
          }
        });
      });
    },

    function isIframe() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    },

    function requestLogin() {
      var self = this;
      var locHash = location.hash;
      var view = { class: 'foam.u2.view.LoginView', mode_: 'SignIn' };

      if ( locHash ) {
        var searchParams = new URLSearchParams(location.search);

        if ( locHash === '#reset' ) {
          view = { class: 'foam.nanos.auth.ChangePasswordView' };
        }

        if ( locHash === '#sign-up' && ! self.loginSuccess ) {
          view = {
            class: 'foam.u2.view.LoginView',
            mode_: 'SignUp',
            param: {
              email: searchParams.get('email'),
              disableEmail_: searchParams.has('email'),
              token_: searchParams.get('token'),
              organization: searchParams.has('companyName')
                ? searchParams.get('companyName')
                : '',
              disableCompanyName_: searchParams.has('companyName'),
              countryChoices_: searchParams.has('country') ? [searchParams.get('country')] : ['CA', 'US'],
              firstName: searchParams.has('firstName') ? searchParams.get('firstName') : '',
              lastName: searchParams.has('lastName') ? searchParams.get('lastName') : '',
              jobTitle: searchParams.has('jobTitle') ? searchParams.get('jobTitle') : '',
              phone: searchParams.has('phone') ? searchParams.get('phone') : '',
            }
          };
        }

        // Process auth token
        if ( ! self.loginSuccess && !! searchParams.get('token') ) {
          self.client.authenticationTokenService.processToken(null, null,
            searchParams.get('token')).then(() => {
              location = locHash == '#onboarding' ? '/' : '/' + locHash;
            });
        }
      }

      return new Promise(function(resolve, reject) {
        self.stack.push(view, self);
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
      if ( accountArray ) {
        for ( i =0; i < accountArray.length; i++ ) {
          if ( accountArray[i].status == this.BankAccountStatus.VERIFIED ) {
            this.verifiedAccount = true;
          }
        }
      }
      await this.getCAUSPaymentEnabled(user, this.agent);

      if ( user.compliance == this.ComplianceStatus.PASSED ) {
        var signingOfficers = await this.getSigningOfficersArray(user);
        this.coalesceUserAndSigningOfficersCompliance(user, signingOfficers);
      }

      /*
       * Get the complianceStatus object from the complianceStatusArray
       * when it matches the condition of business onboarding status
       * and bank account status, also when showBanner is true.
       */
      var bannerElement = this.complianceStatusArray.find((complianceStatus) => {
        return complianceStatus.condition(user, accountArray, this.verifiedAccount) && complianceStatus.showBanner;
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

      if ( user.compliance == this.ComplianceStatus.PASSED ) {
        var signingOfficers = await this.getSigningOfficersArray(user);
        this.coalesceUserAndSigningOfficersCompliance(user, signingOfficers);
      }

      if ( accountArray ) {
        for ( i =0; i < accountArray.length; i++ ) {
          if ( accountArray[i].status == this.BankAccountStatus.VERIFIED ) {
            this.verifiedAccount = true;
          }
        }
      }

      var toastElement = this.complianceStatusArray.find((complianceStatus) => {
        return complianceStatus.condition(user, accountArray, this.verifiedAccount);
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
        if ( this.appConfig.mode != foam.nanos.app.Mode.PRODUCTION ) {
          return true;
        } else {
          return false;
        }
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
    },

    /**
     * Returns an array containing all signing officers of the business.
     */
    async function getSigningOfficersArray(user) {
      if ( this.Business.isInstance(user) ) {
        try {
          return (await user.signingOfficers.junctionDAO.where(
            this.EQ(this.BusinessUserJunction.SOURCE_ID, user.id)).select()
          ).array;
        } catch (err) {
          console.warn(this.QUERY_SIGNING_OFFICERS_ERROR, err);
        }
      }
    },
    /**
     * Set caUsOnboardingComplete based on CA/US oboarding status.
     */
    async function getCAUSPaymentEnabled(user, agent) {
      if ( this.Business.isInstance(user) ) {
        this.__subSubContext__.canadaUsBusinessOnboardingDAO.find(
          this.AND(
            this.EQ(this.CanadaUsBusinessOnboarding.USER_ID, agent.id),
            this.EQ(this.CanadaUsBusinessOnboarding.BUSINESS_ID, user.id)
          )
        ).then((o) => {
          this.caUsOnboardingComplete = o && o.status === this.OnboardingStatus.SUBMITTED;
        });
      }
    },

    /*
     * Update user compliance by coalescing it with signing officers compliance.
     */
    function coalesceUserAndSigningOfficersCompliance(user, signingOfficers) {
      if ( signingOfficers === undefined ) return;

      for ( let i = 0; i < signingOfficers.length; i++ ) {
        if ( user.compliance != signingOfficers[i].compliance ) {
          user.compliance = signingOfficers[0].compliance;
          return;
        }
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

      var hash = this.window.location.hash;
      if ( hash ) hash = hash.substring(1);

      if ( hash ) {
        window.onpopstate();
      } else if ( this.group ) {
        this.window.location.hash = this.group.defaultMenu;
      }

      // Update the look and feel now that the user is logged in since there
      // might be a more specific one to use now.
      this.fetchTheme();
    }
  ]
});

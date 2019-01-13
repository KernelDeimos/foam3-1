foam.CLASS({
  package: 'net.nanopay.sme',
  name: 'SMEController',
  extends: 'net.nanopay.ui.Controller',

  documentation: 'SME Top-Level Application Controller.',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.sme.ui.ChangePasswordView',
    'net.nanopay.sme.ui.ResendPasswordView',
    'net.nanopay.sme.ui.ResetPasswordView',
    'net.nanopay.sme.ui.SMEModal',
    'net.nanopay.sme.ui.SMEStyles',
    'net.nanopay.sme.ui.SMEWizardOverview',
    'net.nanopay.sme.ui.SuccessPasswordView',
    'net.nanopay.sme.ui.ToastNotification',
    'net.nanopay.sme.ui.VerifyEmail',
    'net.nanopay.sme.ui.TwoFactorSignInView',
    'net.nanopay.model.Business',
    'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',
    'net.nanopay.sme.ui.banner.ComplianceBannerData',
    'net.nanopay.sme.ui.banner.ComplianceBannerMode',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  exports: [
    'agent',
    'appConfig',
    'as ctrl',
    'balance',
    'bannerizeCompliance',
    'currentAccount',
    'findAccount',
    'findBalance',
    'hasPassedCompliance',
    'notify',
    'privacyUrl',
    'termsUrl',
    'bannerData'
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
  /* InvoiceOverview Header format length */
  ^ .x-large-header {
    overflow: hidden;
    white-space: nowrap;
    max-width: 600px;
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
  `,

  messages: [
    { name: 'NotRequestedBanner', message: 'To enable payments, please complete your business profile and add a bank account.' },
    { name: 'RequestedBanner', message: 'We\'re currently reviewing your business profile to enable payments. This typically takes 2-3 business days.' },
    { name: 'PassedBanner', message: 'Congratulations! Your business is now fully verified and ready to make domestic and cross-border payments!' },
    {
      name: 'INCOMPLETE_BUSINESS_REGISTRATION',
      message: `You must finish business registration before sending or requesting money.`
    },
    {
      name: 'HAS_NOT_PASSED_COMPLIANCE',
      message: `Your business registration is still under review. Please wait until it has been approved until sending or requesting money.`
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
        If a user acts as a Business, this will be set to the user acting as
        the business.
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
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      self.clientPromise.then(function(client) {
        self.setPrivate_('__subContext__', client.__subContext__);
        foam.__context__.register(foam.u2.UnstyledActionView, 'foam.u2.ActionView');
        self.getCurrentUser();

        window.onpopstate = function(event) {
          if ( location.hash != null ) {
            // Redirect user to switch business if agent doesn't exist.
            if ( ! self.agent && location.hash !== '' ) {
              self.client.menuDAO.find('sme.accountProfile.switch-business')
                .then(function(menu) {
                  menu.launch();
                });
            } else {
              var hash = location.hash.substr(1);
              if ( hash !== '' ) {
                self.client.menuDAO.find(hash).then(function(menu) {
                  menu.launch();
                });
              }
            }
          }
        };
      });
    },

    function initE() {
      var self = this;

      self.clientPromise.then(function() {
        self.client.nSpecDAO.find('appConfig').then(function(config) {
          self.appConfig.copyFrom(config.service);
        });
        self.getCurrentAgent();

        self.AppStyles.create();
        self.SMEStyles.create();
        self.InvoiceStyles.create();
        self.ModalStyling.create();

        // TODO & NOTE: This is a workaround. This prevents the CSS from breaking when viewing it in a subclass first before the parent class.
        self.BankPadAuthorization.create();

        foam.__context__.register(self.ActionView, 'foam.u2.ActionView');
        foam.__context__.register(self.SMEWizardOverview, 'net.nanopay.ui.wizard.WizardOverview');
        foam.__context__.register(self.SMEModal, 'foam.u2.dialog.Popup');
        foam.__context__.register(self.ResetPasswordView, 'foam.nanos.auth.resetPassword.EmailView');
        foam.__context__.register(self.ResendPasswordView, 'foam.nanos.auth.resetPassword.ResendView');
        foam.__context__.register(self.ChangePasswordView, 'foam.nanos.auth.resetPassword.ResetView');
        foam.__context__.register(self.SuccessPasswordView, 'foam.nanos.auth.resetPassword.SuccessView');
        foam.__context__.register(self.VerifyEmail, 'foam.nanos.auth.ResendVerificationEmail');
        foam.__context__.register(self.ToastNotification, 'foam.u2.dialog.NotificationMessage');
        foam.__context__.register(self.TwoFactorSignInView, 'foam.nanos.auth.twofactor.TwoFactorSignInView');

        self.findBalance();
        self.addClass(self.myClass())
          .tag('div', null, self.topNavigation_$)
          .start()
            .addClass('stack-wrapper')
            .start({ class: 'net.nanopay.sme.ui.banner.ComplianceBanner', data$: self.bannerData$ })
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
      // don't go to log in screen if going to reset password screen
      if ( location.hash != null && location.hash === '#reset' ) {
        return new Promise(function(resolve, reject) {
          self.stack.push({ class: 'foam.nanos.auth.resetPassword.ResetView' }); // TODO SME specific
          self.loginSuccess$.sub(resolve);
        });
      }

      // don't go to log in screen if going to sign up password screen
      if ( location.hash != null && location.hash === '#sign-up' && ! self.loginSuccess ) {
        var searchParams = new URLSearchParams(location.search);
        return new Promise(function(resolve, reject) {
          self.stack.push({
            class: 'net.nanopay.sme.ui.SignUpView',
            emailField: searchParams.get('email'),
            disableEmail: true,
            signUpToken: searchParams.get('token'),
            companyNameField: searchParams.has('companyName') ? searchParams.get('companyName'): '',
            disableCompanyName: searchParams.has('companyName')
          });
          self.loginSuccess$.sub(resolve);
        });
      }

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'net.nanopay.sme.ui.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    },

    function getCurrentUser() {
      var self = this;
      // get current user, else show login
      this.client.auth.getCurrentUser(null).then(function(result) {
        self.loginSuccess = !! result;
        if ( result ) {
          self.user.copyFrom(result);
          // check if user email verified
          if ( ! self.user.emailVerified ) {
            self.loginSuccess = false;
            self.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
            return;
          }

          self.onUserUpdate();
          self.bannerizeCompliance();
        }
      })
      .catch(function(err) {
        self.requestLogin().then(function() {
          self.getCurrentUser();
        });
      });
    },

    function getCurrentAgent() {
      var self = this;
      // get current user, else show login
      this.client.agentAuth.getCurrentAgent(this).then(function(result) {
        if ( result ) {
          self.agent = result;

          self.onUserUpdate();
        }
      }).catch(function(err) {
        self.requestLogin().then(function() {
          self.getCurrentUser();
        });
      });
    },

    function bannerizeCompliance() {
      switch ( this.user.compliance ) {
        case this.ComplianceStatus.NOTREQUESTED:
          this.bannerData.isDismissed = false;
          this.bannerData.mode = this.ComplianceBannerMode.NOTICE;
          this.bannerData.message = this.NotRequestedBanner;
          break;
        case this.ComplianceStatus.REQUESTED:
          this.bannerData.isDismissed = false;
          this.bannerData.mode = this.ComplianceBannerMode.NOTICE;
          this.bannerData.message = this.RequestedBanner;
          break;
        case this.ComplianceStatus.PASSED:
          this.bannerData.isDismissed = false;
          this.bannerData.mode = this.ComplianceBannerMode.ACCOMPLISHED;
          this.bannerData.message = this.PassedBanner;
          break;
        default:
          this.bannerData.isDismissed = true;
          break;
      }
    },

    function notify(message, type) {
      this.add(this.NotificationMessage.create({ message, type }));
    },

    function hasPassedCompliance() {
      if ( this.user.compliance !== this.ComplianceStatus.PASSED ) {
        if ( this.user.onboarded ) {
          this.notify(this.HAS_NOT_PASSED_COMPLIANCE, 'error');
        } else {
          this.notify(this.INCOMPLETE_BUSINESS_REGISTRATION, 'error');
        }
        return false;
      }
      return true;
    }
  ]
});

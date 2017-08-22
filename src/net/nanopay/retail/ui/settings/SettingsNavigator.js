foam.CLASS({
  package: 'net.nanopay.retail.ui.settings',
  name: 'SettingsNavigator',
  extends: 'foam.u2.View',

  imports: [ 'stack' ],

  documentation: 'View to navigate between setting pages.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .settingsBar {
          width: 100%;
          height: 40px;
          line-height: 40px;
          background-color: #FFFFFF;
          margin-bottom: 20px;
        }

        ^ .settingsBarContainer {
          width: 992px;
          margin: auto;
        }

        ^ .foam-u2-ActionView {
          opacity: 0.6;
          font-family: Roboto;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.3px;
          color: #093649;
          padding: 0;
          padding-left: 30px;
          display: inline-block;
          cursor: pointer;
          margin: 0;
          border: none;
          background: transparent;
          outline: none;
          line-height: 40px;
        }

        ^ .foam-u2-ActionView:first-child {
          padding-left: 0;
        }

        ^ .foam-u2-ActionView:hover {
          background: white;
          opacity: 1;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())

        .start('div').addClass('settingsBar')
          .start('div').addClass('settingsBarContainer')
            .add(this.PERSONAL_PROFILE)
            .add(this.BUSINESS_PROFILE)
            .add(this.BANK_ACCOUNT)
            .add(this.CASH_OUT)
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'personalProfile',
      label: 'Personal Profile',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.retail.ui.settings.personal.PersonalSettingsView' });
      }
    },
    {
      name: 'businessProfile',
      label: 'Business Profile',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.retail.ui.settings.business.BusinessSettingsView' });
      }
    },
    {
      name: 'bankAccount',
      label: 'Bank Account',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.retail.ui.settings.bankAccount.BankAccountSettingsView' });
      }
    },
    {
      name: 'cashOut',
      label: 'Cash Out',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.retail.ui.settings.autoCashout.AutoCashoutSettingsView' });
      }
    }
  ]
});

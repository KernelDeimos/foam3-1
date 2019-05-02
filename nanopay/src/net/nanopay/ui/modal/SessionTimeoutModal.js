foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'SessionTimeoutModal',
  extends: 'foam.u2.Controller',

  documentation: ``,

  imports: [
    'auth',
    'user',
    'userDAO',
    'accountDAO',
    'requestLogin',
    'notify',
    'sessionTimer'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccount'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling',
    'foam.mlang.Expressions'
  ],

  css: `
    ^ .Container {
      width: 330px !important;
      height: 194px !important
    }
    
    ^ .headerTitle {
      width: 214px;
      height: 36px;
      margin-left: 24px;
      margin-top: 24px;
      font-family: Lato;
      font-size: 24px;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
    }
    
    ^ .content {
      margin-left:24px;
      margin-top: 8px;
      width: 282px;
      height: 51px;
      font-family: Lato;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
    }
    
    ^ .net-nanopay-ui-ActionView-signOut {
      width: 96px;
      height: 36px;
    }
    
    ^ .net-nanopay-ui-ActionView-staySignIn {
      width: 120px;
      height: 36px;
      margin-left: 16px;
    }
    
    ^ .actions {
      height: 68px;
      width: 328px;
      padding-left: 71px;
      padding-top: 26px;
    }
  `,

  properties: [
    {
      name: 'countDownValue',
      value: 60,
      postSet: function (oldVal, newVal) {
        if (newVal === 0) {
          this.signOut();
        }
      }
    }
  ],

  methods: [
    function initE() {

      this.timer = setInterval(() => {
        this.countDownValue--;
      }, 1000);

      this.SUPER();
      this
        .start().addClass(this.myClass())
        .start().addClass('Container')
          .start().addClass('headerTitle').add('Session Timeout').end()
          .start().addClass('content')
            .add('Your session is about to expire.  You will be automatically signed out in ')
            .add(this.countDownValue$)
            .add('s.  To continue your session, select Stay Signed In.')
          .end()
          .start().addClass('actions')
            .add(this.SIGN_OUT)
            .add(this.STAY_SIGN_IN)
          .end()
        .end()
        .end()
        .end();
    }
  ],
  actions: [
    {
      name: 'signOut',
      label: 'Sign Out',
      code: async function (X) {

        try {
          X.closeDialog();
          clearTimeout(this.sessionTimer.timer);
          await this.auth.logout();
          window.location.assign(window.location.origin);
        } catch (e) {
          this.notify(e.toString(), 'error');
          window.location.assign(window.location.origin);
        }
      }
    },
    {
      name: 'staySignIn',
      label: 'Stay Signed in',
      code: async function (X) {
        clearInterval(this.timer);
        this.timer = null;

        try {
          X.closeDialog();
          await this.accountDAO.where(
            this.EQ(this.BankAccount.OWNER, this.user.id),
          ).select();
        } catch (e) {
          this.notify(e.toString(), 'error');
          this.signOut();
        }
      }
    }
  ]
});

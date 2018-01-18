foam.CLASS({
  package: 'net.nanopay.cico.ui.co',
  name: 'CashOutSuccessModal',
  extends: 'foam.u2.Controller',

  imports: [ 'closeDialog', 'amount' ],

  documentation: 'Pop up modal displaying details of a successful cash out.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 448px;
          height: 288px;
          margin: auto;
        }
        ^ .cashOutContainer {
          width: 448px;
          height: 288px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
        }
        ^ .popUpHeader {
          width: 448px;
          height: 40px;
          background-color: #093649;
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
        ^ .successIcon {
          width: 60px;
          height: 60px;
          display: inline-block;
          margin-left: 30px;
          padding: 0;
          vertical-align: top;
          margin-top: 20px;
        }
        ^ .cashOutResultDiv {
          margin-top: 34px;
          display: inline-block;
          width: 301px;
        }
        ^ .cashOutResult {
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.3px;
          color: #093649;
          display: inline-block;
        }
        ^ .net-nanopay-ui-ActionView-closeButton {
          width: 24px;
          height: 24px;
          margin: 0;
          margin-top: 7px;
          margin-right: 20px;
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
        ^ .net-nanopay-ui-ActionView-okButton {
          font-family: Roboto;
          width: 136px;
          height: 40px;
          position: static;
          border-radius: 2px;
          background: %SECONDARYCOLOR%;
          border: solid 1px %SECONDARYCOLOR%;
          display: inline-block;
          color: white;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin: 0;
          outline: none;
          box-shadow: none;
          font-weight: normal;
        }
        ^ .net-nanopay-ui-ActionView-okButton:hover {
          background: %SECONDARYCOLOR%;
          border-color: %SECONDARYCOLOR%;
          opacity: 0.9;
        }
        ^ .amount {
          width: 100px;
          height: 16px;
          display: inline-block;
          padding: 0;
          margin: 0;
          margin-left: 5px;
          margin-bottom: 20px;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.3px;
          color: #093649;
        }
        ^ .okButtonDiv {
          width: 100%;
          text-align: center;
          margin-top: 40px;
        }
    */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var formattedAmount = this.amount/100;

      this.addClass(this.myClass())
      .start()
        .start().addClass('cashOutContainer')
          .start().addClass('popUpHeader')
            .start().add(this.Title).addClass('popUpTitle').end()
            .add(this.CLOSE_BUTTON)
          .end()
          .start({class: 'foam.u2.tag.Image', data: 'images/done-30.svg'}).addClass('successIcon').end()
          .start('div').addClass('cashOutResultDiv')
            .start().add(this.CashOutSuccessDesc).addClass('cashOutResult').end()
            .start().add('$', formattedAmount.toFixed(2)).addClass('amount').end()
            .br()
            .start().add(this.CashOutResultDesc).addClass('cashOutResult').end()
          .end()
          .start('div').addClass('okButtonDiv')
            .add(this.OK_BUTTON)
          .end()
        .end()
      .end()
    }
  ],

  messages: [
    { name: 'Title', message: 'Cash Out' },
    { name: 'CashOutSuccessDesc', message: 'You have successfully cashed out ' },
    {
      name: 'CashOutResultDesc',
      message: "Please be advised that it will take around 2 business days for the balance to arrive in your bank account. If you don't see your balance after 5 business days please contact our advisor at XXX-XXX-XXXX."
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'okButton',
      label: 'OK',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
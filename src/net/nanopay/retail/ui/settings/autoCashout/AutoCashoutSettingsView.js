foam.CLASS({
  package: 'net.nanopay.retail.ui.settings.autoCashout',
  name: 'AutoCashoutSettingsView',
  extends: 'foam.u2.View',

  imports: [ 'stack' ],

  documentation: 'View displaying auto cashout information',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 100%;
          background-color: #edf0f5;
        }
        ^ .autoCashOutContainer {
          width: 992px;
          margin: auto;
        }
        ^ .col {
          display: inline-block;
          width: 492px;
          height: 280px;
          vertical-align: top;
        }
        ^ .title {
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          color: #093649;
          margin: 0;
        }
        ^ .instructions {
          font-size: 12px;
          margin: 0;
          line-height: 12px;
          color: #093649;
        }
        ^ .topMarginOverride {
          margin-top: 0;
        }
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
        ^ .updateContainer {
          height: inherit;
          padding: 0 53px;
          background-color: #FFFFFF;
        }
        ^ .planContainer {
          display: inline-block;
          width: 100%;
          height: 60px;
          background-color: #FFFFFF;
          line-height: 60px;
          font-size: 12px;
        }
        ^ .planContainer:hover {
          cursor: pointer;
        }
        ^ .planName {
          display: inline-block;
          margin: 0;
          margin-left: 60px;
          width: 120px;
        }
        ^ .planPricing {
          display: inline-block;
          margin: 0;
          margin-left: 170px;
          width: fit-content;
        }
        ^ .selectedPlan {
          background-color: #23C2B7;
          color: #FFFFFF;
        }
        ^ .promoRow {
          float: bottom;
          height: 40px;
        }
        ^ .promoRow p {
          line-height: 40px;
          width: fit-content;
          margin: 0;
        }
        ^ .bankBoxTitle {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          font-weight: normal;
          padding-top: 21px;
          color: #093649;
          margin: 0;
          display: inline-block;
        }
        ^ .cashOutSelectionText {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #2cab70;
          display: inline-block;
          margin: 0;
          margin-left: 6px;
        }
        ^ .minCashOutText {
          font-family: Roboto;
          font-size: 10px;
          line-height: 1.6;
          letter-spacing: 0.3px;
          color: #8f8f8f;
          margin: 0;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        ^ .learnMore {
          font-family: Roboto;
          font-size: 12px;
          letter-spacing: 0.3px;
          text-decoration: underline;
          color: #2cab70;
          cursor: pointer;
          margin-bottom: 0;
        }
        ^ .updateBtn {
          font-family: Roboto;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: #59a5d5;
          border: solid 1px #59a5d5;
          display: inline-block;
          color: white;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin: 0;
          outline: none;
          line-height: 40px;
          float: right;
          margin-top: 64px;
        }
        ^ .promoInput {
          width: 356px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px #ededed;
          display: inline-block;
          padding: 5px;
          margin-left: 33px;
          outline: 0;
        }
        ^ .enterPromo {
          font-family: Roboto;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.3px;
          color: #093649;
          display: inline-block;
        }
      */}
    })
  ],

  messages: [
    { name: 'Title',            message: 'Cash Out' },
    { name: 'Instructions1',    message: 'Please select your new plan.' },
    { name: 'Instructions2',    message: 'All changes will take effect on your next cash out.' },
    { name: 'TitlePayAsYouGo',  message: 'Pay-as-you-Go' },
    { name: 'PricePayAsYouGo',  message: '$1/Cash out' },
    { name: 'TitleMonthly',     message: 'Monthly' },
    { name: 'PriceMonthly',     message: '$5/Month' },
    { name: 'LabelPromo',       message: 'Enter promo code:' },
    { name: 'MinCashOut', message: '* Minimum cashout is $5. To cash out less than the minimum, contact us at support@mintchip.ca'},
    { name: 'LearnMore', message: 'Learn more about our cash out plans.'}
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())

        //
        .start('div').addClass('settingsBar')
          .start('div').addClass('settingsBarContainer')
            .add(this.PERSONAL_PROFILE)
            .add(this.BUSINESS_PROFILE)
            .add(this.BANK_ACCOUNT)
            .add(this.CASH_OUT)
          .end()
        .end()
        .start('div').addClass('autoCashOutContainer')
          .start('div').addClass('row')
            .start('p').add(this.Title).addClass('title').end()
          .end()
          .start('div').addClass('row')
            .start('div').addClass('col').addClass('spacer')

              .start('div').addClass('row').addClass('topMarginOverride')
                .start('p').add(this.Instructions1).addClass('instructions').end()
              .end()
              .start('div').addClass('row')
                .start('p').add(this.Instructions2).addClass('instructions').end()
              .end()

              .start('div').addClass('row')
                .start('div').addClass('planContainer').addClass('selectedPlan')
                  .start('p').add(this.TitlePayAsYouGo).addClass('planName').end()
                  .start('p').add(this.PricePayAsYouGo).addClass('planPricing').end()
                .end()
              .end()
              .start('div').addClass('row')
                .start('div').addClass('planContainer')
                  .start('p').add(this.TitleMonthly).addClass('planName').end()
                  .start('p').add(this.PriceMonthly).addClass('planPricing').end()
                .end()
              .end()

              .start('div').addClass('row').addClass('promoRow')
                .start('p').add(this.LabelPromo).addClass('enterPromo').end()
                .start('input').addClass('promoInput').end()
              .end()
            .end()

            .start('div').addClass('col').addClass('spacer')
              .start('div').addClass('updateContainer')
                .start('h6').add('You have selected:').addClass('bankBoxTitle').end()
                .start('h6').add('Pay-as-you-Go ($1 per cashout).').addClass('cashOutSelectionText').end()
                .start('h6').add(this.MinCashOut).addClass('minCashOutText').end()
                .start('h6').add(this.LearnMore).addClass('learnMore').end()
                .start('div').add('Update').addClass('updateBtn').end()
              .end()
            .end()
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

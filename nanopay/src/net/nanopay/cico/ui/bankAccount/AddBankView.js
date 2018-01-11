foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'AddBankView',
  extends: 'foam.u2.View',

  documentation: 'View for adding a shopper through the wizard view flow',

  properties: [
    'startAtValue',
    'wizardTitle',
    'backLabelValue',
    'nextLabelValue'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .tag({ class: 'net.nanopay.cico.ui.bankAccount.form.BankForm', title: this.wizardTitle, startAt: this.startAtValue, backLabel: this.backLabelValue, nextLabel: this.nextLabelValue })
        .end();
    }
  ]
});

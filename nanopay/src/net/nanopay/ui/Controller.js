foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',
  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },  
  documentation: 'Nanopay Top-Level Application Controller.',

  implements: [ 'net.nanopay.util.CurrencyFormatter' ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.model.Account',
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Currency',
    'net.nanopay.ui.style.AppStyles',
    'net.nanopay.ui.modal.ModalStyling',
    'net.nanopay.invoice.ui.style.InvoiceStyles'
  ],

  exports: [
    'account',
    'as ctrl'
  ],

  css: `
    .stack-wrapper {
      margin-bottom: -10px;
      min-height: calc(80% - 60px);
    }

    .stack-wrapper:after {
      content: "";
      display: block;
    }

    .stack-wrapper:after, .net-nanopay-b2b-ui-shared-FooterView {
      height: 10px;
    }

    .foam-comics-DAOUpdateControllerView .property-transactionLimits .net-nanopay-ui-ActionView-addItem {
      height: auto;
      padding: 3px;
      width: auto;
    }

    .foam-comics-DAOControllerView .foam-u2-view-TableView-row {
      height: 40px;
    }

    .foam-u2-view-TableView .net-nanopay-ui-ActionView {
      height: auto;
      padding: 8px;
      width: auto;
    }
  `,

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.model.Account',
      name: 'account',
      factory: function() { return this.Account.create(); }
    }
  ],

  methods: [
    function initE() {
      this.AppStyles.create();
      this.InvoiceStyles.create();
      this.ModalStyling.create();

      var self = this;
      foam.__context__.register(net.nanopay.ui.ActionView, 'foam.u2.ActionView');
      
      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.ui.topNavigation.TopNav' })
        .br()
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end()
        .br()
        .tag({class: 'net.nanopay.ui.FooterView'});
    }
  ]
});

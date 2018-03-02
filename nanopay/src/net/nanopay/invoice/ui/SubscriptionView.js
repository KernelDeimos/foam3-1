foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionView',
  extends: 'foam.u2.View',

  documentation: "Summary View of User' Recurring Invoices.",

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice'
  ],

  imports: [
    'recurringInvoiceDAO',
    'invoiceDAO'
  ],

  exports: [ 'hideActionButton' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
        }
        ^ .net-nanopay-ui-ActionView-create{
          display: none;
        }
        ^ .button-div{
          margin-bottom: 25px;
        }
        ^ .foam-u2-view-TableView th {
          text-align: center !important;
        }
        ^ .foam-u2-view-TableView td{
          text-align: center !important;
        }
        */
      }
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'hideActionButton',
      value: false
    }
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideActionButton$)
          .start().addClass('button-div')
            .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-filter.png', text: 'Filters'}})
            .start().addClass('inline float-right')
            .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-print.png', text: 'Print'}}).addClass('import-button').end()
            .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-export.png', text: 'Export'}}).addClass('import-button').end()
            .end()
          .end()
        .end()
        .start({
          class: 'foam.u2.ListCreateController',
          dao: this.recurringInvoiceDAO,
          detailView: { class: 'net.nanopay.invoice.ui.SubscriptionDetailView' },
          summaryView: this.SubscriptionTableView.create(),
          showActions: false
        })
        .end()
    }
  ],

  classes: [
    {
      name: 'SubscriptionTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.invoice.model.RecurringInvoice' ],

      imports: [ 'recurringInvoiceDAO' ],
      properties: [
        'selection',
        { name: 'data', factory: function() { return this.recurringInvoiceDAO; }}
      ],

      methods: [
        function initE() {

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              config: {
                amount: {
                  tableCellView: function(obj, e) {
                  return e.E().add('- $', obj.amount).style({color: '#c82e2e'})
                  }
                }
              },
              columns: [
                'id', 'payerName', 'nextInvoiceDate', 'amount', 'frequency', 'endsAfter', 'status'
              ]
            }).addClass(this.myClass('table')).end()
        }
      ],
    }
  ]
});

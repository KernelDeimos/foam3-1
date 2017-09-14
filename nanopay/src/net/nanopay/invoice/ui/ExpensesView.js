
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ExpensesView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Expenses Invoices.',

  requires: [ 'net.nanopay.invoice.model.Invoice' ],

  imports: [ 'invoiceDAO', 'user' ],

  exports: [ 'hideSaleSummary' ],

  properties: [ 
    'selection', 
    {
      class: 'Boolean',
      name: 'hideSaleSummary',
      value: false
    },
    { name: 'data', factory: function() { return this.invoiceDAO; }}
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
        }
        ^ .net-nanopay-invoice-ui-SummaryCard{
          width: 16.5%;
        }
        ^ .optionsDropDown {
          left: -92 !important;
          top: 30 !important;
        }
        */
      }
    })
  ], 

  messages: [
    {
      name: 'placeholderText',
      message: 'You don’t have any bills to pay now. When you receive an invoice from your partners, it will show up here.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideSaleSummary$)
          .start({class: 'net.nanopay.invoice.ui.PayableSummaryView'}).end()
          .start().addClass('container')
            .start().addClass('button-div')
              .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-filter.png', text: 'Filters'}})
              .start().addClass('inline')
                .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/approve.png', text: 'Pay'}})
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/dispute.png', text: 'Dispute'}}).addClass('import-button').end()
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/reject.png', text: 'Reject'}}).addClass('import-button').end()
              .end()          
              .start().addClass('inline')
                .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-sync-s.png', text: 'Sync'}})
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-import.png', text: 'Import'}}).addClass('import-button').end()
              .end()
            .end()
          .end()
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.invoiceDAO,
            factory: function() { return self.Invoice.create({ toUserId: self.user.id, toUserName: self.user.name }); },
            createLabel: 'New Invoice',
            createDetailView: { class: 'net.nanopay.invoice.ui.BillDetailView' },
            detailView: { class: 'net.nanopay.invoice.ui.ExpensesDetailView' },
            summaryView: this.ExpensesTableView.create()
          })
        .end()
        .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.invoiceDAO, message: this.placeholderText, image: 'images/ic-payable.png'})
    },
  ],

  classes: [
    {
      name: 'ExpensesTableView',
      extends: 'foam.u2.View',
      
      requires: [ 'net.nanopay.invoice.model.Invoice' ],
      imports: [ 'invoiceDAO' ],

      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.invoiceDAO; }}
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              config: {
                amount: { 
                  tableCellView: function(obj, e) {
                    return e.E().add('+ $', obj.amount).style({color: '#2cab70'})
                  } 
                },
                status: { 
                  tableCellView: function(obj, e) {
                    var statusCircle = obj.status == 'Scheduled' ? { border: '3px solid #59a5d5' } : 
                    { border: '3px solid #2cab70', background: '#2cab70'};

                    var statusColor = obj.status == 'Scheduled' ? { color: '#59a5d5'} : { color: '#2cab70'};
                    
                    return e.E().addClass('recievable-status').start('span').style(statusCircle).end().add(obj.status).style(statusColor);
                  }
                }
              },
              columns: [
                'invoiceNumber', 'purchaseOrder', 'toBusinessId', 'issueDate', 'amount', 'status'
              ],
            }).end()
        },
      ]
    }
  ]
});

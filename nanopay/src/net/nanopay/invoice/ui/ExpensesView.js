
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ExpensesView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Expenses Invoices.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.ui.InvoiceSummaryView'
  ],

  imports: [
    'user'
  ],

  exports: [
    'hideSaleSummary'
  ],

  properties: [
    'selection',
    {
      name: 'summaryView',
      documentation: `A named reference to the summary view so we can subscribe
          to events emitted from it.`,
    },
    {
      class: 'Boolean',
      name: 'hideSaleSummary',
      value: false
    },
    {
      name: 'expensesDAO',
      factory: function() {
        return this.user.expenses;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      factory: function() {
        return this.expensesDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    }
  ],

  css: `
    ^{
      width: 970px;
      margin: auto;
    }
    ^ .net-nanopay-invoice-ui-SummaryCard{
      width: 15.8%;
    }
    ^ .optionsDropDown {
      left: -92 !important;
      top: 30 !important;
    }
    ^ .net-nanopay-ui-ActionView-create{
      position: relative;
      top: -32;
      margin-right: 5px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    ^ .button-div{
      height: 40px;
    }
    ^ .foam-u2-view-TableView td{
      width: 8px;
    }
    ^ .foam-u2-ListCreateController{
      top: 30px;
      position: relative;
    }
  `,

  messages: [
    {
      name: 'placeholderText',
      message: 'You don’t have any bills to pay now. When you receive an ' +
          'invoice from your partners, it will show up here.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideSaleSummary$)
          .tag(this.InvoiceSummaryView, {
            sumLabel: 'Payables',
            dao: this.user.expenses
          }, this.summaryView$)
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.filteredDAO$proxy,
            createLabel: 'New Bill',
            createDetailView: {
              class: 'net.nanopay.invoice.ui.BillDetailView'
            },
            detailView: { class: 'net.nanopay.invoice.ui.ExpensesDetailView' },
            summaryView: this.ExpensesTableView,
            showActions: false
          })
        .end()
        .start()
          .enableClass('hide', this.hideSaleSummary$)
          .tag({
            class: 'net.nanopay.ui.Placeholder',
            dao: this.expensesDAO,
            message: this.placeholderText,
            image: 'images/ic-bankempty.svg'
          })
        .end();

      // When a SummaryCard is clicked on, it will toggle between two states:
      // active and inactive. When it changes state it will emit one of the two
      // following events. We subscribe to them here and update the table view
      // based on the card that was selected.
      this.summaryView.sub('statusChange', this.updateTableDAO);
      this.summaryView.sub('statusReset', this.resetTableDAO);
    },
  ],

  listeners: [
    {
      name: 'updateTableDAO',
      code: function(_, __, newStatus) {
        this.filteredDAO = this.expensesDAO
            .where(this.EQ(this.Invoice.STATUS, newStatus))
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    },
    {
      name: 'resetTableDAO',
      code: function() {
        this.filteredDAO = this.expensesDAO
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    }
  ],

  classes: [
    {
      name: 'ExpensesTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.invoice.model.Invoice'
      ],

      imports: [
        'expensesDAO'
      ],

      exports: [
        'selection'
      ],

      properties: [
        'selection',
        {
          name: 'data',
          factory: function() {
            return this.expensesDAO;
          }
        }
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              selection$: this.selection$,
              data$: this.data$,
              config: {
                amount: {
                  tableCellView: function(obj, e) {
                    return e.E()
                        .add('+ $', obj.amount)
                        .style({ color: '#2cab70' });
                  }
                },
                status: {
                  tableCellView: function(obj, e) {
                    var statusCircle = obj.status == 'Scheduled'
                        ? { border: '3px solid #59a5d5' }
                        : {
                            border: '3px solid #2cab70',
                            background: '#2cab70'
                          };

                    var statusColor = obj.status == 'Scheduled'
                        ? { color: '#59a5d5' }
                        : { color: '#2cab70' };

                    return e.E()
                        .start('span')
                          .style(statusCircle)
                        .end()
                        .add(obj.status)
                        .style(statusColor);
                  }
                }
              },
              columns: [
                'id', 'invoiceNumber', 'purchaseOrder', 'payeeId', 'dueDate',
                'amount', 'status'
              ],
            }).end();
        }
      ]
    }
  ]
});

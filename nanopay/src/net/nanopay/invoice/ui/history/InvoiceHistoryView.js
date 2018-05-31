foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceHistoryView',
  extends: 'foam.u2.View',

  documentation: 'History view of invoice actions',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.dao.history.HistoryRecord',
    'foam.dao.history.PropertyUpdate',
    'net.nanopay.invoice.ui.history.InvoiceReceivedHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceHistoryItemView'
  ],

  imports: [
    'invoiceHistoryDAO',
    'invoiceDAO'
  ],

  css: `
    ^ {
      margin-top: 20px;
    }
  `,

  properties: [
    'id',
    {
      name: 'data',
      expression: function (id) {

        // Filter the invoice history DAO and only take the records that have
        // to do with the invoice we're looking at.
        var filteredInvoiceHistoryDAO = this.invoiceHistoryDAO
          .where(this.EQ(this.HistoryRecord.OBJECT_ID, this.id));

        // We're going to append a 'fake' record to the DAO which contains the
        // change of status to OverDue if it makes sense to do so.

        // Create the MDAO and load the relevant existing records into it
        var mdao = foam.dao.MDAO.create({ of: this.HistoryRecord });
        filteredInvoiceHistoryDAO.select(o => { mdao.put(o); });

        // Load the invoice and check the status to see if it's overDue. If it
        // is, add it to the MDAO.
        this.invoiceDAO.find(this.id).then(invoice => {
          if ( invoice.dueDate && invoice.dueDate.getTime() < Date.now() ) {
            mdao.put(this.HistoryRecord.create({
              objectId: this.id,
              timestamp: invoice.dueDate,
              updates: [
                this.PropertyUpdate.create({
                  name: 'status',
                  oldValue: '', // Doesn't matter
                  newValue: 'Overdue'
                })
              ]
            }));
          }
        });

        // Use the filtered DAO with the (possibly) appended value to populate
        // the view.
        return mdao;
      }
    },
    {
      name: 'invoiceReceivedHistoryItem',
      factory: function(){
        return this.InvoiceReceivedHistoryItemView.create();
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.history.HistoryView',
          title: 'Invoice History',
          data: this.data,
          historyItemView: this.InvoiceHistoryItemView.create()
        });
    }
  ]
});

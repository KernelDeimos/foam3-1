foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'RecurringInvoice',

  documentation: 'Recurring Invoice model.',

  searchColumns: [
    'search', 'payerId', 'payeeId', 'status'
  ],

  tableColumns: [
    'id', 'payerName', 'nextInvoiceDate', 'amount', 'frequency', 'endsAfter', 'status'
  ],

  properties: [
    {
      name: 'search',
      transient: true,
      searchView: { class: "foam.u2.search.TextSearchView", of: 'net.nanopay.invoice.model.RecurringInvoice', richSearch: true }
    },
    {
      name: 'id',
      label: 'Recurring ID'
    },
    { 
      class: 'String',
      name: 'frequency',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Daily',
          'Weekly',
          'Biweekly',
          'Monthly'
        ]
      }
    },
    {
      class: 'Double',      
      name: 'endsAfter',
      label: 'End Date'
    },
    {
      class: 'DateTime',
      name: 'nextInvoiceDate',
      tableCellFormatter: function(date) {
        if ( date ) {
          this.add(date.toISOString().substring(0,10));
        }
      }
    },
    {
      class: 'Double',
      name: 'amount',
      label: 'Amount Per Invoice',
      tableCellFormatter: function(a) {
        this.start().style({'padding-right': '20px'}).add('$' + a.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')).end();
      }
    },
    {
      class: 'Boolean',
      name: 'deleted'
    },
    {
      name: 'payeeId'
    },
    {
      name: 'payerId'
    },
    {
      class: 'String',
      name: 'payeeName',
      label: 'Vendor'
    },
    {
      class: 'String',
      name: 'payerName',
      label: 'Customer'
    },
    {
      name: 'status',
      transient: true
    },
    {
      class: 'Long',
      name: 'invoiceNumber',
      label: 'Invoice #',
      aliases: [ 'invoice', 'i' ],
      visibility: foam.u2.Visibility.FINAL
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      label: 'PO #',
      aliases: [ 'purchase', 'po', 'p' ],
    },
    {
      class: 'String',
      name: 'note',
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'Date',
      name: 'issueDate',
      label: 'Date Due',
      required: true,
      factory: function() { return new Date(); },
      aliases: [ 'dueDate', 'due', 'd', 'issued' ],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    }
  ]
});

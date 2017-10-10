foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'Invoice',

  documentation: 'Invoice model. Amount is set to double type.',

  ids: [ 'invoiceNumber' ],

  searchColumns: [
    'search', 'payerId', 'payeeId', 'status'
  ],

  tableColumns: [
    'invoiceNumber', 'purchaseOrder', 'payerId', 'payeeId', 'issueDate', 'amount', 'status'/*, 'payNow'*/
  ],

  javaImports: [ 'java.util.Date' ],

  properties: [
    {
      name: 'search',
      transient: true,
      searchView: { class: "foam.u2.search.TextSearchView", of: 'net.nanopay.invoice.model.Invoice', richSearch: true }
    },
    {
      class: 'Long',
      name: 'invoiceNumber',
      label: 'Invoice #',
      aliases: [ 'id', 'invoice', 'i' ],
      visibility: foam.u2.Visibility.FINAL
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      label: 'PO #',
      aliases: [ 'purchase', 'po', 'p' ],
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
    },
    {
      class: 'Date',
      name: 'paymentDate',
      label: 'Received',
      aliases: [ 'scheduled', 'paid' ],
      tableCellFormatter: function(date) {
        if ( date ) {
          this.add(date.toISOString().substring(0,10));
        }
      }
    },
    {
      class: 'String',
      name: 'currencyType'
    },
    {
      class: 'String',
      name: 'payeeName',
      label: 'Vendor',
      aliases: [ 'to', 'vendor', 'v' ],
      transient: true
    },
    {
      class: 'String',
      name: 'payerName',
      label: 'Customer',
      aliases: [ 'from', 'customer', 'c' ],
      transient: true
    },
    {
      class: 'Long',
      name: 'paymentId'
    },
    {
      class: 'Boolean',
      name: 'draft',
      value: false
    },
    {
      class: 'String',
      name: 'freshbooksInvoiceId'
    },
    {
      class: 'String',
      name: 'freshbooksInvoiceNumber'
    },
    {
      class: 'String',
      name: 'freshbooksInvoicePurchaseOrder'
    },
    {
      class: 'String',
      name: 'invoiceFileUrl'
    },
    {
      class: 'String',
      name: 'note',
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'String',
      name: 'invoiceImageUrl'
    },
    {
      // TODO: make Currency class
      class: 'Double',
      name: 'amount',
      aliases: [ 'a' ],
      required: true,
      tableCellFormatter: function(a) {
        this.start().style({'padding-right': '20px'}).add('$' + a.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')).end();
      }
    },
    {
      class: 'String',
      name: 'currencyCode',
      required: true
    },
    {
      name: 'iso20022',
      required: true
    },
    {
      class: 'String',
      name: 'status',
      transient: true,
      aliases: [ 's' ],
      expression: function(draft, paymentId, issueDate, paymentDate) {
        if ( draft ) return 'Draft';
        if ( paymentId === -1 ) return 'Disputed';
        if ( paymentId ) return 'Paid';
        if ( issueDate.getTime() < Date.now() ) return 'Overdue';
        if ( issueDate.getTime() < Date.now() + 24*3600*7*1000 ) return 'Due';
        return paymentDate ? 'Scheduled' : 'New';
      },
      javaGetter: `
        if ( getDraft() ) return "Draft";
        if ( getPaymentId() == -1 ) return "Disputed";
        if ( getPaymentId() > 0 ) return "Paid";
        if ( getIssueDate().getTime() < System.currentTimeMillis() ) return "Overdue";
        if ( getIssueDate().getTime() < System.currentTimeMillis() + 24*3600*7*1000 ) return "Due";
        return getPaymentDate() != null ? "Scheduled" : "New";
      `,
      searchView: { class: "foam.u2.search.GroupBySearchView", width: 40, viewSpec: { class: 'foam.u2.view.ChoiceView', size: 8 } },
      tableCellFormatter: function(state, obj, rel) {
        function formatDate(d) { return d ? d.toISOString().substring(0,10) : ''; }

        var label;

        if ( state === 'Scheduled' || state === 'Paid' ) {
          label = state;
        } else {
          label = state;
        }

        this.start().addClass('generic-status Invoice-Status-' + state).add(label).end();
      }
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function(status) {
        return false;
        return status !== 'Paid' && this.lookup('net.nanopay.interac.ui.etransfer.TransferWizard', true);
      },
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.interac.ui.etransfer.TransferWizard', invoice: this })
      }
    }
  ]
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'sales',
  inverseName: 'payeeId',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Vendor',
    searchView: {
      class: "foam.u2.search.GroupBySearchView",
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise(function (resolve, reject) {
          dao.find(key).then(function (user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function (o) {
        this.add(o.label());
      }.bind(this));
    },
    postSet: function(oldValue, newValue){
      var self = this;
      var dao = this.__context__.userDAO;

      dao.find(newValue).then(function(a) {
        if ( a ) {
          self.payerName = a.label();
          if ( a.address ) self.currencyType = a.address.countryId + 'D';
        } else {
          self.payerName = 'Unknown Id: ' + newValue;
        }
      });
    }
  }
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'expenses',
  inverseName: 'payerId',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Customer',
//    aliases: [ 'from', 'customer' ],
    searchView: {
      class: "foam.u2.search.GroupBySearchView",
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise(function (resolve, reject) {
          dao.find(key).then(function (user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function (o) {
        this.add(o.label());
      }.bind(this));
    },
    postSet: function(oldValue, newValue){
      var self = this;
      var dao = this.__context__.userDAO;

      dao.find(newValue).then(function(a) {
        if ( a ) {
          self.payerName = a.label();
          if ( a.address ) self.currencyType = a.address.countryId + 'D';
        } else {
          self.payerName = 'Unknown Id: ' + newValue;
        }
      });
    }
  }
});

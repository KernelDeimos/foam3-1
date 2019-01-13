foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ReceivableController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with receivable invoices.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  implements: [
    'net.nanopay.integration.AccountingIntegrationTrait'
  ],

  imports: [
    'hasPassedCompliance',
    'isBusinessEnabled',
    'stack',
    'user'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.user.sales;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        var self = this;
        return {
          class: 'foam.u2.view.ScrollTableView',
          editColumnsEnabled: false,
          columns: [
            this.Invoice.PAYER.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: function(_, invoice) {
                var additiveSubField = invoice.payer.businessName ?
                  invoice.payer.businessName :
                  invoice.payer.label();
                this.add(additiveSubField);
              }
            }),
            this.Invoice.INVOICE_NUMBER.clone().copyFrom({
              label: 'Invoice No.'
            }),
            this.Invoice.AMOUNT.clone().copyFrom({
              tableCellFormatter: function(_, invoice) {
                invoice.destinationCurrency$find.then((currency) => {
                  this.add(`+ ${currency.format(invoice.amount)}`);
                });
              }
            }),
            'dueDate',
            'lastModified',
            'status'
          ],
          contextMenuActions: [
            foam.core.Action.create({
              name: 'viewDetails',
              label: 'View details',
              code: function(X) {
                X.stack.push({
                  class: 'net.nanopay.sme.ui.InvoiceOverview',
                  invoice: this,
                  isPayable: false
                });
              }
            }),
            foam.core.Action.create({
              name: 'markVoid',
              label: 'Mark as Void',
              isEnabled: function() {
                if ( self.user.id != this.createdBy ) return false;
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              isAvailable: function() {
                if ( self.user.id != this.createdBy ) return false;
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.PAID ||
                  this.status === self.InvoiceStatus.PENDING ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              code: function(X) {
                this.paymentMethod = self.PaymentStatus.VOID;
                self.user.sales.put(this);
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              label: 'Delete',
              confirmationRequired: true,
              isAvailable: function() {
                return this.status === self.InvoiceStatus.DRAFT;
              },
              code: function(X) {
                self.user.sales.remove(this);
              }
            })
          ]
        };
      }
    },
    {
      name: 'primaryAction',
      factory: function() {
        var self = this;
        return this.Action.create({
          name: 'reqMoney',
          label: 'Request payment',
          code: function(X) {
            if ( self.hasPassedCompliance() && self.isBusinessEnabled() ) {
              X.menuDAO.find('sme.quickAction.request').then((menu) => {
                var clone = menu.clone();
                Object.assign(clone.handler.view, {
                  invoice: self.Invoice.create({}),
                  isPayable: false,
                  isForm: true,
                  isList: false,
                  isDetailView: false
                });
                clone.launch(X, X.controllerView);
              });
            }
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function(invoice) {
        this.stack.push({
          class: 'net.nanopay.sme.ui.InvoiceOverview',
          invoice: invoice,
          isPayable: false
        });
      }
    }
  ]
});

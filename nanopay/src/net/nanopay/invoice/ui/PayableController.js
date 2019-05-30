foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'PayableController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with payable invoices.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice'
  ],

  implements: [
    'net.nanopay.accounting.AccountingIntegrationTrait',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.accounting.xero.model.XeroInvoice',
  ],

  imports: [
    'checkAndNotifyAbilityToPay',
    'currencyDAO',
    'stack',
    'user',
    'accountingIntegrationUtil'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.user.expenses;
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
            this.Invoice.PAYEE_ID.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: function(_, invoice) {
                var additiveSubField = invoice.payee.businessName ?
                  invoice.payee.businessName :
                  invoice.payee.label();
                this.add(additiveSubField);
              }
            }),
            this.Invoice.INVOICE_NUMBER.clone().copyFrom({
              label: 'Invoice No.',
              tableWidth: 145
            }),
            this.Invoice.AMOUNT.clone().copyFrom({ tableWidth: 145 }),
            this.Invoice.ISSUE_DATE.clone().copyFrom({ tableWidth: 145 }),
            this.Invoice.DUE_DATE.clone().copyFrom({ tableWidth: 145 }),
            this.Invoice.STATUS.clone().copyFrom({ tableWidth: 145 }),
            'invoiceFile'
          ],

          contextMenuActions: [
            foam.core.Action.create({
              name: 'viewDetails',
              label: 'View details',
              code: async function(X) {
                let updatedInvoice = await X.accountingIntegrationUtil.forceSyncInvoice(this);
                X.stack.push({
                  class: 'net.nanopay.sme.ui.InvoiceOverview',
                  invoice: updatedInvoice,
                  isPayable: true
                });
              }
            }),

            foam.core.Action.create({
              name: 'payNow',
              label: 'Pay now',
              isAvailable: function() {
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              code: async function(X) {
                let updatedInvoice = await X.accountingIntegrationUtil.forceSyncInvoice(this);

                if (! updatedInvoice) {
                  return;
                }
                self.checkAndNotifyAbilityToPay().then((result) => {
                  if ( result ) {
                    X.menuDAO.find('sme.quickAction.send').then((menu) => {
                      var clone = menu.clone();
                      Object.assign(clone.handler.view, {
                        invoice: updatedInvoice,
                        isForm: false,
                        isList: false,
                        isDetailView: true,
                        isPayable: true
                      });
                      clone.launch(X, X.controllerView);
                    });
                  }
                });
              }
            }),

            foam.core.Action.create({
              name: 'edit',
              label: 'Edit',
              confirmationRequired: true,
              isAvailable: function() {
                return this.status === self.InvoiceStatus.DRAFT;
              },
              code: function(X) {
                X.menuDAO.find('sme.quickAction.send').then((menu) => {
                  var clone = menu.clone();
                  Object.assign(clone.handler.view, {
                    isPayable: true,
                    isForm: true,
                    isDetailView: false,
                    invoice: this
                  });
                  clone.launch(X, X.controllerView);
                });
              }
            }),

            foam.core.Action.create({
              name: 'approve',
              isAvailable: function() {
                return this.status === self.InvoiceStatus.PENDING_APPROVAL;
              },
              availablePermissions: ['invoice.pay'],
              code: function(X) {
                X.menuDAO.find('sme.quickAction.send').then((menu) => {
                  var clone = menu.clone();
                  Object.assign(clone.handler.view, {
                    isApproving: true,
                    isForm: false,
                    isDetailView: true,
                    invoice: this
                  });
                  clone.launch(X, X.controllerView);
                }).catch((err) => {
                  console.warn('Error occured when redirecting to approval payment flow: ', err);
                });
              }
            }),

            foam.core.Action.create({
              name: 'markVoid',
              label: 'Mark as Void',
              isEnabled: function() {
                return self.user.id === this.createdBy &&
                  ( this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.OVERDUE ) && !
                  ( self.QuickbooksInvoice.isInstance(this) || self.XeroInvoice.isInstance(this) );
              },
              isAvailable: function() {
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.PAID ||
                  this.status === self.InvoiceStatus.PENDING ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              code: function() {
                this.paymentMethod = self.PaymentStatus.VOID;
                self.user.expenses.put(this);
              }
            }),

            foam.core.Action.create({
              name: 'delete',
              label: 'Delete',
              confirmationRequired: true,
              isAvailable: function() {
                return this.status === self.InvoiceStatus.DRAFT;
              },
              code: function() {
                self.user.expenses.remove(this);
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
          name: 'sendMoney',
          label: 'Send payment',
          code: function(X) {
            self.checkAndNotifyAbilityToPay().then((result) => {
              if ( result ) {
                X.menuDAO.find('sme.quickAction.send').then((menu) => {
                  var clone = menu.clone();
                  Object.assign(clone.handler.view, {
                    invoice: self.Invoice.create({}),
                    isPayable: true,
                    isForm: true,
                    isList: false,
                    isDetailView: false
                  });
                  clone.launch(X, X.controllerView);
                });
              }
            });
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: async function(invoice, X) {
        let updatedInvoice = await this.accountingIntegrationUtil.forceSyncInvoice(invoice);
        if ( updatedInvoice === null || updatedInvoice === undefined ) return;
        this.stack.push({
          class: 'net.nanopay.sme.ui.InvoiceOverview',
          invoice: updatedInvoice,
          isPayable: true
        });
      }
    }
  ]
});

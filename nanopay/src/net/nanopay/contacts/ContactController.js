/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ContactController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with contacts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.ui.wizard.WizardController'
  ],

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.accounting.AccountingIntegrationTrait'
  ],

  imports: [
    'accountDAO',
    'accountingIntegrationUtil',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'stack',
    'subject',
    'pushMenu',
    'publicBusinessDAO',
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.subject.user.contacts;
      }
    },
    {
      name: 'summaryView',
      factory: function() {
        var self = this;
        return {
          class: 'foam.u2.view.ScrollTableView',
          editColumnsEnabled: false,
          columns: [
            foam.core.Property.create({
              name: 'organization',
              label: 'Business',
              tableCellFormatter: function(X, obj) {
                if ( ! obj.businessId ) {
                  this.start().add(obj.organization).end();
                } else {
                  self.publicBusinessDAO
                    .find(obj.businessId)
                    .then( (business) =>
                      this.start().add(business.toSummary()).end()
                  );
                }
              }
            }),
            'signUpStatus',
            'warning'
          ],
          contextMenuActions: [
            this.Action.create({
              name: 'addBankAccount',
              label: 'Add Bank',
              isEnabled: async function() {
                var bank = await this.accounts.find(this.EQ(net.nanopay.bank.BankAccount.OWNER, this.id))
                return this.signUpStatus !== self.ContactStatus.ACTIVE && ! bank;
              },
              code: function(X) {
                X.controllerView.add(self.WizardController.create({
                  model: 'net.nanopay.contacts.Contact',
                  data: this,
                  controllerMode: foam.u2.ControllerMode.CREATE
                }, X));
              }
            }),
            this.Action.create({
              name: 'edit',
              label: 'View details',
              isEnabled: async function() {
                return this.signUpStatus !== self.ContactStatus.ACTIVE;
              },
              code: function(X) {
                X.controllerView.add(self.WizardController.create({
                  model: 'net.nanopay.contacts.Contact',
                  data: this,
                  controllerMode: foam.u2.ControllerMode.EDIT
                }, X));
              }
            }),
            this.Action.create({
              name: 'invite',
              isEnabled: function() {
                return this.signUpStatus != self.ContactStatus.ACTIVE;
              },
              isAvailable: async function() {
                let account = await self.accountDAO.find(this.bankAccount);
                return this.signUpStatus != self.ContactStatus.ACTIVE && ! self.INBankAccount.isInstance(account);
              },
              code: function(X) {
                var invite = net.nanopay.model.Invitation.create({
                  email: this.email,
                  businessName: this.organization,
                  createdBy: this.subject.user.id,
                  isContact: true
                });
                X.controllerView.add(self.WizardController.create({
                  model: 'net.nanopay.model.Invitation',
                  data: invite
                }, X));
              }
            }),
            this.Action.create({
              name: 'requestMoney',
              isEnabled: function() {
                return (
                  this.businessId &&
                  this.businessStatus !== self.AccountStatus.DISABLED
                ) || this.bankAccount;
              },
              code: function(X) {
                self.checkAndNotifyAbilityToReceive().then((result) => {
                  if ( result ) {
                    X.menuDAO.find('sme.quickAction.request').then((menu) => {
                      var clone = menu.clone();
                      Object.assign(clone.handler.view, {
                        invoice: self.Invoice.create({ contactId: this.id }),
                        isPayable: false
                      });
                      clone.launch(X, X.controllerView);
                    });
                  }
                });
              }
            }),
            this.Action.create({
              name: 'sendMoney',
              isEnabled: function() {
                return (
                  this.businessId &&
                  this.businessStatus !== self.AccountStatus.DISABLED
                ) || this.bankAccount;
              },
              code: function(X) {
                self.checkAndNotifyAbilityToPay().then((result) => {
                  if ( result ) {
                    X.menuDAO.find('sme.quickAction.send').then((menu) => {
                      var clone = menu.clone();
                      Object.assign(clone.handler.view, {
                        invoice: self.Invoice.create({ contactId: this.id }),
                        isPayable: true
                      });
                      clone.launch(X, X.controllerView);
                    });
                  }
                });
              }
            }),
            this.Action.create({
              name: 'delete',
              code: function(X) {
                X.controllerView.add(self.Popup.create(null, X).tag({
                  class: 'net.nanopay.contacts.ui.modal.DeleteContactView',
                  data: this
                }));
              }
            })
          ]
        };
      }
    },
    {
      name: 'primaryAction',
      factory: function() {
        return this.Action.create({
          name: 'addContact',
          label: 'Add a Contact',
          code: function() {
            this.pushMenu('sme.menu.toolbar');
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function onEdit(contact) {
        // Do nothing.
      }
    }
  ]
});

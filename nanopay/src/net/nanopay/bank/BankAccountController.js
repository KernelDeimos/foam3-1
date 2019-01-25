foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccountController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with bank accounts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'ctrl',
    'stack',
    'user',
  ],

  exports: [
    'selectedAccount'
  ],

  messages: [
    { name: 'SINGULAR_BANK', message: 'Only 1 bank account can be added during the beta.' },
    { name: 'DELETE_BANK_MESSAGE', message: 'Please contact us at support@ablii.com to delete this bank account.' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        var dao = this.user.accounts.where(
          this.OR(
            this.EQ(this.Account.TYPE, this.BankAccount.name),
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          )
        );
        dao.of = this.BankAccount;
        return dao;
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
          fitInScreen: true,
          contextMenuActions: [
            foam.core.Action.create({
              name: 'verifyAccount',
              isEnabled: function() {
                return this.status === self.BankAccountStatus.UNVERIFIED;
              },
              code: function(X) {
                self.selectedAccount = this;
                self.ctrl.add(self.Popup.create().tag({
                  class: 'net.nanopay.cico.ui.bankAccount.modalForm.AddCABankModal',
                  startAt: 'microCheck',
                  bank: self.selectedAccount
                }));
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              code: function(X) {
                // Disable ability to delete a bank account
                self.ctrl.notify(self.DELETE_BANK_MESSAGE, 'warn');
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
          name: 'addBank',
          label: 'Add bank account',
          code: async function() {
            await self.checkAvailability();
            if ( ! self.availableCAD || ! self.availableUSD ) {
              self.ctrl.notify(self.SINGULAR_BANK, 'warning');
            } else {
              self.stack.push({
                class: 'net.nanopay.bank.ui.BankPickCurrencyView',
                usdAvailable: self.availableUSD,
                cadAvailable: self.availableCAD
              }, self);
            }
          },
          // isAvailable: function() { return self.available; }
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'selectedAccount',
      documentation: `
        The account that the user wants to verify. Exported so that BankForm
        can use it.
      `
    },
    {
      class: 'Boolean',
      name: 'available',
      value: false,
      documentation: `used for disabling the button for adding a Bank Account when User has one of each currency (CAD && USD)`
    },
    {
      class: 'Boolean',
      name: 'availableCAD',
      value: true,
      documentation: `used for a check on CAD Bank Accounts, when User has one CAD BankAccount availableCAD`
    },
    {
      class: 'Boolean',
      name: 'availableUSD',
      value: true,
      documentation: `used for a check on USD Bank Accounts, when User has one USD BankAccount availableUSD`
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.checkAvailability();
    },
    {
      name: 'checkAvailability',
      code: async function() {
        this.available = true;
        this.availableCAD = true;
        this.availableUSD = true;
        var accountListCAD = await ctrl.user.accounts.where(
            foam.mlang.predicate.Eq.create({
              arg1: net.nanopay.account.Account.TYPE,
              arg2: net.nanopay.bank.CABankAccount.name
            })
        ).select();
        var accountListUSD = await ctrl.user.accounts.where(
          foam.mlang.predicate.Eq.create({
            arg1: net.nanopay.account.Account.TYPE,
            arg2: net.nanopay.bank.USBankAccount.name
          })
        ).select();
        if ( accountListCAD && accountListCAD.array.length > 0 ) {
          this.availableCAD = false;
        }
        if ( accountListUSD && accountListUSD.array.length > 0 ) {
          this.availableUSD = false;
        }
        if ( ! this.availableCAD && ! this.availableUSD ) {
          this.available = false;
        } else this.available = true;
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function onEdit(account) {
        // Do nothing.
      }
    }
  ]
});

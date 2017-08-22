foam.CLASS({
  package: 'net.nanopay.retail.ui.settings.bankAccount',
  name: 'BankAccountSettingsView',
  extends: 'foam.u2.Controller',

  requires: [
    'net.nanopay.retail.model.BankAccount',
    'foam.u2.dialog.Popup'
  ],

  imports: [ 'bankAccountDAO', 'stack' ],

  implements: [
    'foam.mlang.Expressions',
  ],

  properties: [
    'allBanksCount',
    'verifiedBanksCount',
    'unverifiedBanksCount',
    'selection',
    { name: 'data', factory: function() { return this.bankAccountDAO; }},
    {
      name: 'dao',
      factory: function() { return this.bankAccountDAO; }
    }
  ],

  documentation: 'View displaying list of Bank Accounts added.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 100%;
          background-color: #edf0f5;
        }
        ^ .bankAccountContainer {
          width: 992px;
          margin: auto;
        }
        ^ .bankContentCard {
          width: 218px;
          height: 100px;
          margin-right: 30px;
        }
        ^ .actionButton {
          width: 218px;
          height: 100px;
          float: right;
          margin-bottom: 20px;
        }
        ^ .foam-u2-ActionView-create {
          visibility: hidden;
        }
        ^ table {
          border-collapse: collapse;
          margin: auto;
          width: 992px;
        }
        ^ thead > tr > th {
          font-family: 'Roboto';
          font-size: 14px;
          background-color: rgba(110, 174, 195, 0.2);
          color: #093649;
          line-height: 1.14;
          letter-spacing: 0.3px;
          border-spacing: 0;
          text-align: left;
          padding-left: 15px;
          height: 40px;
        }
        ^ tbody > tr > th > td {
          font-size: 12px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          padding-left: 15px;
          height: 60px;
        }
        ^ .foam-u2-view-TableView th {
          padding-left: 15px;
          font-family: Roboto;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: #093649;
          font-style: normal;
        }
        ^ .foam-u2-view-TableView td {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          padding-left: 15px;
          font-size: 12px;
          color: #093649;
        }
        ^ tbody > tr {
          height: 60px;
          background: white;
        }
        ^ tbody > tr:nth-child(odd) {
          background: #f6f9f9;
        }

        ^ .foam-u2-ActionView-addBank {
          background: none;
          outline: none;
          border: none;

          width: 218px;
          height: 100px;
          float: right;

          background-color: #23C2b7;
          letter-spacing: 0.3px;
          color: #FFFFFF;
          border-radius: 2px;
          opacity: 1;
          font-weight: normal;
        }

        ^ .foam-u2-ActionView-addBank span {
          display: block;
          margin-top: 8px;

          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
        }

        ^ .foam-u2-ActionView-addBank:hover {
          background: none;
          cursor: pointer;
          background-color: #20B1A7;
        }

        ^ .foam-u2-dialog-Popup-background {
          pointer-events: none;
          background-color: #edf0f5;
          opacity: 1;
        }

        ^ .foam-u2-dialog-Popup-inner {
          background-color: transparent !important;
        }
      */}
    })
  ],

  messages: [
    { name: 'TitleAll',         message: 'Total Bank Accounts' },
    { name: 'TitleVerified',    message: 'Verified Account(s)' },
    { name: 'TitleUnverified',  message: 'Unverified Account(s)' },
    { name: 'ActionAdd',        message: 'Add a new bank account' },
  ],

  methods: [
    function initE() {
      var self = this;
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.retail.ui.settings.SettingsNavigator'})
        .start('div').addClass('bankAccountContainer')
          .start('div').addClass('row')
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.retail.ui.shared.contentCard.ContentCard', data: { title: this.TitleAll}, contents$: this.allBanksCount$ }).addClass('bankContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.retail.ui.shared.contentCard.ContentCard', data: { title: this.TitleVerified}, contents$: this.verifiedBanksCount$ }).addClass('bankContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.retail.ui.shared.contentCard.ContentCard', data: { title: this.TitleUnverified}, contents$: this.unverifiedBanksCount$ }).addClass('bankContentCard')
            .end()
            .start('div').addClass('spacer')
              //.tag({class: 'net.nanopay.retail.ui.shared.contentCard.ContentCardActionButton', data: { title: this.ActionAdd , image: 'ui/images/ic-plus.svg'} }).addClass('actionButton')
              .tag(this.ADD_BANK, { showLabel: true })
            .end()
          .end()
          .start()
            .tag({
                class: 'foam.u2.ListCreateController',
                dao: this.bankAccountDAO,
                factory: function() { return self.Transaction.create(); },
                detailView: {
                  class: 'foam.u2.DetailView',
                  properties: [
                    this.BankAccount.ACCOUNT_NAME,
                    this.BankAccount.BANK_NUMBER,
                    this.BankAccount.TRANSIT_NUMBER,
                    this.BankAccount.ACCOUNT_NUMBER,
                    this.BankAccount.STATUS
                  ]
                },
              summaryView: this.BankAccountTableView.create()
            })
          .end()
        .end()
    }
  ],

  classes: [
    {
      name: 'BankAccountTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.retail.model.BankAccount' ],

      imports: [ 'bankAccountDAO' ],
      properties: [
        'selection',
        { name: 'data', factory: function() { return this.bankAccountDAO; } }
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              config: {
                status: {
                  tableCellView: function(obj, e) {
                    return e.E().style({color: '#2cab70'})
                  }
                }
              },
              columns: [
                'accountName', 'bankNumber', 'transitNumber', 'accountNumber', 'status'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ],

  actions: [
    {
      name: 'addBank',
      label: 'Add a bank account',
      icon: 'ui/images/ic-plus.svg',
      code: function() {
        this.add(this.Popup.create().tag({class: 'net.nanopay.retail.ui.settings.bankAccount.form.BankForm', title: this.ActionAdd }));
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.dao.select(this.COUNT()).then(function(count) {
          self.allBanksCount = count.value;
        });

        var verifiedBanksDAO = this.dao.where(this.EQ(this.BankAccount.STATUS, "Verified"));
        verifiedBanksDAO.select(this.COUNT()).then(function(count) {
          self.verifiedBanksCount = count.value;
        });

        var unverifiedBanksDAO = this.dao.where(this.EQ(this.BankAccount.STATUS, "Unverified"));
        unverifiedBanksDAO.select(this.COUNT()).then(function(count) {
          self.unverifiedBanksCount = count.value;
        });
      }
    }
  ]
});

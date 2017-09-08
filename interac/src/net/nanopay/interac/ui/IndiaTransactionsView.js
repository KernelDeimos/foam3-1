foam.CLASS({
  package: 'net.nanopay.interac.ui',
  name: 'IndiaTransactionsView',
  extends: 'foam.u2.View',

  documentation: 'View displaying interac home page with list of accounts and transactions',

  requires: [ 'net.nanopay.transactionservice.model.Transaction' ],

  imports: [ 
    'transactionDAO',
    'account' 
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 962px;
          margin: 0 auto;
        }
        ^ h3 {
          opacity: 0.6;
          font-family: Roboto;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-bottom: 20px;
          display: inline-block;
          vertical-align: top;
        }
        ^ .accountDiv {
          width: 400px;
          background-color: #ffffff;
          padding: 12px 10.4px 12px 10.4px;
          margin-bottom: 10px;
        }
        ^ .account {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          text-align: left;
          color: #59a5d5;
          text-decoration: underline;
          display: inline-block;
        }
        ^ .accountBalance {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          float: right;
          color: #093649;
          display: inline-block;
        }
        ^ .tableBarDiv {
          margin-top: 25px;
          margin-bottom: 10px;
        }
        ^ .interacLogo {
          width: 90px;
          height: 40px;
          display: inline-block;
          float: right;
          margin-right: 12px;
        }
        ^ .titleMargin {
          margin: 0;
        }
        ^ .foam-u2-ActionView-sendTransfer {

          width: 135px;
          height: 40px;
          border-radius: 2px;
          background: #e68e43;
          border: 0;
          box-shadow: none;
          display: inline-block;
          line-height: 40px;
          color: white;
          font-size: 14px;
          margin: 0;
          padding: 0;
          outline: none;
          float: right;
          cursor: pointer;
        }
        ^ .foam-u2-ActionView-sendTransfer:hover {
          background: #CD752A;
        }
        ^ table {
          border-collapse: collapse;
          margin: auto;
          width: 962px;
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
          font-family: 'Roboto';
          padding-left: 15px;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: #093649;
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
        ^ .foam-u2-ActionView-create {
          visibility: hidden;
        }
        ^ .foam-u2-view-TableView-noselect {
          cursor: pointer;
        }
        ^ .foam-u2-md-OverlayDropdown {
          width: 175px;
        }
      */}
    })
  ],

  properties: [
    { name: 'data', factory: function() { return this.transactionDAO; }}
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('h3').add(this.myAccounts).end()
          .start('div').addClass('accountDiv')
            .start().add('Chequing Account xxxxxxxxxxxx0933').addClass('account').end()
            .start().add('INR ', this.account$.dot('accountInfo').dot('balance')).addClass('accountBalance').end()
          .end()
          .start('div').addClass('tableBarDiv')
            .start('h3').add(this.recentActivities).addClass('titleMargin').end()
            .add(this.SEND_TRANSFER)
            .start({class: 'foam.u2.tag.Image', data: 'images/interac.png'})
              .attrs({srcset: 'images/interac@2x.png 2x, images/interac@3x.png 3x'})
              .addClass('interacLogo')
            .end()
          .end()
          .start()
            .tag({
                class: 'foam.u2.ListCreateController',
                dao: this.transactionDAO,
                factory: function() { return self.Transaction.create(); },
                detailView: {
                  class: 'foam.u2.DetailView',
                  properties: [
                    this.Transaction.REFERENCE_NUMBER,
                    this.Transaction.DATE,
                    this.Transaction.PAYEE_ID,
                    this.Transaction.AMOUNT,
                    this.Transaction.RECEIVING_AMOUNT,
                    this.Transaction.RATE,
                    this.Transaction.FEES
                  ]
                },
              summaryView: this.TransactionTableView.create()
            })
          .end()
        .end();
    }
  ],

  messages: [
    { name: 'myAccounts', message: 'My Accounts' },
    { name: 'recentActivities', message: 'Recent Activities' }
  ],

  actions: [
    {
      name: 'sendTransfer',
      label: 'Send e-Transfer',
      code: function(X) {
        // send e-Transfer functionality
        X.stack.push({ class: 'net.nanopay.interac.ui.etransfer.TransferWizard' })
      }
    }
  ],

  classes: [
    {
      name: 'TransactionTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.transactionservice.model.Transaction' ],

      imports: [ 'transactionDAO' ],

      properties: [
        'selection',
        { name: 'data', factory: function() {return this.transactionDAO}}
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              editColumnsEnabled: true,
              data: this.data,
              columns: [
                'referenceNumber', 'date', 'payeeId', 'amount', 'receivingAmount', 'rate', 'fees'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});
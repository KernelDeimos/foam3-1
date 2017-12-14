foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'TransactionsView',
  extends: 'foam.u2.Element',

  documentation: 'View displaying home page with list of accounts and transactions',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [ 
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.auth.User'
  ],

  imports: [
    'transactionDAO',
    'userDAO',
    'user'
  ],

  exports: [
    'as data',
    'filter',
    'filteredTransactionDAO'
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
          margin: 0;
          display: inline-block;
          vertical-align: top;
          margin-bottom: 30px;
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
        ^ .searchIcon {
          position: absolute;
          margin-left: 20px;
          margin-top: 8px;
        }
        ^ .net-nanopay-ui-ActionView-sendTransfer {
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background: #59a5d5;
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
        ^ .net-nanopay-ui-ActionView-sendTransfer:hover {
          background: #3783b3;
        }
        ^ table {
          border-collapse: collapse;
          margin: auto;
          width: 962px;
        }
        ^ thead > tr > th {
          font-family: 'Roboto';
          font-size: 14px;
          background: %TABLECOLOR%;
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
        ^ .filter-search {
          width: 225px;
          height: 40px;
          border-radius: 2px;
          background-color: #ffffff;
          display: inline-block;
          margin-left: 15px;
          margin-bottom: 30px;
          vertical-align: top;
          border: 0;
          box-shadow:none;
          padding: 10px 10px 10px 31px;
          font-size: 14px;
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
        ^ .net-nanopay-ui-ActionView-create {
          visibility: hidden;
        }
        ^ .foam-u2-md-OverlayDropdown {
          width: 175px;
        }
        ^ .net-nanopay-ui-ActionView-exportButton {
          position: absolute;
          width: 75px;
          height: 40px;
          opacity: 0.01;
          cursor: pointer;
          z-index: 100;
        }
        ^ .net-nanopay-ui-ActionView-filterButton {
          position: absolute;
          width: 75px;
          height: 35px;
          opacity: 0.01;
          cursor: pointer;
          z-index: 100;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Reference #',
        onKey: true
      }
    },
    { name: 'data', factory: function() { return this.transactionDAO; }},
    {
      name: 'filteredTransactionDAO',
      expression: function(data, filter) {
        return data.where(this.CONTAINS_IC(this.Transaction.REFERENCE_NUMBER, filter));
      },
      view: {
        class: 'foam.u2.view.TableView',
        columns: [
          'referenceNumber', 'date', 'payeeId', 'amount',
        ]
      }
    }
  ],

  messages: [
    { name: 'myAccounts', message: 'My Accounts' },
    { name: 'recentActivities', message: 'Recent Activities' },
    { name: 'placeholderText', message: 'You don\'t have any recent transactions right now.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start().addClass('inline')
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-export.png', text: 'Export'}}).add(this.EXPORT_BUTTON).end()
              .end()
              .start({class: 'foam.u2.tag.Image', data: 'images/ic-search.svg'}).addClass('searchIcon').end()
              .start(this.FILTER).addClass('filter-search').end()
            .end()
          .end()
          .add(this.FILTERED_TRANSACTION_DAO)
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.transactionDAO, message: this.placeholderText, image: 'images/ic-payable.png' })
        .end();
    },
    function dblclick(transaction){
      this.stack.push({ class: 'net.nanopay.tx.ui.TransactionDetailView', data: transaction });
    }
  ],

  actions: [
    {
      name: 'exportButton',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.ExportModal', exportData: X.filteredTransactionDAO}));
      }
    }
  ]
});

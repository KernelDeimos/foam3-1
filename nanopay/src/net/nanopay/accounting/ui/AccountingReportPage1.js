foam.CLASS({
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingReportPage1',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'accountingIntegrationUtil',
    'pushMenu',
    'quickbooksService',
    'stack',
    'user',
    'xeroService',
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.resultresponse.ContactResponseItem',
    'net.nanopay.accounting.resultresponse.InvoiceResponseItem',
    'foam.dao.EasyDAO'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: #f9fbff;
      text-align: center
    }
    ^ .report-container {
      display: inline-block;
      width: 100%;
      height: 90vh;
    }
    ^ .button-bar {
      margin-top:20px;
      height: 48px;
      background-color: #ffffff;
      padding-top: 12px;
      padding-bottom: 12px;
      padding-right: 24px;
    }
    ^ .foam-u2-ActionView-next {
      width: 158px;
      height: 48px !important;
      border-radius: 4px;
      border: 1px solid #4a33f4;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #604aff !important;
      font-size: 16px !important;
      font-weight: 400;
      float:right;
      color: #FFFFFF !important;
    }
    ^ .foam-u2-ActionView-next:hover {
      background-color: #4d38e1 !important;
    }
    ^ .title {
      font-size: 24px;
      font-weight: 900;
      color: black;
      margin-top: 24px;
    }
    ^ .checkmark-img {
      width: 53px;
      height: 53px;
      margin-top: 120px;
    }
    
    ^ .report-table-container {
      max-height: 500px;
      width: 677px;
      margin-top: 25px;
      margin-left: auto; margin-right: auto;
      overflow: hidden;
    }
    
    ^ .report-title-2 {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 80px;
      margin-bottom: -14px;
    }
    
    ^ .report-title-2 p {
      font-size: 16px;
      font-weight: 900;
      line-weight: 1.5
    }
    
    ^ .report-title-img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
    
    ^ .report-title-3 {
      font-size: 14px;
    }

    ^ .download-button {
      float: right;
      margin-right: 24px;
      width: 158px;
      height: 48px;
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #ffffff;
      border: solid 1px #604aff;
      font-size: 16px;
      color: #604aff;
    }

    ^ .download-button:hover {
      color: #4d38e1;
      background-color: #ffffff !important;
      border-color: #4d38e1;
    }

    .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-name, .foam-u2-view-TableView-th-businessName {
      width: 320px;
    }

    .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-invoiceNumber, .foam-u2-view-TableView-th-Amount, .foam-u2-view-TableView-th-dueDate {
      width: 200px;
    }
  `,

  messages: [
    { name: 'SUCCESS_MESSAGE', message: 'Successfully synced contacts and invoices' }
  ],

  properties: [
    'reportResult',
    {
      class: 'Int',
      name: 'contactCount',
      value: 0
    },
    {
      class: 'Int',
      name: 'invoiceCount',
      value: 0
    }
  ],

  methods: [
    function initE() {
      this
        .start().addClass(this.myClass())

          .start().addClass('report-container')

            .start('img').addClass('checkmark-img')
              .attrs({ src: 'images/checkmark-large-green.svg' })
            .end()
            .start('h1').add(this.SUCCESS_MESSAGE).addClass('title').end()

            .start('div').addClass('report-table-container')
              .start().tag({
                class: 'net.nanopay.accounting.ui.ErrorTable', data: this.initSuccessContact(), columns: ['businessName', 'name'], header: 'Contacts (' + this.contactCount + ')'
              }).show(this.slot(function(contactCount) {
                return contactCount > 0 ? true : false;
              }))
              .end()
              .start().tag({
                class: 'net.nanopay.accounting.ui.ErrorTable', data: this.initSuccessInvoice(), columns: ['invoiceNumber', 'Amount', 'dueDate'], header: 'Invoices (' + this.invoiceCount + ')'
              }).show(this.slot(function(invoiceCount) {
                return invoiceCount > 0 ? true : false;
              }))
              .end()
              .addClass('aaaaa')

            .end()
          .end()

          .start().addClass('button-bar')
            .start(this.NEXT).end()
          .end()

        .end();
    },

    function initSuccessContact() {
      let myData = this.reportResult.successContact;
      let myDAO = foam.dao.MDAO.create( { of: this.ContactResponseItem } );

      for ( x in myData ) {
        myDAO.put(this.ContactResponseItem.create({
          id: x,
          businessName: myData[x].businessName,
          name: myData[x].name
        }))
        this.contactCount++;
      }

      return myDAO;
    },

    function initSuccessInvoice() {
      let myData = this.reportResult.successInvoice;
      let myDAO = foam.dao.MDAO.create( { of: this.InvoiceResponseItem } );

      for ( x in myData ) {
        myDAO.put(this.InvoiceResponseItem.create({
          id: x,
          invoiceNumber: myData[x].invoiceNumber,
          Amount: myData[x].Amount,
          dueDate: myData.dueDate
        }))
        this.invoiceCount++;
      }

      return myDAO;
    },
  ],

  actions: [
    {
      name: 'next',
      label: 'Next',
      code: function() {
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingReportPage2',
          doSync: true,
          reportResult: this.reportResult
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.invoice.ui.style',
  name: 'InvoiceStyles',
  extends: 'foam.u2.View',

  documentation: 'Invoice CSS that is used for styling views associated to invoices. Implement to use.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        
        .Invoice-Status-Disputed  {
          color: #c82e2e;
          background: white;
          border: 1px solid #c82e2e;
        }
        .Invoice-Status-New  {
          color: #262626;
          background: white;
          border: 1px solid #262626;
        }
        .Invoice-Status-Overdue {
          background: #c82e2e;
          color: white;
        }
        .Invoice-Status-Due {
          background: #59aadd;
          color: white;
        }
        .Invoice-Status-Paid {
          background: #20b020;
          color: white;
        }
        .Invoice-Status-Scheduled {
          color: #20b020;
          border: 1px solid #20b020;
          background: white;
        }
        .Invoice-Status-Pending-Approval {
          color: #093649;
          border: 1px solid #093649;
          background: white;
        }
        .Invoice-Status-Draft {
          color: #666666;
        }
        .generic-status{
          border-radius: 30px;
          padding: 3px 7px;
          display: inline;
        }
        .foam-comics-BrowserView-net-nanopay-b2b-model-Invoice tbody tr {
          height: 40px;
        }
        .foam-u2-view-TableView-th-invoiceNumber  { width: 80px; min-width: 80px; }
        .foam-u2-view-TableView-th-purchaseOrder  { width: 80px; min-width: 80px; }
        .foam-u2-view-TableView-th-payerName { width: 150px; min-width: 150px; }
        .foam-u2-view-TableView-th-payeeName   { width: 150px; min-width: 150px; }
        .foam-u2-view-TableView-th-payerId { width: 150px; min-width: 150px; }
        .foam-u2-view-TableView-th-payeeId   { width: 150px; min-width: 150px; }
        .foam-u2-view-TableView-th-paymentDate      { width: 90px; min-width: 90px; }
        .foam-u2-view-TableView-th-issueDate      { width: 90px; min-width: 90px; }
        .foam-u2-view-TableView-th-amount         { width: 90px; min-width: 90px; padding-right:20px; }
        .foam-u2-view-TableView-th-status         { width: 80px; min-width: 80px; }
      */}
    })
  ]
});
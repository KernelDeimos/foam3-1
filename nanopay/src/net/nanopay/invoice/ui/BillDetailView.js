foam.CLASS({
    package: 'net.nanopay.invoice.ui',
    name: 'BillDetailView',
    extends: 'foam.u2.View',

    imports: [ 
      'stack', 
      'hideSaleSummary'
    ],

    requires: [
      'net.nanopay.invoice.model.Invoice',
      'foam.u2.dialog.NotificationMessage'
    ],
    
    properties: [
      {
        class: 'Boolean',
        name: 'checkBoxRecurring'
      },
      {
        class: 'Double',
        name: 'endsAfter'
      },
      {
        class: 'Date',
        name: 'nextInvoiceDate'
      },
      {
        class: 'String',
        name: 'frequency',
        view: {
          class: 'foam.u2.view.ChoiceView',
          choices: [
            'Daily',
            'Weekly',
            'Biweekly',
            'Monthly'
          ]
        },
        value: 'Daily'       
      }
    ],

    axioms: [
     foam.u2.CSS.create({
       code: function CSS() {/*
        ^{
          font-weight: 100;
        }
        ^ .customer-div {
          display: inline-block;
          margin-bottom: 20px;
        }
        ^ .frequency-div {
          display: inline-block;
          margin: 0 36px 20px 0;
        }
        ^ .attachment-btn {
          margin: 10px 0;
        }
        ^ .new-invoice-title {
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          color: #093649;
          margin: 0;
        }
        ^ .enable-recurring-text {
          font-size: 12px;
          margin: 20px 0;
        }
        ^ .company-card {
          width: 480px;
          height: 155px;
          border-radius: 2px;
          border: solid 1px rgba(164, 179, 184, 0.5);
          margin-top: 20px;
        }
        ^ .company-picture{
          width: 80px;
          height: 80px;
          margin: 17px 30px 0 20px;
        }
        ^ .company-name {
          font-size: 14px;
          font-weight: 300;
          margin-bottom: 10px;
        }
        ^ .vendor-name {
          opacity: 0.6;
          font-size: 14px;
          color: #093649;
          margin: 0;
          margin-bottom: 6px;
        }
        ^ .company-address {
          font-size: 12px;
          margin: 0;
        }
        ^ .connection-icon {
          width: 24px;
          height: 24px;
          float: right;
          margin: 110px 20px 0 0;
        }
        ^ .small-input-box{
          margin: 20px 0;
        }
        ^ .label{
          margin: 0;
        }
        ^ .net-nanopay-ui-ActionView-cancel {
          margin-left: 457px;
          margin-top: 20px;
        }
        ^ .foam-u2-tag-Select {
          width: 225px;
          height: 40px;
          margin-top: 10px;
        }
        ^ .input-container-1{
          width: 600px;
          float: right;
        }
       */}
     })
   ],

    methods: [
        function initE() {
          this.SUPER();
          this.hideSaleSummary = true;

          this
            .addClass(this.myClass())
            .start().addClass('button-row')
              .start(this.DELETE_DRAFT).end()
              .start(this.SAVE_AND_PREVIEW).addClass('float-right').end()
              .start(this.SAVE_AS_DRAFT).addClass('float-right').end()
            .end()
            .start().add('New Bill').addClass('light-roboto-h2').end()
            .start().addClass('white-container')
              .start().addClass('customer-div')
              .start().addClass('label').add('Vendor').end()              
                .start(this.Invoice.PAYEE_ID, { objToChoice: function(user) { return [ user.id, user.firstName + ' ' + user.lastName ]; } }).end()
              .end()
              .start().addClass('input-container-1')
                .start().addClass('float-right')
                  .start().addClass('label').add('PO #').end()
                  .start(this.Invoice.PURCHASE_ORDER).addClass('small-input-box').end()
                .end()
                .start().addClass('')
                  .start().addClass('label').add('Due Date').end()
                  .start(this.Invoice.DUE_DATE).addClass('small-input-box').end()
                  .start().addClass('label').add('Amount').end()
                  .start(this.Invoice.AMOUNT).addClass('small-input-box').end()
                .end()
              .end()
              .start()
                .add('Attachments')
                .start().add('Add Attachment').addClass('attachment-btn white-blue-button btn').end()
                .add('Maximum size 10MB')
              .end()
              .start()
                // .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxRecurring$ })
                // .add('Enable recurring payments').addClass('enable-recurring-text')
              .end()
              .startContext({data: this})
                .start().show(this.checkBoxRecurring$)              
                  .start().addClass('frequency-div')
                    .start().addClass('label').add('Frequency').end()
                      .start(this.FREQUENCY).end()
                  .end()
                  .start().addClass('inline').style({ 'margin-right' : '36px'})
                    .start().addClass('label').add('Ends After ( ) Occurences').end()
                    .start(this.ENDS_AFTER).addClass('small-input-box').end()
                  .end()
                  .start().addClass('inline')
                    .start().addClass('label').add('Next Bill Date').end()
                    .start(this.NEXT_INVOICE_DATE).addClass('small-input-box').end()
                  .end()
                .end()
              .endContext()
              .start()
                .add('Note')
                .start(this.Invoice.NOTE).addClass('half-input-box').end()
              .end()
            .end();
            
        }
    ],

    actions: [
      {
        name: 'deleteDraft',
        label: 'Delete Draft',
        code: function(X) {
          X.stack.push({class: 'net.nanopay.invoice.ui.ExpensesView'});
        }
      },
      {
        name: 'saveAsDraft',
        label: 'Save As Draft',
        code: function(X) {
          X.dao.put(this);
          X.stack.push({class: 'net.nanopay.invoice.ui.ExpensesView'});
        }
      },
      {
        name: 'saveAndPreview',
        label: 'Save & Preview',
        isEnabled: function(amount) { return amount > 0; },
        code: function(X) {
          var self = this;

          if(X.frequency && X.endsAfter && X.nextInvoiceDate && this.amount){
            var recurringInvoice = net.nanopay.invoice.model.RecurringInvoice.create({
              frequency: X.frequency,
              endsAfter: X.endsAfter,
              nextInvoiceDate: X.nextInvoiceDate,
              amount: this.amount,
              payeeId: this.payeeId,
              payerId: this.payerId,
              invoiceNumber: this.invoiceNumber,
              dueDate: this.dueDate,
              purchaseOrder: this.purchaseOrder,
              payeeName: this.payeeName,
              payerName: this.payerName
            })
            X.recurringInvoiceDAO.put(recurringInvoice).then(function(a){
              self.recurringInvoice = a;
              X.dao.put(self);
            })
          } else {
            X.dao.put(this);          
          }
          X.stack.push({class: 'net.nanopay.invoice.ui.ExpensesView'});
        }
      },

    ]
});
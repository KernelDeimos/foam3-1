foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionEditView',
  extends: 'foam.u2.View',

  documentation: "Edit View for Recurring Invoices.",

  requires: [ 
    'net.nanopay.invoice.model.RecurringInvoice'
  ],

  imports: [
    'recurringInvoiceDAO'
  ],

  properties: [
    'data',
    // 'purchaseOrder',
    // 'amount',
    // 'invoiceNumber',
    // {
    //   name: 'frequency',
    //   view: {
    //     class: 'foam.u2.view.ChoiceView',
    //     choices: [
    //       'Daily',
    //       'Weekly',
    //       'Biweekly',
    //       'Monthly'
    //     ]
    //   }
    // },
    // {
    //   class: 'Date',      
    //   name: 'issueDate'
    // },
    // { 
    //   class: 'Date',      
    //   name: 'endsAfter'
    // },
    // {
    //   class: 'Date',      
    //   name: 'nextDate'
    // },
    // {
    //   name: 'note',
    //   view: 'foam.u2.tag.TextArea',
    //   value: ''
    // }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
        }
        ^{
          font-weight: 100;
        }
        ^ .customer-div {
          display: inline-block;
          margin-bottom: 20px;
        }
        ^ .po-amount-div {
          margin-left: 20px;
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
          width: 228px;
          height: 40px;
          margin-top: 10px;
        }
        ^ .grey-button{
          margin-top: 20px;
          top: 0;
        }
        ^ .white-blue-button{
          margin-top: 20px
        }
        */
      }
    })
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().addClass('button-row')
          .start(this.BACK_TO_REC).addClass('grey-button').end()
          .start(this.APPLY).addClass('float-right blue-button').end()          
          .start(this.NEXT_INVOICE).addClass('float-right white-blue-button').end()
        .end()
        .start().add('Edit Invoice').addClass('light-roboto-h2').end()
        .start().addClass('white-container')
          .start().addClass('customer-div')
          .start().addClass('label').add('Vendor').end()              
            .add(this.data.payeeName)
          .end()
          .start().addClass('po-amount-div float-right')
            .start().addClass('label').add('PO #').end()
            .start(this.RecurringInvoice.PURCHASE_ORDER).addClass('small-input-box').end()
            .start().addClass('label').add('Amount').end()
            .start(this.RecurringInvoice.AMOUNT).addClass('small-input-box').end()
          .end()
          .start().addClass('float-right')
            .start().addClass('label').add('Invoice #').end()
            .start(this.RecurringInvoice.INVOICE_NUMBER).addClass('small-input-box').end()
            .start().addClass('label').add('Due Date').end()
            .start(this.RecurringInvoice.ISSUE_DATE).addClass('small-input-box').end()
          .end()
          .start()
            .add('Attachments')
            .start().add('Add Attachment').addClass('attachment-btn white-blue-button btn').end()
            .add('Maximum size 10MB')
          .end()
          .start()
            .tag({class: 'foam.u2.CheckBox'})
            .add('Enable recurring payments').addClass('enable-recurring-text')
          .end()
          .start().addClass('frequency-div')
            .start().addClass('label').add('Frequency').end()
            .start(this.RecurringInvoice.FREQUENCY).end()
          .end()
          .start().addClass('inline').style({ 'margin-right' : '36px'})
            .start().addClass('label').add('Ends After').end()
            .start(this.RecurringInvoice.ENDS_AFTER).addClass('small-input-box').end()
          .end()
          .start().addClass('inline')
            .start().addClass('label').add('Next Bill Date').end()
            .start(this.RecurringInvoice.NEXT_INVOICE_DATE).addClass('small-input-box').end()
          .end()
          .start()
            .add('Note')
            .start(this.RecurringInvoice.NOTE).addClass('half-input-box').end()
          .end()
        .end();
        
    }
  ],

  actions: [
    {
      name: 'backToRec',
      label: 'Back',
      code: function(X) {
        X.stack.back();
      }
    },
    {
      name: 'nextInvoice',
      label: 'Apply To Next Invoice',
      code: function(X) {
        /* edit all invoice associated to this recurring invoice */
        X.dao.put(this);
        X.stack.push({class: 'net.nanopay.invoice.ui.SubscriptionView'});
      }
    },
    {
      name: 'apply',
      label: 'Apply To All',
      code: function(X) {
        X.dao.put(this);
        X.stack.push({class: 'net.nanopay.invoice.ui.SubscriptionView'});
      }
    },
  ]
});
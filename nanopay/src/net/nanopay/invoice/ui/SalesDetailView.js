foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SalesDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'ctrl',
    'hideSummary',
    'invoiceDAO',
    'stack',
    'user'
  ],

  exports: [
    'as data',
    'hideSummary',
    'openExportModal'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ {
      width: 962px;
      margin: auto;
    }
    ^ h5{
      opacity: 0.6;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      color: #093649;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border: 1px solid lightgrey;
      background-color: rgba(164, 179, 184, 0.1);
      vertical-align: top;
      position: relative;
      z-index: 10;
    }
    .net-nanopay-ui-ActionView-backAction:hover {
      background: rgba(164, 179, 184, 0.3);
    }
    ^ .net-nanopay-ui-ActionView-recordPayment:hover {
      background: %SECONDARYHOVERCOLOR%;
    }
    ^ .net-nanopay-ui-ActionView-voidDropDown:focus {
      background: %SECONDARYHOVERCOLOR%;
    }
    ^ .net-nanopay-ui-ActionView-voidDropDown:hover {
      background: %SECONDARYHOVERCOLOR%;
    }
    ^ .net-nanopay-ui-ActionView-recordPayment {
      background-color: #59A5D5;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    ^ .net-nanopay-ui-ActionView-voidDropDown {
      width: 30px;
      height: 40px;
      background-color: #59A5D5;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-voidDropDown::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 6px solid transparent;
      border-top-color: white;
      transform: translate(-6.5px, -1px);
    }
    ^ .popUpDropDown {
      padding: 0 !important;
      z-index: 100;
      width: 165px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .popUpDropDown > div {
      width: 165px;
      height: 30px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;
    }
    ^ .popUpDropDown > div:hover {
      background-color: #59a5d5;
      color: white;
      cursor: pointer;
    }
    ^ h5 img{
      margin-left: 20px;
      position: relative;
      top: 3px;
    }
    ^ .myHide {
      display: none;
    }
  `,

  properties: [
    'voidMenuBtn_',
    'voidPopUp_',
    {
      name: 'verbTenseMsg',
      documentation: 'Past or present message on invoice status notification',
      expression: function(data) {
        return data.paymentMethod === this.PaymentStatus.PENDING ?
            'Invoice is' :
            'Invoice has been';
      }
    },
    {
      name: 'foreignExchange',
      factory: function() {
        if ( this.data.sourceCurrency == null ) return false;
        return this.data.targetCurrency !== this.data.sourceCurrency;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.hideSummary = true;
      var dispy;

      // Currently making 'Record Payment' button disappear with 'myHide'
      this.addClass(self.myClass())
      .add(self.data.status$.map(function(status) {
        if ( self.data.createdBy == self.user.id ) {
          dispy = self.E().addClass(self.myClass())
          .start(self.VOID_DROP_DOWN, null, self.voidMenuBtn_$)
            .enableClass('myHide', foam.util.equals(status, 'Void'))
          .end();
        }
        dispy.start(self.RECORD_PAYMENT)
          .enableClass('myHide', foam.util.equals(status, 'Void'))
        .end();
        return dispy;
      }));

      this
        .addClass(this.myClass())
        .startContext({ data: this })
          .start(this.BACK_ACTION).end()
        .endContext()
        .start(this.EXPORT_BUTTON,
          { icon: 'images/ic-export.png', showLabel: true }
        ).end()
        .start('h5')
          .add('Bill to ', this.data.payer.label())
          .callIf(this.foreignExchange, function() {
            this.start({
              class: 'foam.u2.tag.Image',
              data: 'images/ic-crossborder.svg'
            }).end();
          })
        .end()
        .callIf(this.foreignExchange, function() {
          this.tag({
            class: 'net.nanopay.invoice.ui.shared.ForeignSingleItemView',
            data: self.data
          });
        })
        .callIf(! this.foreignExchange, function() {
          this.tag({
            class: 'net.nanopay.invoice.ui.shared.SingleItemView',
            data: self.data
          });
        })
        .tag({
          class: 'net.nanopay.invoice.ui.history.InvoiceHistoryView',
          id: this.data.id
        })
      .br()
      .start('div').addClass('light-roboto-h2')
        .start('span').style({ 'margin-bottom': '0px', 'margin-left': '20px' }).add('Note: ').end()
        .start('span').style({ 'font-size': '10px' }).add(this.data.note).end()
      .end()
      .br();
    },

    function openExportModal() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.ui.modal.ExportModal',
        exportObj: this.data
      }));
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X) {
        this.hideSummary = false;
        X.stack.back();
      }
    },
    {
      name: 'exportButton',
      label: 'Export',
      code: function(X) {
        X.openExportModal();
      }
    },
    {
      name: 'recordPayment',
      label: 'Record Payment',
      code: function(X) {
        var self = this;
        if ( this.data.paymentMethod != this.PaymentStatus.NONE ) {
          self.add(self.NotificationMessage.create({
            message: `${this.verbTenseMsg} ${this.data.paymentMethod.label}.`,
            type: 'error'
          }));
          return;
        }
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({
          class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal',
          invoice: this.data
        }));
      }
    },
    {
      name: 'voidDropDown',
      label: '',
      code: function(X) {
         var self = this;

         self.voidPopUp_ = self.PopupView.create({
           width: 165,
           x: - 137,
           y: 40,
         });

         self.voidPopUp_.addClass('popUpDropDown')
          .start('div').add('Void')
            .on('click', this.voidPopUp)
          .end();

        self.voidMenuBtn_.add(self.voidPopUp_);
      }
    }
  ],

  listeners: [
    function voidPopUp() {
      var self = this;
      self.voidPopUp_.remove();
      if ( this.data.paymentMethod != this.PaymentStatus.NONE ) {
        self.add(self.NotificationMessage.create({
          message: `${this.verbTenseMsg} ${this.data.paymentMethod.label}.`,
          type: 'error'
        }));
        return;
      }
      this.ctrl.add(this.Popup.create().tag({
        class: 'net.nanopay.invoice.ui.modal.DisputeModal',
        invoice: this.data
      }));
    }
  ]
});

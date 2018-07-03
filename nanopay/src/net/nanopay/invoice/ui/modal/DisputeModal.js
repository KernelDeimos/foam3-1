
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'DisputeModal',
  extends: 'foam.u2.Controller',

  documentation: 'Dispute Invoice Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  imports: [
    'user',
    'invoiceDAO'
  ],

  properties: [
    'invoice',
    {
      name: 'type',
      expression: function(invoice, user) {
        return user.id != invoice.payeeId;
      }
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    {
      name: 'companyName',
      expression: function(type) {
        return type ? this.invoice.payeeName : this.invoice.payerName;
      }
    }
  ],

  css: `
    ^{
      width: 448px;
      margin: auto;
      font-family: Roboto;
    }
  `,

  messages: [
    {
      name: 'VoidSuccess',
      message: 'Invoice voided.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .tag(this.ModalHeader.create({ title: 'Void' }))
        .addClass(this.myClass())
          .start()
            .start().addClass('key-value-container')
              .start()
                .start().addClass('key').add('Company').end()
                .start().addClass('value')
                  .add(this.companyName)
                .end()
              .end()
              .start()
                .start().addClass('key').add('Amount').end()
                .start().addClass('value')
                  .add(this.invoice.targetCurrency.alphabeticCode)
                  .add(' ')
                  .add((this.invoice.amount/100).toFixed(2))
                  .end()
              .end()
            .end()
            .start().addClass('label').add('Note').end()
            .start(this.NOTE).addClass('input-box').end()
            .start(this.VOIDED).addClass('blue-button').addClass('btn').end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'voided',
      label: 'Void',
      code: function(X) {
        this.invoice.paymentMethod = this.PaymentStatus.VOID;
        this.invoice.note = X.data.note;
        this.invoiceDAO.put(this.invoice);
        ctrl.add(this.NotificationMessage.create({
          message: this.VoidSuccess,
          type: ''
        }));
        X.closeDialog();
      }
    }
  ]
});

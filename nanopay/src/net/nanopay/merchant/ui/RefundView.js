foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'RefundView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Refund confirmation popup',

  requires: [
    'net.nanopay.merchant.ui.SuccessView',
    'net.nanopay.merchant.ui.ErrorView',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.cico.model.TransactionType',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  imports: [
    'user',
    'device',
    'stack',
    'toolbarIcon',
    'toolbarTitle',
    'transactionDAO'
  ],

  css: `
    ^ {
      width: 100%;
      height: 100%;
      background-color: #ffffff;
      position: fixed;
    }
    ^ .refund-info-wrapper {
      width: 100%;
      height: 180px;
      color: #252c3d;
    }
    ^ .refund-message {
      height: 16px;
      font-size: 16px;
      line-height: 1;
      text-align: left;
      color: #252c3d;

      padding-left: 83px;
      padding-top: 48px;
    }
    ^ .refund-amount {
      font-size: 25px;
      line-height: 0.64;
      color: #26a96c;
    }
    ^ .refund-profile {
      display: table;
      height: 45px;
      overflow: hidden;
      padding-left: 77px;
      padding-top: 20px;
    }
    ^ .refund-profile-icon img {
      height: 45px;
      width: 45px;
      display: table-cell;
      vertical-align: middle;
      border-style: solid;
      border-width: 1px;
      border-color: #f1f1f1;
      border-radius: 50%;
    }
    ^ .refund-profile-name {
      font-size: 16px;
      line-height: 1;
      text-align: left;
      color: #252c3d;
      display: table-cell;
      vertical-align: middle;
      padding-left: 14px;
    }
    ^ .refund-buttons-wrapper {
      width: 100%;
      position: fixed;
      bottom: 0px;
    }
    ^ .refund-cancel-button {
      width: 50%;
      height: 72px;
      background-color: #595959;
    }
    ^ .refund-accept-button {
      width: 50%;
      height: 72px;
      background-color: #f55a5a;
    }
  `,

  properties: [
    ['header', true],
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'transactionUser'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.toolbarIcon = 'arrow_back';
      this.toolbarTitle = 'Back';

      var user = this.transactionUser;

      this
        .addClass(this.myClass())
        .start('div').addClass('refund-info-wrapper')
          .start().addClass('refund-message')
            .add('Refund ')
            .start('span').addClass('refund-amount').add('$' + ( this.transaction.amount / 100 ).toFixed(2)).end()
            .add(' to')
          .end()
          .start().addClass('refund-profile')
            .start().addClass('refund-profile-icon')
              .tag({ class: 'foam.u2.tag.Image', data: user.profilePicture || 'images/merchant/ic-placeholder.png' })
            .end()
            .start().addClass('refund-profile-name')
              .add(user.firstName + ' ' + user.lastName)
            .end()
          .end()
        .end()
        .start('div').addClass('refund-buttons-wrapper')
          .start('button').addClass('refund-cancel-button')
            .add('Cancel')
            .on('click', this.onCancelClicked)
          .end()
          .start('button').addClass('refund-accept-button')
            .add('Refund')
            .on('click', this.onRefundClicked)
          .end()
        .end()
    }
  ],

  listeners: [
    function onCancelClicked (e) {
      this.stack.back();
    },

    function onRefundClicked (e) {
      if ( this.transaction.refundTransactionId ||
            this.transaction.status == this.TransactionStatus.REFUNDED ||
            this.transaction.type == this.TransactionType.REFUND ) {
        return;
      }

      var self = this;
      this.transactionDAO.put(this.Transaction.create({
        payeeId: this.user.id,
        payerId: this.transactionUser.id,
        amount: this.transaction.amount,
        deviceId: this.device.id,
        refundTransactionId: this.transaction.id,
        status: this.TransactionType.REFUND
      })).then(function () {
        self.transaction.status = self.TransactionStatus.REFUNDED;
        return self.transactionDAO.put(self.transaction);
      })
      .then(function (result) {
        self.transaction.copyFrom(result);
        self.stack.push(self.SuccessView.create({
          transaction: self.transaction,
          transactionUser: self.transactionUser
        }));
      })
      .catch(function (err) {
        // clone transaction and set status to refunded
        var failed = self.transaction.clone();
        failed.status = self.TransactionStatus.REFUNDED

        self.stack.push(self.ErrorView.create({
          transaction: failed,
          transactionUser: self.transactionUser
        }));
      });
    }
  ]
});

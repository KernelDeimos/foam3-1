foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'TransactionRowView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.merchant.ui.transaction.TransactionDetailView',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.cico.model.TransactionType',
    'foam.nanos.auth.User'
  ],

  imports: [
    'currentAccount',
    'stack',
    'user',
    'userDAO'
  ],

  css: `
    ^ {
      background-color: #ffffff;
      box-shadow: inset 0 -1px 0 0 #f2f2f2;
    }
    ^ .transaction-item {
      padding-left: 20px;
      padding-right: 20px;
    }
    ^ .transaction-item-icon img {
      position: absolute;
      border-style: solid;
      border-width: 1px;
      border-color: #f1f1f1;
      border-radius: 50%;
      margin-top: 13px;
      margin-bottom: 13px;
    }
    ^ .transaction-item-name {
      position: absolute;
      text-align: left;
      color: #252c3d;
    }
    ^ .transaction-item-datetime {
      position: absolute;
      text-align: left;
      color: #666a86;
    }
    ^ .transaction-item-amount {
      position: absolute;
      text-align: right;
      right: 0px;
      color: #26a96c;
      padding-right: 20px;
    }
    ^ .transaction-item-amount.refund {
      color: #f55a5a;
    }
    @media only screen and (min-width: 0px) {
      ^ {
        height: 70px;
      }
      ^ .transaction-item-icon img {
        height: 45px;
        width: 45px;
      }
      ^ .transaction-item-name {
        font-size: 16px;
        padding-left: 65px;
        padding-top: 22px;
      }
      ^ .transaction-item-datetime {
        font-size: 10px;
        padding-left: 65px;
        padding-top: 40px;
      }
      ^ .transaction-item-amount {
        font-size: 20px;
        line-height: 70px;
      }
    }
    @media only screen and (min-width: 768px) {
      ^ {
        height: 110px;
      }
      ^ .transaction-item-icon img {
        height: 85px;
        width: 85px;
      }
      ^ .transaction-item-name {
        font-size: 26px;
        padding-left: 105px;
        padding-top: 32px;
      }
      ^ .transaction-item-datetime {
        font-size: 20px;
        padding-left: 105px;
        padding-top: 65px;
      }
      ^ .transaction-item-amount {
        font-size: 30px;
        line-height: 110px;
      }
    }
    @media only screen and (min-width: 1024px) {
      ^ {
        height: 150px;
      }
      ^ .transaction-item-icon img {
        height: 124px;
        width: 124px;
      }
      ^ .transaction-item-name {
        font-size: 36px;
        padding-left: 145px;
        padding-top: 42px;
      }
      ^ .transaction-item-datetime {
        font-size: 30px;
        padding-left: 145px;
        padding-top: 90px;
      }
      ^ .transaction-item-amount {
        font-size: 40px;
        line-height: 150px;
      }
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'transactionUser',
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var refund = this.transaction.status === this.TransactionType.REFUND ||
        this.transaction.status === this.TransactionStatus.REFUNDED;

      this.transactionUser = this.user.id == this.transaction.payerId ?
        this.transaction.payee : this.transaction.payer;

      this.addClass(this.myClass())
        .on('click', this.onClick).start('div').addClass('transaction-item')
          .start()
            .addClass('transaction-item-icon').tag({
              class: 'foam.u2.tag.Image',
              data: this.transactionUser.profilePicture ?
                this.transactionUser.profilePicture :
                'images/ic-placeholder.png'
              }).end()
          .start().addClass('transaction-item-name')
            .add(this.transactionUser.firstName + ' '
              + this.transactionUser.lastName)
          .end()
          .start().addClass('transaction-item-datetime')
            .add(this.transaction.date.toString())
          .end()
          .start().addClass('transaction-item-amount')
            .addClass(refund ? 'refund' : '')
            .add('$' + (this.transaction.total / 100).toFixed(2))
          .end()
        .end();
    }
  ],

  listeners: [
    function onClick(e) {
      this.stack.push(this.TransactionDetailView.create({
        transaction: this.transaction,
        transactionUser: this.transactionUser
      }));
    }
  ]
});

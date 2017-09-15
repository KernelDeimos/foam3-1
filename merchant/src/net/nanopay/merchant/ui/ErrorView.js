foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'ErrorView',
  extends: 'foam.u2.View',

  imports: [
    'toolbar'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background-color: #f55a5a;
          height: 480px;
          width: 320px;
          margin-top: -56px;
        }
        ^ .error-view-div {
          padding-top: 70px;
          padding-left: 36px;
        }
        ^ .error-icon img {
          height: 76px;
          width: 76px;
        }
        ^ .error-message {
          font-family: Roboto;
          font-size: 32px;
          font-weight: 300;
          text-align: left;
          padding-top: 30px;
        }
        ^ .error-amount {
          font-family: Roboto;
          font-size: 32px;
          font-weight: bold;
          text-align: left;
          padding-top: 7px;
        }
        ^ .error-from-to {
          font-family: Roboto;
          font-size: 12px;
          text-align: left;
          color: rgba(255, 255, 255, 0.7);
          padding-top: 50px;
        }
        ^ .error-profile {
          display: table;
          height: 40px;
          overflow: hidden;
          padding-top: 10px;
        }
        ^ .error-profile-icon img {
          height: 40px;
          width: 40px;
          display: table-cell;
          vertical-align: middle;
          border-style: solid;
          border-width: 1px;
          border-color: #f1f1f1;
          border-radius: 50%;
        }
        ^ .error-profile-name {
          font-family: Roboto;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          display: table-cell;
          vertical-align: middle;
          padding-left: 20px;
        }
      */}
    })
  ],

  properties: [
    { name: 'refund', class: 'Boolean' }
  ],

  messages: [
    { name: 'paymentError', message: 'Payment failed. Please try again' },
    { name: 'refundError',  message: 'Refund failed. Please try again' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var user = this.data.user

      this
        .addClass(this.myClass())
        .start('div').addClass('error-view-div')
          .start('div').addClass('error-icon')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-error.png' })
          .end()
          .start().addClass('error-message').add( ! this.refund ? this.paymentError : this.refundError ).end()
          .start().addClass('error-amount').add('$' + ( this.data.amount / 100 ).toFixed(2)).end()
          .start().addClass('error-from-to').add( ! this.refund ? 'From' : 'To' ).end()
          .start().addClass('error-profile')
            .start('div').addClass('error-profile-icon')
              .tag({ class: 'foam.u2.tag.Image', data: user.profilePicture || 'images/ic-placeholder.png' })
            .end()
            .start().addClass('error-profile-name')
              .add(user.firstName + ' ' + user.lastName)
            .end()
          .end()
        .end()

      this.onload.sub(function () {
        this.toolbar.classList.add('hidden');
      });
    }
  ]
})
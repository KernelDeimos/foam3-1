foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'BalanceView',
  extends: 'foam.u2.View',

  imports: [
    'user',
    'account'
  ],

  css: `
    ^ {
      width: 100%;
      background: white;
      height: 60px;
      border-radius: 2px;
    }
    ^ .light-roboto-h2{
      margin: 20px 0 0 20px;
    }
    ^ .account-balance{
      font-size: 14px;
      font-weight: bold;
      position: relative;
      top: 23px;
      left: 25px;
    }
  `,

  messages: [
    { name: 'title', message: 'Digital Cash Balance'}
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
      .addClass(this.myClass())
      .start().addClass('float-left light-roboto-h2')
        .add(this.title)
      .end()
      .start().addClass('account-balance')
       .add('$ ', this.account.balance.toFixed(2))
      .end();
    }
  ]
});
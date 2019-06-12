foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'CurrencyChoice',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currencyDAO',
    'currentAccount',
    'stack'
  ],

  requires: [
    'foam.u2.View',
    'net.nanopay.model.Currency'
  ],

  exports: [
    'as data'
  ],

  css: `
    ^container {
      height: 100%;
      display: flex;
      align-items: center;
    }
    ^container:hover {
      cursor: pointer;
    }
    ^container img {
      margin: 0 4px;
    }
    ^container span {
      font-size: 12px;
    }
    ^carrot {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid black;
      display: inline-block;
      float: right;
      margin-top: 8px;
      margin-left: 5px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-currencyChoice {
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      width: 84px !important;
      cursor: pointer;
      margin-left: 5px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-currencyChoice > span {
      color: #2b2b2b !important;
      font-family: lato !important;
      font-size: 12px;
      font-weight: 300;
      margin-left: 5px;
    }
    ^ .popUpDropDown {
      z-index: 950;
      position: relative;
      background: white;
      width: 90px !important;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
      border-radius: 3px;
      padding: 6px;
      margin-left: -6px;
    }
    ^ .popUpDropDown div {
      width: auto !important;
      text-align: center;
      height: auto;
      padding-bottom: 5;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;
      padding: 4px 12px;
      border-radius: 3px;
    }
    ^ .popUpDropDown div:hover {
      background: #604aff !important;
    }
    ^ .foam-u2-PopupView {
      padding: 0 !important;
      z-index: 1000;
      width: 110px !important;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
    }
    ^ .popUpDropDown > div:hover{
      background-color: #59a5d5;
      color: white;
      cursor: pointer;
    }
    ^ .popUpDropDown::before {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: white;
      -ms-transform: translate(110px, -16px);
      transform: translate(50px, -16px);
    }
    ^ .popUpDropDown > div {
      display: flex;
    }
    ^img{
      width: 27px;
      position: relative;
      top: 2px;
      border-radius: 2px;
    }
    ^ .flag {
      width: 30px;
      height: 17.6px;
      object-fit: contain;
      margin-right: 12px;
      margin-top: 5px;
      margin-left: 0px;
      border-radius: 2px;
    }
    ^background {
      bottom: 0;
      left: 0;
      opacity: 0.4;
      right: 0;
      top: 0;
      position: fixed;
      z-index: 850;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView.net-nanopay-sme-ui-AbliiActionView-currencyChoice img {
      border-radius: 2px !important;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView.net-nanopay-sme-ui-ActionView-currencyChoice:hover {
      background: transparent !important;
    }
    ^ .disabled {
      filter: grayscale(100%) opacity(60%);
      cursor: default;
    }
  `,

  properties: [
    'optionsBtn_',
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'chosenCurrency',
      postSet: function() {
        this.data = this.chosenCurrency;
      },
      documentation: 'The selected currency showing on the optionsBtn_'
    }
  ],

  methods: [
    function initE() {
      var denominationToFind = this.data ? this.data : this.currentAccount.denomination;
      // Get the default currency and set it as chosenCurrency
      this.currencyDAO.find(denominationToFind)
        .then((currency) => {
          this.chosenCurrency = currency;
        });

      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('container'))
          .start('img').attr('src', this.chosenCurrency$.dot('flagImage')).end()
          .add(this.chosenCurrency$.dot('alphabeticCode'))
          .on('click', this.onClick)
          .enableClass('disabled', this.mode$.map((mode) => mode === foam.u2.DisplayMode.DISABLED))
          .start('div')
            .addClass(this.myClass('carrot'))
          .end()
        .end()
        .start('span', null, this.optionsBtn_$).end();
    }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function(e) {
        var self = this;
        if (
          mode === foam.u2.DisplayMode.DISABLED ||
          mode === foam.u2.DisplayMode.RO
        ) {
          e.preventDefault();
        }

        this.optionPopup_ = this.View.create({});

        this.optionPopup_ = this.optionPopup_
          .start('div')
            .addClass('popUpDropDown')
            .select(this.currencyDAO, function(currency) {
              if ( typeof currency.flagImage === 'string' ) {
                return this.E()
                  .start('img').addClass(this.myClass('img'))
                      .attrs({ src: currency.flagImage })
                      .addClass('flag')
                  .end()
                  .add(currency.alphabeticCode)
                  .on('click', function() {
                      self.chosenCurrency = currency;
                      self.optionPopup_.remove();
                  });
              }
            })
          .end()
          .start()
            .addClass(this.myClass('background'))
            .on('click', () => {
              this.optionPopup_.remove();
            })
          .end();

        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});

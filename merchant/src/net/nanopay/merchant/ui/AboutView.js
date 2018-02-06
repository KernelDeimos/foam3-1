foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'AboutView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  imports: [
    'showAbout',
    'toolbarIcon',
    'toolbarTitle',
    'webApp',
    'copyright',
  ],

  css: `
    ^ {
      width: 100%;
      height: 480px;
      display: table;
      position: absolute;
      background-color: %PRIMARYCOLOR%;
      margin-top: -56px;
    }
    ^ .wrapper {
      display: table-cell;
      vertical-align: middle;
    }
    ^ .about-mintchip {
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }
  `,

  properties: [
    ['header', true]
  ],

  messages: [
    { name: 'version', message: '0.0.1' },
    { name: 'rights', message: 'All rights reserved.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.showAbout = false;
      this.toolbarTitle = 'Back';
      this.toolbarIcon = 'arrow_back';

      this.onDetach(function () {
        self.showAbout = true;
      });

      this
        .addClass(this.myClass())
        .start('div').addClass('wrapper')
          .start('div').addClass('about-mintchip')
            .start('div').addClass('mintchip-logo')
              .attrs({ 'aria-hidden': true })
              .callIf(this.webApp == 'nanopay Merchant', function(){
                this.tag({ class: 'foam.u2.tag.Image', data: 'images/ic-launcher/64x64.png' })  
              })
              .callIf(this.webApp == 'ConnectedMerchant™', function(){
                this.tag({ class: 'foam.u2.tag.Image', data: 'images/connected-logo.png' })
              })
            .end()
            .start('h3').add(this.webApp).end()
            .start().add('Version ' + this.version).end().br()
            .start().add('© 2018 ' + this.copyright).br().add(this.rights).end()
          .end()
        .end()

    }
  ]
});

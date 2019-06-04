foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksSubHeader',
  extends: 'foam.u2.Controller',

  imports: [
    'theme'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: %PRIMARYCOLOR%;
          height: 65px;
          width: 100%;
          margin-bottom: 15px;
          margin-top: 20px;
          display: table;
        }
        ^ .verticalCenter {
          display: table-cell;
          vertical-align: middle;
        }
        ^ .icConnected {
          display: inline-block;
          width: 24px;
          height: 24px;
          margin-left: 30px;
          vertical-align: middle;
        }
        ^ .firstImg {
          display: inline-block;
          max-width: 120px;
          max-height: 65px;
          width: auto;
          height: auto;
          vertical-align: middle;
          margin-left: 82px;
        }
        ^ .secondImg {
          display: inline-block;
          max-width: 120px;
          max-height: 65px;
          width: auto;
          height: auto;
          margin-left: 30px;
          vertical-align: middle;
        }
      */}
    })
  ],

  properties: [
    'secondImg'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var logoSlot = this.theme.logo$.map(function(logo) { return logo || self.logo; });
      this
      .addClass(this.myClass())
      .start('div').addClass('verticalCenter')
        .start({class: 'foam.u2.tag.Image', data$: logoSlot}).addClass('firstImg').end()
        .start({class: 'foam.u2.tag.Image', data: 'images/banks/ic-connected.svg'}).addClass('icConnected').end()
        .callIf(self.secondImg, function() {
          this.start({class: 'foam.u2.tag.Image', data$: self.secondImg$}).addClass('secondImg').end()
        })
        .callIf(!self.secondImg, function() {
          this.start({class: 'foam.u2.tag.Image', data$: logoSlot}).addClass('secondImg').end()
        })
      .end()
    }
  ]
});

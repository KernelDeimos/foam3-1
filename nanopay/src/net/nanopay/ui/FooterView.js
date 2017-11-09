foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'FooterView',
  extends: 'foam.u2.View',

  documentation: 'View to display footer, including copyright label',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100%;
          min-width: 992px;
          margin: auto;
          position: relative;
          top: 60;
        }
        ^ h3{
          font-size: 14px;
          font-weight: 300;
          text-align: center;
          color: #262626;
          display: inline-block;
          opacity: 0.6;
          float: left;
          margin-left: 25px;
        }
        ^ .copyright-label {
          margin-right: 50px;
          float: right;
          opacity: 0.3;
        }
      */}
    })
  ],

  messages: [
    { name: 'portalLabel',    message: 'B2B Portal Powered by @nanopay' },
    { name: 'copyrightLabel', message: 'copyright @nanopay 2017, all right reserved.' }
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('h3').add(this.portalLabel).end()
          .start('h3').addClass('copyright-label').add(this.copyrightLabel).end()
        .end();
    }
  ]
});

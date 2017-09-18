foam.CLASS({
  package: 'net.nanopay.ui.topNavigation',
  name: 'TopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar',

  imports: [ 'menuDAO' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: #093649;
          width: 100%;
          height: 60px;
          color: white;
          padding-top: 5px;
        }
        ^ .topNavContainer {
          width: 100%;
          margin: auto;
        }
        .menuBar > div > ul {
          padding-left: 0;
          font-weight: 100;
          color: #ffffff;
        }
        .menuBar > div > ul > li{
          margin-left: 25px;
          display: inline-block;
          cursor: pointer;
          border-bottom: 4px solid transparent;
          transition: text-shadow;
        }

        .menuBar > div > ul > li:hover {
          border-bottom: 4px solid #1cc2b7;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.menuDAO; }
    }
  ],

  methods: [
    function initE(){
      this
        .addClass(this.myClass())
        .start().addClass('topNavContainer')
          // .start({class: 'net.nanopay.ui.topNavigation.BusinessLogoView', data: '' })
          // .end()
          .start({class: 'foam.nanos.menu.MenuBar'}).addClass('menuBar')
          .end()
          // .start({class: 'net.nanopay.ui.topNavigation.UserTopNavView'})
          // .end()
        .end()
    }
  ]
});

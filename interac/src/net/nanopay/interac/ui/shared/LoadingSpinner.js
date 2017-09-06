foam.CLASS({
  package: 'net.nanopay.interac.ui.shared',
  name: 'LoadingSpinner',
  extends: 'foam.u2.View',

  documentation: 'Small view that just shows a loading spinner',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          display: inline-block;
          width: 20px;
          height: 20px;
        }

        ^ .hidden {
          display: none;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isHidden',
      value: false
    }
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass()).enableClass('hidden', this.isHidden$)
        .start({class: 'foam.u2.tag.Image', data: 'images/ic-loading.svg'}).end();
    },

    function show() {
      this.isHidden = false;
    },

    function hide() {
      this.isHidden = true;
    }
  ]
});

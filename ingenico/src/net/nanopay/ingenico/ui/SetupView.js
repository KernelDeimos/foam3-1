foam.CLASS({
  package: 'net.nanopay.ingenico.ui',
  name: 'SetupView',
  extends: 'foam.u2.View',

  documentation: 'Setup view with serial number',

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 480px;
          background: #2c4389
        }
        ^ .setup-title {
          height: 30px;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          padding-top: 20px;
        }
        ^ .serial-number-label {
          height: 29px;
          font-size: 25px;
          font-weight: 500;
          text-align: center;
          color: #ffffff;
          padding-top: 44px;
        }
        ^ .setup-instructions {
          height: 60px;
          font-size: 16px;
          line-height: 1.25;
          text-align: center;
          color: #ffffff;
          padding-top: 66px;
        }
        ^ .setup-next-wrapper {
          padding-top: 103px;
        }
        ^ .setup-next-button {
          width: 320px;
          height: 72px;
          background-color: #26a96c;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'serialNumber',
      factory: function () {
        return '1234 5678 9012 1234';
      }
    }
  ],

  messages: [
    { name: 'instructions', message: 'Input the serial number above in the retail portal and press next to provision this device.' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .addClass('setup-title')
          .add('Serial Number')
        .end()
        .start()
          .addClass('serial-number-label')
          .add(this.serialNumber)
        .end()
        .start()
          .addClass('setup-instructions')
          .add(this.instructions)
        .end()
        .start('div').addClass('setup-next-wrapper')
          .start('button').addClass('setup-next-button')
            .add('Next')
            .on('click', this.onNextClicked)
          .end()
        .end()
    }
  ],

  listeners: [
    function onNextClicked (e) {
      this.stack.push({ class: 'net.nanopay.ingenico.ui.HomeView' });
    }
  ]
});
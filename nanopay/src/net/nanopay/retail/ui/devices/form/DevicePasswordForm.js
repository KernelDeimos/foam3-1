foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DevicePasswordForm',
  extends: 'net.nanopay.ui.wizardView.WizardSubView',

  documentation: 'Form to display device password.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .passwordLabel {
          font-size: 45px;
          letter-spacing: 24px;
          color: #093649;
        }
      */}
    })
  ],

  requires: [
    'net.nanopay.retail.model.Device'
  ],

  messages: [
    { name: 'Step',         message: 'Step 4: Use the following code.' },
    { name: 'Instructions', message: 'Please input the following code on the device you want to provision and follow the instructions on your device to finish the process.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('stepRow')
          .start('p').add(this.Step).end()
        .end()
        .start('p').addClass('instructionsRow').add(this.Instructions).end()
        .start('p').addClass('passwordLabel').add('012345').end()
    }
  ]
});

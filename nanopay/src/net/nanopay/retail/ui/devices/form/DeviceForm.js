
foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DeviceForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a device',

  requires: [
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'user',
    'deviceDAO'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code}),
  ],

  css:
    `
    ^ p {
      margin: 0;
      font-size: 12px;
      color: #093649;
      line-height: 1.33;
    }

    ^ .stepRow {
      margin-bottom: 40px;
    }

    ^ .instructionsRow {
      margin-bottom: 40px;
    }

    ^ input {
      width: 220px;
      height: 40px;
      box-sizing: border-box;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding-left: 15px;
      padding-right: 15px;
      outline: none;
      margin-top: 8px;
    }

    ^ .inputFieldLabel {
      margin-right: 20px;
      vertical-align: top;
      margin-bottom: 8px;
    }

    ^ .inputErrorLabel {
      display: inline-block;
      color: red !important;
      vertical-align: top;
    }
  `,

  methods: [
    function init() {
      this.title = 'Add a Device';
      // this.isCustomNavigation = true;
      this.views = [
        { parent: 'addDevice', id: 'form-addDevice-name',     label: 'Name',      view: { class: 'net.nanopay.retail.ui.devices.form.DeviceNameForm' } },
        { parent: 'addDevice', id: 'form-addDevice-type',     label: 'Type',      view: { class: 'net.nanopay.retail.ui.devices.form.DeviceTypeForm' } },
        { parent: 'addDevice', id: 'form-addDevice-serial',   label: 'Serial #',  view: { class: 'net.nanopay.retail.ui.devices.form.DeviceSerialForm' } },
        { parent: 'addDevice', id: 'form-addDevice-password', label: 'Password',  view: { class: 'net.nanopay.retail.ui.devices.form.DevicePasswordForm' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      code: function(X) {
        if ( this.position === 0 ) {
          X.stack.push({ class: 'net.nanopay.retail.ui.devices.DevicesView' });
        } else {
          this.subStack.back();
        }
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      code: function(X) {
        var self = this;

        // Info from form
        var deviceInfo = this.viewData;

        if ( this.position == 0 ) {
          // Device Name

          if ( ( deviceInfo.deviceName == null || deviceInfo.deviceName.trim() == '' ) ) {
            self.add(self.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
            return;
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 1 ) {
          // Device Type

          if ( ! deviceInfo.selectedOption ) {
            self.add(self.NotificationMessage.create({ message: 'Please select a device type before proceeding.', type: 'error' }));
            return;
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 2 ) { 
          // Device Serial Number

          if ( ! /^[a-zA-Z0-9]{16}$/.exec(deviceInfo.serialNumber) ) {
            self.add(self.NotificationMessage.create({ message: 'Please enter a valid serial number before proceeding.', type: 'error' }));
            return;
          }

          this.viewData.password = Math.floor(Math.random() * (999999 - 100000)) + 100000;
          this.subStack.push(this.views[this.subStack.pos + 1].view);
          this.complete = true;
          return;
        }

        if ( this.subStack.pos == this.views.length - 1 ) { // If last page
          var deviceInfo = this.viewData;
          var newDevice = this.Device.create({
            name: deviceInfo.deviceName,
            type: deviceInfo.selectedOption - 1,
            status: this.DeviceStatus.PENDING,
            serialNumber: deviceInfo.serialNumber,
            password: deviceInfo.password,
            owner: this.user.id
          });

          this.deviceDAO.put(newDevice).then(function (result) {
            X.stack.push({ class: 'net.nanopay.retail.ui.devices.DevicesView' });
          }).catch(function (err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });

          return;
        }

      }
    }
  ]
});

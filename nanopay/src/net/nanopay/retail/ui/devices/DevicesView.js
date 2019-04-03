foam.CLASS({
  package: 'net.nanopay.retail.ui.devices',
  name: 'DevicesView',
  extends: 'foam.u2.Controller',

  documentation: 'View displaying list of Devices provisioned.',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'user',
    'deviceDAO'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'net.nanopay.retail.model.DeviceStatus',
    'net.nanopay.retail.model.Device'
  ],

  css: `
    ^{
      width: 962px;
      margin: 0 auto;
    }
    ^ .devicesRow {
      width: 100%;
    }
    ^ .devicesContainer {
      width: 992px;
      margin: auto;
    }
    ^ .deviceContentCard {
      width: 358px;
      height: 100px;
      margin-right: 13.5px;
      float: left;
    }
    ^ .actionButton {
      width: 218px;
      height: 100px;
      float: right;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-create {
      visibility: hidden;
    }
    ^ .net-nanopay-ui-ActionView-addDevice {
      margin: 0;
      background: none;
      outline: none;
      border: none;
      width: 218px;
      height: 100px;
      float: right;
      background-color: %SECONDARYCOLOR%;
      letter-spacing: 0.3px;
      color: #FFFFFF;
      border-radius: 2px;
      opacity: 1;
      font-weight: normal;
    }
    ^ .net-nanopay-ui-ActionView-addDevice span {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
    }
    ^ .net-nanopay-ui-ActionView-addDevice:hover {
      background: none;
      cursor: pointer;
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .foam-u2-dialog-Popup-inner {
      background-color: transparent !important;
    }
    ^ .foam-u2-view-TableView-row:hover {
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  messages: [
    { name: 'TitleAll',        message: 'All Device(s)' },
    { name: 'TitleActive',     message: 'Active Device(s)' },
    { name: 'TitleDisabled',   message: 'Disabled Device(s)' },
    { name: 'ActionAdd',       message: 'Add a new device' },
    { name: 'placeholderText', message: 'You don\'t have any devices right now. Click Add a new device to add a device.' }
  ],

  properties: [
    'allDevicesCount',
    'activeDevicesCount',
    'disabledDevicesCount',
    {
      name: 'data',
      factory: function () {
        return this.deviceDAO.where(this.EQ(this.Device.OWNER, this.user.id));
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.data.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
          .start('div').addClass('row')
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleAll, content$: this.allDevicesCount$ }).addClass('deviceContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleActive, content$: this.activeDevicesCount$ }).addClass('deviceContentCard')
            .end()
            // .start('div').addClass('spacer')
            //   .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleDisabled, content$: this.disabledDevicesCount$ }).addClass('deviceContentCard')
            // .end()
            .start('div')
              .tag(this.ADD_DEVICE)
            .end()
          .end()
          .start()
            .tag({
              class: 'foam.u2.ListCreateController',
              dao: this.data,
              factory: function() { return self.Device.create(); },
              detailView: {
                class: 'foam.u2.DetailView',
                properties: [
                  this.Device.NAME,
                  this.Device.STATUS,
                  this.Device.SERIAL_NUMBER,
                  this.Device.PASSWORD
                ]
              },
              summaryView: this.DeviceTableView.create()
            })
          .end()
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.data, message: this.placeholderText, image: 'images/ic-deviceempty.svg' });
    }
  ],

  actions: [
    {
      name: 'addDevice',
      label: 'ADD A NEW ACCOUNT',
      icon: 'images/ic-plus.svg',
      code: function(X) {
        // X.stack.push({class: 'net.nanopay.retail.ui.devices.form.DeviceForm'});
        this.add(this.Popup.create().tag({
          class: 'net.nanopay.account.ui.addAccountModal.AddAccountModalWizard',
        }));
      }
    }
  ],

  classes: [
    {
      name: 'DeviceTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.retail.model.Device',
        'foam.u2.dialog.Popup'
      ],

      imports: [
        'user',
        'deviceDAO'
      ],

      exports: [
        'selectedDevice'
      ],

      properties: [
        {
          name: 'selectedDevice',
          value: null
        },
        {
          name: 'selection',
          preSet: function(oldValue, newValue) {
            if ( newValue ) {
              this.selectedDevice = newValue;
              this.manageDevice();
              return oldValue;
            }
          }
        },
        {
          name: 'data',
          factory: function () {
            return this.deviceDAO.where(this.EQ(this.Device.OWNER, this.user.id));
          }
        }
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              selection$: this.selection$,
              data: this.data,
              columns: [
                'name', 'status', 'serialNumber', 'password'
              ]
            }).addClass(this.myClass('table')).end();
        },

        function manageDevice() {
          this.add(this.Popup.create().tag({ class: 'net.nanopay.retail.ui.devices.ManageDeviceModal' }));
        }
      ]
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function () {
        var self = this;
        this.data.select(this.COUNT()).then(function (count) {
          self.allDevicesCount = count.value;
        });

        this.data.where(this.EQ(this.Device.STATUS, this.DeviceStatus.ACTIVE)).select(this.COUNT()).then(function (count) {
          self.activeDevicesCount = count.value;
        });

        this.data.where(this.EQ(this.Device.STATUS, this.DeviceStatus.DISABLED)).select(this.COUNT()).then(function (count) {
          self.disabledDevicesCount = count.value;
        });
      }
    }
  ]
});

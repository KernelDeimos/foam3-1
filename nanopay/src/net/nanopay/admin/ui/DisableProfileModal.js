foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'DisableProfileModal',
  extends: 'foam.u2.Controller',

  documentation: 'Disable profile modal',

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.ui.modal.ModalHeader',
  ],

  imports: [
    'activatePopUp',
    'approvePopUp',
    'closeDialog',
    'editProfilePopUp',
    'userDAO'
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }
    ^ .content {
      padding: 20px;
      margin-top: -20px;
    }
    ^ .description {
      font-size: 12px;
      text-align: center;
      margin-bottom: 60px;
    }
    ^ .net-nanopay-ui-ActionView {
      height: 40px;
      border-radius: 2px;
      overflow: hidden;
      zoom: 1;
    }
    ^ .net-nanopay-ui-ActionView-disable {
      background-color: #59a5d5;
      color: white;
      display: inline-block;
      float:right;
    }
    ^ .net-nanopay-ui-ActionView-disable:hover,
    ^ .net-nanopay-ui-ActionView-disable:focus {
      background-color: #357eac;
    }
  `,

  properties: [
    'data',
    ['title', 'Disable Profile']
  ],

  messages: [
    { name: 'Description', message: 'Are you sure you want to disable this profile?' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      if (this.activatePopUp) this.activatePopUp.remove();
      if (this.editProfilePopUp) this.editProfilePopUp.remove();
      if (this.approvePopUp) this.approvePopUp.remove();
      
      this
        .addClass(this.myClass())
        .tag(this.ModalHeader.create({ title: this.title }))
        .start('div').addClass('content')
          .start('p').addClass('description').add(this.Description).end()
          .start()
            .start(this.CANCEL).end()
            .start(this.DISABLE).end()
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function (X) {
        X.closeDialog();
      }
    },
    {
      name: 'disable',
      code: function (X) {
        var self = this;
        var toDisable = this.data;
        toDisable.status = this.AccountStatus.DISABLED;

        this.userDAO.put(toDisable)
        .then(function (result) {
          if ( ! result ) throw new Error('Unable to disable profile');
          X.closeDialog();
          self.data.copyFrom(result);
          self.add(self.NotificationMessage.create({ message: 'Profile successfully disabled.' }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: 'Unable to disable profile.', type: 'error' }));
        });
      }
    }
  ]
});
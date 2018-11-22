foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'InviteContactModal',
  extends: 'foam.u2.Controller',

  documentation: 'A modal that lets a user invite a contact to the platform.',

  imports: [
    'ctrl',
    'invitationDAO',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Invitation'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^ h2 {
      margin-top: 0;
    }
    ^main {
      padding: 24px;
    }
    ^buttons {
      background: #fafafa;
      height: 84px;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    ^ .net-nanopay-ui-ActionView-cancel {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
    ^ .net-nanopay-ui-ActionView-cancel:hover {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'Invite to Ablii'
    },
    {
      name: 'CHECKBOX_LABEL',
      message: 'I have this contacts permission to invite them to Ablii'
    },
    {
      name: 'INVITE_SUCCESS',
      message: 'Invitation sent!'
    },
    {
      name: 'INVITE_FAILURE',
      message: 'There was a problem sending the invitation.'
    }
  ],


  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'data',
      factory: function() {
        return this.Contact.create();
      }
    },
    {
      class: 'String',
      name: 'message',
      documentation: `A message a user can include in the invitation email.`,
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 60 },
    },
    {
      class: 'Boolean',
      name: 'permission'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('main'))
          .start('h2')
            .add(this.TITLE)
          .end()
          .start()
            .addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .add('Email')
            .end()
            .startContext({ data: this.data })
              .start(this.data.EMAIL)
                .addClass('input-field')
              .end()
            .endContext()
          .end()
          .start()
            .addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .add('Message')
            .end()
            .start(this.MESSAGE)
              .addClass('input-field')
            .end()
          .end()
          .start()
            .addClass('input-wrapper')
            .tag(this.PERMISSION, { label: this.CHECKBOX_LABEL })
          .end()
        .end()
        .start()
          .addClass(this.myClass('buttons'))
          .add(this.CANCEL)
          .add(this.SEND)
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'send',
      isEnabled: function(permission) {
        return permission;
      },
      code: function(X) {
        /** Send the invitation. */
        var invite = this.Invitation.create({
          email: this.data.email,
          createdBy: this.user.id,
          message: this.message
        });
        this.invitationDAO
          .put(invite)
          .then(() => {
            this.ctrl.add(this.NotificationMessage.create({
              message: this.INVITE_SUCCESS,
            }));
            X.closeDialog();
            this.user.contacts.on.reset.pub(); // Force the view to update.
          })
          .catch(() => {
            this.ctrl.add(this.NotificationMessage.create({
              message: this.INVITE_FAILURE,
              type: 'error'
            }));
          });
      }
    }
  ]
});

/**
 * Modal to invite partners to the nanopay platform.
 */
foam.CLASS({
  package: 'net.nanopay.partners.ui.modal',
  name: 'PartnerInviteModal',
  extends: 'foam.u2.Controller',

  documentation: 'Modal to invite partners to the platform',

  imports: [
    'invitationDAO',
    'user',
    'validateEmail'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.tag.TextArea',
    'net.nanopay.model.Invitation',
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  properties: [
    'companyName',
    'contactName',
    'emailAddress',
    {
      name: 'message',
      view: 'foam.u2.tag.TextArea',
      value: ''
    }
  ],

  css: `
    ^ {
      border-radius: 2px;
      width: 448px;
      margin: auto;
      font-family: Roboto;
    }
    ^ .label {
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: %BLACK%;
      margin-left: 0; /* Override */
    }
    ^ .one-col {
      margin: 20px;
    }
    ^ .two-col {
      display: flex;
      margin: 20px;
    }
    ^ .two-col > div {
      flex-grow: 1;
    }
    ^ .two-col > div:last-child {
      margin-left: 20px;
    }
    ^ input {
      width: 100%;
      height: 40px;
    }
    ^ .blue-button {
      margin: 20px 0; /* Override */
    }
    ^ textarea {
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 10px;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2;
      text-align: left;
      color: %BLACK%;
      width: 100%;
      white-space: normal !important; /* Override */
    }
  `,

  methods: [
    function initE() {
      this.message = this.user.firstName + ' from nanopay invites you to try ' +
          'out B2B payment platform. Instant transfers and secure ' +
          'transactions. Try it out now!';
      this.SUPER();
      this
        .tag(this.ModalHeader.create({ title: this.ModalTitle }))
        .addClass(this.myClass())
          .start().addClass('one-col')
            .start().add(this.EMAIL_ADDRESS.label).addClass('label').end()
            .start(this.EMAIL_ADDRESS).end()
          .end()
          .start().addClass('one-col')
            .start().add(this.MESSAGE.label).addClass('label').end()
            .start(this.MESSAGE).attr('wrap', 'hard').end()
          .end()
          .start().addClass('one-col')
            .start(this.SEND_NEW_INVITE)
              .addClass('blue-button')
              .addClass('btn')
            .end()
          .end()
        .end();
    }
  ],

  messages: [
    {
      name: 'InviteSendSuccess',
      message: 'Invitation sent!'
    },
    {
      name: 'InviteSendError',
      message: 'There was a problem sending the invitation.'
    },
    {
      name: 'ModalTitle',
      message: 'New Invite'
    }
  ],

  actions: [
    {
      name: 'sendNewInvite',
      label: 'Send',
      help: 'Invite someone to the nanopay platform',
      code: function(X) {
        var self = this;
        if ( ! this.validateEmail(this.emailAddress) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid Email Address.', type: 'error' }));
          return;
        }
        var invite = this.Invitation.create({
          email: this.emailAddress,
          message: this.message,
          createdBy: this.user.id
        });

        // See SendInvitationDAO.java
        this.invitationDAO.put(invite).then(function(a) {
          X.ctrl.add(self.NotificationMessage.create({
            message: self.InviteSendSuccess,
          }));
          X.closeDialog();
        }).catch(function(err) {
          X.ctrl.add(self.NotificationMessage.create({
            message: err.message,
            type: 'error',
          }));
        });
      }
    }
  ]
});

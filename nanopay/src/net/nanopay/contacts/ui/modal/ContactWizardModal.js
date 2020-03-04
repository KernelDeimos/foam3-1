foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Wizard for adding a Contact in Ablii',

  requires: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Invitation'
  ],

  imports: [
    'ctrl',
    'invitationDAO',
    'user'
  ],

  exports: [
    'addContact',
    'bankAdded',
    'isConnecting',
    'isEdit',
    'sendInvite',
  ],

  css: `
    ^ {
      width: 540px;
      box-sizing: border-box;
    }
    ^ .foam-u2-tag-Input,
    ^ .foam-u2-TextField {
      width: 100%;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    /* Styles for contact sub wizard views */
    ^ .container {
      padding: 24px;
    }
    ^ .title-block {
      display: flex;
      justify-content: space-between;
    }
    ^ .contact-title {
      font-size: 24px !important;
      line-height: 1.5;
      font-weight: 900 !important;
      display: inline-block;
    }
    ^ .step-indicator {
      margin-top: 8px;
    }
    ^ .instruction {
      color: #8e9090;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      margin-top: 8px;
    }
    ^ .divider {
      background-color: #e2e2e3;
      height: 1px;
      margin: 24px 0;
      width: 100%;
    }
    ^ .field-label {
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    ^ .two-column {
      display: grid;
      grid-gap: 16px;
      grid-template-columns: 1fr 1fr;
    }
    ^ .button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back {
      color: #604aff;
      padding: 0;
      margin: 32px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back:hover {
      color: #4d38e1;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-next {
      min-width: 104px;
    }
`,

  messages: [
    { name: 'CONTACT_ADDED', message: 'Personal contact added.' },
    { name: 'CONTACT_UPDATED', message: 'Personal contact updated.' },
    { name: 'INVITE_SUCCESS', message: 'Sent a request to connect.' },
    { name: 'CONTACT_ADDED_INVITE_SUCCESS', message: 'Personal contact added.  An email invitation was sent.' },
    { name: 'INVITE_FAILURE', message: 'There was a problem sending the invitation.' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'data',
      factory: function() {
        return this.Contact.create({
          type: 'Contact',
          group: 'sme'
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `
        The user is editing an existing contact, not creating a new one.
      `,
      factory: function() {
        return this.data.id;
      }
    },
    {
      class: 'Boolean',
      name: 'isConnecting',
      documentation: 'True while waiting for a DAO method call to complete.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'confirmRelationship',
      view: {
        class: 'foam.u2.CheckBox',
        showLabel: false
      }
    },
    {
      class: 'Boolean',
      name: 'shouldInvite',
      label: 'Invite this contact to join Ablii',
      documentation: `
        True if the user wants to invite the contact to join Ablii.
      `,
      view: {
        class: 'foam.u2.CheckBox',
      }
    },
    {
      class: 'FObjectProperty',
      name: 'bankAccount',
      factory: function() {
        var account = this.BankAccount.create();
        return account;
      }
    },
    {
      class: 'Boolean',
      name: 'bankAdded',
      value: false
    }
  ],

  methods: [
    function init() {
      this.viewData.isBankingProvided = false;
      if ( this.data.id ) {
        if ( this.data.bankAccount ) {
          this.viewData.isBankingProvided = true;
        }
        this.startAt = 'AddContactStepOne';
      }
      this.views = {
        'AddContactMenu': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactMenu' },
          startPoint: true
        },
        'SearchBusiness': {
          view: { class: 'net.nanopay.contacts.ui.modal.SearchBusinessView' }
        },
        'AddContactByPaymentCode': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactByPaymentCode' }
        },
        'AddContactConfirmation': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactConfirmation' }
        },
        'AddContactStepOne': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepOne' }
        },
        'AddContactStepTwo': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepTwo' }
        },
        'AddContactStepThree': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepThree' }
        },
        'InviteContact': {
          view: { class: 'net.nanopay.contacts.ui.modal.InviteContactModal' }
        }
      };
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    /** Add the contact to the user's contacts. */
    async function addContact() {
      this.isConnecting = true;

      try {
        this.data = await this.user.contacts.put(this.data);
        if ( this.isEdit ) {
          this.ctrl.notify(this.CONTACT_UPDATED);
        } else {
          if ( this.shouldInvite ) {
            try {
              await this.sendInvite(false);
              this.ctrl.notify(this.CONTACT_ADDED_INVITE_SUCCESS);
            } catch (err) {
              var msg = err.message || this.GENERIC_PUT_FAILED;
              this.ctrl.notify(msg, 'error');
            }
          } else {
            this.ctrl.notify(this.CONTACT_ADDED);
          }
        }
      } catch (e) {
        var msg = e.message || this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, 'error');
        this.isConnecting = false;
        return false;
      }

      this.isConnecting = false;
      return true;
    },

    /** Send the Contact an email inviting them to join Ablii. */
    async function sendInvite(showToastMsg) {
      var invite = this.Invitation.create({
        email: this.data.email,
        createdBy: this.user.id,
        inviteeId: this.data.id,
        message: ''
      });

      try {
        this.invitationDAO.put(invite);
        if ( showToastMsg ) {
          this.ctrl.notify(this.INVITE_SUCCESS);
        }
        // Force the view to update.
        this.user.contacts.cmd(foam.dao.AbstractDAO.RESET_CMD);
      } catch (e) {
        var msg = e.message || this.INVITE_FAILURE;
        this.ctrl.notify(msg, 'error');
        return false;
      }

      return true;
    }
  ]
});

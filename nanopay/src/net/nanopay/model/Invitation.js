foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Invitation',

  documentation: `
    Objects will determine whether an invitation to the platform or a connection request will be sent.
    Used as a property model in InvitationWizardView for contact invitation.
  `,

  tableColumns: [
    'id',
    'invitee',
    'inviter',
    'timestamp',
  ],

  sections: [
    {
      name: 'invitation',
      title: 'Invite a contact'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50,
      visibility: 'HIDDEN'
    },
    {
      class: 'Long',
      name: 'inviteeId',
      documentation: 'Id of invitee if currently a user',
      visibility: 'HIDDEN'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'invitee',
      visibility: 'HIDDEN',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'inviter',
      visibility: 'HIDDEN',
      storageTransient: true
    },
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Business name of the invitee.',
      section: 'invitation',
      visibility: function(isContact) {
        return isContact ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      },
      view: { class: 'foam.u2.tag.Input', placeholder: 'ex. Vandelay Industries' },
      validateObj: function(businessName) {
        if (
          typeof businessName !== 'string' ||
          businessName.trim().length === 0
        ) {
          return 'Business name required';
        }
      },
    },
    {
      class: 'EMail',
      name: 'email',
      documentation: 'Email address of the invitee.',
      section: 'invitation',
      visibility: function(isContact) {
        return isContact ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      },
      view: { class: 'foam.u2.tag.Input', placeholder: 'ex. example@domain.com' },
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ( ! emailRegex.test(email) ) {
          return 'Invalid email address.';
        }
      }
    },
    {
      class: 'String',
      name: 'message',
      documentation: 'Custom message for invitee.',
      section: 'invitation',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 60, placeholder: 'Add a message to the invitation' },
    },
    {
      class: 'Boolean',
      name: 'invitePermission',
      documentation: 'True if user confirms invitation permission.',
      section: 'invitation',
      view: { class: 'foam.u2.CheckBox', label: `I have this contact's permission to invite them to Ablii` },
      validateObj: function(invitePermission) {
        if ( ! invitePermission ) {
          return 'Permission required.';
        }
      }
    },
    {
      class: 'Long',
      name: 'createdBy',
      documentation: 'Id of user sending the invite/request',
      visibility: 'HIDDEN'
    },
    {
      class: 'DateTime',
      name: 'timestamp',
      label: 'Date',
      documentation: 'Timestamp of when invitation was sent',
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'internal',
      documentation: 'True if the invited user already existed, false ' +
          'otherwise',
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'isContact',
      documentation: `True if the invited user is a Contact.`,
      visibility: 'HIDDEN'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.model.InvitationStatus',
      name: 'status',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'group',
      documentation: `
        Used in Ablii when inviting someone who is not on the platform to join a
        Business.
      `,
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'Ablii signing officer\'s firstName',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'Ablii signing officer\'s lastName',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'jobTitle',
      documentation: 'Ablii signing officer\'s jobTitle',
      visibility: 'HIDDEN'
    },
    {
      class: 'PhoneNumber',
      name: 'phoneNumber',
      documentation: 'Ablii signing officer\'s phoneNumber',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'tokenData',
      documentation: 'The token associated to the sent invitation',
      visibility: 'HIDDEN'
    },
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return `${this.email}`;
      },
      javaCode: `
        return  this.getEmail();
      `
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.model',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',

  documentation: `A version of the FOAM User base model customized for
    the nanopay platform and business.
  `,

  implements: [
    'foam.nanos.auth.DeletedAware', // TODO: need to properly deprecate DeletedAware
    'foam.core.Validatable',
    'net.nanopay.liquidity.approvalRequest.ApprovableAware'
  ],

  javaImports: [
    'foam.mlang.MLang',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.NOT',

    'java.util.regex.Pattern',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.AddressException',
    'net.nanopay.contacts.Contact'
  ],

  requires: [
    'net.nanopay.onboarding.model.Questionnaire',
    'net.nanopay.model.PersonalIdentification'
  ],

  constants: [
    {
      name: 'NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    }
  ],

  tableColumns: [
    'id',
    'type',
    'group',
    'legalName',
    'organization',
    'email',
  ],

  searchColumns: [
    'id',
    'type',
    'spid',
    'group',
    'enabled',
    'firstName',
    'lastName',
    'organization',
    'email',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'invited',
      value: false,
      documentation: `Determines whether the User was invited to the platform by
        an invitation email.`,
      section: 'administrative'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'invitedBy',
      documentation: 'The ID of the person who invited the User to the platform.',
      section: 'administrative'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'previousStatus',
      documentation: `Tracks the previous status of the User.`,
      section: 'administrative'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Determines whether the User is permitted certain actions.',
      javaGetter: `
        return net.nanopay.admin.model.AccountStatus.DISABLED != getStatus();
      `,
      // NOTE: '_enabled_ is deprecated; use _status_ instead.',
      hidden: true,
      section: 'administrative'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'status',
      documentation: `Tracks the type of status of the User.`,
      tableCellFormatter: function(status) {
        var bgColour = '#a4b3b8';
        var borderColour = '#a4b3b8';
        var textColour = '#ffffff';
        if ( status.label == 'Submitted' ) {
          bgColour = 'transparent';
          borderColour = '#2cab70';
          textColour = '#2cab70';
        } else if ( status.label == 'Active' ) {
          bgColour = '#2cab70';
          borderColour = '#2cab70';
          textColour = '#ffffff';
        }
        if ( status.label != '' ) {
          this.start()
            .add(status.label)
            .style({
              'color': textColour,
              'border': '1px solid ' + borderColour,
              'border-radius': '100px',
              'background': bgColour,
              'padding': '3px 10px 3px 10px',
              'display': 'inline-block'
            })
          .end();
        }
      },
      section: 'administrative'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.onboarding.model.Questionnaire',
      name: 'questionnaire',
      documentation: `Returns the response from the User to a questionnaire from the
        Questionnaire model.`,
      section: 'administrative'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'A stored copy of additional documents for compliance verification.',
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.data.additionalDocuments$
        };
      },
      createMode: 'HIDDEN',
      section: 'business'
    },
    {
      class: 'String',
      name: 'jobTitle',
      label: 'Job Title',
      documentation: 'The job title of the individual person, or real user.',
      validateObj: function(jobTitle) {
        if ( ! jobTitle.trim() ) {
          return 'Job title required.';
        }
      },
      section: 'business'
    },
    {
      class: 'Boolean',
      name: 'welcomeEmailSent',
      documentation: 'Determines whether a welcome email has been sent to the User.',
      value: false,
      section: 'administrative'
    },
    {
      class: 'Boolean',
      name: 'portalAdminCreated',
      documentation: 'Determines whether a User was created by an admin user.',
      section: 'administrative',
      value: false,
    },
    {
      class: 'Boolean',
      name: 'createdPwd',
      value: false,
      documentation: `Determines whether the User is using its own unique password or one
        that was system-generated.`,
      section: 'administrative'
    },
    {
      class: 'Int',
      name: 'inviteAttempts',
      value: 0,
      documentation: 'Defines the number of attempts to invite the user.',
      section: 'administrative'
    },
    {
      class: 'String',
      name: 'operatingBusinessName',
      documentation: `The business name displayed to the public. This may differ
        from the organization name.`,
          // Is displayed on client if present taking place of organziation name.
      createMode: 'HIDDEN',
      section: 'business'
    },
    {
      class: 'Boolean',
      name: 'thirdParty',
      documentation: `Determines whether the User is taking instructions from and/or acting
        on behalf of a 3rd party.
      `,
      createMode: 'HIDDEN',
      section: 'business'
    },
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      documentation: `A placeholder for the photo identification image, such as a
        passport, of the individual person, or real user.
      `,
      createMode: 'HIDDEN',
      factory: function() {
        return this.PersonalIdentification.create();
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' },
      section: 'personal'
    },
    {
      class: 'Boolean',
      name: 'PEPHIORelated',
      documentation: `Determines whether the user is a domestic or foreign _Politically
        Exposed Person (PEP), Head of an International Organization (HIO)_, or
        related to any such person.
      `,
      createMode: 'HIDDEN',
      section: 'business'
    },
    {
      class: 'String',
      name: 'signUpToken',
      storageTransient: true,
      documentation: `This is set to a random Universal Unique Identifier (UUID) that
        lets the User register with the platform from an email link. A sign up token
        is embedded in the email link.  This token includes a property that allows the
        backend to verify the email of the User and associate the User with the Contact
        that was created when inviting the User.
      `,
      section: 'administrative'
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Determines whether the User is deleted.',
      value: false,
      writePermissionRequired: true,
      visibility: 'RO',
      tableWidth: 85,
      section: 'administrative'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      documentation: `The profile picture of the individual user, initially
        defaulting to a placeholder picture.`,
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/ic-placeholder.png'
      },
      createMode: 'HIDDEN',
      section: 'personal'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: foam.nanos.auth.LifecycleState.ACTIVE,
      visibility: foam.u2.Visibility.HIDDEN
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: foam.u2.Visibility.HIDDEN
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.label();
      },
      javaCode: `
        return label();
      `
    },
    {
      name: 'getApprovableKey',
      type: 'String',
      javaCode: `
        String id = ((Long) getId()).toString();
        return id;
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
        String containsDigitRegex = ".*\\\\d.*";
        boolean isValidEmail = true;

        String firstName = this.getFirstName().trim();
        String lastName = this.getLastName().trim();
        String email = this.getEmail().trim();

        try {
          InternetAddress emailAddr = new InternetAddress(email);
          emailAddr.validate();
        } catch (AddressException ex) {
          isValidEmail = false;
        }

        if ( firstName.length() > NAME_MAX_LENGTH ) {
          throw new IllegalStateException("First name cannot exceed 70 characters.");
        } else if ( Pattern.matches(containsDigitRegex, firstName) ) {
          throw new IllegalStateException("First name cannot contain numbers.");
        } else if ( lastName.length() > NAME_MAX_LENGTH ) {
          throw new IllegalStateException("Last name cannot exceed 70 characters.");
        } else if ( Pattern.matches(containsDigitRegex, lastName) ) {
          throw new IllegalStateException("Last name cannot contain numbers.");
        } else  if ( SafetyUtil.isEmpty(email) ) {
          throw new IllegalStateException("Email is required.");
        } else if ( SafetyUtil.isEmpty(firstName) ) {
          throw new IllegalStateException("First name is required.");
        } else if ( SafetyUtil.isEmpty(lastName) ) {
          throw new IllegalStateException("Last name is required.");
        } else if ( ! isValidEmail ) {
          throw new IllegalStateException("Invalid email address.");
        }

        // Run the validation logic generated by validationPredicates.
        super.validate(x);
      `
    }
  ],

  actions: [
    {
      name: 'viewAccounts',
      label: 'View Accounts',
      tableWidth: 135,
      availablePermissions: ['foam.nanos.auth.User.permission.viewAccounts'],
      code: function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.businessName}'s Accounts`,
          data: X.accountDAO.where(m.EQ(net.nanopay.account.Account.OWNER, this.id))
        });
      }
    },
    {
      name: 'viewTransactions',
      label: 'View Transactions',
      tableWidth: 160,
      availablePermissions: ['foam.nanos.auth.User.permission.viewTransactions'],
      code: async function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        var ids = await X.accountDAO
          .where(m.EQ(net.nanopay.account.Account.OWNER, this.id))
          .select(m.MAP(net.nanopay.account.Account.ID))
          .then((sink) => sink.delegate.array);
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.label()}'s Transactions`,
          data: X.transactionDAO.where(
            m.OR(
              m.IN(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, ids),
              m.IN(net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, ids)
            )
          )
        });
      }
    },
    {
      name: 'viewPayables',
      label: 'View Payables',
      availablePermissions: ['foam.nanos.auth.User.permission.viewPayables'],
      code: async function(X) {
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.label()}'s Payables`,
          data: this.expenses
        });
      }
    },
    {
      name: 'viewReceivables',
      label: 'View Receivables',
      availablePermissions: ['foam.nanos.auth.User.permission.viewReceivables'],
      code: async function(X) {
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.label()}'s Receivables`,
          data: this.sales
        });
      }
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public User findUser(X x, long userId) {
              DAO bareUserDAO = (DAO) x.get("bareUserDAO");
              DAO contactDAO = (DAO) x.get("contactDAO");
              DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
              User user = null;
              Contact contact = null;
              try{
                contact = (Contact) contactDAO.find(userId);
                if ( contact != null && contact.getBusinessId() == 0 ) {
                  user = (User) bareUserDAO.find(AND(
                    EQ(User.EMAIL, contact.getEmail()),
                    NOT(INSTANCE_OF(Contact.class)),
                    EQ(User.DELETED, false)));
                  if ( user == null ) { // when a real user is not present the the transaction is to an external user.
                    user = contact;
                  }
                } else if ( contact != null && contact.getBusinessId() > 0 ){
                  user = (User) localBusinessDAO.find(contact.getBusinessId());
                } else {
                  user = (User) bareUserDAO.find(userId);
                }
              } catch(Exception e) {
                e.printStackTrace();
              }
              return user;
            }
        `);
      }
    }
  ]
});

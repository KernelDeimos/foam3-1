foam.CLASS({
  package: 'net.nanopay.model',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',

  documentation: `A version of the FOAM User base model customized for
    the nanopay platform and business.
  `,

  implements: [
    'foam.nanos.auth.DeletedAware',
    'foam.core.Validatable'
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

  imports: [
    'complianceHistoryDAO'
  ],

  requires: [
    'net.nanopay.onboarding.model.Questionnaire'
  ],

  constants: [
    {
      name: 'NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    }
  ],

  properties: [
    // TODO: Remove this after migration.
    {
      class: 'Int',
      name: 'ownershipPercent',
      documentation: `Defines the percentage of ownership if the user is a principal
        owner.`
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessTypeDAO',
      name: 'businessTypeId',
      of: 'net.nanopay.model.BusinessType',
      documentation: 'The ID of the proprietary details of the business.',
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessSectorDAO',
      name: 'businessSectorId',
      of: 'net.nanopay.model.BusinessSector',
      documentation: 'The ID of the general economic grouping for the business.',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.sme.onboarding.ui.BusinessSectorSelectionView' },
          rowView: { class: 'net.nanopay.sme.onboarding.ui.BusinessSectorCitationView' },
          sections: [
            {
              heading: 'Industries',
              dao: X.businessSectorDAO
            }
          ],
          search: true
        };
      }
    },
    {
      class: 'Boolean',
      name: 'invited',
      value: false,
      documentation: `Determines whether the User was invited to the platform by
        an invitation email.`
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'invitedBy',
      documentation: 'The ID of the person who invited the User to the platform.'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'previousStatus',
      documentation: `Tracks the previous status of the User.`
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Determines whether the User is permitted certain actions.',
      javaGetter: `
        return net.nanopay.admin.model.AccountStatus.DISABLED != getStatus();
      `,
      // NOTE: '_enabled_ is deprecated; use _status_ instead.',
      hidden: true
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
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.onboarding.model.Questionnaire',
      name: 'questionnaire',
      documentation: `Returns the response from the User to a questionnaire from the
        Questionnaire model.`
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
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.User',
      name: 'principalOwners',
      documentation: 'Represents the people who own the majority shares in a business.'
    },
    {
      class: 'String',
      name: 'jobTitle',
      label: 'Job Title',
      documentation: 'The job title of the individual person, or real user.'
    },
    {
      class: 'Boolean',
      name: 'welcomeEmailSent',
      documentation: 'Determines whether a welcome email has been sent to the User.',
      value: false,
    },
    {
      class: 'Boolean',
      name: 'portalAdminCreated',
      documentation: 'Determines whether a User was created by an admin user.',
      value: false,
    },
    // NOTE: The following is subject to change and is not finalized.
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'businessPhone',
      documentation: 'The phone number of the business.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    },
    {
      class: 'String',
      name: 'businessIdentificationNumber',
      transient: true,
      documentation: `The Business Identification Number (BIN) that identifies your business
        to federal, provincial or municipal governments and is used by the business
        for tax purposes. This number is typically issued by an Issuing Authority such as
        the CRA.`,
      getter: function() {
        return this.businessRegistrationNumber;
      },
      setter: function(x) {
        this.businessRegistrationNumber = x;
      },
      javaGetter: `return getBusinessRegistrationNumber();`,
      javaSetter: `setBusinessRegistrationNumber(val);`
    },
    {
      class: 'String',
      name: 'businessRegistrationNumber',
      width: 35,
      documentation: `The Business Identification Number (BIN) that identifies your business
        to federal, provincial or municipal governments and is used by the business
        for tax purposes. This number is typically issued by an Issuing Authority such as
        the CRA.`,

      validateObj: function(businessRegistrationNumber) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( businessRegistrationNumber.length > 0 &&
              ! re.test(businessRegistrationNumber) ) {
          return 'Invalid registration number.';
        }
      }
    },
    {
      class: 'String',
      name: 'issuingAuthority',
      transient: true,
      documentation: 'An organization that has the power to issue an official document.',
      getter: function() {
        return this.businessRegistrationAuthority;
      },
      setter: function(x) {
        this.businessRegistrationAuthority = x;
      },
      javaGetter: `return getBusinessRegistrationAuthority();`,
      javaSetter: `setBusinessRegistrationAuthority(val);`
    },
    {
      class: 'String',
      name: 'businessRegistrationAuthority',
      documentation: `An organization that has the power to issue and process a
        business registration.`,
      width: 35,
      validateObj: function(businessRegistrationAuthority) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( businessRegistrationAuthority.length > 0 &&
            ! re.test(businessRegistrationAuthority) ) {
          return 'Invalid issuing authority.';
        }
      }
    },
    {
      class: 'Date',
      name: 'businessRegistrationDate',
      documentation: 'The date that the business was registered by their issuing authority.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      documentation: `Returns the postal address of the business associated with the
        User from the Address model.`,
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      documentation: `The profile picture of the business, such as a logo, initially
        defaulting to a placeholder picture.`,
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/business-placeholder.png'
      }
    },
    {
      class: 'Boolean',
      name: 'onboarded',
      documentation: `Determines whether completed business registration. This property
        dictates portal views after compliance and account approval.`,
      value: false,
      permissionRequired: true
    },
    {
      class: 'Boolean',
      name: 'createdPwd',
      value: false,
      documentation: `Determines whether the User is using its own unique password or one
        that was system-generated.`
    },
    {
      class: 'Int',
      name: 'inviteAttempts',
      value: 0,
      documentation: 'Defines the number of attempts to invite the user.',
    },
    {
      class: 'String',
      name: 'operatingBusinessName',
      documentation: `The business name displayed to the public. This may differ
        from the organization name.`,
          // Is displayed on client if present taking place of organziation name.

    },
    {
      class: 'Boolean',
      name: 'holdingCompany',
      documentation: `Determines whether a User is a holding company.  A holding company
        represent a corporate group which owns shares of multiple companies.`
    },
    {
      class: 'Boolean',
      name: 'thirdParty',
      documentation: `Determines whether the User is taking instructions from and/or acting
        on behalf of a 3rd party.
      `
    },
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      documentation: `A placeholder for the photo identification image, such as a
        passport, of the individual person, or real user.
      `
    },
    {
      class: 'Boolean',
      name: 'PEPHIORelated',
      documentation: `Determines whether the user is a domestic or foreign _Politically
        Exposed Person (PEP), Head of an International Organization (HIO)_, or
        related to any such person.
      `
    },
    // TODO: Remove
    {
      class: 'Boolean',
      name: 'signingOfficer',
      documentation: `Determines whether the user is the signing officer capable of
        acting as the business and providing additional information on behalf of
        the business.
      `
    },
    {
      class: 'FObjectProperty',
      name: 'suggestedUserTransactionInfo',
      of: 'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
      documentation: `Returns the expected transaction types, frequency, amount and
        currencies that the User anticipates making with the platform. This
        information is required for KYC purposes.  It is drawn from the
        suggestedUserTransactionInfo object.
        `
    },
    {
      class: 'String',
      name: 'targetCustomers',
      label: 'Who do you market your products and services to?',
      documentation: `The type of clients that the business markets its products and
        services.`
    },
    {
      class: 'String',
      name: 'sourceOfFunds',
      documentation: 'The entities that provide funding to the business.'
    },
    {
      class: 'String',
      name: 'taxIdentificationNumber',
      documentation: `The tax identification number associated with the business of
      the User.`
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
      `
    },
    {
      name: 'type',
      class: 'String',
      visibility: 'RO',
      storageTransient: true,
      documentation: `The type of the User.`,
      tableWidth: 75,
      getter: function() {
         return this.cls_.name;
      },
      javaGetter: `
    return getClass().getSimpleName();
      `
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Determines whether the User is deleted.',
      value: false,
      permissionRequired: true,
      visibility: 'RO',
      tableWidth: 85
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      documentation: `The profile picture of the individual user, initially
        defaulting to a placeholder picture.`,
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/ic-placeholder.png'
      }
    }
  ],

  methods: [
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
    },
    {
      name: 'viewComplianceHistory',
      label: 'View Compliance History',
      availablePermissions: ['service.compliancehistorydao'],
      code: async function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.label()}'s Compliance History`,
          data: this.complianceHistoryDAO.where(m.AND(
              m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_ID, this.id), 
              m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_DAO_KEY, 'localUserDAO')
          ))
        });
      }
    },
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
                    NOT(INSTANCE_OF(Contact.class))));
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

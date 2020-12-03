/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.model',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',

  documentation: `A version of the FOAM User base model customized for
    the nanopay platform and business.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.nanos.approval.ApprovableAware'
  ],

  imports: [
    'complianceHistoryDAO?'
  ],

  javaImports: [
    'foam.mlang.MLang',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.NOT',

    'java.util.List',
    'java.util.regex.Pattern',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.AddressException',
    'net.nanopay.contacts.Contact'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.model.PersonalIdentification',
    'net.nanopay.onboarding.model.Questionnaire'
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
    'group.id',
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

  messages: [
    { name: 'COMPLIANCE_HISTORY_MSG', message: 'Compliance History for' },
    { name: 'PAYABLES_MSG', message: 'Payables for' },
    { name: 'RECEIVABLES_MSG', message: 'Receivables for' },
    { name: 'FOR_MSG', message: 'for' },
    { name: 'TWO_FACTOR_SUCCESS', message: 'Two factor authentication successfully disabled' },
    { name: 'TWO_FACTOR_INFO', message: 'Two factor authentication already disabled' },
    { name: 'RESET_LOGIN_SUCCESS', message: 'Login attempts successfully reset' },
    { name: 'RESET_LOGIN_INFO', message: 'Login attempts already reset' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Returns the postal address from the Address model.',
      factory: function() {
        return this.Address.create();
      },
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView'
        };
      },
      section: 'userInformation'
    },
    {
      class: 'Boolean',
      name: 'invited',
      value: false,
      documentation: `Determines whether the User was invited to the platform by
        an invitation email.`,
      section: 'operationsInformation',
      gridColumns: 6,
      order: 50
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'invitedBy',
      documentation: 'The ID of the person who invited the User to the platform.',
      section: 'operationsInformation',
      gridColumns: 6,
      order: 55
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'previousStatus',
      documentation: `Tracks the previous status of the User.`,
      section: 'operationsInformation',
      order: 11,
      gridColumns: 6,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Determines whether the User is permitted certain actions.',
      javaGetter: `
        return net.nanopay.admin.model.AccountStatus.DISABLED != getStatus();
      `,
      // NOTE: '_enabled_ is deprecated; use _status_ instead.',
      section: 'deprecatedInformation',
      order: 10,
      gridColumns: 6
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
      section: 'operationsInformation',
      order: 10,
      gridColumns: 6,
      sheetsOutput: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.onboarding.model.Questionnaire',
      name: 'questionnaire',
      documentation: `Returns the response from the User to a questionnaire from the
        Questionnaire model.`,
      section: 'operationsInformation'
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
      createVisibility: 'HIDDEN',
      section: 'ownerInformation'
    },
    {
      class: 'Boolean',
      name: 'welcomeEmailSent',
      documentation: 'Determines whether a welcome email has been sent to the User.',
      value: true,
      section: 'operationsInformation',
      gridColumns: 6,
      order: 60,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'portalAdminCreated',
      documentation: 'Determines whether a User was created by an admin user.',
      section: 'operationsInformation',
      gridColumns: 6,
      order: 65,
      value: false,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'createdPwd',
      value: false,
      documentation: `Determines whether the User is using its own unique password or one
        that was system-generated.`,
      section: 'operationsInformation',
      gridColumns: 6,
      order: 70,
      externalTransient: true
    },
    {
      class: 'Int',
      name: 'inviteAttempts',
      value: 0,
      documentation: 'Defines the number of attempts to invite the user.',
      section: 'operationsInformation',
      gridColumns: 6,
      order: 57,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'thirdParty',
      documentation: `Determines whether the User is taking instructions from and/or acting
        on behalf of a 3rd party.
      `,
      createVisibility: 'HIDDEN',
      section: 'ownerInformation',
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      documentation: `A placeholder for the photo identification image, such as a
        passport, of the individual person, or real user.
      `,
      createVisibility: 'HIDDEN',
      section: 'complianceInformation'
    },
    {
      class: 'Boolean',
      name: 'PEPHIORelated',
      documentation: `Determines whether the user is a domestic or foreign _Politically
        Exposed Person (PEP), Head of an International Organization (HIO)_, or
        related to any such person.
      `,
      createVisibility: 'HIDDEN',
      section: 'ownerInformation',
      gridColumns: 6
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
      section: 'operationsInformation',
      gridColumns: 6,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Determines whether the User is deleted.',
      value: false,
      writePermissionRequired: true,
      visibility: 'RO',
      tableWidth: 85,
      section: 'deprecatedInformation',
      order: 20,
      gridColumns: 6,
      externalTransient: true
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
      createVisibility: 'HIDDEN',
      section: 'systemInformation',
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      section: 'systemInformation',
      gridColumns: 6,
      value: foam.nanos.auth.LifecycleState.PENDING,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      writePermissionRequired: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: 'HIDDEN',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'organization',
      documentation: 'The organization/business associated with the User.',
      displayWidth: 80,
      width: 100,
      tableWidth: 160,
      section: 'businessInformation',
      order: 15,
      gridColumns: 6,
      label: 'Company Name'
    },
    {
      name: 'checkerPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;',
      hidden: true
    },
    {
      class: 'FObjectArray',
      name: 'approvalRequests',
      section: 'operationsInformation',
      order: 110,
      of: 'foam.nanos.approval.ApprovalRequest',
      view: { class: 'foam.u2.view.DAOtoFObjectArrayView' },
      visibility: 'RO',
      storageTransient: true
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
        List <PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        for ( PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          }
          catch ( IllegalStateException e ) {
            throw e;
          }
        }        

        // Run the validation logic generated by validationPredicates.
        FObject.super.validate(x);
      `
    }
  ],

  actions: [
    {
      name: 'viewTransactions',
      label: 'View Transactions',
      section: 'accountInformation',
      tableWidth: 160,
      availablePermissions: ['foam.nanos.auth.User.permission.viewTransactions'],
      code: async function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        var ids = await X.accountDAO
          .where(m.EQ(net.nanopay.account.Account.OWNER, this.id))
          .select(m.MAP(net.nanopay.account.Account.ID))
          .then((sink) => sink.delegate.array);
        var dao = X.transactionDAO.where(
          m.OR(
            m.IN(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, ids),
            m.IN(net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, ids)
          )
        );
        X.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            browseTitle: `${dao.of.model_.plural} ${this.FOR_MSG} ${this.toSummary()}`
          }
        });
      }
    },
    {
      name: 'viewPayables',
      label: 'View Payables',
      section: 'accountInformation',
      availablePermissions: ['foam.nanos.auth.User.permission.viewPayables'],
      code: async function(X) {
        var dao = this.expenses;
        this.__context__.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            browseTitle: `${this.PAYABLES_MSG} ${this.toSummary()}`
          }
        });
      }
    },
    {
      name: 'viewReceivables',
      label: 'View Receivables',
      section: 'accountInformation',
      availablePermissions: ['foam.nanos.auth.User.permission.viewReceivables'],
      code: async function(X) {
        var dao = this.sales;
        this.__context__.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            browseTitle: `${this.RECEIVABLES_MSG} ${this.toSummary()}`
          }
        });
      }
    },
    {
      name: 'resetLoginAttempts',
      section: 'userInformation',
      code: async function(X) {
        var loginAttempts = await X.loginAttemptsDAO.find(this.id);
        if ( loginAttempts == undefined || loginAttempts.loginAttempts == 0 ) {
          X.notify(this.RESET_LOGIN_INFO, '', this.LogLevel.WARN, true);
        } else {
          loginAttempts.loginAttempts = 0;
          X.loginAttemptsDAO.put(loginAttempts)
            .then(result => {
              X.notify(this.RESET_LOGIN_SUCCESS, '', this.LogLevel.INFO, true);
            });
        }
      }
    },
    {
      name: 'disableTwoFactor',
      label: 'Disable TFA',
      section: 'userInformation',
      code: async function(X) {
        var user = await X.userDAO.find(this.id);
        if ( ! user.twoFactorEnabled ) {
          X.notify(this.TWO_FACTOR_INFO, '', this.LogLevel.WARN, true);
        } else {
          user.twoFactorEnabled = false;
          X.userDAO.put(user)
            .then(() => {
              X.notify(this.TWO_FACTOR_SUCCCESS, '', this.LogLevel.INFO, true);
            });
        }
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
              } catch(Exception e) {}
              return user;
            }
        `);
      }
    }
  ]
});

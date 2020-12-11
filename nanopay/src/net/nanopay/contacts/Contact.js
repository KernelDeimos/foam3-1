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
  package: 'net.nanopay.contacts',
  name: 'Contact',
  extends: 'foam.nanos.auth.User',

  documentation: `
    The base model, as part of the Self-Serve project, for representing people who,
    although they are not registered on the platform, can still receive invoices from
    platform users. Used as a property model in ContactWizardView for the three steps
    of contact creation.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions',
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern',
    'javax.mail.internet.AddressException',
    'javax.mail.internet.InternetAddress',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Business'
  ],

  imports: [
    'accountDAO',
    'auth',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'countryDAO',
    'targetCorridorDAO',
    'publicBusinessDAO',
    'pushMenu',
    'subject',
    'user'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.Country',
    'foam.u2.dialog.Popup',
    'foam.u2.DisplayMode',
    'foam.u2.LoadingSpinner',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.payment.PaymentProviderCorridor',
    'net.nanopay.ui.wizard.WizardController'
  ],

  constants: [
    {
      name: 'NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    }
  ],

  tableColumns: [
    'organization',
    'status'
  ],

  sections: [
    {
      name: 'userInformation',
      title: 'Contact Information',
      order: 1
    },
    {
      name: 'businessInformation',
      order: 2
    }
  ],

  messages: [
    {
      name: 'CONFIRM_RELATIONSHIP',
      message: `I have a business relationship with this contact.`
    },
    {
      name: 'INVITE_LABEL',
      message: 'Invite this contact to join '
    },
    {
      name: 'RESTRICT_INVITE_LABEL',
      message: 'This contact cannot be invited to join Ablii'
    },
    {
      name: 'UNABLE_TO_ADD_BANK_ACCOUNT',
      message: `You currently have not completed the necessary requirements
          to add an account to your contact. Please visit the capability store to enable payments.`
    },
    { name: 'ERROR_BUSINESS_PROFILE_NAME_MESSAGE', message: 'Business name required' },
    { name: 'INVALID_EMAIL', message: 'Valid email required' },
    { name: 'INVALID_FIRST_NAME', message: 'First name cannot exceed 70 characters' },
    { name: 'INVALID_LAST_NAME', message: 'Last name cannot exceed 70 characters' },
    { name: 'CONFIRMATION_REQUIRED', message: 'Confirmation required' },
    { name: 'PLACEHOLDER', message: 'Please select....' },
    { name: 'HEADER', message: 'Country of bank account' },
    { name: 'MISSING_BANK_WARNING', message: 'Missing bank information' }
  ],

  css: `
    .spinner {
      text-align: center;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .spinner img {
      width: 60px;
    }
  `,

  properties: [
    {
      name: 'organization',
      label: 'Business',
      documentation: 'The organization/business associated with the Contact.',
      includeInDigest: false,
      view: { class: 'foam.u2.tag.Input', focused: true },
      validateObj: function(organization) {
        if (
          typeof organization !== 'string' ||
          organization.trim().length === 0
        ) {
          return this.ERROR_BUSINESS_PROFILE_NAME_MESSAGE;
        }
      },
      postSet: function(_, n) {
        this.businessName = n;
      },
      tableCellFormatter: function(X, obj) {
        if ( ! obj.businessId ) {
          this.start().add(obj.organization).end();
        } else {
          obj.publicBusinessDAO
            .find(obj.businessId)
            .then(business =>
              this.start()
                .add(business ? business.toSummary() : obj.organization)
              .end()
          );
        }
      }
    },
    {
      class: 'String',
      name: 'operatingBusinessName',
      documentation: `The operating business name of the business the contact is
        associated to.
        This is the opt-in name the business wants to display on our platform (used for searching), 
        as opposed to businessName / organization which is the company’s legal name.`,
      includeInDigest: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'legalName',
      documentation: `A field for the legal first and last name of the Contact,
        if different than the provided first name.  The field will default to first
        name, last name.`,
      visibility: 'HIDDEN',
      label: 'Name'
    },
    {
      name: 'email',
      documentation: 'The email address of the Contact.',
      label: 'Email',
      view: { class: 'foam.u2.tag.Input' },
      validateObj: function(email) {
        if ( ! this.businessId ) {
          var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if ( ! emailRegex.test(email) ) {
            return this.INVALID_EMAIL;
          }
        }
      }
    },
    {
      name: 'firstName',
      view: { class: 'foam.u2.tag.Input' },
      validateObj: function(firstName) {
        if ( !! firstName ) {
          if ( firstName.length > this.NAME_MAX_LENGTH ) {
            return this.INVALID_FIRST_NAME;
          }
        }
      }
    },
    {
      name: 'middleName',
      visibility: 'HIDDEN',
      validateObj: function(middleName) {}
    },
    {
      name: 'lastName',
      view: { class: 'foam.u2.tag.Input' },
      validateObj: function(lastName) {
        if ( !! lastName ) {
          if ( lastName.length > this.NAME_MAX_LENGTH ) {
            return this.INVALID_LAST_NAME;
          }
        }
      }
    },
    {
      // REVIEW: this should be storageTransient - believe it's just used for
      // capability input.
      class: 'Boolean',
      name: 'confirm',
      documentation: `True if the user confirms their relationship with the contact.`,
      includeInDigest: false,
      section: 'operationsInformation',
      gridColumns: 6,
      label: '',
      updateVisibility: function() {
        return foam.u2.DisplayMode.HIDDEN;
      },
      createVisibility: function(isEdit) {
        return isEdit ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.CheckBox',
          label: X.data.CONFIRM_RELATIONSHIP
        };
      },
      validateObj: function(confirm) {
        if ( ! confirm ) {
          return this.CONFIRMATION_REQUIRED;
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.contacts.ContactStatus',
      name: 'signUpStatus',
      documentation: `Tracks the registration status of a contact with respect to
        whether a individual person, or real user, can sign in or not.
        Pending, Ready and Connected
      `,
      includeInDigest: true,
      visibility: 'HIDDEN',
      label: 'Status',
      tableWidth: 170,
      expression: function(bankAccount, businessId) {
        return bankAccount || businessId ? net.nanopay.contacts.ContactStatus.READY : net.nanopay.contacts.ContactStatus.PENDING;
      },
      tableCellFormatter: function(state, obj) {
        this.__subContext__.contactDAO.find(obj.id).then(contactObj=> {
          var format = contactObj.bankAccount || contactObj.businessId ? net.nanopay.contacts.ContactStatus.READY : net.nanopay.contacts.ContactStatus.PENDING;
          var label = state == net.nanopay.contacts.ContactStatus.CONNECTED ? state.label.replace(/\s+/g, '') : format.label.replace(/\s+/g, '');

          this.start()
            .start().show(state != net.nanopay.contacts.ContactStatus.CONNECTED).addClass('contact-status-circle-' + label).end()
            .start('img')
              .show(state == net.nanopay.contacts.ContactStatus.CONNECTED)
              .attrs({ src: this.__subContext__.theme.logo })
              .style({ 'width': '15px', 'position': 'relative', 'top': '3px', 'right': '4px' })
              .end()
            .start().addClass('contact-status-' + label)
              .add(label)
            .end()
          .end();
        });
      }
    },
    {
      // TODO: This should probably be defined by a relationship.
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      javaValue: '0',
      name: 'businessId',
      documentation: `A unique identifier for the business associated with the Contact.`,
      includeInDigest: false,
      section: 'businessInformation',
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether the Contact can login to the platform.',
      value: false
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'bankAccount',
      includeInDigest: true,
      documentation: `The unique identifier for the bank account of the Contact
        if created while registering the Contact.`,
      section: 'accountInformation',
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'createBankAccount',
      documentation: 'A before put bank account object a user creates for the contact.',
      storageTransient: true,
      label: '',
      visibility: function(countries) {
        return countries.length == 0 && ! this.createBankAccount ? 
          foam.u2.DisplayMode.HIDDEN : 
          foam.u2.DisplayMode.RW;
      },
      factory: function() {
        if ( this.bankAccount ) {
          return this.accountDAO.find(this.bankAccount).then((res) => this.createBankAccount = res);
        }
      },
      view: function(_, X) {
        let e = foam.mlang.Expressions.create();
        var pred = e.AND(
            e.EQ(foam.strategy.StrategyReference.DESIRED_MODEL_ID, 'net.nanopay.bank.BankAccount'),
            e.IN(foam.strategy.StrategyReference.STRATEGY, X.data.countries)
        );
        var v = foam.u2.view.FObjectView.create({
          of: net.nanopay.bank.BankAccount,
          predicate: pred,
          placeholder: X.data.PLACEHOLDER,
          header: X.data.HEADER,
          classIsFinal: true,
          copyOldData: function(o) { return { isDefault: o.isDefault, forContact: o.forContact }; }
        }, X);
        v.data$.sub(function() { v.data.forContact = true; });

        return v;
      }
    },
    {
      transient: true,
      flags: ['web'],
      name: 'availableCountries',
      visibility: 'HIDDEN',
      expression: function(targetCorridorDAO) {
        if ( this.createBankAccount && this.createBankAccount.country ) return [];
        return this.PromisedDAO.create({
          promise: targetCorridorDAO.where(this.INSTANCE_OF(this.PaymentProviderCorridor))
            .select(this.MAP(this.PaymentProviderCorridor.TARGET_COUNTRY))
            .then(sink => {
              let unique = [...new Set(sink.delegate.array)];
              let arr = [];
              for ( i = 0; i < unique.length; i++ ) {
                model = foam.lookup(`net.nanopay.bank.${ unique[i] }BankAccount`);
                if ( model ) arr.push(model);
              }
              this.countries = arr;
              this.showSpinner = false;
            })
        });
      }
    },
    {
      transient: true,
      flags: ['web'],
      name: 'countries',
      visibility: 'HIDDEN',
      documentation: `Stores available countries contact can have account domicilied in.`,
      factory: function() { return []; }
    },
    {
      transient: true,
      flags: ['web'],
      name: 'noCorridorsAvailable',
      documentation: 'GUI when no corridor capabilities have been added to user.',
      visibility: function(showSpinner, countries, createBankAccount) {
        return ! showSpinner && countries.length == 0 && ! createBankAccount ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
      view: function(_, X) {
        return X.E().start().add(X.data.UNABLE_TO_ADD_BANK_ACCOUNT).end();
      }
    },
    {
      transient: true,
      flags: ['web'],
      name: 'loadingSpinner',
      label: '',
      visibility: function(showSpinner, createBankAccount) {
        return showSpinner && ! createBankAccount ? foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      },
      factory: function() {
        return this.LoadingSpinner.create().addClass('spinner');
      },
      view: function(_, X) {
        return X.E().start().add(X.data.loadingSpinner).end();
      }
    },
    {
      transient: true,
      flags: ['web'],
      class: 'Boolean',
      name: 'showSpinner',
      value: true
    },
    {
      transient: true,
      flags: ['web'],
      class: 'Boolean',
      name: 'shouldInvite',
      documentation: 'True if the user wants to invite the contact to join Ablii.',
      section: 'userInformation',
      label: '',
      readPermissionRequired: true,
      createVisibility: function(createBankAccount$country, isEdit) {
        return (createBankAccount$country != 'IN' && ! isEdit) ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: function() {
        return foam.u2.DisplayMode.HIDDEN;
      },
      view: function(_, X) {
        return foam.u2.CheckBox.create({ label: X.data.INVITE_LABEL + X.theme.appName });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      documentation: 'The postal address of the business associated with the Contact.',
      includeInDigest: false,
      section: 'businessInformation',
      label: '',
      view: function(_, X) {
        // Removing auth checks. TODO: solution on what to show based on what.
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          showDisclaimer: false
        };
      },
      factory: function() {
        return  this.Address.create();
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'businessStatus',
      documentation: 'Tracks the status of a business.',
      section: 'systemInformation',
      gridColumns: 6,
      storageTransient: true
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: 'True if the contact is being edited',
      visibility: 'HIDDEN',
      storageTransient: true,
      value: false
    },
    {
      name: 'emailVerified',
      value: true,
      documentation: `Verifies that the email address of the Contact is valid.
        If the email address is not verified the transaction validation logic will
        throw an error when a Contact is either the Payer or Payee of an invoice.
      `,
      section: 'systemInformation'
    },
    {
      // TODO/REVIEW: this should be transient. 
      class: 'String',
      name: 'warning',
      section: 'systemInformation',
      label: '',
      includeInDigest: false,
      tableWidth: 80,
      expression: function(bankAccount, businessId) {
        return ! bankAccount && ! businessId ? this.MISSING_BANK_WARNING : '';
      },
      tableHeaderFormatter: function() { },
      tableCellFormatter: function(value, obj) {
        if ( value ) {
          this.start()
            .attrs({ title: value } )
            .start({ class: 'foam.u2.tag.Image', data: 'images/warning.svg' }).end()
          .end();
        }
      }
    }
  ],

  actions: [
    {
      name: 'addBankAccount',
      isAvailable: async function() {
        var bank = await this.accounts.find(this.EQ(net.nanopay.bank.BankAccount.OWNER, this.id))
        return this.signUpStatus !== this.ContactStatus.READY && ! bank;
      },
      code: function(X) {
        X.controllerView.add(this.WizardController.create({
          model: 'net.nanopay.contacts.Contact',
          data: this,
          controllerMode: foam.u2.ControllerMode.CREATE,
          isEdit: true
        }, X));
      }
    },
    {
      name: 'edit',
      label: 'Edit Details',
      isAvailable: function() {
        return this.signUpStatus === this.ContactStatus.READY && this.businessId === 0;
      },
      code: function(X) {
        X.controllerView.add(this.WizardController.create({
          model: 'net.nanopay.contacts.Contact',
          data: this,
          controllerMode: foam.u2.ControllerMode.EDIT,
          isEdit: true
        }, X));
      }
    },
    {
      name: 'invite',
      isEnabled: function() {
        return this.signUpStatus != this.ContactStatus.READY;
      },
      isAvailable: async function() {
        let account = await this.accountDAO.find(this.bankAccount);
        let permission = await this.auth.check(null, 'menu.read.capability.menu.invitation');
        return this.signUpStatus != this.ContactStatus.READY && ! this.INBankAccount.isInstance(account) && permission;
      },
      code: function(X) {
        var invite = net.nanopay.model.Invitation.create({
          email: this.email,
          businessName: this.organization,
          createdBy: this.subject.user.id,
          isContact: true
        }, X);
        X.controllerView.add(this.WizardController.create({
          model: 'net.nanopay.model.Invitation',
          data: invite,
          controllerMode: foam.u2.ControllerMode.EDIT
        }, X))
      }
    },
    {
      name: 'requestMoney',
      isEnabled: function() {
        return (
          this.businessId &&
          this.businessStatus !== this.AccountStatus.DISABLED
        ) || this.bankAccount;
      },
      isAvailable: async function() {
        let permission = await this.auth.check(null, 'menu.read.capability.main.invoices.receivables');
        return permission;
      },
      code: function(X) {
        this.checkAndNotifyAbilityToReceive().then((result) => {
          if ( result ) {
            X.menuDAO.find('sme.quickAction.request').then((menu) => {
              var clone = menu.clone();
              Object.assign(clone.handler.view, {
                invoice: this.Invoice.create({ contactId: this.id }),
                isPayable: false
              });
              clone.launch(X, X.controllerView);
            });
          }
        });
      }
    },
    {
      name: 'sendMoney',
      isEnabled: function() {
        return (
          this.businessId &&
          this.businessStatus !== this.AccountStatus.DISABLED
        ) || this.bankAccount;
      },
      isAvailable: async function() {
        let permission = await this.auth.check(null, 'menu.read.capability.main.invoices.payables');
        return permission;
      },
      code: function(X) {
        this.checkAndNotifyAbilityToPay().then((result) => {
          if ( result ) {
            X.menuDAO.find('sme.quickAction.send').then((menu) => {
              var clone = menu.clone();
              Object.assign(clone.handler.view, {
                invoice: this.Invoice.create({ contactId: this.id }),
                isPayable: true
              });
              clone.launch(X, X.controllerView);
            });
          }
        });
      }
    },
    {
      name: 'delete',
      code: function(X) {
        X.controllerView.add(this.Popup.create(null, X).tag({
          class: 'net.nanopay.contacts.ui.modal.DeleteContactView',
          data: this
        }));
      }
    },
    {
      name: 'resetLoginAttempts',
      isAvailable: () => false
    },
    {
      name: 'disableTwoFactor',
      isAvailable: () => false
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        if ( getBusinessId() != 0 ) {
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          Business business = (Business) localBusinessDAO.inX(x).find(getBusinessId());
          if ( business == null ) {
            throw new IllegalStateException("The business this contact references was not found.");
          }
        } else {
          boolean isValidEmail = true;
          try {
            InternetAddress emailAddr = new InternetAddress(this.getEmail());
            emailAddr.validate();
          } catch (AddressException ex) {
            isValidEmail = false;
          }

          if ( this.getFirstName().length() > NAME_MAX_LENGTH ) {
            throw new IllegalStateException("First name cannot exceed 70 characters.");
          } else if ( this.getLastName().length() > NAME_MAX_LENGTH ) {
            throw new IllegalStateException("Last name cannot exceed 70 characters.");
          } else  if ( this.getBusinessId() == 0 && SafetyUtil.isEmpty(this.getEmail()) ) {
            throw new IllegalStateException("Email is required.");
          } else if ( ! isValidEmail ) {
            throw new IllegalStateException("Invalid email address.");
          }

          if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
            throw new IllegalStateException("Business name is required.");
          }

          if ( ! foam.util.SafetyUtil.isEmpty(this.getBankAccount()) ) {
            BankAccount bankAccount = (BankAccount) this.findBankAccount(x);

            if ( bankAccount == null ) throw new RuntimeException("Bank account not found.");

            if ( SafetyUtil.isEmpty(bankAccount.getName()) ) {
              throw new RuntimeException("Financial institution name required.");
            }

            Address businessAddress = this.getBusinessAddress();

            if ( businessAddress == null ) {
              throw new IllegalStateException("Business Address is required.");
            }

            java.util.List<foam.core.PropertyInfo> props = businessAddress.getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
            for ( foam.core.PropertyInfo prop : props ) {
              try {
                prop.validateObj(x, businessAddress);
              } catch ( IllegalStateException e ) {
                throw e;
              }
            }
          }
        }
        if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
          throw new IllegalStateException("Organization is required.");
        }
      `
    },
    {
      type: 'Boolean',
      name: 'validatePostalCode',
      args: [
        {
          class: 'String',
          name: 'code'
        },
        {
          class: 'String',
          name: 'countryId'
        }
      ],
      javaCode: `
        Pattern caPosCode = Pattern.compile("^[ABCEGHJ-NPRSTVXY]\\\\d[ABCEGHJ-NPRSTV-Z][ -]?\\\\d[ABCEGHJ-NPRSTV-Z]\\\\d$");
        Pattern usPosCode = Pattern.compile("^\\\\d{5}(?:[-\\\\s]\\\\d{4})?$");
        Pattern inPosCode = Pattern.compile("^\\\\d{6}(?:[-\\\\s]\\\\d{4})?$");

        switch ( countryId ) {
          case "CA":
            return caPosCode.matcher(code).matches();
          case "US":
            return usPosCode.matcher(code).matches();
          case "IN":
            return inPosCode.matcher(code).matches();
          default:
            return false;
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.create." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.read." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.update." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.remove." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        if ( this.operatingBusinessName ) return this.operatingBusinessName;
        if ( this.organization ) return this.organization;
        if ( this.legalName ) return this.legalName;
        if ( this.lastName && this.firstName ) return this.firstName + ' ' + this.lastName;
        if ( this.lastName ) return this.lastName;
        if ( this.firstName ) return this.firstName;
        return '';
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getOperatingBusinessName()) ) return this.getOperatingBusinessName();
        if ( ! SafetyUtil.isEmpty(this.getOrganization()) ) return this.getOrganization();
        if ( ! SafetyUtil.isEmpty(this.getLegalName()) ) return this.getLegalName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) && ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName() + " " + this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) ) return this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName();
        return "";
      `
    }
  ]
});

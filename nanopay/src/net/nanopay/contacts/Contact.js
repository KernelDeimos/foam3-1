foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'Contact',
  extends: 'foam.nanos.auth.User',

  documentation: `
    The base model, as part of the Self-Serve project, for representing people who,
    although they are not registered on the platform, can still receive invoices from
    platform users.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.AddressException',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Business',
  ],

  imports: [
    'publicBusinessDAO'
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

  properties: [
    {
      name: 'organization',
      documentation: 'The organization/business associated with the Contact.',
      label: 'Business',
      validateObj: function(organization) {
        if (
          typeof organization !== 'string' ||
          organization.trim().length === 0
        ) {
          return 'Business name required';
        }
      },
      postSet: function(_,n) {
        this.businessName = n;
      }
    },
    {
      name: 'legalName',
      documentation: `A field for the legal first and last name of the Contact,
        if different than the provided first name.  The field will default to first
        name, last name.`,
      label: 'Name'
    },
    {
      name: 'email',
      documentation: 'The email address of the Contact.',
      label: 'Email',
      validateObj: function(email) {
        if ( ! this.businessId ) {
          var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if ( ! emailRegex.test(email) ) {
            return 'Invalid email address.';
          }
        }
      }
    },
    {
      name: 'firstName',
      validateObj: function(firstName) {
        if ( !! firstName ) {
          if ( firstName.length > this.NAME_MAX_LENGTH ) {
            return 'First name cannot exceed 70 characters.';
          }
        }
      }
    },
    {
      name: 'middleName',
      validateObj: function(middleName) {}
    },
    {
      name: 'lastName',
      validateObj: function(lastName) {
        if ( !! lastName ) {
          if ( lastName.length > this.NAME_MAX_LENGTH ) {
            return 'Last name cannot exceed 70 characters.';
          }
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.contacts.ContactStatus',
      name: 'signUpStatus',
      label: 'Status',
      tableWidth: 170,
      documentation: `Tracks the registration status of a contact with respect to
        whether a individual person, or real user, can sign in or not.
      `,
      tableCellFormatter: function(state, obj) {
        var format = obj.bankAccount && state != net.nanopay.contacts.ContactStatus.ACTIVE ? 'Ready' : 'Pending';
        var label = state == net.nanopay.contacts.ContactStatus.ACTIVE ? state.label.replace(/\s+/g, '') : format;
        this.start()
          .start().show(state != net.nanopay.contacts.ContactStatus.ACTIVE).addClass('contact-status-circle-' + label).end()
          .start('img')
            .show(state == net.nanopay.contacts.ContactStatus.ACTIVE)
            .attrs({ src: this.__subContext__.theme.logo })
            .style({ 'width': '15px', 'position': 'relative', 'top': '3px', 'right': '4px' })
            .end()
          .start().addClass('contact-status-' + label)
            .add(label)
          .end()
        .end();
      }
    },
    {
      // TODO: This should probably be defined by a relationship.
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      documentation: `A unique identifier for the business associated with the Contact.`
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'realUser',
      documentation: `The ID for the individual person, or real user,
        who registers with our platform.`
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
      documentation: `The unique identifier for the bank account of the Contact
        if created while registering the Contact.`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      documentation: 'The postal address of the business associated with the Contact.',
      view: { class: 'net.nanopay.sme.ui.AddressView' },
      factory: function() {
        return this.Address.create();
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'businessStatus',
      documentation: 'Tracks the status of a business.',
      storageTransient: true
    },
    {
      name: 'emailVerified',
      value: true,
      documentation: `Verifies that the email address of the Contact is valid.
        If the email address is not verified the transaction validation logic will
        throw an error when a Contact is either the Payer or Payee of an invoice.
      `
    },
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
      class: 'PhoneNumber',
      name: 'businessPhoneNumber',
      documentation: 'The phone number of the business.'
    },
    {
      class: 'Boolean',
      name: 'businessPhoneVerified',
      writePermissionRequired: true
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

          if ( this.getBankAccount() != 0 ) {
            BankAccount bankAccount = (BankAccount) this.findBankAccount(x);

            if ( bankAccount == null ) throw new RuntimeException("Bank account not found.");

            if ( SafetyUtil.isEmpty(bankAccount.getName()) ) {
              throw new RuntimeException("Financial institution name required.");
            }

            Address businessAddress = this.getBusinessAddress();
            DAO countryDAO = (DAO) x.get("countryDAO");
            DAO regionDAO = (DAO) x.get("regionDAO");

            Country country = (Country) countryDAO.find(businessAddress.getCountryId());
            if ( country == null ) {
              throw new RuntimeException("Invalid country id.");
            }

            Region region = (Region) regionDAO.find(businessAddress.getRegionId());
            if ( region == null ) {
              throw new RuntimeException("Invalid region id.");
            }

            Pattern streetNumber = Pattern.compile("^[0-9]{1,16}$");
            if ( ! streetNumber.matcher(businessAddress.getStreetNumber()).matches() ) {
              throw new RuntimeException("Invalid street number.");
            }

            if ( SafetyUtil.isEmpty(businessAddress.getStreetName()) ) {
              throw new RuntimeException("Invalid street name.");
            } else if ( businessAddress.getStreetName().length() > 100 ) {
              throw new RuntimeException("Street name cannot exceed 100 characters");
            }
            else {
              businessAddress.setStreetName(businessAddress.getStreetName().trim());
            }

            if ( SafetyUtil.isEmpty(businessAddress.getCity()) ) {
              throw new RuntimeException("Invalid city name.");
            } else if ( businessAddress.getCity().length() > 100 ) {
              throw new RuntimeException("City cannot exceed 100 characters");
            } else {
              businessAddress.setCity(businessAddress.getCity().trim());
            }

            if ( ! this.validatePostalCode(businessAddress.getPostalCode(), businessAddress.getCountryId()) ) {
              String codeType = businessAddress.getCountryId().equals("US") ? "zip code" : "postal code";
              throw new RuntimeException("Invalid " + codeType + ".");
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
        User user = (User) x.get("user");
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
        User user = (User) x.get("user");
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
        User user = (User) x.get("user");
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
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.delete." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'label',
      type: 'String',
      code: async function label() {
        if ( this.businessId ) {
          let business = await this.publicBusinessDAO.find(this.businessId);
          return business.label();
        }
        if ( this.organization ) return this.organization;
        if ( this.businessName ) return this.businessName;
        if ( this.legalName ) return this.legalName;
        if ( this.lastName && this.firstName ) return this.firstName + ' ' + this.lastName;
        if ( this.lastName ) return this.lastName;
        if ( this.firstName ) return this.firstName;
        return '';
      },
      javaCode: `
        DAO publicBusinessDAO = (DAO) getX().get("publicBusinessDAO");
        if ( this.getBusinessId() != 0 ) {
          Business business = (Business) publicBusinessDAO.find(this.getBusinessId());
          return business.label();
        }
        if ( ! SafetyUtil.isEmpty(this.getOrganization()) ) return this.getOrganization();
        if ( ! SafetyUtil.isEmpty(this.getBusinessName()) ) return this.getBusinessName();
        if ( ! SafetyUtil.isEmpty(this.getLegalName()) ) return this.getLegalName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) && ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName() + " " + this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) ) return this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName();
        return "";
      `
    }
  ]
});

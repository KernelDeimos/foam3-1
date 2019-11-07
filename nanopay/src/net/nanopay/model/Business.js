foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Business',
  extends: 'foam.nanos.auth.User',

  imports: [
    'ctrl',
    'invoiceDAO'
  ],

  requires: [
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  documentation: `Business is an object that extends the user class. A business is an
    entity on behalf of which multiple users can act.  A business is associated with
    the company name provided by the user upon registraton. The business object allows
    business information to be updated and retrieved.  The body parameters refer to
    the business as the 'organization'.
  `,

  tableColumns: [
    'id',
    'businessName',
    'email',
    'viewAccounts'
  ],

  messages: [
    { name: 'COMPLIANCE_REPORT_WARNING', message: ' has not completed the business profile, and cannot generate compliance documents.' }
  ],

  sections: [
    {
      name: 'business',
      title: 'Business Information'
    },
    {
      name: 'personal',
      title: 'Personal Information',
      isAvailable: () => false
    },
    {
      name: 'administrative',
      help: 'Properties that are used internally by the system.',
      permissionRequired: true
    },
  ],

  properties: [
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Legal name of business.',
      width: 50
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessTypeDAO',
      name: 'businessTypeId',
      of: 'net.nanopay.model.BusinessType',
      documentation: 'The ID of the proprietary details of the business.',
      section: 'business'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `This refines the "created" property in
        foam.nanos.auth.user and changes the section from administrative to
        business, so that paymentops and other groups can see this property. `,
      section: 'business',
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
      },
      section: 'business'
    },
    {
      class: 'String',
      name: 'businessPermissionId',
      documentation: `A generated name used in permission strings related to the business.
        The name does not contain any special characters.
      `,
      expression: function(businessName, id) {
        return businessName.replace(/\W/g, '').toLowerCase() + id;
      },
      type: 'String',
      javaGetter: `
        return getBusinessName().replaceAll("\\\\W", "").toLowerCase() + getId();
      `,
      createMode: 'HIDDEN',
      updateMode: 'RO',
      section: 'administrative'
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether the User can login to the platform.',
      value: false,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'emailVerified',
      hidden: true
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      hidden: true,
    },
    {
      class: 'DateTime',
      name: 'passwordLastModified',
      hidden: true,
    },
    {
      class: 'DateTime',
      name: 'passwordExpiry',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'residenceOperated',
      documentation: 'Determines whether a business is operated at the residence of the owner.',
      section: 'business'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'beneficialOwnerDocuments',
      documentation: `A stored copy of the documents that verify a person as a
        beneficial owner.`,
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.data.beneficialOwnerDocuments$
        };
      },
      section: 'business'
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
      },
      section: 'business'
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
      javaSetter: `setBusinessRegistrationAuthority(val);`,
      section: 'business'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryOfBusinessRegistration',
      documentation: `Country where business was registered.`,
      section: 'business'
    },
    {
      class: 'Date',
      name: 'businessRegistrationDate',
      documentation: 'The date that the business was registered by their issuing authority.',
      section: 'business'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      documentation: 'The phone number of the business.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' },
      section: 'business'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: `Returns the postal address of the business associated with the
        User from the Address model.`,
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'Boolean',
      name: 'businessHoursEnabled',
      documentation: 'Determines whether business hours are enabled for the User to set.',
      value: false,
      section: 'business'
    },
    {
      class: 'Boolean',
      name: 'onboarded',
      documentation: `Determines whether completed business registration. This property
        dictates portal views after compliance and account approval.`,
      value: false,
      writePermissionRequired: true,
      section: 'administrative'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.User',
      name: 'principalOwners',
      documentation: 'Represents the people who own the majority shares in a business.',
      createMode: 'HIDDEN',
      section: 'business'
    },
    {
      class: 'Boolean',
      name: 'holdingCompany',
      documentation: `Determines whether a Business is a holding company.  A holding company
        represent a corporate group which owns shares of multiple companies.`,
      section: 'business'
    },
    {
      class: 'String',
      name: 'sourceOfFunds',
      documentation: 'The entities that provide funding to the business.',
      section: 'business'
    },
    {
      class: 'String',
      name: 'targetCustomers',
      label: 'Who do you market your products and services to?',
      documentation: `The type of clients that the business markets its products and
        services.`,
      section: 'business'
    },
    {
      class: 'FObjectProperty',
      name: 'suggestedUserTransactionInfo',
      of: 'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
      documentation: `Returns the expected transaction types, frequency, amount and
        currencies that the User anticipates making with the platform. This
        information is required for KYC purposes.  It is drawn from the
        suggestedUserTransactionInfo object.
        `,
      section: 'business'
    },
    {
      class: 'String',
      name: 'taxIdentificationNumber',
      documentation: `The tax identification number associated with the business of
      the User.`,
      section: 'business'
    },
    {
      name: 'businessIdentificationCode',
      documentation: 'ISO 9362 Business Identification Code (BIC) (regulated by SWIFT). see https://en.wikipedia.org/wiki/ISO_9362.',
      class: 'String',
      section: 'business'
    },
    {
      class: 'String',
      name: 'businessRegistrationNumber',
      width: 35,
      documentation: `The Business Registration Number (BRN) that identifies your business
        to federal, provincial or municipal governments and is used by the business
        for tax purposes. This number is typically issued by an Issuing Authority such as
        the CRA.`,

      validateObj: function(businessRegistrationNumber) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( businessRegistrationNumber.length > 0 &&
              ! re.test(businessRegistrationNumber) ) {
          return 'Invalid registration number.';
        }
      },
      section: 'business'
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
      javaSetter: `setBusinessRegistrationNumber(val);`,
      section: 'business'
    },
    {
      class: 'FObjectArray',
      name: 'businessDirectors',
      of: 'net.nanopay.model.BusinessDirector',
      view: {
        class: 'foam.u2.view.FObjectArrayView'
      },
      section: 'business'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      documentation: `The profile picture of the business, such as a logo, initially
        defaulting to a placeholder picture.`,
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/business-placeholder.png'
      },
      section: 'business'
    },
    {
      class: 'Boolean',
      name: 'internationalPaymentEnabled',
      value: false,
      documentation: `Determines whether a user has been onboarded to
        a partner platform to support international payments.`,
      section: 'business'
    },
    // Overwrite validateObj on firstName, lastName, and email so we can create
    // businesses through the GUI.
    {
      name: 'firstName',
      validateObj: function() {}
    },
    {
      name: 'lastName',
      validateObj: function() {}
    },
    {
      name: 'email',
      validateObj: function() {}
    }
 ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.EQ'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable'
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        if ( SafetyUtil.isEmpty(this.getBusinessName()) ) {
          throw new IllegalStateException("Business name cannot be empty.");
        }

        // Temporarily prohibit businesses based in Quebec.
        Address businessAddress = this.getAddress();

        if ( businessAddress != null && SafetyUtil.equals(businessAddress.getRegionId(), "QC") ) {
          throw new IllegalStateException("Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.");
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        // Prevent privilege escalation by only allowing a user's group to be
        // set to one that the user doing the put has permission to update.
        boolean hasGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());

        if ( ! hasGroupUpdatePermission ) {
          throw new AuthorizationException("You do not have permission to set that business's group to '" + this.getGroup() + "'.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = (User) x.get("user");
        User agent = (User) x.get("agent");

        if ( user == null ) throw new AuthenticationException();

        // If the user has the appropriate permission, allow access.
        if ( auth.check(x, "business.read." + Long.toString(this.getId())) ) return;

        // Allow businesses to read themselves.
        if ( user instanceof Business && SafetyUtil.equals(this.getId(), user.getId())) return;

        DAO junctionDAO = user.getEntities(x).getJunctionDAO();

        // There are decorators on agentJunctionDAO that need to access
        // businessDAO, but this method needs to access agentJunctionDAO, so we
        // end up with a loop where the two call each other until the call stack
        // overflows. In order to get around that, we skip all of the decorators
        // on agentJunctionDAO, which is what the line below is doing. We could
        // have made a second, undecorated service instead, but then it would be
        // easily for developers to mistakenly use the undecorated service in
        // places where it shouldn't be used.
        while ( junctionDAO instanceof ProxyDAO ) junctionDAO = ((ProxyDAO) junctionDAO).getDelegate();

        // Create a dummy object so we can search by its composite id.
        UserUserJunction dummy = new UserUserJunction.Builder(x).setSourceId(agent != null ? agent.getId() : user.getId()).setTargetId(this.getId()).build();

        UserUserJunction junction = (UserUserJunction) junctionDAO.inX(x).find(dummy.getId());
        boolean userIsInBusiness = junction != null;

        // Allow users to read businesses they're in.
        if ( userIsInBusiness ) return;

        throw new AuthorizationException();
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");
        boolean isUpdatingSelf = SafetyUtil.equals(this.getId(), user.getId());

        // to allow update authorization for users with permissions
        boolean hasUserEditPermission = auth.check(x, "business.update." + this.getId());

        // In other words: if the user EITHER is updating themselves, has edit authorization or is changing the system (will be handled below)
        // then they can PROCEED
        if (
          ! isUpdatingSelf &&
          ! hasUserEditPermission
        ) {
          throw new AuthorizationException();
        }

        Business oldBusiness = (Business) oldObj;

        // Prevent privilege escalation by only allowing a user's group to be
        // changed under appropriate conditions.
        if ( ! SafetyUtil.equals(oldBusiness.getGroup(), this.getGroup()) ) {
          boolean hasOldGroupUpdatePermission = auth.check(x, "group.update." + oldBusiness.getGroup());
          boolean hasNewGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());
          if ( isUpdatingSelf ) {
            throw new AuthorizationException("You cannot change your own group.");
          } else if ( ! hasUserEditPermission ) {
            throw new AuthorizationException("You do not have permission to change that business's group.");
          } else if ( ! (hasOldGroupUpdatePermission && hasNewGroupUpdatePermission) ) {
            throw new AuthorizationException("You do not have permission to change that business's group to '" + this.getGroup() + "'.");
          }
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = (User) x.get("user");
        Group group = (Group) x.get("group");
        if ( ! SafetyUtil.equals(group.getId(), "admin") ) {
          throw new AuthorizationException("Businesses cannot be deleted.");
        }
      `
    },
    {
      name: 'label',
      type: 'String',
      code: function label() {
        if ( this.organization ) return this.organization;
        if ( this.businessName ) return this.businessName;
        if ( this.legalName ) return this.legalName;
        return '';
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getOrganization()) ) return this.getOrganization();
        if ( ! SafetyUtil.isEmpty(this.getBusinessName()) ) return this.getBusinessName();
        if ( ! SafetyUtil.isEmpty(this.getLegalName()) ) return this.getLegalName();
        return "";
      `
    }
  ],

  actions: [
    {
      name: 'exportComplianceDocuments',
      code: function() {
        if ( this.compliance === this.ComplianceStatus.NOTREQUESTED
          || ! this.onboarded ) {
          this.ctrl.notify(this.organization + this.COMPLIANCE_REPORT_WARNING);
          return;
        }
        var url = window.location.origin
          + '/service/ascendantFXReports?userId=' + this.id;
        window.location.assign(url);
      }
    },
    {
      name: 'exportSettlementDocuments',
      code: function() {
        // Let us assume that we want to search for invoices with a field 3 days before and 3 days after today.
        var sDate = new Date(Date.now() - (1000*60*60*24*3));
        var dDate = new Date(Date.now() + (1000*60*60*24*3));
        var url = window.location.origin
          + '/service/settlementReports?userId='+ this.id
          + '&startDate=' // + sDate <- add(uncomment) to use above set dates.
          + '&endDate='; // + dDate; <- add(uncomment) to use above set dates.
        window.location.assign(url);
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    This decorator handles adding and updating business information including
    business address, signing officer and benifical officer.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Phone',
    'foam.nanos.notification.Notification',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.documents.AcceptanceDocumentService',
    'net.nanopay.model.Business',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Invitation',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NEQ',
    'static foam.mlang.MLang.INSTANCE_OF'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        BusinessOnboarding businessOnboarding = (BusinessOnboarding) obj;
        DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
        User user = (User)localUserDAO.find(businessOnboarding.getUserId());
        user = (User) user.fclone();

        if ( businessOnboarding != null && businessOnboarding.getSendInvitation() == true && businessOnboarding.getStatus() != net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED ) {
          if ( ! businessOnboarding.getSigningOfficer() && businessOnboarding.getSigningOfficerEmail() != null
                && ! businessOnboarding.getSigningOfficerEmail().equals("") && ! businessOnboarding.getSigningOfficerEmail().equals(user.getEmail()) ) {
            DAO businessInvitationDAO = (DAO) x.get("businessInvitationDAO");

            Invitation existingInvite = (Invitation) businessInvitationDAO.find(
              AND(
                EQ(Invitation.EMAIL, businessOnboarding.getSigningOfficerEmail().toLowerCase()),
                EQ(Invitation.CREATED_BY, businessOnboarding.getBusinessId())
              )
            );

            if ( existingInvite == null ) {
              // If the user needs to invite the signing officer
              String signingOfficerEmail = businessOnboarding.getSigningOfficerEmail().toLowerCase();

              Invitation invitation = new Invitation();
              /**
               * Summary: the group set in the invitation obj is not the final(real) group
               * that the signing office will get after signing up with the invitation email.
               * It is a string saved in the token that will passed into the NewUserCreateBusinessDAO class.
               * The group of the new signing officer will generate in the NewUserCreateBusinessDAO class.
               *
               * Details: After we set the group in the invitation obj, we put the invitation
               * into the businessInvitationDAO service.
               *
               * In the BusinessOnboardingDAO service, it has a decorator called businessInvitationDAO.
               * In the put_ method of businessInvitationDAO.java,
               * it basically set up a token which contains the group information which is the temp string: 'admin'
               *
               * When the user signs up with the signing officer invitation email,
               * the app will call the smeBusinessRegistrationDAO service.
               * In the smeBusinessRegistrationDAO service, it has a decorator called NewUserCreateBusinessDAO.
               *
               * In NewUserCreateBusinessDAO.java, it generates the business specific group
               * in the format of: businessName+businessId.admin. (such as: nanopay8010.admin).
               */
              invitation.setGroup("admin");
              invitation.setCreatedBy(businessOnboarding.getBusinessId());
              invitation.setEmail(businessOnboarding.getSigningOfficerEmail());

              invitation.setFirstName(businessOnboarding.getAdminFirstName());
              invitation.setLastName(businessOnboarding.getAdminLastName());
              invitation.setJobTitle(businessOnboarding.getAdminJobTitle());
              invitation.setPhoneNumber(((Phone)businessOnboarding.getAdminPhone()).getNumber());

              // Send invitation to email to the signing officer
              businessInvitationDAO.put_(x, invitation);
            }
          }

          businessOnboarding.setSendInvitation(false);
          return getDelegate().put_(x, businessOnboarding);
        }

        BusinessOnboarding old = (BusinessOnboarding) getDelegate().find_(x, obj);

        // if the businessOnboarding is already set to SUBMITTED, do not allow modification
        if ( old != null && ( old.getStatus() == net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED ||  old.getStatus() == net.nanopay.sme.onboarding.OnboardingStatus.SAVED ) ) return getDelegate().put_(x, businessOnboarding);

        Long oldDualPartyAgreement = old == null ? 0 : old.getDualPartyAgreement();
        if ( oldDualPartyAgreement != businessOnboarding.getDualPartyAgreement() ) {
          AcceptanceDocumentService documentService = (AcceptanceDocumentService) x.get("acceptanceDocumentService");
          documentService.updateUserAcceptanceDocument(x, businessOnboarding.getUserId(), businessOnboarding.getBusinessId(), businessOnboarding.getDualPartyAgreement(), (businessOnboarding.getDualPartyAgreement() != 0));
        }

        if ( businessOnboarding.getStatus() != net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED ) {
          return getDelegate().put_(x, businessOnboarding);
        }

        Session session = x.get(Session.class);
        if ( session != null ) {
          businessOnboarding.setRemoteHost(session.getRemoteHost());
        }

        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
        DAO localNotificationDAO = ((DAO) x.get("localNotificationDAO"));
        DAO businessInvitationDAO = ((DAO) x.get("businessInvitationDAO")).inX(x);

        Business business = (Business)localBusinessDAO.find(businessOnboarding.getBusinessId());

        // * Step 4+5: Signing officer
        user.setJobTitle(businessOnboarding.getJobTitle());
        user.setPhone(businessOnboarding.getPhone());
        user.setAddress(businessOnboarding.getAddress());

        // If the user is the signing officer
        if ( businessOnboarding.getSigningOfficer() ) {
          user.setBirthday(businessOnboarding.getBirthday());
          // Agreenments (tri-party, dual-party & PEP/HIO)

          if ( businessOnboarding.getPEPHIORelated() ) {
            Notification notification = new Notification();
            notification.setEmailIsEnabled(true);
            notification.setBody("A PEP/HIO related user with Id: " + user.getId() + ", Business Name: " +
                                  business.getOrganization() + " and Business Id: " + business.getId() + " has been Onboarded.");
            notification.setNotificationType("A PEP/HIO related user has been Onboarded");
            notification.setGroupId("fraud-ops");
            localNotificationDAO.put(notification);
          }
          user.setPEPHIORelated(businessOnboarding.getPEPHIORelated());
          user.setThirdParty(businessOnboarding.getThirdParty());

          localUserDAO.put(user);
          // Set the signing officer junction between the user and the business
          business.getSigningOfficers(x).add(user);

          // Update the business because the put to signingOfficerJunctionDAO
          // will have updated the email property of the business.
          business = (Business) localBusinessDAO.find(business.getId());
          business = (Business) business.fclone();

          // * Step 6: Business info
          // Business info: business address
          business.setAddress(businessOnboarding.getBusinessAddress());
          business.setPhone(businessOnboarding.getPhone());

          // Business info: business details
          business.setBusinessTypeId(businessOnboarding.getBusinessTypeId());
          business.setBusinessSectorId(businessOnboarding.getBusinessSectorId());
          business.setSourceOfFunds(businessOnboarding.getSourceOfFunds());

          if ( businessOnboarding.getOperatingUnderDifferentName() ) {
            business.setOperatingBusinessName(businessOnboarding.getOperatingBusinessName());
          }

          // Business info: transaction details
          SuggestedUserTransactionInfo suggestedUserTransactionInfo = new SuggestedUserTransactionInfo();
          suggestedUserTransactionInfo.setBaseCurrency("CAD");
          suggestedUserTransactionInfo.setAnnualRevenue(businessOnboarding.getAnnualRevenue());
          suggestedUserTransactionInfo.setAnnualTransactionFrequency(businessOnboarding.getAnnualTransactionFrequency());
          suggestedUserTransactionInfo.setAnnualDomesticVolume(businessOnboarding.getAnnualDomesticVolume());
          suggestedUserTransactionInfo.setTransactionPurpose(businessOnboarding.getTransactionPurpose());
          suggestedUserTransactionInfo.setAnnualDomesticTransactionAmount("N/A");

          business.setTargetCustomers(businessOnboarding.getTargetCustomers());
          business.setSuggestedUserTransactionInfo(suggestedUserTransactionInfo);

          // * Step 7: Percent of ownership
          business.getBeneficialOwners(x).removeAll(); // To avoid duplicating on updates
          for ( int i = 1; i <= businessOnboarding.getAmountOfOwners() ; i++ ) {
            business.getBeneficialOwners(x).put((BeneficialOwner) businessOnboarding.getProperty("owner"+i));
          }

          if ( businessOnboarding.getStatus() == net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED )
            business.setOnboarded(true);

          if ( business.getCompliance().equals(ComplianceStatus.NOTREQUESTED) ) {
            business.setCompliance(ComplianceStatus.REQUESTED);
          }

          localBusinessDAO.put(business);

        }

        return getDelegate().put_(x, businessOnboarding);
      `
    }
  ]
});

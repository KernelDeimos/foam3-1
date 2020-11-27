package net.nanopay.fx.afex;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.Country;
import foam.nanos.auth.Region;
import foam.nanos.auth.User;
import foam.nanos.auth.LifecycleState;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.*;
import net.nanopay.contacts.Contact;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.model.BeneficialOwner;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessDirector;
import net.nanopay.model.BusinessSector;
import net.nanopay.model.BusinessType;
import net.nanopay.model.JobTitle;
import net.nanopay.model.PadCapture;
import net.nanopay.model.PersonalIdentification;
import net.nanopay.partner.afex.AFEXDigitalAccount;
import net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding;
import net.nanopay.payment.Institution;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class AFEXServiceProvider extends ContextAwareSupport implements FXService, PaymentService {

  private  AFEX afexClient;
  protected DAO fxQuoteDAO_;
  private  X x;
  private final Logger logger_;

  public AFEXServiceProvider(X x, final AFEX afexClient) {
    this.afexClient = afexClient;
    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    this.x = x;
    this.logger_ = (Logger) x.get("logger");
  }

  public boolean onboardBusiness(BankAccount bankAccount) {
    Business business = (Business) ((DAO) this.x.get("localBusinessDAO")).find(bankAccount.getOwner());
    return onboardBusiness(business);
  }

  public boolean onboardBusiness(Business business) throws RuntimeException {
    if ( business == null ||  ! business.getCompliance().equals(ComplianceStatus.PASSED) ) return false;

    try {
      if  ( business.getOnboarded() ) {
        DAO afexBusinessDAO = (DAO) this.x.get("afexBusinessDAO");
        AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));

        User signingOfficer = getSigningOfficer(this.x, business);
        AuthService auth = (AuthService) this.x.get("auth");
          OnboardCorporateClientRequest onboardingRequest = new OnboardCorporateClientRequest();
          Region businessRegion = business.getAddress().findRegionId(this.x);
          Country businessCountry = business.getAddress().findCountryId(this.x);
          if ( afexBusiness != null ) {
            onboardingRequest.setAccountNumber(afexBusiness.getAccountNumber());
          }

          if ( signingOfficer != null ) {
            Boolean useHardCoded = business.getAddress().getCountryId().equals("CA");
            String identificationType = businessCountry == null || businessCountry.getId().equals("CA") ? "Passport"
              : "EmployerIdentificationNumber_EIN"; // Madlen asked it is hardcoded
            String identificationNumber = SafetyUtil.isEmpty(business.getBusinessRegistrationNumber()) ? "N/A"
              : business.getBusinessRegistrationNumber(); // Madlen asked it is hardcoded
            if ( businessRegion != null ) onboardingRequest.setBusinessStateRegion(businessRegion.getRegionCode());
            onboardingRequest.setAccountPrimaryIdentificationExpirationDate("01/01/2099"); // Asked to hardcode this by Madlen(AFEX)
            onboardingRequest.setAccountPrimaryIdentificationNumber( useHardCoded ? "000000000" : identificationNumber);
            onboardingRequest.setAccountPrimaryIdentificationType(useHardCoded ? "BusinessRegistrationNumber" : identificationType);
            if ( businessCountry.getId().equals("US") ) onboardingRequest.setTaxIdentificationNumber(business.getTaxIdentificationNumber());
            if ( businessCountry != null ) onboardingRequest.setBusinessCountryCode(businessCountry.getCode());
            if ( businessRegion != null ) onboardingRequest.setBusinessStateRegion(businessRegion.getRegionCode());
            onboardingRequest.setBusinessAddress1(business.getAddress().getAddress());
            onboardingRequest.setBusinessCity(business.getAddress().getCity());

            if ( businessCountry != null )
              onboardingRequest.setAccountPrimaryIdentificationIssuer( useHardCoded ? "Canada" : businessCountry.getName());
            onboardingRequest.setBusinessName(business.getBusinessName());
            onboardingRequest.setBusinessZip(business.getAddress().getPostalCode());
            onboardingRequest.setCompanyType(getAFEXCompanyType(business.getBusinessTypeId()));
            onboardingRequest.setContactBusinessPhone(business.getPhoneNumber());
            String businessRegDate = null;
            try {
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
              sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
              businessRegDate = sdf.format(business.getBusinessRegistrationDate());
            } catch(Throwable t) {
              logger_.error("Error onboarding business. Error parsing business registration date.", t);
              throw new RuntimeException("Error onboarding business. Error parsing business registration date.");
            }
            onboardingRequest.setDateOfIncorporation(businessRegDate);
            onboardingRequest.setFirstName(signingOfficer.getFirstName());
            onboardingRequest.setGender("Male"); // TO be removed in API by AFEX
            onboardingRequest.setLastName(signingOfficer.getLastName());
            onboardingRequest.setPrimaryEmailAddress(signingOfficer.getEmail());
            Address contactAddress = signingOfficer.getAddress();
            if ( contactAddress != null ) {
              onboardingRequest.setContactAddress1(contactAddress.getAddress());
              onboardingRequest.setContactCity(contactAddress.getCity());
              Region region = contactAddress.findRegionId(this.x);
              if ( region != null ) onboardingRequest.setContactStateRegion(region.getRegionCode());
              Country country = contactAddress.findCountryId(this.x);
              if ( country != null ) onboardingRequest.setContactCountryCode(country.getCode());
              onboardingRequest.setContactZip(contactAddress.getPostalCode());
            }

            try {
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
              sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
              onboardingRequest.setDateOfBirth(sdf.format(signingOfficer.getBirthday()));
            } catch(Throwable t) {
              logger_.error("Error onboarding business. Cound not parse signing officer birthday", t);
              throw new RuntimeException("Error onboarding business. Cound not parse signing officer birthday.");
            }
            JobTitle jobTitle = (JobTitle) ((DAO) this.x.get("jobTitleDAO")).find(EQ(JobTitle.NAME, signingOfficer.getJobTitle()));
            String jobTitleName = jobTitle == null ? "Other" : jobTitle.getName();
            onboardingRequest.setJobTitle(jobTitleName);
            onboardingRequest.setExpectedMonthlyPayments(mapAFEXTransactionCount(business.getSuggestedUserTransactionInfo().getAnnualTransactionFrequency()));
            onboardingRequest.setExpectedMonthlyVolume(mapAFEXVolumeEstimates(business.getSuggestedUserTransactionInfo().getAnnualDomesticVolume()));
            onboardingRequest.setDescription(business.getSuggestedUserTransactionInfo().getTransactionPurpose());

            BusinessSector businessSector = (BusinessSector) ((DAO) this.x.get("businessSectorDAO")).find(business.getBusinessSectorId());
            if ( businessSector != null ) onboardingRequest.setNAICS(businessSector.getName());

            if ( ! SafetyUtil.isEmpty(business.getOperatingBusinessName()) ) {
              onboardingRequest.setTradeName(business.getOperatingBusinessName());
            } else {
              onboardingRequest.setTradeName(business.getOrganization());
            }
            onboardingRequest.setTermsAndConditions("true");
            OnboardCorporateClientResponse newClient = afexClient.onboardCorporateClient(onboardingRequest, business.getSpid());
            if ( newClient != null && afexBusiness == null ) {
              afexBusiness  = new AFEXBusiness();
              afexBusiness.setUser(business.getId());
              afexBusiness.setApiKey(newClient.getAPIKey());
              afexBusiness.setAccountNumber(newClient.getAccountNumber());
              afexBusinessDAO.put(afexBusiness);
            }
            return true;
          }
      }

    } catch(Exception e) {
      logger_.error("Failed to onboard client to AFEX.", e);
    }

    return false;

  }

  public void pushSigningOfficers(Business business, String clientKey) {
    if ( business == null ) return;
    List<User> signingOfficers = ((ArraySink) business.getSigningOfficers(x).getDAO().select(new ArraySink())).getArray();

    for ( User officer : signingOfficers ) {
      pushSigningOfficer(business, officer, clientKey);
    }
  }

  public void pushSigningOfficer(Business business, User officer, String clientKey) {
    AddCompanyOfficerRequest request = new AddCompanyOfficerRequest();
    request.setApiKey(clientKey);
    request.setFirstName(officer.getFirstName());
    request.setLastName(officer.getLastName());
    int ownership = getSigningOfficerOwnershipPercentage(business, officer);
    request.setPercentOwnership(String.valueOf(ownership));
    request.setDirector("true");
    try {
      SimpleDateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
      dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
      request.setDateOfBirth(dateFormat.format(officer.getBirthday()));
    } catch(Exception e) {
      logger_.error("Failed parse beneficial owner birthday.", e);
    }
    Address address = officer.getAddress();
    if ( address != null ) {
      request.setAddress1(address.getAddress());
      request.setCity(address.getCity());
      request.setCountryCode(address.getCountryId());
      Region region = address.findRegionId(this.x);
      if ( null != region )request.setStateRegion(region.getRegionCode());
      request.setZip(address.getPostalCode());
    }

    PersonalIdentification identification = officer.getIdentification();
    if ( identification != null ) {
      request.setCompanyOfficerIdentificationIssuingType(getAFEXIdentificationType(identification.getIdentificationTypeId()));
      request.setCompanyOfficerIdentificationNumber(identification.getIdentificationNumber());
      request.setCompanyOfficerIdentificationIssuingCountry(identification.getCountryId());
      String regionId = identification.getRegionId() != null ?
        identification.getRegionId().substring(3,identification.getRegionId().length()) : "";
      request.setCompanyOfficerIdentificationIssuingRegion(regionId);
      try {
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
        dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        request.setCompanyOfficerIdentificationExpirationDate(dateFormat.format(identification.getExpirationDate()));
      } catch(Exception e) {
        logger_.error("Failed parse company officer identification expiration date.", e);
      }
    }

    addCompanyOfficer(request, business.getSpid());
  }

  private int getSigningOfficerOwnershipPercentage(Business business, User officer) {
    if ( business == null ) return 0;
    List<BeneficialOwner> beneficialOwners = ((ArraySink) business.getBeneficialOwners(x)
      .select(new ArraySink())).getArray();
      for ( BeneficialOwner beneficialOwner : beneficialOwners ) {
        if ( beneficialOwner.getFirstName().equals(officer.getFirstName())
            && beneficialOwner.getLastName().equals(officer.getLastName()) )
          return beneficialOwner.getOwnershipPercent();
      }
      return 1; // AFEX work arround to return 1 where there is no ownership percentage
  }

  public void pushBeneficialOwners(Business business, String clientKey) {
    if ( business == null ) return;
    List<BeneficialOwner> beneficialOwners = ((ArraySink) business.getBeneficialOwners(x)
      .select(new ArraySink())).getArray();

    for ( BeneficialOwner beneficialOwner : beneficialOwners ) {
      if ( beneficialOwner.getOwnershipPercent() >= 25 ) { // Only push when ownership percentage is greater than 25
        pushBeneficialOwner(beneficialOwner, clientKey, business.getSpid());
      }
    }
  }

  public void pushBeneficialOwner(BeneficialOwner beneficialOwner, String clientKey, String spid) {
    AddCompanyOfficerRequest request = new AddCompanyOfficerRequest();
    request.setApiKey(clientKey);
    request.setFirstName(beneficialOwner.getFirstName());
    request.setLastName(beneficialOwner.getLastName());
    request.setPercentOwnership(String.valueOf(beneficialOwner.getOwnershipPercent()));
    request.setDirector("false");
    try {
      SimpleDateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
      dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
      request.setDateOfBirth(dateFormat.format(beneficialOwner.getBirthday()));
    } catch(Exception e) {
      logger_.error("Failed parse beneficial owner birthday.", e);
    }
    Address address = beneficialOwner.getAddress();
    if ( address != null ) {
      request.setAddress1(address.getAddress());
      request.setCity(address.getCity());
      request.setCountryCode(address.getCountryId());
      Region region = address.findRegionId(this.x);
      if ( region != null )request.setStateRegion(region.getRegionCode());
      request.setZip(address.getPostalCode());
    }

    addCompanyOfficer(request, spid);
  }

  public void pushBusinessDirectors(Business business, String clientKey) {
    if ( business == null ) return;
    for ( BusinessDirector director : business.getBusinessDirectors() ) {
      pushBusinessDirector(business, director, clientKey, business.getSpid());
    }
  }

  public void pushBusinessDirector(Business business, BusinessDirector director, String clientKey, String spid) {
    if ( business == null || director == null ) return;

    if ( directorIsBeneficialOwner(business, director) ) return; // We already pushed beneficial owners

    AddCompanyOfficerRequest request = new AddCompanyOfficerRequest();
    request.setApiKey(clientKey);
    request.setFirstName(director.getFirstName());
    request.setLastName(director.getLastName());
    request.setPercentOwnership("1"); // AFEX work arround to return 1 where there is no ownership percentage
    request.setDirector("true");
    addCompanyOfficer(request, spid);
  }

  private boolean directorIsBeneficialOwner(Business business, BusinessDirector director) {
    boolean isBeneficialOwner = false;
    List<BeneficialOwner> beneficialOwners = ((ArraySink) business.getBeneficialOwners(x)
    .select(new ArraySink())).getArray();
    for ( BeneficialOwner beneficialOwner : beneficialOwners ) {
      if ( beneficialOwner.getFirstName().equals(director.getFirstName())
          && beneficialOwner.getLastName().equals(director.getLastName()) )
        isBeneficialOwner = true;
    }
    return isBeneficialOwner;
  }

  public void addCompanyOfficer(AddCompanyOfficerRequest request, String spid) {
    try {
      afexClient.addCompanyOfficer(request, spid);
    } catch(Exception e) {
      logger_.error("Failed to push beneficial owner: " + request.getFirstName(), e);
    }
  }

  public boolean isFXEnrolled(Business business, User signingOfficer) {
    Address businessAddress = business.getAddress();
    if ( businessAddress == null || SafetyUtil.isEmpty(businessAddress.getCountryId()) ) return false;

    if ( "US".equals(businessAddress.getCountryId()) ) return true;

    if ( signingOfficer == null  ) return false;

    DAO canadaUsBusinessOnboardingDAO = (DAO) x.get("canadaUsBusinessOnboardingDAO");
    CanadaUsBusinessOnboarding c = (CanadaUsBusinessOnboarding) canadaUsBusinessOnboardingDAO.find(AND(
      EQ(CanadaUsBusinessOnboarding.USER_ID, signingOfficer.getId()),
      EQ(CanadaUsBusinessOnboarding.BUSINESS_ID, business.getId()),
      EQ(CanadaUsBusinessOnboarding.STATUS, net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED)
    ));
    return c != null;
  }

  public Boolean directDebitEnrollment (Business business, BankAccount bankAccount) {
    AFEXBusiness afexBusiness = getAFEXBusiness(x, business.getId());
    if ( afexBusiness ==  null ) {
      return false;
    }
    DAO padDAO = (DAO) x.get("padCaptureDAO");
    ArraySink sink = new ArraySink();
    PadCapture pad = null;
    padDAO.where(EQ(PadCapture.ACCOUNT_NUMBER, bankAccount.getAccountNumber())).select(sink);
    if ( sink.getArray().size() > 0 ) {
      pad = (PadCapture) sink.getArray().get(0);
    } else {
      return false;
    }
    FindBankByNationalIDResponse bankResponse = getBankInformation(x, afexBusiness.getApiKey(), bankAccount, business.getSpid());
    DirectDebitEnrollmentRequest directDebitEnrollmentRequest = new DirectDebitEnrollmentRequest.Builder(x)
      .setAccountNumber(bankAccount.getAccountNumber())
      .setAccountOwnerFirstName(pad.getFirstName())
      .setAccountOwnerLastName(pad.getLastName())
      .setAPIKey(afexBusiness.getApiKey())
      .setBankDetailsVerified(bankAccount.getStatus() == BankAccountStatus.VERIFIED)
      .setBankName(bankResponse != null ? bankResponse.getInstitutionName() : bankAccount.findInstitution(x).getName())
      .setCurrency(bankAccount.getDenomination())
      .build();
    if ( bankAccount instanceof CABankAccount ) {
      directDebitEnrollmentRequest.setBankRoutingCode("0" + bankAccount.getInstitutionNumber() + bankAccount.getBranchId());
    } else if ( bankAccount instanceof USBankAccount ) {
      directDebitEnrollmentRequest.setBankRoutingCode(bankAccount.getBranchId());
    }

    String directDebitEnrollmentResponse = afexClient.directDebitEnrollment(directDebitEnrollmentRequest, business.getSpid());

    if ( ! directDebitEnrollmentResponse.equals("\"This account is submitted to enroll in Direct Debit.\"") ) {
      logger_.error("Error creating direct debit account for business " + business.getId(), directDebitEnrollmentRequest, directDebitEnrollmentResponse);
      return false;
    }
    return true;
  }

  public String getClientAccountStatus(AFEXBusiness afexBusiness) throws RuntimeException {
    String status = null;
    if ( afexBusiness == null ) return null;
    User user = User.findUser(x, afexBusiness.getUser());
    try {
      GetClientAccountStatusResponse response = this.afexClient.getClientAccountStatus(afexBusiness.getApiKey(), user.getSpid());
      if ( response != null ) {
        status = response.getAccountStatus();
      }
    } catch(Throwable t) {
      logger_.error("Error getting afex business compliance status.", t);
    }
    return status;
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,  long destinationAmount,
    String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();
    User userObj = User.findUser(x, user);
    GetQuoteRequest quoteRequest = new GetQuoteRequest();
    boolean isAmountSettlement = sourceAmount > 0 ? true : false;
    Long amount = isAmountSettlement ? sourceAmount : destinationAmount;
    quoteRequest.setAmount(String.valueOf(toDecimal(amount)));
    quoteRequest.setCurrencyPair(targetCurrency + sourceCurrency);

    AFEXBusiness business = this.getAFEXBusiness(x, user);
    if ( business == null ) {
      throw new RuntimeException("No afexBusiness found for user " + user);
    }
    quoteRequest.setValueDate(getValueDate(targetCurrency, sourceCurrency, business.getApiKey(), userObj.getSpid()));
    quoteRequest.setClientAPIKey(business.getApiKey());

    if ( SafetyUtil.isEmpty(quoteRequest.getClientAPIKey()) ) {
      throw new RuntimeException("No ClientAPIKey set");
    }
    try {
      Quote quote = this.afexClient.getQuote(quoteRequest, userObj.getSpid());
      if ( null != quote ) {
        Double fxAmount = isAmountSettlement ? getConvertedAmount(quote,sourceAmount, true):  getConvertedAmount(quote,destinationAmount, false);
        fxQuote.setRate(quote.getTerms().equals("A") ? quote.getInvertedRate(): quote.getRate());
        fxQuote.setTargetAmount(isAmountSettlement ? fromDecimal(fxAmount) : destinationAmount);
        fxQuote.setTargetCurrency(targetCurrency);
        fxQuote.setSourceAmount(isAmountSettlement ? sourceAmount : fromDecimal(fxAmount));
        fxQuote.setSourceCurrency(sourceCurrency);
        fxQuote.setValueDate(quote.getValueDate());
        fxQuote.setExternalId(quote.getQuoteId());
        fxQuote.setHasSourceAmount(isAmountSettlement);

        LocalDateTime time;
        AFEXCredentials credentials = (AFEXCredentials) getX().get("AFEXCredentials");
        if ( credentials != null && credentials.getQuoteExpiryTime() != 0 ) {
          time = LocalDateTime.now().plusSeconds(credentials.getQuoteExpiryTime());
        } else {
          time = LocalDateTime.now().plusSeconds(30);
        }
        fxQuote.setExpiryTime(Date.from( time.atZone( ZoneId.systemDefault()).toInstant()));
        fxQuote = (FXQuote) fxQuoteDAO_.put_(x, fxQuote);
      }

    } catch(Exception e) {
      logger_.error("Error to get FX Rate from AFEX.", e);
    }

    return fxQuote;
  }

  public double getFXSpotRate(String sourceCurrency, String targetCurrency, long userId) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    GetRateRequest rateRequest = new GetRateRequest();
    rateRequest.setCurrencyPair(targetCurrency + sourceCurrency);
    try {
      GetRateResponse rateResponse = this.afexClient.getSpotRate(rateRequest, user.getSpid());
      if ( null == rateResponse ) throw new RuntimeException("Unable to get spot rates from AFEX");
      return "A".equals(rateResponse.getTerms()) ? rateResponse.getInvertedRate() : rateResponse.getRate();
    } catch(Exception e) {
      logger_.error("Error to get FX Rate from AFEX.", e);
      throw(e);
    }
  }

  private Double getConvertedAmount(Quote quote, long amount, Boolean isSettlementAmount ) {
    if ( isSettlementAmount ) {
      if (quote.getTerms().equals("A")) {
        return toDecimal(amount) / quote.getRate();
      } else {
        return toDecimal(amount) * quote.getRate();
      }
    } else {
      if (quote.getTerms().equals("A")) {
        return toDecimal(amount) * quote.getRate();
      } else {
        return toDecimal(amount) / quote.getRate();
      }
    }
  }

  private String getValueDate(String targetCurrency, String sourceCurrency, String apiKey, String spid) {
    String valueDate = null;
    try {
      valueDate = this.afexClient.getValueDate(targetCurrency + sourceCurrency, "SPOT", apiKey, spid);
    } catch(Exception e) {
      // Log here
    }
    return valueDate;
  }

  public boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    // TODO: Decide whether to create Trade here?
    return true;
  }

  public void addPayee(long userId, String bankAccountId, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    // Check if business address is set and not empty
    Address userAddress = new Address();
    if ( user instanceof Contact ) {
      Contact contact = (Contact) user;
      if ( contact.getBusinessAddress() != null && ! SafetyUtil.equals((contact.getBusinessAddress()).getCountryId(), "") ) {
        userAddress = ((Contact) user).getBusinessAddress();
      }
    } else if (user.getAddress() != null && ! SafetyUtil.equals((user.getAddress()).getCountryId(), "") ){
      userAddress = user.getAddress();
    }
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );

    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    AFEXBusiness afexBusiness = getAFEXBusiness(x, sourceUser);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + sourceUser);

    Address bankAddress = bankAccount.getAddress() == null ? bankAccount.getBankAddress() : bankAccount.getAddress();
    FindBankByNationalIDResponse bankInformation = getBankInformation(x,afexBusiness.getApiKey(),bankAccount, user.getSpid());
    if ( null == bankAddress ) {
      bankAddress = new Address.Builder(x)
        .setCountryId(bankAccount.getCountry())
        .build();
    }

    if ( SafetyUtil.isEmpty(bankAddress.getCountryId()) ) {
      bankAddress.setCountryId(bankAccount.getCountry());
    }

    // Check payee does not already exists on AFEX
    FindBeneficiaryResponse beneficiaryResponse = findBeneficiary(userId,afexBusiness.getApiKey(), user.getSpid());
    if ( null == beneficiaryResponse ) {
      String allowedChars = "[^a-zA-Z0-9,.+()?/:‘\\s-]";
      String beneficiaryName = SafetyUtil.isEmpty(user.getOrganization()) ? user.getBusinessName() : user.getOrganization();
      beneficiaryName = beneficiaryName != null ? beneficiaryName.replaceAll(allowedChars,"") : "";
      String bankName = bankInformation != null ? bankInformation.getInstitutionName() : bankAccount.getName();
      CreateBeneficiaryRequest createBeneficiaryRequest = new CreateBeneficiaryRequest();
      createBeneficiaryRequest.setBankAccountNumber(bankAccount.getAccountNumber());
      createBeneficiaryRequest.setBankCountryCode(bankAddress.getCountryId());
      createBeneficiaryRequest.setBankName(bankName);
      String bankRoutingCode = bankAccount.getRoutingCode(this.x);
      if ( bankAccount instanceof CABankAccount) {
        bankRoutingCode = "0" + bankAccount.getBankCode() + bankRoutingCode;
      }
      if ( ! SafetyUtil.isEmpty(bankAccount.getBankCode()) ) {
        createBeneficiaryRequest.setBankSWIFTBIC(bankAccount.getBankCode());
        createBeneficiaryRequest.setBankAccountNumber(bankAccount.getIban());
      }
      createBeneficiaryRequest.setBankRoutingCode(bankRoutingCode);
      createBeneficiaryRequest.setBeneficiaryAddressLine1(userAddress.getAddress().replace("#", ""));
      createBeneficiaryRequest.setBeneficiaryCity(userAddress.getCity());
      createBeneficiaryRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
      createBeneficiaryRequest.setBeneficiaryName(beneficiaryName);
      createBeneficiaryRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
      Region region = userAddress.findRegionId(this.x);
      if ( region != null ) createBeneficiaryRequest.setBeneficiaryRegion(region.getRegionCode());
      createBeneficiaryRequest.setCurrency(bankAccount.getDenomination());
      createBeneficiaryRequest.setVendorId(String.valueOf(userId));
      createBeneficiaryRequest.setClientAPIKey(afexBusiness.getApiKey());

      try {
        CreateBeneficiaryResponse createBeneficiaryResponse = this.afexClient.createBeneficiary(createBeneficiaryRequest, user.getSpid());
        if ( null == createBeneficiaryResponse ) throw new RuntimeException("Null response got for remote system." );
        if ( createBeneficiaryResponse.getCode() != 0 ) throw new RuntimeException("Unable to create Beneficiary at this time. " +  createBeneficiaryResponse.getInformationMessage());
        addBeneficiary(x, userId, sourceUser, createBeneficiaryResponse.getStatus());
      } catch(Throwable t) {
        logger_.error("Error creating AFEX beneficiary.", t);
      }
    } else {
      addBeneficiary(x, userId, sourceUser, beneficiaryResponse.getStatus());
    }
  }

  public FindBeneficiaryResponse findBeneficiary(long beneficiaryId, String clientApiKey, String spid) {
    FindBeneficiaryRequest findBeneficiaryRequest = new FindBeneficiaryRequest();
    findBeneficiaryRequest.setVendorId(String.valueOf(beneficiaryId));
    findBeneficiaryRequest.setClientAPIKey(clientApiKey);
    FindBeneficiaryResponse beneficiaryResponse = null;
    try {
      beneficiaryResponse = this.afexClient.findBeneficiary(findBeneficiaryRequest, spid);
    } catch(Throwable t) {
      logger_.debug("A beneficiary does not exist for: " + beneficiaryId);
    }
    return beneficiaryResponse;
  }

  private AFEXBeneficiary addBeneficiary(X x, long beneficiaryId, long ownerId, String status) {
    return addBeneficiary(x, beneficiaryId, ownerId, status, false);
  }

  private AFEXBeneficiary addBeneficiary(X x, long beneficiaryId, long ownerId, String status, boolean isInstantBeneficiary) {
    DAO afexBeneficiaryDAO = ((DAO) x.get("afexBeneficiaryDAO")).inX(x);
    AFEXBeneficiary afexBeneficiary = (AFEXBeneficiary) afexBeneficiaryDAO.find(
      AND(
        EQ(AFEXBeneficiary.CONTACT, beneficiaryId),
        EQ(AFEXBeneficiary.OWNER, ownerId),
        EQ(AFEXBeneficiary.IS_INSTANT_BENEFICIARY, isInstantBeneficiary)
      )
    );

    if ( null == afexBeneficiary ) {
      afexBeneficiary = new AFEXBeneficiary();
    }
    afexBeneficiary = (AFEXBeneficiary) afexBeneficiary.fclone();
    afexBeneficiary.setId(afexBeneficiary.getId());
    afexBeneficiary.setContact(beneficiaryId);
    afexBeneficiary.setOwner(ownerId);
    afexBeneficiary.setStatus(status);
    afexBeneficiary.setIsInstantBeneficiary(isInstantBeneficiary);
    return (AFEXBeneficiary) afexBeneficiaryDAO.put(afexBeneficiary);
  }

  public void updatePayee(long userId, String bankAccountId, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    Address userAddress = user.getAddress();
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );

    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    Address bankAddress = bankAccount.getAddress() == null ? bankAccount.getBankAddress() : bankAccount.getAddress();
    if ( null == bankAddress ) throw new RuntimeException("Bank Account Address is null " + bankAccountId );

    AFEXBusiness afexBusiness = getAFEXBusiness(x, sourceUser);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + sourceUser);

    FindBankByNationalIDResponse bankInformation = getBankInformation(x,afexBusiness.getApiKey(),bankAccount, user.getSpid());
    String bankName = bankInformation != null ? bankInformation.getInstitutionName() : bankAccount.getName();

    String allowedChars = "[^a-zA-Z0-9,.+()?/:‘\\s-]";
    String beneficiaryName = user.getBusinessName().replaceAll(allowedChars,"");;
    UpdateBeneficiaryRequest updateBeneficiaryRequest = new UpdateBeneficiaryRequest();
    updateBeneficiaryRequest.setBankAccountNumber(bankAccount.getAccountNumber());
    updateBeneficiaryRequest.setBankCountryCode(bankAddress.getCountryId());
    updateBeneficiaryRequest.setBankName(bankName);
    String bankRoutingCode = bankAccount.getRoutingCode(this.x);
    if ( bankAccount instanceof CABankAccount) {
      bankRoutingCode = "0" + bankAccount.getBankCode() + bankRoutingCode;
    }
    updateBeneficiaryRequest.setBankRoutingCode(bankRoutingCode);
    updateBeneficiaryRequest.setBeneficiaryAddressLine1(bankAddress.getAddress());
    updateBeneficiaryRequest.setBeneficiaryCity(userAddress.getCity());
    updateBeneficiaryRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
    updateBeneficiaryRequest.setBeneficiaryName(beneficiaryName);
    updateBeneficiaryRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
    Region region = userAddress.findRegionId(this.x);
    updateBeneficiaryRequest.setBeneficiaryRegion(region.getRegionCode());
    updateBeneficiaryRequest.setCurrency(bankAccount.getDenomination());
    updateBeneficiaryRequest.setVendorId(String.valueOf(userId));
    updateBeneficiaryRequest.setClientAPIKey(afexBusiness.getApiKey());

    try {
      UpdateBeneficiaryResponse updateBeneficiaryResponse = this.afexClient.updateBeneficiary(updateBeneficiaryRequest, user.getSpid());
      if ( null == updateBeneficiaryResponse ) throw new RuntimeException("Null response got for remote system." );
      if ( updateBeneficiaryResponse.getCode() != 0 ) throw new RuntimeException("Unable to update Beneficiary at this time. " +  updateBeneficiaryResponse.getInformationMessage());
      addBeneficiary(x, userId, sourceUser, updateBeneficiaryResponse.getStatus());
    } catch(Throwable t) {
      logger_.error("Error updating AFEX beneficiary.", t);
    }

  }

  private boolean accountDataIsStale(BankAccount bankAccount, AFEXBeneficiary afexBeneficiary) throws RuntimeException {
    if ( null == afexBeneficiary ) return false;
    if ( null == afexBeneficiary.getLastModified() ) return true;
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account for: " + afexBeneficiary.getContact());
    Calendar accountLastModifiedDate = Calendar.getInstance();
    accountLastModifiedDate.setTime(bankAccount.getLastModified());
    Calendar afexBeneficiaryLastModifiedDate = Calendar.getInstance();
    afexBeneficiaryLastModifiedDate.setTime(afexBeneficiary.getLastModified());
    return (accountLastModifiedDate.after(afexBeneficiaryLastModifiedDate));
  }

  public boolean directDebitUnenrollment(Business business, BankAccount bankAccount) {
    AFEXBusiness afexBusiness = getAFEXBusiness(x, business.getId());
    DirectDebitUnenrollmentRequest unenrollmentRequest = new DirectDebitUnenrollmentRequest.Builder(x)
      .setAccountNumber(bankAccount.getAccountNumber())
      .setApiKey(afexBusiness.getApiKey())
      .setCurrency(bankAccount.getDenomination())
      .build();

    String response = afexClient.directDebitUnenrollment(unenrollmentRequest, business.getSpid());

    return false;
  }

  public void deletePayee(long payeeUserId, long payerUserId) throws RuntimeException {
    AFEXBusiness afexBusiness = getAFEXBusiness(x, payerUserId);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + payerUserId);
    User user = User.findUser(x, payerUserId);
    try{
      DisableBeneficiaryRequest request = new DisableBeneficiaryRequest();
      request.setClientAPIKey(afexBusiness.getApiKey());
      request.setVendorId(String.valueOf(payeeUserId));
      this.afexClient.disableBeneficiary(request, user.getSpid());
      DAO afexBeneficiaryDAO = ((DAO) x.get("afexBeneficiaryDAO")).inX(x);
      AFEXBeneficiary afexBeneficiary = (AFEXBeneficiary) afexBeneficiaryDAO.find(AND(
        EQ(AFEXBeneficiary.CONTACT, payeeUserId),
        EQ(AFEXBeneficiary.OWNER, payerUserId)
      ));
      if ( afexBeneficiary != null ) afexBeneficiaryDAO.remove(afexBeneficiary);

    } catch(Throwable t) {
      logger_.error("Unexpected error disabling AFEX Beneficiary history record.", t);
    }
  }

  public int createTrade(Transaction transaction) throws  RuntimeException {
    DAO txnDAO = (DAO) x.get("localTransactionDAO");

    if ( ! (transaction instanceof AFEXTransaction) ) {
      logger_.error("Transaction id: " + transaction.getId() + " not an instance of AFEXTransaction.");
      throw new RuntimeException("Transaction id: " + transaction.getId() + " not an instance of AFEXTransaction.");
    }
    AFEXTransaction afexTransaction = (AFEXTransaction) transaction;

    AFEXBusiness afexBusiness = getAFEXBusiness(x,afexTransaction.getPayerId());
    if ( null == afexBusiness ) {
      logger_.error("Business has not been completely onboarded on partner system. " + transaction.getPayerId());
      throw new RuntimeException("Business has not been completely onboarded on partner system. " + transaction.getPayerId());
    }

    AFEXBeneficiary afexBeneficiary = getOrCreateAFEXBeneficiary(x,afexTransaction.getPayeeId(), afexTransaction.getPayerId());
    if ( null == afexBeneficiary ) {
      logger_.error("Contact has not been completely onboarded on partner system as a Beneficiary. " + transaction.getPayerId());
      throw new RuntimeException("Contact has not been completely onboarded on partner system as a Beneficiary. " + transaction.getPayerId());
    }

    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(afexTransaction.getFxQuoteId()));
    if  ( null == quote ) {
      logger_.error("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());
      throw new RuntimeException("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());
    }

    User user = User.findUser(x, transaction.getPayerId());
    long tradeAmount = 0;
    tradeAmount =  afexTransaction.getDestinationAmount();
    CreateTradeRequest createTradeRequest = new CreateTradeRequest();
    createTradeRequest.setClientAPIKey(afexBusiness.getApiKey());
    createTradeRequest.setAmount(String.valueOf(toDecimal(tradeAmount)));
    createTradeRequest.setIsAmountSettlement(String.valueOf(false));
    createTradeRequest.setSettlementCcy(afexTransaction.getSourceCurrency());
    createTradeRequest.setTradeCcy(afexTransaction.getDestinationCurrency());
    createTradeRequest.setQuoteID(quote.getExternalId());
    Account srcAccount = transaction.findSourceAccount(x);
    if ( srcAccount instanceof BankAccount ) {
      createTradeRequest.setAccountNumber(((BankAccount)srcAccount).getAccountNumber());
      createTradeRequest.setNote(((BankAccount)srcAccount).getAccountNumber() + ", " + ((BankAccount)srcAccount).getDenomination());
    } else {
      createTradeRequest.setAccountNumber(((AFEXDigitalAccount)srcAccount).getId()+"");
      createTradeRequest.setNote(((AFEXDigitalAccount)srcAccount).getId() + ", " + ((AFEXDigitalAccount)srcAccount).getDenomination());
    }
    createTradeRequest.setValueDate(quote.getValueDate().toString());

    try {
      CreateTradeResponse tradeResponse = this.afexClient.createTrade(createTradeRequest, user.getSpid());
      if ( null != tradeResponse && tradeResponse.getTradeNumber() > 0 ) {
        DAO traderesponseDAO = (DAO) x.get("afexTradeResponseDAO");
        traderesponseDAO.put(tradeResponse);

      return tradeResponse.getTradeNumber();

      }
    } catch(Throwable t) {
      logger_.error("Error creating AFEX Trade.", t);
      throw new RuntimeException(t);
    }
    logger_.error("Unable to create Trade for  " + afexTransaction.getFxQuoteId());
    throw new RuntimeException("Unable to create Trade for  " + afexTransaction.getFxQuoteId());
  }

  public AFEXFundingTransaction submitInstantPayment(AFEXFundingTransaction txn) {

    Account destinationAccount = txn.findDestinationAccount(x);
    Account sourceAccount = txn.findSourceAccount(x);
    AFEXBeneficiary afexBeneficiary = getAFEXBeneficiary(x, destinationAccount.getOwner(), destinationAccount.getOwner(), true);

    User user = User.findUser(x, txn.findDestinationAccount(x).getOwner());
    CreatePaymentRequest createPaymentRequest = new CreatePaymentRequest();
    createPaymentRequest.setPaymentDate(txn.getValueDate());
    createPaymentRequest.setAmount(String.valueOf(txn.getAmount()));
    createPaymentRequest.setCurrency(txn.getSourceCurrency());
    createPaymentRequest.setVendorId(String.valueOf(afexBeneficiary.getContact()));
    try {
      CreatePaymentResponse paymentResponse = this.afexClient.createPayment(createPaymentRequest, user.getSpid());
      if ( paymentResponse != null && paymentResponse.getReferenceNumber() > 0 ) {
        txn = (AFEXFundingTransaction) txn.fclone();
        txn.setReferenceNumber(String.valueOf(paymentResponse.getReferenceNumber()));
        txn.setCompletionDate(new Date());
        return txn;
      }
    } catch(Throwable t) {
      logger_.error("Error sending payment to AFEX.", t);
      throw new RuntimeException(t);
    }

    return txn;
  }

  public Transaction submitPayment(Transaction transaction) throws RuntimeException {
    if ( ! (transaction instanceof AFEXTransaction) ) return transaction;

    AFEXTransaction afexTransaction = (AFEXTransaction) transaction;
    Account destinationAccount = afexTransaction.findDestinationAccount(x);
    Account sourceAccount = afexTransaction.findSourceAccount(x);

    AFEXBusiness afexBusiness = getAFEXBusiness(x,sourceAccount.getOwner());
    if ( null == afexBusiness ) {
      logger_.error("Business has not been completely onboarded on partner system. " + sourceAccount.getOwner());
      throw new RuntimeException("Business has not been completely onboarded on partner system. " + sourceAccount.getOwner());
    }

    AFEXBeneficiary afexBeneficiary = getAFEXBeneficiary(x, destinationAccount.getOwner(), sourceAccount.getOwner());
    if ( null == afexBeneficiary ) {
      logger_.error("Contact has not been completely onboarded on partner system as a Beneficiary. " + destinationAccount.getOwner());
      throw new RuntimeException("Contact has not been completely onboarded on partner system as a Beneficiary. " + destinationAccount.getOwner());
    }

    // If beneficiary bank account happen to have changed we want to update AFEX Beneficiary
    if ( destinationAccount instanceof BankAccount ) {
      BankAccount beneficiaryBankAccount = (BankAccount) destinationAccount;
      if ( accountDataIsStale(beneficiaryBankAccount, afexBeneficiary) ) {
        try {
          updatePayee(afexTransaction.getPayeeId(), beneficiaryBankAccount.getId(), afexTransaction.getPayerId());
        } catch(Throwable t) {
          logger_.error("Bank account details is stale but unable to update afex beneficiary." );
        }
      }
    }


    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(afexTransaction.getFxQuoteId()));
    if  ( null == quote ) {
      logger_.error("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());
      throw new RuntimeException("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());
    }

    DAO traderesponseDAO = (DAO) x.get("afexTradeResponseDAO");
    CreateTradeResponse tradeResponse = (CreateTradeResponse) traderesponseDAO.find(EQ(CreateTradeResponse.TRADE_NUMBER, afexTransaction.getAfexTradeResponseNumber()));

    if ( null != tradeResponse && tradeResponse.getTradeNumber() > 0 ) {
      User user = User.findUser(x, transaction.findSourceAccount(x).getOwner());
      CreatePaymentRequest createPaymentRequest = new CreatePaymentRequest();
      createPaymentRequest.setClientAPIKey(afexBusiness.getApiKey());
      createPaymentRequest.setPaymentDate(tradeResponse.getValueDate());
      createPaymentRequest.setAmount(String.valueOf(tradeResponse.getAmount()));
      createPaymentRequest.setCurrency(tradeResponse.getTradeCcy());
      createPaymentRequest.setVendorId(String.valueOf(afexBeneficiary.getContact()));
      try {
        CreatePaymentResponse paymentResponse = this.afexClient.createPayment(createPaymentRequest, user.getSpid());
        if ( paymentResponse != null && paymentResponse.getReferenceNumber() > 0 ) {
          AFEXTransaction txn = (AFEXTransaction) afexTransaction.fclone();
          txn.setReferenceNumber(String.valueOf(paymentResponse.getReferenceNumber()));
          try {
            Date valueDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").parse(tradeResponse.getValueDate());
            txn.setCompletionDate(valueDate);
          } catch(Throwable t) {
            logger_.error("Error parsing date.", t);
          }
          return txn;
        }
      } catch(Throwable t) {
        logger_.error("Error sending payment to AFEX.", t);
        throw new RuntimeException(t);
      }
    } else {
      logger_.error("Unable to find afexTradeResponse for transaction id: " + transaction.getId());
      throw new RuntimeException("Unable to find afexTradeResponse for transaction id: " + transaction.getId());
    }

    return afexTransaction;
  }

  public Transaction updatePaymentStatus(Transaction transaction) throws RuntimeException {
  if ( transaction instanceof AFEXTransaction ) {

      AFEXTransaction txn = (AFEXTransaction) transaction.fclone();
      Account srcAccount = txn.findSourceAccount(x);
      AFEXBusiness afexBusiness = getAFEXBusiness(x, srcAccount.getOwner());
      long userId = 0;
      CheckPaymentStatusRequest request = new CheckPaymentStatusRequest();
      if ( txn instanceof AFEXFundingTransaction ) {
        afexBusiness = getAFEXBusiness(x, txn.findDestinationAccount(x).getOwner());
        userId = afexBusiness.getUser();
        request.setClientAPIKey("");
      } else if ( afexBusiness != null ){
        request.setClientAPIKey(afexBusiness.getApiKey());
        userId = transaction.findSourceAccount(x).getOwner();
      } else {
        throw new RuntimeException("Business has not been completely onboarded on partner system. " + transaction.getPayerId());
      }

      request.setId(txn.getReferenceNumber());

      try {
        User user = User.findUser(x, userId);
        CheckPaymentStatusResponse paymentStatusResponse = this.afexClient.checkPaymentStatus(request, user.getSpid());
        if (null == paymentStatusResponse) throw new RuntimeException("Null response got for remote system.");

        txn.setStatus(mapAFEXPaymentStatus(paymentStatusResponse.getPaymentStatus()));
        txn.setAfexPaymentStatus(Enum.valueOf(AFEXPaymentStatus.class, paymentStatusResponse.getPaymentStatus().toUpperCase()));

      } catch (Throwable t) {
        logger_.error("Error updating AFEX transaction status.", t);
      }
      return txn;
    }
    return transaction;
  }

  public TransactionStatus mapAFEXPaymentStatus(String paymentStatus){
    if ( AFEXPaymentStatus.SUBMITTED.getLabel().equals(paymentStatus) )
      return TransactionStatus.COMPLETED;

    if ( AFEXPaymentStatus.APPROVED.getLabel().equals(paymentStatus) )
      return TransactionStatus.COMPLETED;

    if ( AFEXPaymentStatus.PROCESSED.getLabel().equals(paymentStatus) )
      return TransactionStatus.COMPLETED;

    if ( AFEXPaymentStatus.PREPARED.getLabel().equals(paymentStatus) )
      return TransactionStatus.COMPLETED;

    if ( AFEXPaymentStatus.FAILED.getLabel().equals(paymentStatus) )
      return TransactionStatus.DECLINED;

    if ( AFEXPaymentStatus.CANCELLED.getLabel().equals(paymentStatus) )
      return TransactionStatus.DECLINED;

      if ( AFEXPaymentStatus.PREPARED_CANCELLED.getLabel().equals(paymentStatus) )
        return TransactionStatus.DECLINED;

      return TransactionStatus.SENT;

  }

  public FindBankByNationalIDResponse getBankInformation(X x, String clientAPIKey, BankAccount bankAccount, String spid) {
    FindBankByNationalIDResponse bankInformation = null;
    FindBankByNationalIDRequest findBankByNationalIDRequest = new FindBankByNationalIDRequest();
    findBankByNationalIDRequest.setClientAPIKey(clientAPIKey);
    findBankByNationalIDRequest.setCountryCode(bankAccount.getCountry());
    if ( bankAccount instanceof CABankAccount ) {
      String institutionNumber;
      if ( SafetyUtil.isEmpty(bankAccount.getInstitutionNumber()) ) {
        DAO institutionDAO = (DAO) x.get("institutionDAO");
        Institution institution = (Institution) institutionDAO.find(bankAccount.getInstitution());
        institutionNumber = institution.getInstitutionNumber();
      } else {
        institutionNumber = bankAccount.getInstitutionNumber();
      }
      String branchId = SafetyUtil.isEmpty(bankAccount.getBranchId()) ? bankAccount.getRoutingCode(x) : bankAccount.getBranchId();
      findBankByNationalIDRequest.setNationalID("0" + institutionNumber + branchId);
    } else if ( bankAccount instanceof USBankAccount ) {
      findBankByNationalIDRequest.setNationalID(bankAccount.getBranchId());
    } else {
      return null;
    }
    try {
      bankInformation = this.afexClient.findBankByNationalID(findBankByNationalIDRequest, spid);
    } catch(Throwable t) {
      logger_.error("Error finding bank information from AFEX.", t);
    }
    return bankInformation;
  }

  public byte[] getConfirmationPDF(Transaction txn) {
    if ( ! (txn instanceof AFEXTransaction) ) {
      return null;
    }
    AFEXTransaction afexTransaction = (AFEXTransaction) txn;

    AFEXBusiness business = getAFEXBusiness(x, afexTransaction.getPayerId());
    GetConfirmationPDFRequest pdfRequest = new GetConfirmationPDFRequest.Builder(x)
      .setClientAPIKey(business.getApiKey())
      .setTradeNumber(afexTransaction.getAfexTradeResponseNumber()+"")
      .build();
    try {
      User user = User.findUser(x, txn.getPayerId());
      return afexClient.getTradeConfirmation(pdfRequest, user.getSpid());
    } catch (Throwable t) {
      logger_.error("Error getting trade confirmation PDF from AFEX.", t);
    }
    return null;
  }

  public AFEXBusiness getAFEXBusiness(X x, Long userId) {
    DAO dao = (DAO) x.get("afexBusinessDAO");
    return (AFEXBusiness) dao.find(EQ(AFEXBusiness.USER, userId));
  }

  protected AFEXBeneficiary getAFEXBeneficiary(X x, Long beneficiaryId, Long ownerId) {
    return getAFEXBeneficiary(x, beneficiaryId, ownerId, false);
  }

  protected AFEXBeneficiary getAFEXBeneficiary(X x, Long beneficiaryId, Long ownerId, boolean isInstantBeneficiary) {
    DAO dao = (DAO) x.get("afexBeneficiaryDAO");
    return (AFEXBeneficiary) dao.find(AND(
      EQ(AFEXBeneficiary.CONTACT, beneficiaryId),
      EQ(AFEXBeneficiary.OWNER, ownerId),
      EQ(AFEXBeneficiary.IS_INSTANT_BENEFICIARY, isInstantBeneficiary)
    ));
  }

  protected AFEXBeneficiary getOrCreateAFEXBeneficiary(X x, Long beneficiaryId, Long ownerId) {
    AFEXBeneficiary afexBeneficiary = getAFEXBeneficiary(x, beneficiaryId, ownerId);
    if ( afexBeneficiary == null ) {
      DAO localAccountDAO = (DAO) x.get("localAccountDAO");
      BankAccount bankAccount = ((BankAccount) localAccountDAO.find(AND(EQ(BankAccount.OWNER, beneficiaryId), INSTANCE_OF(BankAccount.class), EQ(BankAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE))));
      if ( null != bankAccount ) {
        try {
          addPayee(beneficiaryId, bankAccount.getId(), ownerId);
          afexBeneficiary = getAFEXBeneficiary(x, beneficiaryId, ownerId);
        } catch(Throwable t) {
          ((Logger) x.get("logger")).error("Error getting/creating AFEX Beneficiary.", t);
        }
      }
    }
    return afexBeneficiary;
  }

  protected AFEXFundingBalance getOrCreateFundingBalance(X x, AFEXFundingTransaction transaction) {
    AFEXFundingBalance fundingBalance = getFundingBalance(x, transaction.findDestinationAccount(x).getOwner(), transaction.getSourceCurrency());
    if ( fundingBalance != null ) return fundingBalance;

    return createFundingBalance(x, transaction);
  }

  public AFEXFundingBalance createFundingBalance(X x, AFEXFundingTransaction transaction) throws RuntimeException {

    Long userId = transaction.findDestinationAccount(x).getOwner();
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);
    AFEXBusiness afexBusiness = getAFEXBusiness(x, userId);
    if ( null == afexBusiness ) throw new RuntimeException("User not yet onboarded to payment partner " + userId);

    CreateFundingBalanceRequest request = new CreateFundingBalanceRequest();
    request.setAccountNumber(afexBusiness.getAccountNumber());
    request.setCurrency(transaction.getSourceCurrency());
    request.setClientAPIKey(afexBusiness.getApiKey());
    try {
      CreateFundingBalanceResponse response = afexClient.createFundingBalance(request, user.getSpid());
      if ( response == null ) throw new RuntimeException("Unable to get a valid response from  CreateFundingBalance API" );

      if ( ! response.getIsSuccessful() && response.getMessage().equals("Funding balance already exists.") ) {
        AFEXFundingBalance balance = new AFEXFundingBalance();
        balance.setAlreadyExists(true);
        balance.setUser(userId);
        balance.setAccountId(response.getAccountId());
        balance.setFundingBalanceId(response.getFundingBalanceId());
        balance.setCurrency(transaction.getSourceCurrency());
        return  balance;
      } else if ( ! response.getIsSuccessful() ) {
        throw new RuntimeException("Unable to create funding balance. " + response.getMessage());
      }

      return saveFundingBalance(x, userId, response.getFundingBalanceId(), response.getAccountId(), transaction.getSourceCurrency());
    } catch(Throwable t) {
      logger_.error("Error creating funding balance for user.", t);
      throw new RuntimeException("Error creating funding balance for user. " + t.getMessage());
    }
  }

  protected AFEXFundingBalance saveFundingBalance(X x, long userId, String fundingBalanceId, String accountId, String currency) {
    AFEXFundingBalance fundingBalance = getUserFundingBalance(x, userId, currency);
    if ( null == fundingBalance ) {
      fundingBalance = new AFEXFundingBalance();
    }
    fundingBalance = (AFEXFundingBalance) fundingBalance.fclone();
    fundingBalance.setUser(userId);
    fundingBalance.setAccountId(accountId);
    fundingBalance.setFundingBalanceId(fundingBalanceId);
    fundingBalance.setCurrency(currency);
    return (AFEXFundingBalance) ((DAO) x.get("afexFundingBalanceDAO")).inX(x).put(fundingBalance);
  }

  public AFEXFundingBalance getUserFundingBalance(X x, long userId, String currency) {
    DAO afexFundingBalanceDAO = ((DAO) x.get("afexFundingBalanceDAO")).inX(x);
    return (AFEXFundingBalance) afexFundingBalanceDAO.find(
      AND(
        EQ(AFEXFundingBalance.USER, userId),
        EQ(AFEXFundingBalance.CURRENCY, currency)
      )
    );
  }

  public AFEXFundingBalance getFundingBalance(X x, Long userId, String currency) throws RuntimeException {
    AFEXFundingBalance fundingBalance = getUserFundingBalance(x, userId, currency);
    if ( fundingBalance != null &&  ! SafetyUtil.isEmpty(fundingBalance.getFundingBalanceId()) ) return fundingBalance;

    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    AFEXBusiness afexBusiness = getAFEXBusiness(x, user.getId());
    if ( null == afexBusiness ) throw new RuntimeException("User not yet onboarded to payment partner " + userId);

    try {
      FundingBalance f = afexClient.getFundingBalance(afexBusiness.getApiKey(), currency, user.getSpid());
      if ( f != null )
        return saveFundingBalance(x, userId, f.getFundingBalanceId(), f.getAccountId(), currency);
    } catch(Throwable t) {
      logger_.error("Error creating funding balance for user.", t);
      throw new RuntimeException("Error creating funding balance for user. " + t.getMessage());
    }
    return null;
  }

  public AFEXBeneficiary createInstantBeneficiary(X x, AFEXFundingTransaction transaction) throws RuntimeException {
    long userId = transaction.findDestinationAccount(x).getOwner();
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    AFEXBusiness afexBusiness = getAFEXBusiness(x, user.getId());
    // check if instant beneficiary exists already;
    AFEXBeneficiary afexBeneficiary = getAFEXBeneficiary(x, afexBusiness.getId(), afexBusiness.getId(), true);
    if ( afexBeneficiary != null ) {
      return afexBeneficiary;
    }

    AFEXFundingBalance fundingBalance = getOrCreateFundingBalance(x, transaction);
    if ( fundingBalance == null || SafetyUtil.isEmpty(fundingBalance.getFundingBalanceId())  ) throw new RuntimeException("Unable to find funding balance for user " + userId);

    CreateInstantBenefiaryRequest request = new CreateInstantBenefiaryRequest();
    request.setAccountId(fundingBalance.getAccountId());
    request.setFundingBalanceId(fundingBalance.getFundingBalanceId());
    request.setVendorId(String.valueOf(userId));
    try {
      CreateInstantBenefiaryResponse response = afexClient.createInstantBenefiary(request, user.getSpid());
      if ( response == null ) throw new RuntimeException("Unable to get a valid response from  CreateInstantBeneficiary API" );

      if ( response.getCode() != 0 ) throw new RuntimeException("Unable to create instant beneficiary. " + response.getInformationMessage());

      return addBeneficiary(x, userId, userId, "Active", true);
    } catch(Throwable t) {
      logger_.error("Error creating instant beneficiary " + userId , t);
      throw new RuntimeException("Error creating instant beneficiary. ");
    }
  }

  protected User getSigningOfficer(X x, Business business) {
    java.util.List<User> signingOfficers = ((ArraySink) business.getSigningOfficers(x).getDAO().select(new ArraySink())).getArray();
    return signingOfficers.isEmpty() ? null : signingOfficers.get(0);
  }

  protected String getAFEXIdentificationType(long idType) {
    switch((int)idType) {
      case 1:
        return "DriversLicense";
      case 2:
        return "CitizenshipCard";
      case 3:
        return "Passport";
      default:
        return "Item";
    }
  }

  protected String getAFEXCompanyType(long companyType) {
    switch((int)companyType) {
      case 1:
        return "Sole Proprietorship";
      case 2:
        return "Partnership";
      case 3:
        return "Corporation";
      case 4:
        return "Registered Charity";
      case 5:
        return "Limited Liability Company (LLC)";
      case 6:
        return "Public Limited Company";
      case 7:
        return "Other";
      default:
        return ((BusinessType) ((DAO) this.x.get("businessTypeDAO")).find(companyType)).getName();
    }
  }

  private String mapAFEXVolumeEstimates(String estimates) {
    switch (estimates) {
    case "$0 to $50,000":
      return String.valueOf(50000/12);
    case "$50,001 to $100,000":
      return String.valueOf(100000/12);
    case "$100,001 to $500,000":
      return String.valueOf(500000/12);
    default:
      return String.valueOf(1000000/12);
    }
  }

  private String mapAFEXTransactionCount(String estimates) {
    switch (estimates) {
    case "1 to 99":
      return String.valueOf(99/12);
    case "100 to 199":
      return String.valueOf(199/12);
    case "200 to 499":
      return String.valueOf(499/12);
    case "500 to 999":
      return String.valueOf(999/12);
    default:
      return String.valueOf(1000/12);
    }
  }

  private Double toDecimal(Long amount) {
    BigDecimal x100 = new BigDecimal(100);
    BigDecimal val = BigDecimal.valueOf(amount).setScale(2,BigDecimal.ROUND_HALF_DOWN);
    return val.divide(x100).setScale(2,BigDecimal.ROUND_HALF_DOWN).doubleValue();
  }

  private Long fromDecimal(Double amount) {
    BigDecimal x100 = new BigDecimal(100);
    BigDecimal val = BigDecimal.valueOf(amount).setScale(2,BigDecimal.ROUND_HALF_DOWN);
    return val.multiply(x100).longValueExact();
  }

}

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'XeroIntegrationService',
  documentation: 'Xero Integration functions to synchronizing with xero and verifying if signed in',
  implements: [
    'net.nanopay.integration.IntegrationService'
  ],

  javaImports: [
    'com.xero.api.XeroClient',
    'com.xero.model.*',
    'foam.blob.BlobService',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.*',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'net.nanopay.model.Business',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.Address',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.integration.AccountingBankAccount',
    'net.nanopay.integration.ResultResponse',
    'net.nanopay.integration.xero.model.XeroContact',
    'net.nanopay.integration.xero.model.XeroInvoice',
    'net.nanopay.tx.model.Transaction',
    'java.math.BigDecimal',
    'java.util.ArrayList',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.List'
  ],

  methods: [
    {
      name: 'isSignedIn',
      documentation: `Used to check if the access-token's are expired for the specific users`,
      javaCode:
`User             user         = (User) x.get("user");
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client       = new XeroClient(config);
Logger           logger       = (Logger) x.get("logger");
try {

  // Check that user has accessed xero before
  if ( tokenStorage == null ) {
    return new ResultResponse(false, "User has not connected to Xero");
  }

  client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
  client.getContacts();

  return new ResultResponse(true, "User is Signed in");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "User is not Signed in");
}`
    },
    {
      name: 'syncSys',
      documentation: `Calls the functions that retrieve contacts and invoices. If fails returns error messages for each`,
      javaCode:
`User             user         = (User) x.get("user");
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client       = new XeroClient(config);
Logger           logger       = (Logger) x.get("logger");

try {

  // Check that user has accessed xero before
  if ( tokenStorage == null ) {
    return new ResultResponse(false, "User has not connected to Xero");
  }

  // Configures the client Object with the users token data
  client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

  // Attempts to sync contacts and invoices
  ResultResponse contacts = contactSync(x);
  ResultResponse invoices = invoiceSync(x);
  if ( contacts.getResult() && invoices.getResult() ) {
    return new ResultResponse(true, "All information has been synchronized");
  } else {
    
    // Constructs the error message as a result of the error messages of the other issues from each section
    String str = "" ;
    
    // Error message from contacts
    if ( ! contacts.getResult() ) {
      str+= contacts.getReason();
    }

    //Error message from invoices
    if ( ! invoices.getResult() ) {
      str+= invoices.getReason();
    }
    
    return new ResultResponse(false, str);
  }
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
}`
    },
    {
      name: 'contactSync',
      documentation: `Calls the functions that retrieve customers and vendors. If fails returns error messages for each`,
      javaCode:
`User             user         = (User) x.get("user");
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_      = new XeroClient(config);
DAO              notification = (DAO) x.get("notificationDAO");
Logger           logger       = (Logger) x.get("logger");

// Check that user has accessed xero before
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to Xero");
}

// Configures the client Object with the users token data
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
try {
  List <com.xero.model.Contact> updatedContact = new ArrayList<>();
  DAO                           contactDAO     = (DAO) x.get("contactDAO");
  XeroContact                   xContact;
  Sink                          sink;

  // Go through each xero Contact and assess what should be done with it
  for ( com.xero.model.Contact xeroContact : client_.getContacts() ) {

    // Check if Contact already exists on the portal
    xContact = (XeroContact) contactDAO.find(
      AND(
        EQ(
          XeroContact.XERO_ID,
          xeroContact.getContactID()
        ),
        INSTANCE_OF(XeroContact.class)
      )
    );

    if (xContact == null) {
      // Checks if the required data to become a contact is present in the contact data from Xero.
      // If not sends a notification informing user of missing data
      if ("".equals(xeroContact.getEmailAddress()) || "".equals(xeroContact.getFirstName()) || "".equals(xeroContact.getLastName()) || "".equals(xeroContact.getName())) {
        Notification notify = new Notification();
        notify.setUserId(user.getId());
        notify.setBody(
          "Xero Contact: " + xeroContact.getName() +
            " cannot sync due to the following required fields being empty:" +
            (SafetyUtil.isEmpty(xeroContact.getEmailAddress()) ? "[Email Address]" : "") +
            (SafetyUtil.isEmpty(xeroContact.getFirstName()) ? "[First Name]" : "") +
            (SafetyUtil.isEmpty(xeroContact.getLastName()) ? "[LastName]" : "") + ".");
        notification.put(notify);
        continue;
      }
      xContact = new XeroContact();

    } else {
      xContact = (XeroContact) xContact.fclone();
    }

    /*
     * Address integration
     */
    if (xeroContact.getAddresses() != null &&
      xeroContact.getAddresses().getAddress().size() != 0) {

      foam.nanos.auth.CountryService countryService = (foam.nanos.auth.CountryService) getX().get("countryService");
      foam.nanos.auth.RegionService regionService = (foam.nanos.auth.RegionService) getX().get("regionService");

      com.xero.model.Address xeroAddress = xeroContact.getAddresses().getAddress().get(0);

      foam.nanos.auth.Country country = null;
      if (xeroAddress.getCountry() != null) {
        country = countryService.getCountry(xeroAddress.getCountry());
      }

      foam.nanos.auth.Region region = null;
      if (xeroAddress.getRegion() != null) {
        region = regionService.getRegion(xeroAddress.getRegion());
      }

      foam.nanos.auth.Address nanoAddress = new foam.nanos.auth.Address.Builder(getX())
        .setAddress1(xeroAddress.getAddressLine1())
        .setAddress2(xeroAddress.getAddressLine2())
        .setCity(xeroAddress.getCity())
        .setPostalCode(xeroAddress.getPostalCode() != null ? xeroAddress.getPostalCode() : "")
        .setCountryId(country != null ? country.getCode() : null)
        .setRegionId(region != null ? region.getCode() : null)
        .setType(xeroAddress.getAddressType().value())
        .setVerified(true)
        .build();

      xContact.setBusinessAddress(nanoAddress);
    }

    /*
     * Phone integration
     */
    if (xeroContact.getPhones() != null &&
      xeroContact.getPhones().getPhone().size() != 0) {

      com.xero.model.Phone xeroPhone = xeroContact.getPhones().getPhone().get(1);
      com.xero.model.Phone xeroMobilePhone = xeroContact.getPhones().getPhone().get(3);

      String phoneNumber =
        (xeroPhone.getPhoneCountryCode() != null ? xeroPhone.getPhoneCountryCode() : "") +
          (xeroPhone.getPhoneAreaCode() != null ? xeroPhone.getPhoneAreaCode() : "") +
          (xeroPhone.getPhoneNumber() != null ? xeroPhone.getPhoneNumber() : "");

      String mobileNumber =
        (xeroMobilePhone.getPhoneCountryCode() != null ? xeroMobilePhone.getPhoneCountryCode() : "") +
          (xeroMobilePhone.getPhoneAreaCode() != null ? xeroMobilePhone.getPhoneAreaCode() : "") +
          (xeroMobilePhone.getPhoneNumber() != null ? xeroMobilePhone.getPhoneNumber() : "");

      foam.nanos.auth.Phone nanoPhone = new foam.nanos.auth.Phone.Builder(getX())
        .setNumber(phoneNumber)
        .setVerified(!phoneNumber.equals(""))
        .build();

      foam.nanos.auth.Phone nanoMobilePhone = new foam.nanos.auth.Phone.Builder(getX())
        .setNumber(mobileNumber)
        .setVerified(!mobileNumber.equals(""))
        .build();

      xContact.setBusinessPhone(nanoPhone);
      xContact.setMobile(nanoMobilePhone);
      xContact.setPhoneNumber(phoneNumber);
    }

    // Look up to see if there is an associated business for the contact
    DAO businessDAO = (DAO) x.get("localBusinessDAO");
    Business business = (Business) businessDAO.find(
      EQ(
        Business.EMAIL,
        xeroContact.getEmailAddress()
      )
    );
    if (business != null) {
      xContact.setBusinessId(business.getId());
    }

    xContact.setXeroId(xeroContact.getContactID());
    xContact.setEmail(xeroContact.getEmailAddress());
    xContact.setOrganization(xeroContact.getName());
    xContact.setBusinessName(xeroContact.getName());
    xContact.setFirstName(xeroContact.getFirstName());
    xContact.setLastName(xeroContact.getLastName());
    xContact.setOwner(user.getId());
    xContact.setGroup("sme");
    contactDAO.put(xContact);
  }
  return new ResultResponse(true, "All contacts have been synchronized");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
}`
    },
    {
      name: 'invoiceSync',
      documentation: `Calls the functions that retrieve invoices and bills. If fails returns error messages for each`,
      javaCode:
`User             user         = (User) x.get("user");
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_      = new XeroClient(config);
DAO              notification = (DAO) x.get("notificationDAO");
Logger           logger       = (Logger) x.get("logger");

// Check that user has accessed xero before
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to Xero");
}

// Configures the client Object with the users token data
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

try {
  XeroInvoice xInvoice;
  DAO         invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
  DAO         contactDAO = (DAO) x.get("contactDAO");
  DAO         fileDAO    = (DAO) x.get("fileDAO");
  BlobService blobStore  = (BlobService) x.get("blobStore");

  // Go through each xero Invoices and assess what should be done with it
  for (com.xero.model.Invoice xeroInvoice : client_.getInvoices()) {

    xInvoice = (XeroInvoice) invoiceDAO.find(
      AND(
        EQ(
          XeroInvoice.XERO_ID,
          xeroInvoice.getInvoiceID()
        ),
        INSTANCE_OF(XeroInvoice.class)
      )
    );

    // Check if Invoice already exists on the portal
    if ( xInvoice != null ) {

      // Clone the invoice to make changes
      xInvoice = (XeroInvoice) xInvoice.fclone();

      // Checks to see if the invoice needs to be updated in Xero
      if ( xInvoice.getDesync() ) {
        ResultResponse isSync = resyncInvoice(x, xInvoice, xeroInvoice);
        if(isSync.getResult()) {
          xInvoice.setDesync(false);
          invoiceDAO.put(xInvoice);
        } else {
          logger.error(isSync.getReason());
        }
        continue;
      }
      // Only update the invoice if its not already in the process of changing
      if ( net.nanopay.invoice.model.InvoiceStatus.UNPAID != xInvoice.getStatus() || net.nanopay.invoice.model.InvoiceStatus.DRAFT != xInvoice.getStatus() ) {
        continue;
      }

    } else {

      // Checks if the invoice was paid
      if ( InvoiceStatus.PAID == xeroInvoice.getStatus() || InvoiceStatus.VOIDED == xeroInvoice.getStatus() ) {
        continue;
      }

      // Create an invoice
      xInvoice = new XeroInvoice();
    }

    //TODO: Remove this when we accept other currencies
    if ( ! (xeroInvoice.getCurrencyCode() == CurrencyCode.CAD || xeroInvoice.getCurrencyCode() == CurrencyCode.USD) ){
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody("Xero Invoice # " +
        xeroInvoice.getInvoiceNumber()+
        " cannot sync due to portal only accepting CAD and USD");
      notification.put(notify);
      continue;
    }

    // Searches for a previous existing Contact
    XeroContact contact = (XeroContact) contactDAO.find(
      AND(
        INSTANCE_OF(XeroContact.class),
        EQ(
          XeroContact.XERO_ID,
          xeroInvoice.getContact().getContactID()
        )
      )
    );

    // If the Contact doesn't exist send a notification as to why the invoice wasn't imported
    if ( contact == null ) {
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody(
        "Xero Invoice # " +
        xeroInvoice.getInvoiceNumber() +
        " cannot sync due to an Invalid Contact: " +
        xeroInvoice.getContact().getName());
      notification.put(notify);
      continue;
    }
    // TODO change to accept all currencys
    // Only allows CAD and USD
    if ( ! ("CAD".equals(xeroInvoice.getCurrencyCode().value()) || "USD".equals(xeroInvoice.getCurrencyCode().value())) ) {
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      String s = "Xero Invoice # " +
        xeroInvoice.getInvoiceNumber() +
        " can not be sync'd because the currency " +
        xeroInvoice.getCurrencyCode().value() +
        " is not supported in this system ";
      notify.setBody(s);
      notification.put(notify);
      continue;
    }
    //TODO: Change when the currency is not CAD and USD
    xInvoice.setDestinationCurrency(xeroInvoice.getCurrencyCode().value());
    xInvoice.setAmount((xeroInvoice.getAmountDue().movePointRight(2)).longValue());


    if ( xeroInvoice.getType() == InvoiceType.ACCREC ) {
      xInvoice.setContactId(contact.getId());
      xInvoice.setPayeeId(user.getId());
      xInvoice.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
      xInvoice.setDraft(true);
      xInvoice.setInvoiceNumber(xeroInvoice.getInvoiceNumber());
    } else {
      xInvoice.setPayerId(user.getId());
      xInvoice.setContactId(contact.getId());
      xInvoice.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
    }
    xInvoice.setXeroId(xeroInvoice.getInvoiceID());
    xInvoice.setIssueDate(xeroInvoice.getDate().getTime());
    xInvoice.setDueDate(xeroInvoice.getDueDate().getTime());
    xInvoice.setDesync(false);

    // get invoice attachments
    if ( ! xeroInvoice.isHasAttachments() ) {
      invoiceDAO.put(xInvoice);
      continue;
    }

    // try to get attachments
    List<Attachment> attachments;
    try {
      attachments = client_.getAttachments("Invoices", xeroInvoice.getInvoiceID());
    } catch ( Throwable ignored ) {
      invoiceDAO.put(xInvoice);
      continue;
    }

    // return invoice if attachments is null or size is 0
    if ( attachments == null || attachments.size() == 0 ) {
      invoiceDAO.put(xInvoice);
      continue;
    }

    // iterate through all attachments
    File[] files = new File[attachments.size()];
    for ( int i = 0 ; i < attachments.size() ; i++ ) {
      try {
        Attachment attachment = attachments.get(i);
        long filesize = attachment.getContentLength().longValue();

        // get attachment content and create blob
        java.io.ByteArrayInputStream bais = client_.getAttachmentContent("Invoices",
          xeroInvoice.getInvoiceID(), attachment.getFileName(), null);
        foam.blob.Blob data = blobStore.put_(x, new foam.blob.InputStreamBlob(bais, filesize));

        // create file
        files[i] = new File.Builder(x)
          .setId(attachment.getAttachmentID())
          .setOwner(user.getId())
          .setMimeType(attachment.getMimeType())
          .setFilename(attachment.getFileName())
          .setFilesize(filesize)
          .setData(data)
          .build();
        fileDAO.inX(x).put(files[i]);
      } catch ( Throwable ignored ) { }
    }

    // set files on nano invoice
    xInvoice.setInvoiceFile(files);
    invoiceDAO.put(xInvoice);
    continue;
  }
  return new ResultResponse(true, "All invoices have been synchronized");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
}`
    },
    {
      name: 'resyncInvoice',
      documentation: `Updates Xero with a processed invoice`,
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'nano',
          javaType: 'net.nanopay.integration.xero.model.XeroInvoice',
        },
        {
          name: 'xero',
          javaType: 'com.xero.model.Invoice',
        }
      ],
      javaCode:
`DAO              store          = (DAO) x.get("xeroTokenStorageDAO");
DAO              accountDAO     = (DAO) x.get("accountDAO");
User             user           = (User) x.get("user");
XeroTokenStorage tokenStorage   = (XeroTokenStorage) store.find(user.getId());
Group            group          = user.findGroup(x);
AppConfig        app            = group.getAppConfig(x);
DAO              configDAO      = (DAO) x.get("xeroConfigDAO");
XeroConfig       config         = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_        = new XeroClient(config);
Logger           logger         = (Logger) x.get("logger");

BankAccount      account;
if (user.getId() == nano.getPayeeId()) {
  account  = (BankAccount) accountDAO.find(nano.getDestinationAccount());
} else {
  account  = (BankAccount) accountDAO.find(nano.getAccount());
}

client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
try {
  if ( SafetyUtil.isEmpty(account.getIntegrationId()) ) {
    return new ResultResponse(false, "The follow error has occured: Bank Account not linked to Xero");
  } 
  com.xero.model.Account           xeroAccount = client_.getAccount(account.getIntegrationId());
  List<com.xero.model.Invoice>     xeroInvoiceList = new ArrayList<>();
  if ( ! (InvoiceStatus.AUTHORISED == xero.getStatus()) ) {
    xero.setStatus(InvoiceStatus.AUTHORISED);
    xeroInvoiceList.add(xero);
    client_.updateInvoice(xeroInvoiceList);
  }

  // Creates a payment for the full amount for the invoice and sets it paid to the bank account on xero
  Payment payment = new Payment();
  payment.setInvoice(xero);
  payment.setAccount(xeroAccount);
  Calendar cal = Calendar.getInstance();
  cal.setTime(new Date());
  payment.setDate(cal);
  //TODO: Change when the currency is not CAD and USD
  payment.setAmount(BigDecimal.valueOf(nano.getAmount()).movePointLeft(2));
  List<Payment> paymentList = new ArrayList<>();
  paymentList.add(payment);
  client_.createPayments(paymentList);
  return new ResultResponse(true, " ");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "The follow error has occured: " + e.getMessage());
}`
    },
    {
      name: 'removeToken',
      documentation: `Removes the token making access to Xero not possible`,
      javaCode:
`User             user         = (User) x.get("user");
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to Xero");
}

// Clears the tokens simulating logout.
tokenStorage.setToken(" ");
tokenStorage.setTokenSecret(" ");
tokenStorage.setTokenTimestamp("0");
store.put(tokenStorage);
return new ResultResponse(true, "User has been Signed out of Xero");`
    },
    {
      name: 'pullBanks',
      documentation: `Pulls the bank accounts to allow linking with portal bank accounts`,
      javaCode:
`User                        user         = (User) x.get("user");
DAO                         store        = (DAO) x.get("xeroTokenStorageDAO");
Group                       group        = user.findGroup(x);
AppConfig                   app          = group.getAppConfig(x);
DAO                         configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig                  config       = (XeroConfig)configDAO.find(app.getUrl());
List<AccountingBankAccount> banks        = new ArrayList<>();
Logger                      logger       = (Logger) x.get("logger");
XeroTokenStorage            tokenStorage = (XeroTokenStorage) store.find(user.getId());
XeroClient                  client_      = new XeroClient(config);

try {
  // Check that user has accessed xero before
  if ( tokenStorage == null ) {
    throw new Throwable("User is not synchronised to Xero");
  }

  // Configures the client Object with the users token data
  client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
  for ( com.xero.model.Account xeroAccount :  client_.getAccounts() ) {
    AccountingBankAccount xBank = new AccountingBankAccount();
    if ( com.xero.model.AccountType.BANK != xeroAccount.getType() ) {
      continue;
    }
    xBank.setAccountingName("XERO");
    xBank.setAccountingId(xeroAccount.getAccountID());
    xBank.setName(xeroAccount.getName());
    banks.add(xBank);
  }
  return banks;
} catch ( Throwable e ){
  e.printStackTrace();
  logger.error(e);
  return banks;
}`
   }
 ]
});

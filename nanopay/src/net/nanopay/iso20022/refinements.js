foam.CLASS({
  refines: 'net.nanopay.iso20022.ISODate',

  properties: [
    ['javaJSONParser', 'new net.nanopay.iso20022.ISODateParser()'],
    ['javaCSVParser',  'new net.nanopay.iso20022.ISODateParser()'],
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    }
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      // create SimpleDateFormatter field
      if ( ! info.fields ) info.fields = [];
      info.fields = [
        foam.java.Field.create({
          type: 'java.lang.ThreadLocal<java.text.SimpleDateFormat>',
          visibility: 'protected',
          final: true,
          name: 'sdf',
          initializer: `
            new java.lang.ThreadLocal<java.text.SimpleDateFormat>() {
              @Override
              protected java.text.SimpleDateFormat initialValue() {
                java.text.SimpleDateFormat df = new java.text.SimpleDateFormat("yyyy-MM-dd");
                df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                return df;
              }
            }
          `
        })
      ];

      info.method({
        name: 'toJSON',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.json.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      info.method({
        name: 'toCSV',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.csv.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      return info;
    },

    function formatDate(value) {
      // returns date in the following format: YYYY-MM-DD
      // pads month and date with leading zeros
      var year = value.getUTCFullYear();
      var month = value.getUTCMonth() + 1;
      month = ('00' + month).slice(-2);

      var date = value.getUTCDate();
      date = ('00' + date).slice(-2);

      return year + '-' + month + '-' + date;
    }
  ]
});

foam.CLASS({
  refines: 'net.nanopay.iso20022.ISODateTime',

  properties: [
    ['javaJSONParser', 'new net.nanopay.iso20022.ISODateTimeParser()'],
    ['javaCSVParser',  'new net.nanopay.iso20022.ISODateTimeParser()'],
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    }
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      // create SimpleDateFormatter field
      if ( ! info.fields ) info.fields = [];
      info.fields = [
        foam.java.Field.create({
          type: 'java.lang.ThreadLocal<java.text.SimpleDateFormat>',
          visibility: 'protected',
          final: true,
          name: 'sdf',
          initializer: `
            new java.lang.ThreadLocal<java.text.SimpleDateFormat>() {
              @Override
              protected java.text.SimpleDateFormat initialValue() {
                java.text.SimpleDateFormat df = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                return df;
              }
            }
          `
        })
      ];

      info.method({
        name: 'toJSON',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.json.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      info.method({
        name: 'toCSV',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.csv.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      return info;
    },

    function formatDate(value) {
      // returns date in the following format: YYYY-MM-DD'T'HH:mm:ss.SSS+/-hh:mm
      // pads hour and minute in offset with leading zeros
      var isoString = value.toISOString();
      isoString = isoString.substring(0, isoString.length - 1);

      var timezoneOffset = value.getTimezoneOffset();
      if ( timezoneOffset < 0 ) {
        timezoneOffset *= -1
        isoString += '+';
      } else {
        isoString += '-';
      }

      // calculate hour and minute offset
      var hourOffset = ('00' + (Math.trunc(timezoneOffset / 60))).slice(-2);
      timezoneOffset = ('00' + (timezoneOffset - ( hourOffset * 60 ))).slice(-2);

      isoString += hourOffset + ':' + timezoneOffset;
      return isoString;
    }
  ]
});

foam.CLASS({
  refines: 'net.nanopay.iso20022.ISOTime',

  properties: [
    ['javaJSONParser', 'new net.nanopay.iso20022.ISOTimeParser()'],
    ['javaCSVParser',  'new net.nanopay.iso20022.ISOTimeParser()'],
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    }
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      // create SimpleDateFormatter field
      if ( ! info.fields ) info.fields = [];
      info.fields = [
        foam.java.Field.create({
          type: 'java.lang.ThreadLocal<java.text.SimpleDateFormat>',
          visibility: 'protected',
          final: true,
          name: 'sdf',
          initializer: `
            new java.lang.ThreadLocal<java.text.SimpleDateFormat>() {
              @Override
              protected java.text.SimpleDateFormat initialValue() {
                java.text.SimpleDateFormat df = new java.text.SimpleDateFormat("HH:mm:ss.SSS'Z'");
                df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                return df;
              }
            }
          `
        })
      ];

      info.method({
        name: 'toJSON',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.json.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      info.method({
        name: 'toCSV',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.csv.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      return info;
    },

    function formatDate(value) {
      // returns date in the following format: HH:mm:ss.SSS'Z'
      // pads all values with leading zeros
      var hours = value.getUTCHours();
      hours = ('00' + hours).slice(-2);

      var minutes = value.getUTCMinutes();
      minutes = ('00' + minutes).slice(-2);

      var seconds = value.getUTCSeconds();
      seconds = ('00' + seconds).slice(-2);

      var milliseconds = value.getUTCMilliseconds();
      milliseconds = ('000' + milliseconds).slice(-3);

      return hours + ':' + minutes + ':' + seconds + '.' + milliseconds + 'Z';
    }
  ]
});

foam.CLASS({
  refines: 'net.nanopay.iso20022.Pacs00800106',

  javaImports: [
    'net.nanopay.tx.TransactionDAO',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionType',
    'java.util.Date',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.payment.Institution',
    'net.nanopay.model.Branch',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'java.util.Random',
    'static foam.mlang.MLang.EQ',
    'foam.core.FObject',
    'foam.nanos.logger.Logger',
    'java.io.*'
  ],

  methods: [
    {
      name: 'generatePacs002Msgby008Msg',

        javaReturns: 'net.nanopay.iso20022.Pacs00200109',
        javaCode: `
          final PrintWriter out = getX().get(PrintWriter.class);

          Logger  logger = (Logger) getX().get("logger");
          Pacs00200109 pacs00200109 = new Pacs00200109();
          pacs00200109.setX(getX());

          FIToFIPaymentStatusReportV09 fIToFIPmtStsRpt = new FIToFIPaymentStatusReportV09();

          GroupHeader53 grpHdr53 = new GroupHeader53();
          grpHdr53.setMessageIdentification(java.util.UUID.randomUUID().toString().replace("-", ""));
          grpHdr53.setCreationDateTime(new Date());

          if ( this.getFIToFICstmrCdtTrf() != null ) {
            if ( this.getFIToFICstmrCdtTrf().getGrpHdr() == null ) {
              throw new RuntimeException("Missing field : GrpHdr");
            }
            if ( this.getFIToFICstmrCdtTrf().getGrpHdr().getMessageIdentification() == null ) {
              throw new RuntimeException("Missing field : MessageIdentification");
            }
            if ( this.getFIToFICstmrCdtTrf().getGrpHdr().getCreationDateTime() == null ) {
              throw new RuntimeException("Missing field : CreationDateTime");
            }
            if ( this.getFIToFICstmrCdtTrf().getGrpHdr().getNumberOfTransactions() == null ) {
              throw new RuntimeException("Missing field : NumberOfTransactions");
            }

            if ( this.getFIToFICstmrCdtTrf().getCdtTrfTxInf() != null ) {

              int length_ = this.getFIToFICstmrCdtTrf().getCdtTrfTxInf().length;
              pacs00200109.setFIToFIPmtStsRpt(fIToFIPmtStsRpt);
              pacs00200109.getFIToFIPmtStsRpt().setTxInfAndSts(new PaymentTransaction91[length_]);
              pacs00200109.getFIToFIPmtStsRpt().setOrgnlGrpInfAndSts(new OriginalGroupHeader13[length_]);
              pacs00200109.getFIToFIPmtStsRpt().setGrpHdr(grpHdr53);

              DAO userDAO        = (DAO) getX().get("userDAO");
              DAO bankAccountDAO = (DAO) getX().get("accountDAO");
              DAO branchDAO      = (DAO) getX().get("branchDAO");
              DAO institutionDAO = (DAO) getX().get("institutionDAO");
              String addrLine = "";
              long senderId =  0 ;
              long receiverId = 0;

              Random rand = new Random();
              for ( int i = 0 ; i < length_ ; i++ ) {

                 try {
                   if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor() != null ) {
                     User sender = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getContactDetails().getEmailAddress()));

                     // Create a Sender
                     if ( sender == null ) {
                       sender = new User();

                       senderId = rand.nextInt(1000) + 10000;
                       sender.setId(senderId);
                       sender.setEmail((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getContactDetails().getEmailAddress());

                       Phone senderPhone = new Phone();
                       senderPhone.setVerified(true);
                       senderPhone.setNumber((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getContactDetails().getPhoneNumber());

                       sender.setPhone(senderPhone);

                       sender.setEmailVerified(true);
                       sender.setFirstName((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getName());
                       sender.setBirthday((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getIdentification().getPrvtId().getDateAndPlaceOfBirth().getBirthDate());
                       sender.setGroup("system");
                       sender.setSpid("iterac");
                       sender.setBusinessTypeId(0);
                       sender.setBusinessSectorId(1);
                       //sender.setStatus("Active");
                       sender.setOnboarded(true);

                       Address senderAddress = new Address();
                       addrLine = "";

                       if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getStreetName() != null |
                              ((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getStreetName()).equals("") ) {  //structured
                                senderAddress.setStructured(true);
                                senderAddress.setStreetName((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getStreetName());
                                senderAddress.setSuite((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getBuildingNumber());
                       } else {
                         for ( int j = 0; j < (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getAddressLine().length; j++ ) {
                           addrLine += (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getAddressLine()[j] + " ";
                         }

                         senderAddress.setAddress1(addrLine);
                       }
                       senderAddress.setCity((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getTownName());
                       senderAddress.setCountryId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getCountry());
                       senderAddress.setRegionId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getCountrySubDivision());
                       senderAddress.setPostalCode((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getPostalAddress().getPostCode());

                       sender.setAddress(senderAddress);

                       FObject fUserDAO = (FObject) userDAO.put(sender);

                      // Create a Sender's BankAccount
                       if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAccount() != null ) {
                          BankAccount senderBankAcct = new BankAccount();
                          senderBankAcct.setId(senderId);
                          senderBankAcct.setX(getX());
                          senderBankAcct.setAccountNumber((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                          senderBankAcct.setDenomination((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getInstructedAmount().getCcy());
                          senderBankAcct.setName("Default");

                          Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification()));
                          if ( institution != null ) {
                            senderBankAcct.setInstitution(institution.getId());
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Institution", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                          }

                          Branch branch = (Branch) branchDAO.find(EQ(Branch.BRANCH_ID, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAgent().getBranchIdentification().getIdentification()));
                          if ( branch != null ) {
                            senderBankAcct.setBranch(branch.getId());
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Branch", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAgent().getBranchIdentification().getIdentification(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                          }
                          senderBankAcct.setStatus(BankAccountStatus.VERIFIED);
                          senderBankAcct.setVerificationAttempts(1);
                          senderBankAcct.setIsDefault(true);
                          senderBankAcct.setOwner(senderId);

                          bankAccountDAO.put(senderBankAcct);
                      } else {
                          throw new RuntimeException("Missing field : DbtrAcct");
                      }
                    } else {
                       sender = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtor().getContactDetails().getEmailAddress()));
                       senderId = sender.getId();
                    }
                  } else {
                    throw new RuntimeException("Missing field : Dbtr");
                  }

                  if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor() != null ) {
                    User receiver = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getContactDetails().getEmailAddress()));

                    // Create a Receiver
                    if ( receiver == null ) {
                      receiver = new User();

                      receiverId = rand.nextInt(1000) + 10000;
                      receiver.setId(receiverId);
                      receiver.setEmail((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getContactDetails().getEmailAddress());

                      Phone receiverPhone = new Phone();
                      receiverPhone.setVerified(true);
                      receiverPhone.setNumber((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getContactDetails().getPhoneNumber());

                      receiver.setPhone(receiverPhone);

                      receiver.setEmailVerified(true);
                      receiver.setFirstName((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getName());
                      receiver.setBirthday((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getIdentification().getPrvtId().getDateAndPlaceOfBirth().getBirthDate());
                      receiver.setGroup("system");
                      receiver.setSpid("iterac");
                      receiver.setBusinessTypeId(0);
                      receiver.setBusinessSectorId(1);
                      //receiver.setStatus("Active");
                      receiver.setOnboarded(true);

                      Address receiverAddress = new Address();
                      addrLine = "";

                      if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getStreetName() != null |
                             ((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getStreetName()).equals("") ) {  //structured
                               receiverAddress.setStructured(true);
                               receiverAddress.setStreetName((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getStreetName());
                               receiverAddress.setSuite((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getBuildingNumber());
                      } else {
                        for ( int j = 0; j < (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getAddressLine().length; j++ ) {
                          addrLine += (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getAddressLine()[j] + " ";
                        }

                        receiverAddress.setAddress1(addrLine);
                      }
                      receiverAddress.setCity((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getTownName());
                      receiverAddress.setCountryId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getCountry());
                      receiverAddress.setRegionId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getCountrySubDivision());
                      receiverAddress.setPostalCode((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getPostalAddress().getPostCode());

                      receiver.setAddress(receiverAddress);

                      userDAO.put(receiver);

                      // Create a Receiver's BankAccount
                      if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditorAccount() != null ) {
                        BankAccount receiverBankAcct = new BankAccount();
                        receiverBankAcct.setId(receiverId);
                        receiverBankAcct.setX(getX());
                        receiverBankAcct.setAccountNumber((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditorAccount().getIdentification().getOthr().getIdentification());
                        receiverBankAcct.setDenomination((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getInterbankSettlementAmount().getCcy());
                        receiverBankAcct.setName("Default");
//                        receiverBankAcct.setInstitution((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification());
//                        receiverBankAcct.setBranch((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditorAgent().getBranchIdentification().getIdentification());

                          Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification()));
                          if ( institution != null ) {
                            receiverBankAcct.setInstitution(institution.getId());
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Institution", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                          }

                          Branch branch = (Branch) branchDAO.find(EQ(Branch.BRANCH_ID, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification()));
                          if ( branch != null ) {
                            receiverBankAcct.setBranch(branch.getId());
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Branch", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                          }

                        receiverBankAcct.setStatus(BankAccountStatus.VERIFIED);
                        receiverBankAcct.setVerificationAttempts(1);
                        receiverBankAcct.setIsDefault(true);
                        receiverBankAcct.setOwner(receiverId);

                        bankAccountDAO.put(receiverBankAcct);
                      } else {
                        throw new RuntimeException("Missing field : CreditorAccount");
                      }
                  } else {
                    receiver = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCreditor().getContactDetails().getEmailAddress()));
                    receiverId = receiver.getId();
                  }
                } else {
                  throw new RuntimeException("Missing field : Creditor");
                }

                  //Create a Transaction
                  if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getInstructedAmount() != null ) {
                    double txAmt = (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getInstructedAmount().getXmlValue();
                    long longTxAmt = Math.round(txAmt);

                    Transaction transaction = new Transaction.Builder(getX())
                      .setStatus(TransactionStatus.ACSP)
                      .setPayerId(senderId)
                      .setPayeeId(receiverId)
                      .setAmount(longTxAmt)
                      .setType(TransactionType.NONE)
                      .setMessageId(this.getFIToFICstmrCdtTrf().getGrpHdr().getMessageIdentification())
                      .build();
                      DAO txnDAO = (DAO) getX().get("transactionDAO");

                      txnDAO.put(transaction);
                  } else {
                    throw new RuntimeException("Missing field : InstdAmt");
                  }

                  if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPaymentIdentification() != null ) {
                    if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPaymentIdentification().getEndToEndIdentification() == null ) {
                      throw new RuntimeException("Missing field : EndToEndId");
                    }

                    if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPaymentIdentification().getTransactionIdentification() == null ) {
                      throw new RuntimeException("Missing field : TransactionIdentification");
                    }

                    String strStatus = "ACSP";

                    PaymentTransaction91 paymentTransaction91 = new PaymentTransaction91();

                    paymentTransaction91.setStatusIdentification(java.util.UUID.randomUUID().toString().replace("-", ""));
                    paymentTransaction91.setOriginalEndToEndIdentification((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPaymentIdentification().getEndToEndIdentification());
                    paymentTransaction91.setOriginalTransactionIdentification((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPaymentIdentification().getTransactionIdentification());
                    paymentTransaction91.setTransactionStatus(strStatus);  // ACSP or ACSC

                    pacs00200109.getFIToFIPmtStsRpt().getTxInfAndSts()[i] = paymentTransaction91;

                    OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();

                    orgnlGrpInfAndSts.setOriginalMessageIdentification(this.getFIToFICstmrCdtTrf().getGrpHdr().getMessageIdentification());
                    orgnlGrpInfAndSts.setOriginalCreationDateTime(this.getFIToFICstmrCdtTrf().getGrpHdr().getCreationDateTime());
                    orgnlGrpInfAndSts.setOriginalMessageNameIdentification("Pacs.008.001.06");
                    orgnlGrpInfAndSts.setOriginalNumberOfTransactions(this.getFIToFICstmrCdtTrf().getGrpHdr().getNumberOfTransactions());
                    orgnlGrpInfAndSts.setOriginalControlSum(this.getFIToFICstmrCdtTrf().getGrpHdr().getControlSum());
                    orgnlGrpInfAndSts.setGroupStatus(strStatus);

                    pacs00200109.getFIToFIPmtStsRpt().getOrgnlGrpInfAndSts()[i] = orgnlGrpInfAndSts;
                  } else {
                    throw new RuntimeException("Missing field : PmtId");
                  }
                } catch (Throwable t) {
                  out.println("Error " + t);
                  out.println("<pre>");
                  t.printStackTrace(out);
                  out.println("</pre>");
                  t.printStackTrace();
                  logger.error(t);
               }
             }
         } else {
           throw new RuntimeException("Missing field : CdtTrfTxInf");
         }
       } else {
         throw new RuntimeException("Missing field : FIToFICstmrCdtTrf");
       }

          return pacs00200109;
          `
      }
  ]

});


foam.CLASS({
  refines: 'net.nanopay.iso20022.Pacs02800101',

  javaImports: [
    'net.nanopay.tx.TransactionDAO',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionType',
    'java.util.Date',
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
  ],

  methods: [
      {
        name: 'generatePacs002Msgby028Msg',

          javaReturns: 'net.nanopay.iso20022.Pacs00200109',
          javaCode: `
            Pacs00200109 pacs00200109 = new Pacs00200109();
            pacs00200109.setX(getX());

            FIToFIPaymentStatusReportV09 fIToFIPmtStsRpt = new FIToFIPaymentStatusReportV09();

            GroupHeader53 grpHdr53 = new GroupHeader53();
            grpHdr53.setMessageIdentification(java.util.UUID.randomUUID().toString().replace("-", ""));
            grpHdr53.setCreationDateTime(new Date());

            int length_ = this.getFIToFIPmtStsReq().getOrgnlGrpInf().length;
            pacs00200109.setFIToFIPmtStsRpt(fIToFIPmtStsRpt);
            pacs00200109.getFIToFIPmtStsRpt().setOrgnlGrpInfAndSts(new OriginalGroupHeader13[length_]);
            pacs00200109.getFIToFIPmtStsRpt().setGrpHdr(grpHdr53);

            if ( this.getFIToFIPmtStsReq() == null ) {
              throw new RuntimeException("Missing field : FIToFIPmtStsReq");
            }

            DAO txnDAO = (DAO) getX().get("transactionDAO");

            for ( int i = 0 ; i < length_ ; i++ ) {
              if ( (this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i] != null ) {
                OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();

                if ( (this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOriginalMessageIdentification() != null && (this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOriginalCreationDateTime() != null ) {
                  //Transaction txn = (Transaction) txnDAO.find((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOriginalMessageIdentification());
                  Transaction txn = (Transaction) txnDAO.find(EQ(Transaction.MESSAGE_ID, (this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOriginalMessageIdentification()));

                  String strStatus = "";

                  if ( txn != null ) {
                    strStatus = ( (TransactionStatus) txn.getStatus() ).getLabel();
                  }

                  orgnlGrpInfAndSts.setOriginalMessageIdentification((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOriginalMessageIdentification());
                  orgnlGrpInfAndSts.setOriginalCreationDateTime((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOriginalCreationDateTime());
                  orgnlGrpInfAndSts.setOriginalMessageNameIdentification("Pacs.008.001.06");
                  orgnlGrpInfAndSts.setGroupStatus(strStatus);   // ACSP or ACSC
                  pacs00200109.getFIToFIPmtStsRpt().getOrgnlGrpInfAndSts()[i] = orgnlGrpInfAndSts;
                } else {
                  throw new RuntimeException("Missing field : OriginalMessageIdentification OR OriginalCreationDateTime");
                }
              } else {
                throw new RuntimeException("Missing field : OrgnlGrpInf");
              }
            }

            return pacs00200109;
            `
        }
  ]
});

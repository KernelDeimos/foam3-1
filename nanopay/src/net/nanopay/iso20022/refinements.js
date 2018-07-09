foam.CLASS({
  refines: 'net.nanopay.iso20022.ISODate',

  properties: [
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
    function formatDate(value) {
      // returns date in the following format: YYYY-MM-DDThh:mm:ss.sss+/-hh:mm
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
    function formatDate(value) {
      // returns date in the following format: HH:mm:ss.sssZ
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
    'net.nanopay.cico.model.TransactionType',
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
          grpHdr53.setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
          grpHdr53.setCreDtTm(new Date());

          if ( this.getFIToFICstmrCdtTrf() != null ) {
            if ( this.getFIToFICstmrCdtTrf().getGrpHdr() == null ) {
              throw new RuntimeException("Missing field : GrpHdr");
            }
            if ( this.getFIToFICstmrCdtTrf().getGrpHdr().getMsgId() == null ) {
              throw new RuntimeException("Missing field : MsgId");
            }
            if ( this.getFIToFICstmrCdtTrf().getGrpHdr().getCreDtTm() == null ) {
              throw new RuntimeException("Missing field : CreDtTm");
            }
            if ( this.getFIToFICstmrCdtTrf().getGrpHdr().getNbOfTxs() == null ) {
              throw new RuntimeException("Missing field : NbOfTxs");
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
                   if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr() != null ) {
                     User sender = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getCtctDtls().getEmailAdr()));

                     // Create a Sender
                     if ( sender == null ) {
                       sender = new User();

                       senderId = rand.nextInt(1000) + 10000;
                       sender.setId(senderId);
                       sender.setEmail((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getCtctDtls().getEmailAdr());

                       Phone senderPhone = new Phone();
                       senderPhone.setVerified(true);
                       senderPhone.setNumber((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getCtctDtls().getPhneNb());

                       sender.setPhone(senderPhone);

                       sender.setEmailVerified(true);
                       sender.setFirstName((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getNm());
                       sender.setBirthday((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getId().getPrvtId().getDtAndPlcOfBirth().getBirthDt());
                       sender.setGroup("system");
                       sender.setSpid("iterac");
                       sender.setBusinessTypeId(0);
                       sender.setBusinessSectorId(1);
                       //sender.setStatus("Active");
                       sender.setOnboarded(true);

                       Address senderAddress = new Address();
                       addrLine = "";

                       if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getStrtNm() != null |
                              ((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getStrtNm()).equals("") ) {  //structured
                                senderAddress.setStructured(true);
                                senderAddress.setStreetName((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getStrtNm());
                                senderAddress.setSuite((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getBldgNb());
                       } else {
                         for ( int j = 0; j < (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getAdrLine().length; j++ ) {
                           addrLine += (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getAdrLine()[j] + " ";
                         }

                         senderAddress.setAddress1(addrLine);
                       }
                       senderAddress.setCity((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getTwnNm());
                       senderAddress.setCountryId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getCtry());
                       senderAddress.setRegionId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getCtrySubDvsn());
                       senderAddress.setPostalCode((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getPstlAdr().getPstCd());

                       sender.setAddress(senderAddress);

                       FObject fUserDAO = (FObject) userDAO.put(sender);

                      // Create a Sender's BankAccount
                       if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAcct() != null ) {
                          BankAccount senderBankAcct = new BankAccount();
                          senderBankAcct.setId(senderId);
                          senderBankAcct.setX(getX());
                          senderBankAcct.setAccountNumber((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAcct().getId().getOthr().getId());
                          senderBankAcct.setDenomination((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getInstdAmt().getCcy());
                          senderBankAcct.setName("Default");

                          Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAgt().getFinInstnId().getClrSysMmbId().getMmbId()));
                          if ( institution != null ) {
                            senderBankAcct.setInstitution(institution);
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Institution", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAgt().getFinInstnId().getClrSysMmbId().getMmbId(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAcct().getId().getOthr().getId());
                          }

                          Branch branch = (Branch) branchDAO.find(EQ(Branch.BRANCH_ID, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAgt().getBrnchId().getId()));
                          if ( branch != null ) {
                            senderBankAcct.setBranch(branch);
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Branch", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAgt().getBrnchId().getId(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAcct().getId().getOthr().getId());
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
                       sender = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtr().getCtctDtls().getEmailAdr()));
                       senderId = sender.getId();
                    }
                  } else {
                    throw new RuntimeException("Missing field : Dbtr");
                  }

                  if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr() != null ) {
                    User receiver = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getCtctDtls().getEmailAdr()));

                    // Create a Receiver
                    if ( receiver == null ) {
                      receiver = new User();

                      receiverId = rand.nextInt(1000) + 10000;
                      receiver.setId(receiverId);
                      receiver.setEmail((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getCtctDtls().getEmailAdr());

                      Phone receiverPhone = new Phone();
                      receiverPhone.setVerified(true);
                      receiverPhone.setNumber((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getCtctDtls().getPhneNb());

                      receiver.setPhone(receiverPhone);

                      receiver.setEmailVerified(true);
                      receiver.setFirstName((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getNm());
                      receiver.setBirthday((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getId().getPrvtId().getDtAndPlcOfBirth().getBirthDt());
                      receiver.setGroup("system");
                      receiver.setSpid("iterac");
                      receiver.setBusinessTypeId(0);
                      receiver.setBusinessSectorId(1);
                      //receiver.setStatus("Active");
                      receiver.setOnboarded(true);

                      Address receiverAddress = new Address();
                      addrLine = "";

                      if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getStrtNm() != null |
                             ((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getStrtNm()).equals("") ) {  //structured
                               receiverAddress.setStructured(true);
                               receiverAddress.setStreetName((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getStrtNm());
                               receiverAddress.setSuite((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getBldgNb());
                      } else {
                        for ( int j = 0; j < (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getAdrLine().length; j++ ) {
                          addrLine += (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getAdrLine()[j] + " ";
                        }

                        receiverAddress.setAddress1(addrLine);
                      }
                      receiverAddress.setCity((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getTwnNm());
                      receiverAddress.setCountryId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getCtry());
                      receiverAddress.setRegionId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getCtrySubDvsn());
                      receiverAddress.setPostalCode((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getPstlAdr().getPstCd());

                      receiver.setAddress(receiverAddress);

                      userDAO.put(receiver);

                      // Create a Receiver's BankAccount
                      if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtrAcct() != null ) {
                        BankAccount receiverBankAcct = new BankAccount();
                        receiverBankAcct.setId(receiverId);
                        receiverBankAcct.setX(getX());
                        receiverBankAcct.setAccountNumber((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtrAcct().getId().getOthr().getId());
                        receiverBankAcct.setDenomination((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getIntrBkSttlmAmt().getCcy());
                        receiverBankAcct.setName("Default");
//                        receiverBankAcct.setInstitution((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtrAgt().getFinInstnId().getClrSysMmbId().getMmbId());
//                        receiverBankAcct.setBranch((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtrAgt().getBrnchId().getId());

                          Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtrAgt().getFinInstnId().getClrSysMmbId().getMmbId()));
                          if ( institution != null ) {
                            receiverBankAcct.setInstitution(institution);
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Institution", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtrAgt().getFinInstnId().getClrSysMmbId().getMmbId(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAcct().getId().getOthr().getId());
                          }

                          Branch branch = (Branch) branchDAO.find(EQ(Branch.BRANCH_ID, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtrAgt().getFinInstnId().getClrSysMmbId().getMmbId()));
                          if ( branch != null ) {
                            receiverBankAcct.setBranch(branch);
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Branch", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtrAgt().getFinInstnId().getClrSysMmbId().getMmbId(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getDbtrAcct().getId().getOthr().getId());
                          }

                        receiverBankAcct.setStatus(BankAccountStatus.VERIFIED);
                        receiverBankAcct.setVerificationAttempts(1);
                        receiverBankAcct.setIsDefault(true);
                        receiverBankAcct.setOwner(receiverId);

                        bankAccountDAO.put(receiverBankAcct);
                      } else {
                        throw new RuntimeException("Missing field : CdtrAcct");
                      }
                  } else {
                    receiver = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getCdtr().getCtctDtls().getEmailAdr()));
                    receiverId = receiver.getId();
                  }
                } else {
                  throw new RuntimeException("Missing field : Cdtr");
                }

                  //Create a Transaction
                  if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getInstdAmt() != null ) {
                    double txAmt = (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getInstdAmt().getXmlValue();
                    long longTxAmt = Math.round(txAmt);

                    Transaction transaction = new Transaction.Builder(getX())
                      .setStatus(TransactionStatus.ACSP)
                      .setPayerId(senderId)
                      .setPayeeId(receiverId)
                      .setAmount(longTxAmt)
                      .setType(TransactionType.NONE)
                      .setBankAccountId(receiverId)
                      .setMessageId(this.getFIToFICstmrCdtTrf().getGrpHdr().getMsgId())
                      .build();
                      DAO txnDAO = (DAO) getX().get("transactionDAO");

                      txnDAO.put(transaction);
                  } else {
                    throw new RuntimeException("Missing field : InstdAmt");
                  }

                  if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPmtId() != null ) {
                    if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPmtId().getEndToEndId() == null ) {
                      throw new RuntimeException("Missing field : EndToEndId");
                    }

                    if ( (this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPmtId().getTxId() == null ) {
                      throw new RuntimeException("Missing field : TxId");
                    }

                    String strStatus = "ACSP";

                    PaymentTransaction91 paymentTransaction91 = new PaymentTransaction91();

                    paymentTransaction91.setStsId(java.util.UUID.randomUUID().toString().replace("-", ""));
                    paymentTransaction91.setOrgnlEndToEndId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPmtId().getEndToEndId());
                    paymentTransaction91.setOrgnlTxId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPmtId().getTxId());
                    paymentTransaction91.setTxSts(strStatus);  // ACSP or ACSC

                    pacs00200109.getFIToFIPmtStsRpt().getTxInfAndSts()[i] = paymentTransaction91;

                    OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();

                    orgnlGrpInfAndSts.setOrgnlMsgId(this.getFIToFICstmrCdtTrf().getGrpHdr().getMsgId());
                    orgnlGrpInfAndSts.setOrgnlCreDtTm(this.getFIToFICstmrCdtTrf().getGrpHdr().getCreDtTm());
                    orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");
                    orgnlGrpInfAndSts.setOrgnlNbOfTxs(this.getFIToFICstmrCdtTrf().getGrpHdr().getNbOfTxs());
                    orgnlGrpInfAndSts.setOrgnlCtrlSum(this.getFIToFICstmrCdtTrf().getGrpHdr().getCtrlSum());
                    orgnlGrpInfAndSts.setOrgnlMsgId(this.getFIToFICstmrCdtTrf().getGrpHdr().getMsgId());
                    orgnlGrpInfAndSts.setGrpSts(strStatus);

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
    'net.nanopay.cico.model.TransactionType',
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
            grpHdr53.setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
            grpHdr53.setCreDtTm(new Date());

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

                if ( (this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlMsgId() != null && (this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlCreDtTm() != null ) {
                  //Transaction txn = (Transaction) txnDAO.find((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlMsgId());
                  Transaction txn = (Transaction) txnDAO.find(EQ(Transaction.MESSAGE_ID, (this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlMsgId()));

                  String strStatus = "";

                  if ( txn != null ) {
                    strStatus = ( (TransactionStatus) txn.getStatus() ).getLabel();
                  }

                  orgnlGrpInfAndSts.setOrgnlMsgId((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlMsgId());
                  orgnlGrpInfAndSts.setOrgnlCreDtTm((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlCreDtTm());
                  orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");
                  orgnlGrpInfAndSts.setGrpSts(strStatus);   // ACSP or ACSC
                  pacs00200109.getFIToFIPmtStsRpt().getOrgnlGrpInfAndSts()[i] = orgnlGrpInfAndSts;
                } else {
                  throw new RuntimeException("Missing field : OrgnlMsgId OR OrgnlCreDtTm");
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

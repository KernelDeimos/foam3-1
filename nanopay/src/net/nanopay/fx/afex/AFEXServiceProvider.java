package net.nanopay.fx.afex;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import static foam.mlang.MLang.*;
import net.nanopay.bank.BankAccount;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;

public class AFEXServiceProvider extends ContextAwareSupport implements FXService, PaymentService {

  private  AFEX afexClient;
  protected DAO fxQuoteDAO_;
  private  X x;

  public AFEXServiceProvider(X x, final AFEX afexClient) {
    this.afexClient = afexClient;
    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    this.x = x;
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,  long destinationAmount,
    String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();
    GetQuoteRequest quoteRequest = new GetQuoteRequest();
    Long amount = sourceAmount > 0 ? sourceAmount : destinationAmount;
    quoteRequest.setAmount(String.valueOf(amount));
    quoteRequest.setCurrencyPair(targetCurrency + sourceCurrency);
    quoteRequest.setValueDate(getValueDate(targetCurrency, sourceCurrency));
    try {
      Quote quote = this.afexClient.getQuote(quoteRequest);
      if ( null != quote ) {
        fxQuote.setRate(quote.getRate());
        fxQuote.setTargetAmount(destinationAmount);
        fxQuote.setTargetCurrency(targetCurrency);
        fxQuote.setSourceAmount(sourceAmount);
        fxQuote.setSourceCurrency(sourceCurrency);
        fxQuote.setValueDate(quote.getValueDate());
        fxQuote = (FXQuote) fxQuoteDAO_.put_(x, fxQuote);
      }

    } catch(Exception e) {
      // Log here
    }

    return fxQuote;
  }

  private String getValueDate(String targetCurrency, String sourceCurrency ) {
    String valueDate = null;
    try {
      valueDate = this.afexClient.getValueDate(targetCurrency + sourceCurrency, "CASH");
    } catch(Exception e) {
      // Log here
    }
    return valueDate;
  }

  public boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    // TODO: Decide whether to create Trade here?
    return true;
  }

  public void addPayee(long userId, long bankAccountId, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    Address userAddress = user.getAddress() == null ? user.getBusinessAddress() : user.getAddress(); 
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );
    
    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    Address bankAddress = bankAccount.getAddress() == null ? bankAccount.getBankAddress() : bankAccount.getAddress(); 
    if ( null == bankAddress ) throw new RuntimeException("Bank Account Address is null " + bankAccountId );

    AFEXBusiness afexBusiness = getAFEXBusiness(x, sourceUser);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + sourceUser);

    // Check payee does not already exists on AFEX
    FindBeneficiaryResponse beneficiaryResponse = findBeneficiary(userId,afexBusiness.getApiKey());
    if ( null == beneficiaryResponse ) {
      CreateBeneficiaryRequest createBeneficiaryRequest = new CreateBeneficiaryRequest();
      createBeneficiaryRequest.setBankAccountNumber(bankAccount.getAccountNumber());
      createBeneficiaryRequest.setBankCountryCode(bankAddress.getCountryId());
      createBeneficiaryRequest.setBankName(bankAccount.getName());
      createBeneficiaryRequest.setBankRoutingCode(bankAccount.getRoutingCode(this.x));
      createBeneficiaryRequest.setBeneficiaryAddressLine1(userAddress.getAddress());
      createBeneficiaryRequest.setBeneficiaryCity(userAddress.getCity());
      createBeneficiaryRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
      createBeneficiaryRequest.setBeneficiaryName(user.getBusinessName());
      createBeneficiaryRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
      createBeneficiaryRequest.setBeneficiaryRegion(userAddress.getRegionId());
      createBeneficiaryRequest.setCurrency(bankAccount.getDenomination());
      createBeneficiaryRequest.setVendorId(String.valueOf(userId));
      createBeneficiaryRequest.setClientAPIKey(afexBusiness.getApiKey());

      try {
        CreateBeneficiaryResponse createBeneficiaryResponse = this.afexClient.createBeneficiary(createBeneficiaryRequest);
        if ( null == createBeneficiaryResponse ) throw new RuntimeException("Null response got for remote system." );
        if ( createBeneficiaryResponse.getCode() != 0 ) throw new RuntimeException("Unable to create Beneficiary at this time. " +  createBeneficiaryResponse.getInformationMessage());
        addBeneficiary(x, userId, sourceUser, createBeneficiaryResponse.getStatus());
      } catch(Throwable t) {
        ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
      }
    } else {
      addBeneficiary(x, userId, sourceUser, beneficiaryResponse.getStatus());
    }
  }

  public FindBeneficiaryResponse findBeneficiary(long beneficiaryId, String clientApiKey) {
    FindBeneficiaryRequest findBeneficiaryRequest = new FindBeneficiaryRequest();
    findBeneficiaryRequest.setVendorId(String.valueOf(beneficiaryId));
    findBeneficiaryRequest.setClientAPIKey(clientApiKey);
    FindBeneficiaryResponse beneficiaryResponse = null;
    try {
      beneficiaryResponse = this.afexClient.findBeneficiary(findBeneficiaryRequest);
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error finding AFEX beneficiary.", t);
    }
    return beneficiaryResponse;
  }

  private void addBeneficiary(X x, long beneficiaryId, long ownerId, String status) {
    DAO afexBeneficiaryDAO = ((DAO) x.get("afexBeneficiaryDAO")).inX(x);
    AFEXBeneficiary afexBeneficiary = (AFEXBeneficiary) afexBeneficiaryDAO.find(
      AND(
        EQ(AFEXBeneficiary.CONTACT, beneficiaryId),
        EQ(AFEXBeneficiary.OWNER, ownerId)
      )
    );

    if ( null == afexBeneficiary ) {
      afexBeneficiary = new AFEXBeneficiary();
    }
    afexBeneficiary.setId(afexBeneficiary.getId());
    afexBeneficiary.setContact(beneficiaryId);
    afexBeneficiary.setOwner(ownerId);
    afexBeneficiary.setStatus(status);
    afexBeneficiaryDAO.put(afexBeneficiary);
  }

  public void updatePayee(long userId, long bankAccountId, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    Address userAddress = user.getAddress(); 
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );
    
    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    Address bankAddress = bankAccount.getBankAddress(); 
    if ( null == bankAddress ) throw new RuntimeException("Bank Account Address is null " + bankAccountId );

    AFEXBusiness afexBusiness = getAFEXBusiness(x, sourceUser);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + sourceUser);

    UpdateBeneficiaryRequest updateBeneficiaryRequest = new UpdateBeneficiaryRequest();
    updateBeneficiaryRequest.setBankAccountNumber(bankAccount.getAccountNumber());
    updateBeneficiaryRequest.setBankCountryCode(bankAddress.getCountryId());
    //updateBeneficiaryRequest.setBankName(bankAccount.get);
    updateBeneficiaryRequest.setBankRoutingCode(bankAccount.getRoutingCode(this.x));
    updateBeneficiaryRequest.setBeneficiaryAddressLine1(bankAddress.getAddress());
    updateBeneficiaryRequest.setBeneficiaryCity(userAddress.getCity());
    updateBeneficiaryRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
    updateBeneficiaryRequest.setBeneficiaryName(user.getLegalName());
    updateBeneficiaryRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
    updateBeneficiaryRequest.setBeneficiaryRegion(userAddress.getRegionId());
    updateBeneficiaryRequest.setCurrency(bankAccount.getDenomination());
    updateBeneficiaryRequest.setVendorId(String.valueOf(userId));
    updateBeneficiaryRequest.setClientAPIKey(afexBusiness.getApiKey());

    try {
      UpdateBeneficiaryResponse updateBeneficiaryResponse = this.afexClient.updateBeneficiary(updateBeneficiaryRequest);
      if ( null == updateBeneficiaryResponse ) throw new RuntimeException("Null response got for remote system." );
      if ( updateBeneficiaryResponse.getCode() != 0 ) throw new RuntimeException("Unable to update Beneficiary at this time. " +  updateBeneficiaryResponse.getInformationMessage());
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
    }    

  }

  public void deletePayee(long payeeUserId, long payerUserId) throws RuntimeException {}

  public FindBeneficiaryResponse getPayeeInfo(String payeeUserId, Long businessId) throws RuntimeException {
    FindBeneficiaryResponse payeeInfo = null;
    AFEXBusiness afexBusiness = getAFEXBusiness(x, businessId);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + businessId);
    FindBeneficiaryRequest request = new FindBeneficiaryRequest();
    request.setVendorId(payeeUserId);
    request.setClientAPIKey(afexBusiness.getApiKey());
    try {
      payeeInfo = this.afexClient.findBeneficiary(request);
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
    }
    return payeeInfo;
  }

  public Transaction submitPayment(Transaction transaction) throws RuntimeException{
    if ( ! (transaction instanceof AFEXTransaction) ) return transaction;

    AFEXBusiness afexBusiness = getAFEXBusiness(x,transaction.getPayerId());
    if ( null == afexBusiness ) throw new RuntimeException("Business has not been completely onboarded on partner system. " + transaction.getPayerId());

    AFEXBeneficiary afexBeneficiary = getAFEXBeneficiary(x,transaction.getPayeeId(), transaction.getPayerId());
    if ( null == afexBeneficiary ) throw new RuntimeException("Business has not been completely onboarded on partner system. " + transaction.getPayerId());

    long tradeAmount = 0;
    boolean isAmountSettlement = transaction.getAmount() > 1 ? true : false;
    tradeAmount = isAmountSettlement ? transaction.getAmount() : transaction.getDestinationAmount();
    CreateTradeRequest createTradeRequest = new CreateTradeRequest();
    createTradeRequest.setClientAPIKey(afexBusiness.getApiKey());
    createTradeRequest.setAmount(String.valueOf(tradeAmount));
    createTradeRequest.setIsAmountSettlement(String.valueOf(isAmountSettlement));
    createTradeRequest.setSettlementCcy(transaction.getSourceCurrency());
    createTradeRequest.setTradeCcy(transaction.getDestinationCurrency());
    try {
      CreateTradeResponse tradeResponse = this.afexClient.createTrade(createTradeRequest);
      if ( null != tradeResponse && tradeResponse.getTradeNumber() > 0 ) {
        CreatePaymentRequest createPaymentRequest = new CreatePaymentRequest();
        createPaymentRequest.setClientAPIKey(afexBusiness.getApiKey());
        createPaymentRequest.setPaymentDate(tradeResponse.getValueDate());
        createPaymentRequest.setAmount(String.valueOf(tradeResponse.getAmount()));
        createPaymentRequest.setCurrency(tradeResponse.getTradeCcy());
        createPaymentRequest.setVendorId(String.valueOf(afexBeneficiary.getContact()));
        try {
          CreatePaymentResponse paymentResponse = this.afexClient.createPayment(createPaymentRequest);
          if ( paymentResponse != null && paymentResponse.getReferenceNumber() > 0 ) {
            AFEXTransaction txn = (AFEXTransaction) transaction.fclone();
            txn.setReferenceNumber(String.valueOf(paymentResponse.getReferenceNumber()));
            return txn;
          }
        } catch(Throwable t) {
          ((Logger) x.get("logger")).error("Error sending payment to AFEX.", t);
        } 
      }
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error createing AFEX Trade.", t);
    }

    return transaction;
  }

  protected AFEXBusiness getAFEXBusiness(X x, Long userId) {
    DAO dao = (DAO) x.get("afexBusinessDAO");
    return (AFEXBusiness) dao.find(AND(EQ(AFEXBusiness.USER, userId), EQ(AFEXBusiness.STATUS, "Active")));
  }

  protected AFEXBeneficiary getAFEXBeneficiary(X x, Long beneficiaryId, Long ownerId) {
    DAO dao = (DAO) x.get("afexBeneficiaryDAO");
    return (AFEXBeneficiary) dao.find(AND(EQ(AFEXBeneficiary.CONTACT, beneficiaryId), EQ(AFEXBeneficiary.OWNER, ownerId), 
      EQ(AFEXBeneficiary.STATUS, "Active")));
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

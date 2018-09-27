package net.nanopay.fx.ascendantfx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import net.nanopay.bank.BankAccount;
import net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest;
import net.nanopay.fx.ascendantfx.model.AcceptQuoteResult;
import net.nanopay.fx.ascendantfx.model.Deal;
import net.nanopay.fx.ascendantfx.model.DealDetail;
import net.nanopay.fx.ascendantfx.model.Direction;
import net.nanopay.fx.ascendantfx.model.GetQuoteRequest;
import net.nanopay.fx.ascendantfx.model.GetQuoteResult;
import net.nanopay.fx.ascendantfx.model.Payee;
import net.nanopay.fx.ascendantfx.model.PayeeDetail;
import net.nanopay.fx.ascendantfx.model.PayeeOperationRequest;
import net.nanopay.fx.ascendantfx.model.PayeeOperationResult;
import net.nanopay.fx.ascendantfx.model.SubmitDealResult;
import net.nanopay.fx.ascendantfx.model.SubmitDealRequest;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FXDirection;
import net.nanopay.fx.FXPayee;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXServiceProvider;
import net.nanopay.fx.FeesFields;
import net.nanopay.payment.Institution;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.Transaction;

public class AscendantFXServiceProvider implements FXServiceProvider, PaymentService {

  public static final String AFX_ORG_ID = "5904960";
  public static final String AFX_METHOD_ID = "";
  public static final Long AFX_SUCCESS_CODE = 200l;
  private final AscendantFX ascendantFX;
  private final X x;

  public AscendantFXServiceProvider(X x, final AscendantFX ascendantFX) {
    this.ascendantFX = ascendantFX;
    this.x = x;
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, double sourceAmount,
      String fxDirection, String valueDate, long user) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();

    try {
      // Get orgId
      String orgId = getUserAscendantFXOrgId(user);
      if ( SafetyUtil.isEmpty(orgId) ) throw new RuntimeException("Unable to find Ascendant Organization ID for User: " + user);
      //Convert to AscendantFx Request
      GetQuoteRequest getQuoteRequest = new GetQuoteRequest();
      getQuoteRequest.setMethodID("AFXEWSGQ");
      getQuoteRequest.setOrgID(orgId);
      getQuoteRequest.setTotalNumberOfPayment(1);

      Deal deal = new Deal();
      Direction direction = Direction.valueOf(fxDirection);
      deal.setDirection(direction);
      deal.setFxAmount(sourceAmount);
      deal.setFxCurrencyID(sourceCurrency);
      deal.setSettlementCurrencyID(targetCurrency);
      deal.setPaymentMethod("Wire");
      deal.setPaymentSequenceNo(1);

      List<Deal> deals = new ArrayList<Deal>();
      deals.add(deal);
      Deal[] dealArr = new Deal[deals.size()];
      getQuoteRequest.setPayment(deals.toArray(dealArr));

      GetQuoteResult getQuoteResult = this.ascendantFX.getQuote(getQuoteRequest);
      if ( null == getQuoteResult ) throw new RuntimeException("No response from AscendantFX");


      if ( getQuoteResult.getErrorCode() != 0 ) throw new RuntimeException("Unable to get FX Quote from AscendantFX");

      //Convert to FXQUote
      fxQuote.setExternalId(String.valueOf(getQuoteResult.getQuote().getID()));
      fxQuote.setSourceCurrency(sourceCurrency);
      fxQuote.setTargetCurrency(targetCurrency);
      fxQuote.setStatus(ExchangeRateStatus.QUOTED.getName());

      Deal[] dealResult = getQuoteResult.getPayment();
      if ( dealResult.length > 0 ) {
        Deal aDeal = dealResult[0];

        fxQuote.setRate(aDeal.getRate());
        fxQuote.setExpiryTime(getQuoteResult.getQuote().getExpiryTime());
        fxQuote.setTargetAmount(aDeal.getSettlementAmount());
        fxQuote.setSourceAmount(aDeal.getFxAmount());
        fxQuote.setFee(aDeal.getFee());
        fxQuote.setFeeCurrency(aDeal.getFxCurrencyID());
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    return fxQuote;

  }

  public Boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    Boolean result = false;
    // Get orgId
    String orgId = getUserAscendantFXOrgId(user);
    if ( SafetyUtil.isEmpty(orgId) ) throw new RuntimeException("Unable to find Ascendant Organization ID for User: " + user);
    //Build Ascendant Request
    AcceptQuoteRequest request = new AcceptQuoteRequest();
    request.setMethodID("AFXEWSAQ");
    request.setOrgID(orgId);
    request.setQuoteID(Long.parseLong(quoteId));

    AcceptQuoteResult acceptQuoteResult = this.ascendantFX.acceptQuote(request);
    if ( null != acceptQuoteResult && acceptQuoteResult.getErrorCode() == 0 ) {
      result = true;
    }

    return result;
  }

  public void addPayee(long userId, long sourceUser) throws RuntimeException{
    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) userDAO.find_(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    BankAccount bankAccount = BankAccount.findDefault(x, user, null);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + user.getId() );

    String orgId = getUserAscendantFXOrgId(sourceUser);
    if ( SafetyUtil.isEmpty(orgId) ) throw new RuntimeException("Unable to find Ascendant Organization ID for User: " + sourceUser);

    PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
    ascendantRequest.setMethodID("AFXEWSPOA");
    ascendantRequest.setOrgID(orgId);

    PayeeDetail ascendantPayee = getPayeeDetail(user, bankAccount, orgId);
    PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
    ascendantPayeeArr[0] = ascendantPayee;
    ascendantRequest.setPayeeDetail(ascendantPayeeArr);

    PayeeOperationResult ascendantResult = this.ascendantFX.addPayee(ascendantRequest);
    if ( null == ascendantResult ) throw new RuntimeException("No response from AscendantFX");
    if ( ascendantResult.getErrorCode() == 0 ) {
      DAO ascendantUserPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
      AscendantUserPayeeJunction userPayeeJunction = new AscendantUserPayeeJunction.Builder(x).build();
      userPayeeJunction.setUser(userId);
      userPayeeJunction.setAscendantPayeeId(ascendantResult.getPayeeId());
      userPayeeJunction.setOrgId(orgId);
      ascendantUserPayeeJunctionDAO.put(userPayeeJunction);
    }else{
      throw new RuntimeException("Unable to Add Payee to AscendantFX Organization: " + ascendantResult.getErrorMessage() );
    }

  }

  public void deletePayee(long payeeUserId, long payerUserId) throws RuntimeException {
    String orgId = getUserAscendantFXOrgId(payerUserId);
    if ( SafetyUtil.isEmpty(orgId) ) throw new RuntimeException("Unable to find Ascendant Organization ID for User: " + payerUserId);
    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) userDAO.find_(x, payeeUserId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + payeeUserId);

    AscendantUserPayeeJunction userPayeeJunction = getAscendantUserPayeeJunction(orgId, payeeUserId);
    if ( ! SafetyUtil.isEmpty(userPayeeJunction.getAscendantPayeeId()) ) {
      PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
      ascendantRequest.setMethodID("AFXEWSPOD");
      ascendantRequest.setOrgID(orgId);

      PayeeDetail ascendantPayee = new PayeeDetail();
      ascendantPayee.setPaymentMethod("Wire");
      ascendantPayee.setOriginatorID(orgId);
      ascendantPayee.setPayeeID(Integer.parseInt(userPayeeJunction.getAscendantPayeeId()));
      ascendantPayee.setPayeeInternalReference(String.valueOf(payeeUserId));
      PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
      ascendantPayeeArr[0] = ascendantPayee;
      ascendantRequest.setPayeeDetail(ascendantPayeeArr);

      PayeeOperationResult ascendantResult = this.ascendantFX.deletePayee(ascendantRequest);

      if ( null == ascendantResult ) throw new RuntimeException("No response from AscendantFX");
      if ( ascendantResult.getErrorCode() != 0 )
        throw new RuntimeException("Unable to Delete Payee from AscendantFX Organization: " + ascendantResult.getErrorMessage());

      DAO ascendantUserPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
      ascendantUserPayeeJunctionDAO.remove_(x, userPayeeJunction);

    }

  }

  public void submitPayment(Transaction transaction) throws RuntimeException {
    try {
      if ( (transaction instanceof AscendantFXTransaction) ) {
        AscendantFXTransaction ascendantTransaction = (AscendantFXTransaction) transaction;
        String orgId = getUserAscendantFXOrgId(ascendantTransaction.getPayerId());
        if ( SafetyUtil.isEmpty(orgId) ) throw new RuntimeException("Unable to find Ascendant Organization ID for User: " + ascendantTransaction.getPayerId());

        AscendantUserPayeeJunction userPayeeJunction = getAscendantUserPayeeJunction(orgId, ascendantTransaction.getPayeeId());

        // Check FXDeal has not expired
        if ( dealHasExpired(ascendantTransaction.getFxExpiry()) )
          throw new RuntimeException("FX Transaction has expired");


        // If Payee is not already linked to Payer, then Add Payee
        if ( SafetyUtil.isEmpty(userPayeeJunction.getAscendantPayeeId()) ) {
          addPayee(ascendantTransaction.getPayeeId(), ascendantTransaction.getPayerId());
          userPayeeJunction = getAscendantUserPayeeJunction(orgId, ascendantTransaction.getPayeeId()); // REVEIW: Don't like to look-up twice
        }

        //Build Ascendant Request
        SubmitDealRequest ascendantRequest = new SubmitDealRequest();
        ascendantRequest.setMethodID("AFXEWSSD");
        ascendantRequest.setOrgID(orgId);
        ascendantRequest.setQuoteID(Long.parseLong(ascendantTransaction.getFxQuoteId()));
        ascendantRequest.setTotalNumberOfPayment(1);

        DealDetail[] dealArr = new DealDetail[1];
        DealDetail dealDetail = new DealDetail();
        dealDetail.setDirection(Direction.valueOf(FXDirection.Buy.getName()));

        dealDetail.setFee(0);
        dealDetail.setFxAmount(ascendantTransaction.getAmount());
        dealDetail.setFxCurrencyID(ascendantTransaction.getSourceCurrency());
        dealDetail.setPaymentMethod("wire"); // REVEIW: Wire ?
        dealDetail.setPaymentSequenceNo(1);
        dealDetail.setRate(ascendantTransaction.getFxRate());
        dealDetail.setSettlementAmount(ascendantTransaction.getFxSettlementAmount());
        dealDetail.setSettlementCurrencyID(ascendantTransaction.getDestinationCurrency());
        dealDetail.setInternalNotes("");

        Payee payee = new Payee();
        payee.setPayeeID(Integer.parseInt(userPayeeJunction.getAscendantPayeeId()));
        dealDetail.setPayee(payee);
        dealArr[0] = dealDetail;
        ascendantRequest.setPaymentDetail(dealArr);

        SubmitDealResult submittedDealResult = this.ascendantFX.submitDeal(ascendantRequest);
        if ( null == submittedDealResult ) throw new RuntimeException("No response from AscendantFX");

        if ( submittedDealResult.getErrorCode() != 0 )
          throw new RuntimeException(submittedDealResult.getErrorMessage());

      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private AscendantUserPayeeJunction getAscendantUserPayeeJunction(String orgId, long userId) {
    DAO userPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
    final AscendantUserPayeeJunction userPayeeJunction = new AscendantUserPayeeJunction.Builder(x).build();
    userPayeeJunctionDAO.where(
              MLang.AND(
                  MLang.EQ(AscendantUserPayeeJunction.ORG_ID, orgId),
                  MLang.EQ(AscendantUserPayeeJunction.USER, userId)
              )
          ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        userPayeeJunction.setAscendantPayeeId(((AscendantUserPayeeJunction) obj).getAscendantPayeeId());
      }
    });
    return userPayeeJunction;
  }

  private PayeeDetail getPayeeDetail(User user, BankAccount bankAccount, String orgId) {
    PayeeDetail payee = new PayeeDetail();
    payee.setPayeeID(0);
    payee.setPaymentMethod("Wire");

    if ( null != user && null != bankAccount ) {
      payee.setPayeeReference(String.valueOf(user.getId()));
      payee.setCurrencyID(bankAccount.getDenomination());
      payee.setPayeeCountryID(user.getAddress().getCountryId());
      payee.setPayeeInternalReference(String.valueOf(user.getId()));
      DAO institutionDAO = (DAO) x.get("institutionDAO");
      Institution institution = (Institution) institutionDAO.find_(x, bankAccount.getInstitution());

      if ( null != institution ) {
        payee.setOriginatorID(orgId);
        payee.setPayeeAddress1(user.getAddress().getAddress1());
        payee.setPayeeName(user.getFirstName() + " " + user.getLastName());
        payee.setPayeeEmail(user.getEmail());
        payee.setPayeeReference(String.valueOf(user.getId()));
        payee.setPayeeBankName(institution.getName());
        payee.setPayeeBankCountryID(institution.getCountryId());
        payee.setPayeeBankSwiftCode(institution.getSwiftCode());
        payee.setPayeeAccountIBANNumber(institution.getInstitutionNumber());
        payee.setPayeeBankRoutingCode(institution.getInstitutionNumber()); //TODO:
        payee.setPayeeBankRoutingType("Wire"); //TODO
        payee.setPayeeInterBankRoutingCodeType(""); // TODO
      }

    }
    return payee;
  }

  private String getUserAscendantFXOrgId(long userId){
    String orgId = null;
    DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
    final AscendantFXUser ascendantFXUser = new AscendantFXUser.Builder(x).build();
    ascendantFXUserDAO.where(
                  MLang.EQ(AscendantFXUser.USER, userId)
          ).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              ascendantFXUser.setOrgId(((AscendantFXUser) obj).getOrgId());
            }
          });

    if ( ! SafetyUtil.isEmpty(ascendantFXUser.getOrgId()) ) orgId = ascendantFXUser.getOrgId();

    return orgId;
  }

  private boolean dealHasExpired(Date expiryDate) {
    int bufferMinutes = 5;
    Calendar today = Calendar.getInstance();
    today.add(Calendar.MINUTE, bufferMinutes);

    Calendar expiry = Calendar.getInstance();
    expiry.setTime(expiryDate);

    return (today.after(expiry));
  }

}

package net.nanopay.cico.driver.realex;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import foam.dao.AbstractSink;
import java.util.*;
import foam.nanos.auth.User;
import net.nanopay.cico.paymentCard.model.PaymentCard;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import com.realexpayments.remote.sdk.domain.payment.AutoSettle;
import com.realexpayments.remote.sdk.domain.Card;
import com.realexpayments.remote.sdk.domain.Cvn.PresenceIndicator;
import com.realexpayments.remote.sdk.domain.Card.CardType;
import com.realexpayments.remote.sdk.domain.payment.PaymentRequest.PaymentType;
import com.realexpayments.remote.sdk.domain.payment.PaymentRequest;
import com.realexpayments.remote.sdk.http.HttpConfiguration;
import com.realexpayments.remote.sdk.RealexClient;
import com.realexpayments.remote.sdk.RealexException;
import com.realexpayments.remote.sdk.RealexServerException;
import com.realexpayments.remote.sdk.domain.payment.PaymentResponse;
import com.realexpayments.remote.sdk.domain.Card;
import com.realexpayments.remote.sdk.domain.PaymentData;
import net.nanopay.cico.model.MobileWallet;
import static foam.mlang.MLang.*;
import foam.dao.ArraySink;
import net.nanopay.cico.model.RealexPaymentAccountInfo;
import net.nanopay.cico.driver.CICODriver;
import net.nanopay.cico.driver.CICODriverUserReference;
import java.util.UUID;

public class RealexTransactionDAO
 extends ProxyDAO
{
  public RealexTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    //If transaction is realex payment
    String cicoDriverId = (String) transaction.getCicoDriverId();
    if ( ! CICODriver.REALEX.equals(cicoDriverId) )
      return getDelegate().put_(x, obj);
    //figure out the type of transaction: mobile, savedbankCard, and one-off
    PaymentRequest paymentRequest = new PaymentRequest();
    RealexPaymentAccountInfo paymentAccountInfo = (RealexPaymentAccountInfo) transaction.getPaymentAccountInfo();
    if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.MOBILE ) {
      paymentRequest
        .addType(PaymentType.AUTH_MOBILE)
        .addMerchantId(paymentAccountInfo.getMerchantId())
        .addOrderId(Long.toString(transaction.getId()))
        .addAutoSettle(new AutoSettle().addFlag(AutoSettle.AutoSettleFlag.TRUE))
        .addToken(paymentAccountInfo.getToken());
      if ( MobileWallet.GOOGLEPAY == paymentAccountInfo.getMobileWallet() )
        paymentRequest.addMobile("pay-with-google");
      else if ( MobileWallet.APPLEPAY == paymentAccountInfo.getMobileWallet() )
        paymentRequest.addMobile("apple-pay");
    } else if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.PAYMENTCARD ) {
      User user = (User) x.get("user");
      DAO currencyDAO = (DAO) x.get("currencyDAO");
      net.nanopay.model.Currency currency = (net.nanopay.model.Currency) currencyDAO.find(paymentAccountInfo.getCurrencyId().toString());
      DAO paymentCardDAO = (DAO) x.get("paymentCardDAO");
      long cardId = paymentAccountInfo.getPaymentCardId();
      PaymentCard paymentCard = (PaymentCard) paymentCardDAO.find(cardId);
      DAO cicoDriverUserReferenceDAO = (DAO) x.get("cicoDriverUserReferenceDAO");
      ArraySink sink = (ArraySink) cicoDriverUserReferenceDAO.where(AND(
        EQ(CICODriverUserReference.DRIVER_ID, cicoDriverId),
        EQ(CICODriverUserReference.USER_ID, user.getId())
      )).select(new ArraySink());
      List list = sink.getArray();
      if ( list.size() == 0 ) {
        throw new RuntimeException("asdfdasfasdf");
      }
      CICODriverUserReference userReference = (CICODriverUserReference) list.get(0);
      PaymentData myPaymentData = new PaymentData()
        .addCvnNumber(paymentAccountInfo.getCvn());
      paymentRequest
        .addType(PaymentType.RECEIPT_IN)
        .addMerchantId(paymentAccountInfo.getMerchantId())
        .addAmount(transaction.getAmount())
        .addOrderId(UUID.randomUUID().toString())
        .addCurrency((String) currency.getId())
        .addPaymentMethod(paymentCard.getRealexCardReference())
        .addPaymentData(myPaymentData)
        .addAutoSettle(new AutoSettle().addFlag(AutoSettle.AutoSettleFlag.TRUE));
      paymentRequest.addPayerReference(userReference.getReference());
    } else if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.ONEOFF ) {
      throw new RuntimeException("One-off do not support");
    } else {
      throw new RuntimeException("Unknown payment type for Realex platform");
    }
    HttpConfiguration HttpConfiguration = new HttpConfiguration();
    HttpConfiguration.setEndpoint("https://api.sandbox.realexpayments.com/epage-remote.cgi");
    //TODO: do not hard code secret
    RealexClient client = new RealexClient("secret", HttpConfiguration);
    PaymentResponse response = null;
    try {
      response = client.send(paymentRequest);
      // '00' == success
      if ( ! "00".equals(response.getResult()) )
        throw new RuntimeException("fail to cashIn by Realex, error message: " + response.getMessage());
    } catch ( RealexServerException e ) {
      throw new RuntimeException(e);
    } catch ( RealexException e ) {
      throw new RuntimeException(e);
    } catch ( Throwable e ) {
      throw new RuntimeException(e);
    } finally {
      if ( response != null && "00".equals(response.getResult()) )
        transaction.setStatus(TransactionStatus.COMPLETED);
      else
        transaction.setStatus(TransactionStatus.DECLINED);
      return getDelegate().put_(x, transaction);
    }
  }
}

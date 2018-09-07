package net.nanopay.tx.stripe;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.SafetyUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.model.Currency;
import net.nanopay.cico.paymentCard.model.StripePaymentCard;

import java.util.HashMap;
import java.util.Map;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.net.RequestOptions;
import com.stripe.Stripe;

public class StripeTransactionDAO extends ProxyDAO {
  private static final Long STRIPE_ID = 2L;
  protected RequestOptions options_ = null;

  public StripeTransactionDAO(X x, DAO delegate) {
    this(x, "pk_test_sEkkCjZ4jZt2WkJ6iqqyIGLW", delegate);
  }

  public StripeTransactionDAO(X x, String apiKey, DAO delegate) {
    setX(x);
    //this.options_ = RequestOptions.builder().setApiKey(apiKey).build();
    setDelegate(delegate);
    Stripe.apiKey = "sk_test_KD0gUbEr1pATM7mTcB3eKNa0";
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    if ( ! ( obj instanceof StripeTransaction ) ) {
      return super.put_(x, obj);
    }

    StripeTransaction transaction = (StripeTransaction) obj;
    DAO localTransactionDAO = (DAO) x.get("localTransactionDAO");

    // Caculate extra charge for the apple pay.
    if ( transaction.getIsRequestingFee() ) {
      double amount = transaction.getAmount() / 100.0;
      amount = amount * 0.0325;
      amount = amount * 100;
      transaction.setFee((long) amount);
      return transaction;
    }

    DAO currencyDAO = (DAO) x.get("currencyDAO");
    Currency currency = (Currency) currencyDAO.find(transaction.getCurrencyId().toString());

    Map<String, Object> chargeMap = new HashMap<String, Object>();
    chargeMap.put("currency", ((String) currency.getId()).toLowerCase());
    //chargeMap.put("description", transaction.getNotes());

    if ( transaction.getPaymentType() == net.nanopay.cico.CICOPaymentType.MOBILE ) {
      double fee = transaction.getAmount() / 100.0;
      fee = fee * 0.0325;
      fee = fee * 100;
      transaction.setFee((long) fee);
      chargeMap.put("amount", transaction.getAmount() + ((long) fee)); // Include the 3.25% fee
      chargeMap.put("source", transaction.getMobileToken());
    } else if ( transaction.getPaymentType() == net.nanopay.cico.CICOPaymentType.PAYMENTCARD ) {
      DAO paymentCardDAO = (DAO) x.get("paymentCardDAO");

      StripePaymentCard paymentCard = (StripePaymentCard) paymentCardDAO.find_(x, transaction.getPaymentCardId());

      if ( paymentCard == null )
        throw new RuntimeException("Can not find payment card");

      chargeMap.put("amount", transaction.getAmount());
      chargeMap.put("customer", paymentCard.getStripeCustomerId());
     } else {
      throw new RuntimeException("PaymentType is not supported");
     }

   Charge charge = null;
    try {
      charge = Charge.create(chargeMap, this.options_);
      transaction.setStripeChargeId(charge.getId());
      transaction.setStatus(TransactionStatus.COMPLETED);
      return getDelegate().put_(x, transaction);
    } catch (StripeException e){
      transaction.setStatus(TransactionStatus.DECLINED);
      getDelegate().put_(x, transaction);
      if(SafetyUtil.isEmpty(e.getMessage()))
        throw new RuntimeException("Stripe transaction failed.");
      else
        throw new RuntimeException(e.getMessage());
    }
  }
}

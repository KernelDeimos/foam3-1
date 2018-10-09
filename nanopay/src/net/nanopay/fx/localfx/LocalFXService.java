package net.nanopay.fx.localfx;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import net.nanopay.fx.ExchangeRate;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.fx.ExchangeRateStatus;

public class LocalFXService  implements FXService {

  protected DAO exchangeRateDAO_;
  protected DAO fxQuoteDAO_;
  protected Double feeAmount = 1d;
  private final X x;

  public LocalFXService(X x) {
    this.x = x;
    exchangeRateDAO_ = (DAO) x.get("exchangeRateDAO");
    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency,
      double sourceAmount, String fxDirection, String valueDate, long user) throws RuntimeException {

    final FXQuote fxQuote = new FXQuote();


    // Fetch rates from exchangeRateDAO_
    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
            MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {

        fxQuote.setSourceCurrency(((ExchangeRate) obj).getFromCurrency());
        fxQuote.setTargetCurrency(((ExchangeRate) obj).getToCurrency());
        fxQuote.setExternalId(((ExchangeRate) obj).getDealReferenceNumber());
        fxQuote.setStatus(((ExchangeRate) obj).getFxStatus().getLabel());
        fxQuote.setRate(((ExchangeRate) obj).getRate());
        fxQuote.setExpiryTime(((ExchangeRate) obj).getExpirationDate());
      }
    });

    fxQuote.setTargetAmount((sourceAmount - feeAmount) * fxQuote.getRate());
    fxQuote.setSourceAmount(sourceAmount);
    fxQuote.setFee(feeAmount);
    fxQuote.setFeeCurrency(sourceCurrency);

    return (FXQuote) fxQuoteDAO_.put_(this.x, fxQuote);

  }

  public Boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(quoteId));
    if  ( null != quote ) {
      quote.setStatus(ExchangeRateStatus.ACCEPTED.getName());
      fxQuoteDAO_.put_(this.x, quote);
      return true;
    }
    return false;
  }
}

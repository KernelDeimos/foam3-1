package net.nanopay.fx;

import foam.core.X;
import foam.dao.DAO;
import net.nanopay.fx.localfx.LocalFXService;
import net.nanopay.fx.ExchangeRatesCron;

public class FXServiceTest
    extends foam.nanos.test.Test {

  protected FXService fxService;
  protected DAO fxQuoteDAO_;
  X x_;

  @Override
  public void runTest(X x) {

    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    x_ = x;

    fxService = (FXService) x.get("localFXService");

    testGetFXRate();
    testAcceptFXRate();

  }

  public void testGetFXRate() {
    ExchangeRatesCron cron = new ExchangeRatesCron();
    cron.execute(x_);
    FXQuote fxQuote = fxService.getFXRate("CAD", "INR", 100l, 0l, "Buy", null, 0, null);
    test( null != fxQuote, "FX Quote was returned" );
    test( fxQuote.getId() > 0, "Quote has an ID: " + fxQuote.getId() );
    test( "CAD".equals(fxQuote.getSourceCurrency()), "Quote has Source Currency" );
    test( fxQuote.getRate() > 0, "FX rate was returned: " + fxQuote.getRate() );
    test( fxQuote.getTargetAmount() > 0, "FX Target Amount was populated: " + fxQuote.getTargetAmount() );


    FXQuote fxQuoteNoAmount = fxService.getFXRate("CAD", "INR", 0l, 5587l, "Buy", null, 0, null);
    test( fxQuoteNoAmount.getRate() > 0, "FX rate was returned with no Amount: " + fxQuoteNoAmount.getRate() );
    test( fxQuoteNoAmount.getSourceAmount() > 0, "FX Amount was populated: " + fxQuoteNoAmount.getSourceAmount() );
    test( fxQuoteNoAmount.getTargetAmount() > 0, "FX Target Amount: " + fxQuoteNoAmount.getTargetAmount() );

  }

  public void testAcceptFXRate() {

    FXQuote fxQuote = fxService.getFXRate("CAD", "INR", 100l, 0l, "Buy", null, 0, null);
    test( fxQuote.getId() > 0, "Quote has an ID: " + fxQuote.getId() );

    fxQuote = (FXQuote) fxQuoteDAO_.find(fxQuote.getId());
    test( null != fxQuote, "FX Quote was returned" );
    if ( null != fxQuote ) {
      Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(fxQuote.getId()), 0);
      test( fxAccepted, "FX Quote was accepted" );
    }

  }

}

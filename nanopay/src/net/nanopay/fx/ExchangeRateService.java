package net.nanopay.fx;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.NanoService;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import net.nanopay.fx.interac.model.AcceptExchangeRateFields;
import net.nanopay.fx.interac.model.AcceptRateApiModel;
import net.nanopay.fx.model.*;
import org.apache.commons.io.IOUtils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;
import java.util.TimeZone;

import static foam.mlang.MLang.GT;

public class ExchangeRateService
  extends    ContextAwareSupport
  implements ExchangeRateInterface, NanoService
{
  protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {

    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };


  protected DAO    exchangeRateDAO_;
  protected Double feeAmount = 1d;

  @Override
  public ExchangeRateQuote getRateFromSource(String sourceCurrency, String targetCurrency, double sourceAmount, String valueDate) {
    PM pm = new PM(this.getClass(), "getRateFromSource");

    if ( SafetyUtil.isEmpty(sourceCurrency) ) {
      throw new RuntimeException("Invalid sourceCurrency");
    }

    if ( SafetyUtil.isEmpty(targetCurrency) ) {
      throw new RuntimeException("Invalid targetCurrency");
    }

    if ( sourceAmount < 0 ) {
      throw new RuntimeException("Invalid sourceAmount");
    }

    //final double amount = ((double) amountI) / 100.0;
    final ExchangeRateQuote  quote       = new ExchangeRateQuote();
    final ExchangeRateFields reqExRate   = new ExchangeRateFields();
    final FeesFields         reqFee      = new FeesFields();
    final DeliveryTimeFields reqDlvrTime = new DeliveryTimeFields();

    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
            MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        quote.setCode(((ExchangeRate) obj).getCode());
        quote.setExchangeRate(reqExRate);
        quote.setFee(reqFee);
        quote.setDeliveryTime(reqDlvrTime);

        if ( SafetyUtil.isEmpty(valueDate) ) {
          reqExRate.setValueDate((Date) new Date());
        } else {
            //reqExRate.setValueDate(valueDate);
          try {
            String pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'";
            SimpleDateFormat format = new SimpleDateFormat(pattern);
            Date date = format.parse(valueDate);
            reqExRate.setValueDate(date);
          } catch ( Throwable t ) {
              //TODO
          }
        }

        reqExRate.setSourceCurrency(sourceCurrency);
        reqExRate.setTargetCurrency(targetCurrency);
        reqExRate.setDealReferenceNumber(((ExchangeRate) obj).getDealReferenceNumber());
        reqExRate.setFxStatus(((ExchangeRate) obj).getFxStatus());
        reqExRate.setRate(((ExchangeRate) obj).getRate());
        reqExRate.setTargetAmount((sourceAmount - feeAmount) * reqExRate.getRate());
        reqExRate.setSourceAmount(sourceAmount);
        reqFee.setTotalFees(feeAmount);
        reqFee.setTotalFeesCurrency(sourceCurrency);
        reqExRate.setExpirationTime(new Date(new Date().getTime() + (1000 * 60 * 60 * 2)));
        reqDlvrTime.setProcessDate(new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));
      }
    });

    if ( SafetyUtil.isEmpty(quote.getCode()) ) {
      quote.setCode("400");
    }

    pm.log(getX());

    // TODO: move to cron job
    new Thread() {
      public void run() {
        // TODO: this should be in a loop with a sleep
        // (or just move to cron)
        fetchRates();
      }
    }.start();

    return quote;
  }

  @Override
  public ExchangeRateQuote getRateFromTarget(String sourceCurrency, String targetCurrency, double targetAmount, String valueDate) {
    PM pm = new PM(this.getClass(), "getRateFromSource");

    if ( SafetyUtil.isEmpty(sourceCurrency) ) {
      throw new RuntimeException("Invalid sourceCurrency");
    }

    if ( SafetyUtil.isEmpty(targetCurrency) ) {
      throw new RuntimeException("Invalid targetCurrency");
    }

    if ( targetAmount < 0 ) {
      throw new RuntimeException("Invalid targetAmount");
    }

    //final double amount = ((double) amountI) / 100.0;
    final ExchangeRateQuote  quote       = new ExchangeRateQuote();
    final ExchangeRateFields reqExRate   = new ExchangeRateFields();
    final FeesFields         reqFee      = new FeesFields();
    final DeliveryTimeFields reqDlvrTime = new DeliveryTimeFields();

    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
            MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        reqExRate.setRate(((ExchangeRate) obj).getRate());
        quote.setExchangeRate(reqExRate);
        quote.setFee(reqFee);
        quote.setDeliveryTime(reqDlvrTime);
        reqExRate.setSourceCurrency(sourceCurrency);
        reqExRate.setTargetCurrency(targetCurrency);

        if ( SafetyUtil.isEmpty(valueDate) ) {
          reqExRate.setValueDate((Date) new Date());
        } else {
          try {
            String pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'";
            SimpleDateFormat format = new SimpleDateFormat(pattern);
            Date date = format.parse(valueDate);
            reqExRate.setValueDate(date);
          } catch ( Throwable t ) {
            //TODO
          }
        }

        reqExRate.setDealReferenceNumber(((ExchangeRate) obj).getDealReferenceNumber());
        reqExRate.setFxStatus(((ExchangeRate) obj).getFxStatus());
        quote.setCode(((ExchangeRate) obj).getCode());

        reqExRate.setSourceAmount((targetAmount / reqExRate.getRate()) + feeAmount);
        reqExRate.setTargetAmount(targetAmount);
        reqFee.setTotalFees(feeAmount);
        reqFee.setTotalFeesCurrency(sourceCurrency);
        reqExRate.setExpirationTime(new Date(new Date().getTime() + (1000 * 60 * 60 * 2)));
        reqDlvrTime.setProcessDate(new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));

      }
    });

    if ( SafetyUtil.isEmpty(quote.getCode()) ) {
      quote.setCode("400");
    }

    pm.log(getX());

    // TODO: move to cron job
    new Thread() {
      public void run() {
        // TODO: this should be in a loop with a sleep
        // (or just move to cron)
        fetchRates();
      }
    }.start();

    return quote;
  }

  public void fetchRates() {
    PM pmFetch = new PM(this.getClass(), "fetchRates");

    Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
    Count count = (Count) exchangeRateDAO_.where(GT(ExchangeRate.EXPIRATION_DATE, calendar.getTime())).select(new Count());

    if ( count.getValue() == 0 ) {
      HttpURLConnection conn = null;
      BufferedReader reader = null;

      try {
        URL url = new URL("https://exchangeratesapi.io/api/latest?base=CAD");
        conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5 * 1000);
        conn.setReadTimeout(5 * 1000);
        conn.setDoInput(true);
        conn.setRequestProperty("Accept-Charset", "UTF-8");

        StringBuilder builder = sb.get();
        reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
        for ( String line ; (line = reader.readLine()) != null ; ) {
          builder.append(line);
        }

        System.out.println(builder.toString());

        JSONParser parser = getX().create(JSONParser.class);
        FixerIOExchangeRate response = (FixerIOExchangeRate) parser
          .parseString(builder.toString(), FixerIOExchangeRate.class);

        System.out.println(response.toJSON());

        Map rates = response.getRates();
        for ( Object key : rates.keySet() ) {
          exchangeRateDAO_.put(new ExchangeRate.Builder(getX())
            .setFromCurrency(response.getBase())
            .setToCurrency((String) key)
            .setRate((Double) rates.get(key))
            .setExpirationDate(calendar.getTime())
            .build());
        }
      } catch ( Throwable t ) {
        t.printStackTrace();
        IOUtils.closeQuietly(reader);
        if ( conn != null ) {
          conn.disconnect();
        }
      }
    }

    pmFetch.log(getX());
  }

  @Override
  public void start() {
    exchangeRateDAO_ = (DAO) getX().get("exchangeRateDAO");
    fetchRates();
  }

  @Override
  public AcceptRateApiModel acceptRate(String endToEndId, String dealRefNum) {
    if ( SafetyUtil.isEmpty(dealRefNum) ) {
      throw new RuntimeException("Invalid dealRefNum");
    }

    final AcceptRateApiModel acceptRate  = new AcceptRateApiModel();
    final AcceptExchangeRateFields acceptField = new AcceptExchangeRateFields();

    acceptRate.setCode("200");
    acceptRate.setEndToEndId(endToEndId);
    //String transactionId = java.util.UUID.randomUUID().toString().replace("-", "");
    //acceptRate.setTransactionId(transactionId);
    acceptField.setDealReferenceNumber(dealRefNum);
    acceptField.setFxStatus("Booked");
    acceptRate.setExchangeRate(acceptField);

    return acceptRate;
  }
}

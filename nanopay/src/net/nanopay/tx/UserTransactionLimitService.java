package net.nanopay.tx;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.Sink;
import static foam.mlang.MLang.*;
import foam.mlang.sink.Count;
import foam.mlang.sink.Sum;
import foam.nanos.auth.User;
import net.nanopay.model.Broker;
import net.nanopay.tx.UserTransactionLimit;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionLimit;
import net.nanopay.tx.model.TransactionLimitTimeFrame;
import net.nanopay.tx.model.TransactionLimitType;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class UserTransactionLimitService extends ContextAwareSupport implements UserTransactionLimit {
  protected DAO userDAO_;
  protected DAO transactionLimitDAO_;
  protected DAO transactionDAO_;
  protected DAO brokerDAO_;

  // Constants used to get the predefined limit values from the Transaction limits(through the property name)
  protected static final String DEFAULT_USER_TRANSACTION_LIMIT = "default_user";
  protected static final String DEFAULT_BROKER_TRANSACTION_LIMIT = "default_broker";

  @Override
  public void start() {
    userDAO_ = (DAO) getX().get("localUserDAO");
    transactionDAO_ = (DAO) getX().get("transactionDAO");
    transactionLimitDAO_ = (DAO) getX().get("transactionLimitDAO");
    brokerDAO_ = (DAO) getX().get("brokerDAO");
  }

  @Override
  public TransactionLimit getLimit(long userId, TransactionLimitTimeFrame timeFrame, TransactionLimitType type) throws RuntimeException {
    User user = (User) userDAO_.find(userId);

    if ( user == null ) {
      throw new RuntimeException("User not found.");
    }

    for ( TransactionLimit userLimit : user.getTransactionLimits() ) {
      if ( userLimit.getType() == type && userLimit.getTimeFrame() == timeFrame ) {
        return userLimit;
      }
    }
    String limitName = DEFAULT_USER_TRANSACTION_LIMIT;
    if ( isBroker(userId) ) {
      limitName = DEFAULT_BROKER_TRANSACTION_LIMIT;
    }
    Sink sink = new ListSink();
    sink = transactionLimitDAO_.where(AND( EQ(limitName, TransactionLimit.NAME),
                                       EQ(type, TransactionLimit.TYPE),
                                       EQ(timeFrame, TransactionLimit.TIME_FRAME) )
                                  ).limit(1).select(sink);

    List list = ((ListSink) sink).getData();
    if ( list == null || list.size() == 0 ) {
      throw new RuntimeException("Transaction Limit not found.");
    }

    return (TransactionLimit) list.get(0);
  }


  @Override
  public long getRemainingLimit(long userId, TransactionLimitTimeFrame timeFrame, TransactionLimitType type) throws RuntimeException {
    User user = (User) userDAO_.find(userId);

    if ( user == null ) {
      throw new RuntimeException("User not found.");
    }
    TransactionLimit userTotalLimit = getLimit(userId, timeFrame, type);

    boolean isPayer = ( type == TransactionLimitType.SEND );

    int calendarType;
    switch( (TransactionLimitTimeFrame) timeFrame ) {
      case DAY :
        calendarType = Calendar.HOUR_OF_DAY;
        break;
      case WEEK :
        calendarType = Calendar.DAY_OF_WEEK;
        break;
      case MONTH :
        calendarType = Calendar.DAY_OF_MONTH;
        break;
      default :
        calendarType = Calendar.DAY_OF_YEAR;
    }

    long spentAmount = getTransactionAmounts(userId, calendarType, isPayer);

    return userTotalLimit.getAmount() - spentAmount;
  }


  // Checking whether user is a Broker
  private boolean isBroker(long userId) {
    Sink count = new Count();
    count = brokerDAO_.where(EQ(userId, Broker.USER_ID)).limit(1).select(count);

    return ( (Count) count).getValue() > 0;
  }

  // Getting user amount spent given a time period
  private long getTransactionAmounts(long userId, int calendarType, boolean isPayer) {
    Date firstDate = getDayOfCurrentPeriod(calendarType, MaxOrMin.MIN);
    Date lastDate = getDayOfCurrentPeriod(calendarType, MaxOrMin.MAX);

    DAO list = transactionDAO_.where(AND(EQ(userId, ( isPayer ? Transaction.PAYER_ID : Transaction.PAYEE_ID ) ),
                                        GTE(Transaction.DATE, firstDate ),
                                        LTE(Transaction.DATE, lastDate )
                                    ));
    return ((Double)(((Sum) list.select(SUM(Transaction.AMOUNT))).getValue())).longValue();
  }

  // Enum to facilitate getting Max or Min hour of each date
  private enum MaxOrMin {
    MAX, MIN;
  }

  // return min or max date:hour for a specific period according to parameters
  private Date getDayOfCurrentPeriod(int period, MaxOrMin maxOrMin) {
    // get start of this week in milliseconds
    Calendar cal = Calendar.getInstance();

    if ( maxOrMin == MaxOrMin.MAX ) {
      cal.set(period, cal.getActualMaximum(period));
      return getEndOfDay(cal);
    }
    cal.set(period, cal.getActualMinimum(period));
    return getStartOfDay(cal);
  }

  // Setting hours, minutes, seconds and milliseconds to maximum
  private Date getEndOfDay(Calendar calendar) {
    calendar.set(Calendar.HOUR_OF_DAY, 23);
    calendar.set(Calendar.MINUTE, 59);
    calendar.set(Calendar.SECOND, 59);
    calendar.set(Calendar.MILLISECOND, 999);
    return calendar.getTime();
  }

  // Setting hours, minutes, seconds and milliseconds to minimum
  private Date getStartOfDay(Calendar calendar) {
    calendar.set(Calendar.HOUR_OF_DAY, 0);
    calendar.set(Calendar.MINUTE, 0);
    calendar.set(Calendar.SECOND, 0);
    calendar.set(Calendar.MILLISECOND, 0);
    return calendar.getTime();
  }
}

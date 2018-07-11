package net.nanopay.tx.tp.alterna;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import net.nanopay.account.Account;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.bank.BankAccount;
import net.nanopay.model.Branch;
import net.nanopay.payment.Institution;
import net.nanopay.tx.tp.TxnProcessor;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import static foam.mlang.MLang.*;

public class CsvUtil {

  public CsvUtil() {}

  protected final static ThreadLocal<SimpleDateFormat> filenameSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyyMMdd");
    }
  };

  protected final static ThreadLocal<SimpleDateFormat> csvSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("MM/dd/yyyy");
    }
  };

  public final static List<Integer> cadHolidays = Arrays.asList(1, 50, 89, 141, 183, 218, 246, 281, 316, 359, 360);

  /**
   * Generates the process date based on a given date
   * @param date date used to determine the processing date
   * @return either the current date plus 1 day if current time is before 11 am
   *         or the current date plus 2 days if the current date is after 11 am
   */
  public static Date generateProcessDate(Date date) {
    Calendar curDate = Calendar.getInstance();
    curDate.setTime(date);
    int k = curDate.get(Calendar.HOUR_OF_DAY) < 11 ? 1 : 2;
    int i = 0;
    while ( i < k ) {
      curDate.add(Calendar.DAY_OF_YEAR, 1);
      if ( curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
        && curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
        && ! cadHolidays.contains(curDate.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }
    return curDate.getTime();
  }

  /**
   * Generates the completion date based on a given date
   * @param date date used to determine the processing date
   * @return either the current date plus 3 day if current time is before 11 am
   *         or the current date plus 4 days if the current date is after 11 am
   */
  public static Date generateCompletionDate(Date date) {
    Calendar curDate = Calendar.getInstance();
    curDate.setTime(date);
    int k = curDate.get(Calendar.HOUR_OF_DAY) < 11 ? 3 : 4;
    int i = 0;
    while ( i < k ) {
      curDate.add(Calendar.DAY_OF_YEAR, 1);
      if ( curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
        && curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
        && ! cadHolidays.contains(curDate.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }
    return curDate.getTime();
  }

  /**
   * Generates a filename based on a given date
   * @param date date to use in the filename
   * @return the filename
   */
  public static String generateFilename(Date date) {
    return filenameSdf.get().format(date) + "_mintchipcashout.csv";
  }

  /**
   * Pads the left size of a string with zeros
   * @param s string to padd
   * @param n number of 0's to pad with
   * @return the string padded with n number of zeros
   */
  public static String padLeftWithZeros(String s, int n) {
    return String.format("%" + n + "s", s).replace(' ', '0');
  }

  /**
   * fills the outputter with all CICO transactions
   * @param x - the context
   * @param o -  output stream to write to
   * @param mode - outputter mode
   * @return the outputter
   */
  public static void writeCsvFile(X x, OutputStream o, OutputterMode mode) {
    final Date now            = new Date();

    final DAO  bankAccountDAO = (DAO) x.get("localAccountDAO");
    final DAO  transactionDAO = (DAO) x.get("localTransactionDAO");
    final DAO  userDAO        = (DAO) x.get("localUserDAO");

    Outputter out = new Outputter(o, mode, false);
    transactionDAO.where(
      AND(
        EQ(Transaction.TXN_PROCESSOR_ID, TxnProcessor.ALTERNA), /* TODO: make configuration on CsvUtil */
        EQ(Transaction.STATUS, TransactionStatus.PENDING),
        OR(
            EQ(Transaction.TYPE, TransactionType.CASHIN),
            EQ(Transaction.TYPE, TransactionType.CASHOUT),
            EQ(Transaction.TYPE, TransactionType.BANK_ACCOUNT_PAYMENT),
            EQ(Transaction.TYPE, TransactionType.VERIFICATION)
        )
      )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          User user;
          String txnType;
          String refNo;
          Transaction t = (Transaction) obj;
          t = (Transaction) t.fclone();

          BankAccount bankAccount = null;
          user = (User) ((Account) t.getSourceAccount()).getOwner();
          // get transaction type and user
          if ( t.getType() == TransactionType.CASHIN || t.getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
            txnType = "DB";
            bankAccount = (BankAccount) t.getSourceAccount();
          } else if ( t.getType() == TransactionType.CASHOUT || t.getType() == TransactionType.VERIFICATION ) {
            txnType = "CR";
            bankAccount = (BankAccount) t.getDestinationAccount();
          } else {
            // don't output if for whatever reason we get here and
            // the transaction is not a cash in or cash out
            return;
          }

          // if user null, return
          if ( user == null ) return;

          // get bank account and check if null
          if ( bankAccount == null ) return;

          // use transaction ID as the reference number
          refNo = String.valueOf(t.getId());

          boolean isOrganization = (user.getOrganization() != null && !user.getOrganization().isEmpty());
          AlternaFormat alternaFormat = new AlternaFormat();
          // if transaction padType is set, write it to csv. otherwise set default alterna padType to transaction
          if ( ! SafetyUtil.isEmpty(t.getPadType()) ) {
            alternaFormat.setPadType(t.getPadType());
          }
          else {
            t.setPadType(alternaFormat.getPadType());
          }

          alternaFormat.setFirstName(!isOrganization ? user.getFirstName() : user.getOrganization());
          alternaFormat.setLastName(!isOrganization ? user.getLastName() : "");
          alternaFormat.setTransitNumber(padLeftWithZeros(String.valueOf(((Branch)bankAccount.getBranch()).getBranchId()), 5));
          alternaFormat.setBankNumber(padLeftWithZeros(String.valueOf(((Institution)bankAccount.getInstitution()).getInstitutionNumber()), 3));
          alternaFormat.setAccountNumber(bankAccount.getAccountNumber());
          alternaFormat.setAmountDollar(String.format("$%.2f", (t.getAmount() / 100.0)));
          alternaFormat.setTxnType(txnType);

          //if transaction code is set, write it to csv. otherwise set default alterna code to transaction
          if ( ! SafetyUtil.isEmpty(t.getTxnCode()) ) {
            alternaFormat.setTxnCode(t.getTxnCode());
          } else {
            t.setTxnCode(alternaFormat.getTxnCode());
          }

          alternaFormat.setProcessDate(csvSdf.get().format(generateProcessDate(now)));
          alternaFormat.setReference(refNo);

          t.setProcessDate(generateProcessDate(now));
          t.setCompletionDate(generateCompletionDate(now));

          transactionDAO.put(t);
          out.put(alternaFormat, sub);

          // if a verification transaction, also add a DB with same information
          if ( t.getType() == TransactionType.VERIFICATION ) {
            AlternaFormat cashout = (AlternaFormat) alternaFormat.fclone();
            cashout.setTxnType("DB");
            out.put(cashout, sub);
          }
          out.flush();
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });
  }
}

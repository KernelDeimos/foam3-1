package net.nanopay.cico.spi.alterna;

import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.model.Branch;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;

import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.core.X;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import static foam.mlang.MLang.EQ;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.io.*;

public class CsvUtil {

  public CsvUtil() {}

  protected ThreadLocal<SimpleDateFormat> filenameSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyyMMdd");
    }
  };

  protected ThreadLocal<SimpleDateFormat> csvSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyy-MM-dd");
    }
  };

  /**
   * Generates the process date based on a given date
   * @param date date used to determine the processing date
   * @return either the current date plus 1 day if current time is before 11 am
   *         or the current date plus 2 days if the current date is after 11 am
   */
  protected String generateProcessDate(Date date) {
    Calendar now = Calendar.getInstance();
    now.setTime(date);
    now.add(Calendar.DAY_OF_MONTH, ( now.get(Calendar.HOUR_OF_DAY) < 11 ) ? 1 : 2);
    return csvSdf.get().format(now.getTime());
  }

  /**
   * Generates a reference id by concatentating the current time in milliseconds with a randomly generated number
   * @return a reference id
   */
  protected String generateReferenceId() {
    return new Date().getTime() + "" + (int) (Math.random() * (99999 - 10000) + 10000);
  }

  /**
   * Generates a filename based on a given date
   * @param date date to use in the filename
   * @return the filename
   */
  public String generateFilename(Date date) {
    return filenameSdf.get().format(date) + "_mintchipcashout.csv";
  }
  /**
   * fills the outputter with all CICO transactions
   * @param X- the context
   * @param outStream -  the outputter out format if it's a stream
   * @param outWriter -  the outputter out format if it's a writer
   * @param outputter -  "empty" outputter
   * @return the outputter
   */
  public Sink writeCsvFile(X x, OutputterMode mode, OutputStream outStream, Writer outWriter, boolean outputHeaders) {
    final Date now = new Date();
    final DAO userDAO = (DAO) x.get("localUserDAO");
    final DAO branchDAO = (DAO) x.get("branchDAO");
    final DAO bankAccountDAO = (DAO) x.get("bankAccountDAO");
    final DAO transactionDAO = (DAO) x.get("standardCICOTransactionDAO");

    final Sink outputter;
    if ( outStream != null ) {
      outputter = new Outputter(outStream, mode, outputHeaders);
    } else {
      outputter = new Outputter(outWriter, mode, outputHeaders);
    }

    transactionDAO.where(EQ(Transaction.CICO_STATUS, TransactionStatus.NEW)).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        try {
          User user = null;
          String txnType = null;
          Transaction t = (Transaction) obj;

          // get transaction type and user
          if ( t.getType() == TransactionType.CASHIN || t.getType() == TransactionType.VERIFICATION ) {
            txnType = "DB";
            user = (User) userDAO.find(t.getPayeeId());
          } else if ( t.getType() == TransactionType.CASHOUT ) {
            txnType = "CR";
            user = (User) userDAO.find(t.getPayerId());
          } else {
            // don't output if for whatever reason we get here and
            // the transaction is not a cash in or cash out
            return;
          }

          // get bank account
          BankAccount bankAccount = (BankAccount) bankAccountDAO.find(t.getBankAccountId());
          Branch branch = (Branch) branchDAO.find(bankAccount.getBranchId());

          AlternaFormat alternaFormat = new AlternaFormat();
          boolean isOrganization = (user.getOrganization() != null && !user.getOrganization().isEmpty());
          alternaFormat.setFirstName(!isOrganization ? user.getFirstName() : user.getOrganization());
          alternaFormat.setLastName(!isOrganization ? user.getLastName() : " ");
          alternaFormat.setTransitNumber(bankAccount.getTransitNumber());
          alternaFormat.setBankNumber(branch.getFinancialId());
          alternaFormat.setAccountNumber(bankAccount.getAccountNumber());
          alternaFormat.setAmountDollar(String.format("%.2f", (t.getAmount() / 100.0)));
          alternaFormat.setTxnType(txnType);
          alternaFormat.setProcessDate(generateProcessDate(now));
          alternaFormat.setReference(generateReferenceId());
          outputter.put(alternaFormat, sub);
          // if a verification transaction, also add a CR with same information
          if ( t.getType() == TransactionType.VERIFICATION ) {
            AlternaFormat cashout = (AlternaFormat) alternaFormat.fclone();
            cashout.setTxnType("CR");
            outputter.put(cashout, sub);
          }
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });
    return outputter;
  }


}
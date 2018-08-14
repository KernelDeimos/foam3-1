package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.text.NumberFormat;
import java.util.HashMap;

import net.nanopay.account.Account;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;

// Sends an email when an transfer has gone through
public class PaidTransferDAO
  extends ProxyDAO
{
  protected DAO accountDAO_;
  protected DAO userDAO_;

  public PaidTransferDAO(X x, DAO delegate) {
    super(x, delegate);
    accountDAO_ = (DAO) x.get("localAccountDAO");
    userDAO_= (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {

    // Sets the decorator to run on the return phase of the DAO call
    Transaction transaction = (Transaction) super.put_(x, obj);

    // Returns if transaction is an invoice
    if ( transaction.getInvoiceId() != 0 )
      return transaction;

    // Returns if transaction is a cico transaction
    if ( transaction.getType() == TransactionType.CASHIN || transaction.getType() == TransactionType.CASHOUT || transaction.getType() == TransactionType.VERIFICATION )
      return transaction;

    User user   = (User) userDAO_.find_(x,((Account) transaction.findDestinationAccount(x)).getOwner());
    User sender = (User) userDAO_.find_(x,((Account) transaction.findSourceAccount(x)).getOwner());

    // Returns if transaction is a payment from a CCShopper to a CCMerchant
    if ( "ccShopper".equals(sender.getGroup()) && "ccMerchant".equals(user.getGroup()) )
      return transaction;

    // Sends an email when an transfer has gone through
    AppConfig    config    = (AppConfig) x.get("appConfig");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    EmailService email     = (EmailService) x.get("email");
    EmailMessage message   = new EmailMessage();

    message.setTo(new String[]{user.getEmail()});
    HashMap<String, Object> args = new HashMap<>();

    // Loads variables that will be represented in the email received
    args.put("amount",    formatter.format(transaction.getAmount()/100.00));
    args.put("name",      user.getFirstName());
    args.put("email",     user.getEmail());
    args.put("link" ,     config.getUrl());
    args.put("applink" ,  config.getAppLink());
    args.put("playlink" , config.getPlayLink());

    try {
      email.sendEmailFromTemplate(user, message, "transfer-paid", args);
    } catch(Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error sending transfer paid email.", t);
    }

    return transaction;
  }
}

package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.notification.Notification;
import java.text.NumberFormat;
import java.util.HashMap;

import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;

// Sends sends a notification and email when transfer or invoice has been paid.
public class NotificationPaidTransferDAO
  extends ProxyDAO
{
  protected DAO accountDAO_;
  protected DAO userDAO_;

  public NotificationPaidTransferDAO(X x, DAO delegate) {
    super(x, delegate);
    accountDAO_ = (DAO) x.get("localAccountDAO");
    userDAO_= (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // Sets the decorator to run on the return phase of the DAO call
    Transaction transaction = (Transaction) super.put_(x, obj);

    User receiver   = transaction.findDestinationAccount(x).findOwner(x);
    User sender = transaction.findSourceAccount(x).findOwner(x);

    // Returns if transaction is cico transaction or payment from a CCShopper to a CCMerchant
    if ( transaction.getInvoiceId() == 0 ) {
      if ( transaction instanceof COTransaction || transaction instanceof CITransaction ||
        "ccShopper".equals(sender.getGroup()) && "ccMerchant".equals(receiver.getGroup()) ) {
        return transaction;
      }
    }
    // Creates a notification and sends an email when an transfer has gone through
    Notification notification = new Notification();
    notification.setUserId(receiver.getId());
    notification.setEmailIsEnabled(true);
    AppConfig    config    = (AppConfig) x.get("appConfig");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();

    HashMap<String, Object> args = new HashMap<>();
    args.put("amount",    formatter.format(transaction.getAmount()/100.00));
    args.put("name",      receiver.getFirstName());
    args.put("link",      config.getUrl());

    if ( transaction.getInvoiceId() == 0 ) {
      notification.setEmailName("transfer-paid");
      notification.setBody("You received $" + transaction.getAmount() + " from " + sender.label());
      notification.setNotificationType("Received transfer");
      args.put("email",     receiver.getEmail());
      args.put("applink" ,  config.getAppLink());
      args.put("playlink" , config.getPlayLink());
    } else {
      notification.setEmailName("invoice-paid");
      notification.setBody("Invoice with id: " + transaction.getInvoiceId() + " from " + sender.label() + "has been paid");
      notification.setNotificationType("Invoice paid");
      args.put("fromEmail", sender.getEmail());
      args.put("fromName",  sender.getFirstName());
      args.put("account" ,  transaction.getInvoiceId());
    }

    notification.setEmailArgs(args);
    ((DAO)x.get("notificationDAO")).put_(x, notification);

    return transaction;
  }
}

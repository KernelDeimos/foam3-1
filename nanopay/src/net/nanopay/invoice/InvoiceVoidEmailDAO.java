package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import foam.util.SafetyUtil;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import static foam.mlang.MLang.*;

import java.text.NumberFormat;
import java.util.HashMap;
import java.util.List;


// Sends an email to the payer of the Invoice to inform them that the invoice has been Voided
public class InvoiceVoidEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public InvoiceVoidEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("bareUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    User payer = (User) invoice.findPayerId(x);
    User payee = (User) invoice.findPayeeId(x);

    // Checks to make sure invoice is set to Void
    if (  PaymentStatus.VOID != invoice.getPaymentMethod() )
      return getDelegate().put_(x, obj);

    // Makes sure an email isn't sent if the creator is the payer of the invoice
    if (SafetyUtil.compare(invoice.getPayerId(),invoice.getCreatedBy()) == 0 )
      return getDelegate().put_(x, obj);

    invoice = (Invoice) super.put_(x , obj);
    Group           payerGroup = (Group) payer.findGroup(x);
    AppConfig       config     = (AppConfig) payerGroup.getAppConfig(x);
    EmailMessage    message    = new EmailMessage();
    NumberFormat    formatter  = NumberFormat.getCurrencyInstance();
    DAO             userDAO    = (DAO) x.get("userDAO");

    String accountVar = SafetyUtil.isEmpty(invoice.getInvoiceNumber()) ?
      (SafetyUtil.isEmpty(invoice.getPurchaseOrder()) ? "N/A" : invoice.getPurchaseOrder()) :
      invoice.getInvoiceNumber();

    //find signing officer User object
    Sink sink = new ArraySink();
    sink = userDAO.where(EQ(User.EMAIL, payer.getEmail()))
       .limit(1).select(sink);
    List list = ((ArraySink) sink).getArray();
    if ( list == null || list.size() == 0 ) {
      throw new RuntimeException("User not found");
    }
    User user = (User) list.get(0);
    if ( user == null ) {
      throw new RuntimeException("User not found");
    }

    message.setTo(new String[]{payer.getEmail()});
    HashMap<String, Object> args = new HashMap<>();
    args.put("account",  accountVar);
    args.put("amount",   formatter.format(invoice.getAmount()/100.00));
    args.put("link",     config.getUrl());
    args.put("fromName", payee.label());
    args.put("toName",   user.getFirstName());
    args.put("sendTo",   payer.getEmail());
    args.put("supportEmail", SafetyUtil.isEmpty(config.getSupportEmail()) ? payerGroup.getSupportEmail() : config.getSupportEmail());

    try{
      EmailsUtility.sendEmailFromTemplate(x, payer, message, "voidInvoice", args);
    } catch(Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error sending invoice voided email.", t);
    }
    return invoice;
  }
}

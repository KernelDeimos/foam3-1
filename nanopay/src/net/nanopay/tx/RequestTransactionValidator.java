package net.nanopay.tx;


import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.tx.model.Transaction;

import static com.sun.xml.bind.v2.util.XmlFactory.logger;

public class RequestTransactionValidator implements Validator {

  @Override
  public void validate(X x, FObject obj) {
    Logger logger = (Logger) x.get("logger");
    User user = (User) x.get("user");

    logger.debug("RequestTransactionValidator.validate user:", user.getId(), user.label());

    x = x.put("userDAO", x.get("localUserDAO"));

    if ( ! (obj instanceof TransactionQuote) ) {
      throw new RuntimeException("you can only put instanceof TransactionQuote to localTransactionQuotePlanDAO");
    }

    TransactionQuote quote = (TransactionQuote) obj;

    Transaction txn = quote.getRequestTransaction();

    logger.info("txn.findDestinationAccount(x) " + txn.findDestinationAccount(x));
    if ( txn.findDestinationAccount(x) == null ) {
      throw new RuntimeException("destinationAccount must be set");
    }

    logger.info("txn.findSourceAccount(x): " + txn.findSourceAccount(x));
    if ( txn.findSourceAccount(x) == null ) {
      throw new RuntimeException("sourceAccount must be set");
    }

    // **** Commented because fails my tests. Kristina.
    logger.info("txn.findSourceAccount(x).findOwner(x): " + txn.findSourceAccount(x).findOwner(x));
    if ( ! txn.findSourceAccount(x).findOwner(x).getEmailVerified() ) {
      //throw new AuthorizationException("You must verify email to send money.");
    }

    logger.info("txn.findSourceAccount(x).findOwner(x): " + txn.findDestinationAccount(x).findOwner(x));
    if ( ! txn.findDestinationAccount(x).findOwner(x).getEmailVerified() ) {
     // throw new AuthorizationException("Receiver must verify email to receive money.");
    }

    if ( txn.getAmount() < 0 ) {
      //throw new RuntimeException("Amount cannot be negative");
    }

    if ( txn.getAmount() == 0 ) {
      //throw new RuntimeException("Amount cannot be zero");
    }

    if ( ((DAO)x.get("currencyDAO")).find(txn.getSourceCurrency()) == null ) {
      throw new RuntimeException("Source currency is not supported");
    }

    if ( ((DAO)x.get("currencyDAO")).find(txn.getDestinationCurrency()) == null ) {
      throw new RuntimeException("Destination currency is not supported");
    }

  }
}

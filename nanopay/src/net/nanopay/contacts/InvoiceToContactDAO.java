package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;

/**
 * All Contacts are meant to reference a Business. However, they won't reference
 * a Business until that Business is created, after which the Contacts will be
 * updated to refer to the newly created Business.
 * When putting an invoice to pay a Contact, we want to check if the Business
 * reference has been set and if so, change the payeeId on the Invoice to the
 * id of the Business. That way it's a payment directly from a Business to a
 * Business.
 */
public class InvoiceToContactDAO extends ProxyDAO {
  public DAO localUserDAO_;

  public InvoiceToContactDAO(X x, DAO delegate) {
    super(x, delegate);
    localUserDAO_ = ((DAO) x.get("localUserDAO")).inX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) throw new RuntimeException("Cannot put null!");

    Invoice invoice = (Invoice) obj;

    User payee = (User) localUserDAO_.inX(x).find(invoice.getPayeeId());

    if ( payee instanceof Contact ) {
      long businessId = ((Contact) payee).getBusinessId();
      if ( businessId != 0 ) {
        invoice.setPayeeId(businessId);
      } else {
        invoice.setExternal(true);
      }
    }

    return super.put_(x, obj);
  }
}

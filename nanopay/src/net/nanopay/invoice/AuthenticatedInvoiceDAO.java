package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.contacts.Contact;
import net.nanopay.invoice.model.Invoice;

import java.util.List;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;

public class AuthenticatedInvoiceDAO extends ProxyDAO {

  public final static String GLOBAL_INVOICE_READ = "invoice.read.*";
  public final static String GLOBAL_INVOICE_DELETE = "invoice.delete.*";
  protected AuthService auth;

  public AuthenticatedInvoiceDAO(X x, DAO delegate) {
    super(x, delegate);
    auth = (AuthService) x.get("auth");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = this.getUser(x);
    Invoice invoice = (Invoice) obj;

    if ( invoice == null ) {
      throw new IllegalArgumentException("Cannot put null");
    }

    Invoice existingInvoice = (Invoice) super.find_(x, invoice.getId());

    // Disable updating reference id's
    if ( check != null && ! SafetyUtil.equals(invoice.getReferenceId(), existingInvoice.getReferenceId()) ) {
      throw new AuthorizationException("Cannot update reference Id.");
    }

    // Check if the user has global access permission.
    if ( ! auth.check(x, GLOBAL_INVOICE_READ) ) {
      // Check if the user is the creator of the invoice
      if ( ! this.isRelated(x, invoice) ) {
        throw new AuthorizationException();
      }
      // Check if invoice is draft,
      if ( invoice.getDraft() ) {
        // If invoice currently exists and is not created by current user -> throw exception.
        if ( existingInvoice != null && (invoice.getCreatedBy() != user.getId()) ) {
          throw new AuthorizationException();
        }
      }
    }
    // Whether the invoice exist or not, utilize put method and dao will handle it.
    return getDelegate().put_(x, invoice);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = this.getUser(x);
    Invoice invoice = (Invoice) super.find_(x, id);

    if ( invoice != null && ! auth.check(x, GLOBAL_INVOICE_READ)) {
      // Check if user is related to the invoice
      if ( ! this.isRelated(x, invoice) ) {
        throw new AuthorizationException();
      }
      // limiting draft invoice to those who created the invoice.
      if ( invoice.getDraft() && ( invoice.getCreatedBy() != user.getId() ) ) {
        throw new AuthorizationException();
      }
    }
    return invoice;
  }

  private class AuthenticatedInvoiceSink extends foam.dao.ProxySink {
    private User user_;

    public AuthenticatedInvoiceSink(X x, Sink delegate) {
      super(x, delegate);
      user_ = (User) x.get("user");
      if ( user_ == null ) throw new AuthenticationException();
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub) {
      Invoice invoice = (Invoice) obj;
      if ( isRelated(getX(), invoice) && ! ( invoice.getDraft() && invoice.getCreatedBy() != user_.getId() ) ) {
        getDelegate().put(obj, sub);
      }
    }
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( auth.check(x, GLOBAL_INVOICE_READ) ) {
      return super.select_(x, sink, skip, limit, order, predicate);
    }

    Sink authenticatedInvoiceSink = new AuthenticatedInvoiceSink(x, sink);
    getDelegate().select_(x, authenticatedInvoiceSink, skip, limit, order, predicate);
    return sink;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = this.getUser(x);
    Invoice invoice = (Invoice) obj;

    if ( ! (auth.check(x, GLOBAL_INVOICE_DELETE) || user.getId() == invoice.getCreatedBy()) ) {
      throw new AuthorizationException();
    }

    if ( ! invoice.getDraft() ) {
      throw new AuthorizationException("Only invoice drafts can be deleted.");
    }
    return getDelegate().remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User user = this.getUser(x);
    boolean global = auth.check(x, GLOBAL_INVOICE_DELETE);

    DAO dao = global ? getDelegate().where(EQ(Invoice.DRAFT, true))
        : getDelegate().where(AND(EQ(Invoice.CREATED_BY, user.getId()), EQ(Invoice.DRAFT, true)));
    dao.removeAll_(x, skip, limit, order, predicate);
  }

  protected User getUser(X x) {
    User user = (User) x.get("user");
    if ( user == null ) {
      throw new AuthenticationException();
    }
    return user;
  }

  // If the user is payee or payer of the invoice.
  protected boolean isRelated(X x, Invoice invoice) {
    User user = getUser(x);
    long id = user.getId();
    boolean isPayee = invoice.getPayeeId() == id;
    boolean isPayer = invoice.getPayerId() == id;
    List<Contact> contacts = getContactsWithEmail(x, user.getEmail());
    for ( Contact contact : contacts ) {
      if ( invoice.getPayeeId() == contact.getId() ) {
        isPayee = true;
      }
      if ( invoice.getPayerId() == contact.getId() ) {
        isPayer = true;
      }
    }
    return  isPayee || isPayer;
  }

  protected List<Contact> getContactsWithEmail(X x, String emailAddress) {
    DAO contactDAO = (DAO) x.get("localContactDAO");
    ArraySink contactsWithMatchingEmail = (ArraySink) contactDAO
      .where(EQ(Contact.EMAIL, emailAddress))
      .select(new ArraySink());
    return contactsWithMatchingEmail.getArray();
  }
}

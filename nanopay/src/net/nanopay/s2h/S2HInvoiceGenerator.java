package net.nanopay.s2h;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.s2h.model.S2HInvoice;

public class S2HInvoiceGenerator
  extends ProxyDAO {

  public S2HInvoiceGenerator(DAO delegate) {
    setDelegate(delegate);
    setOf(net.nanopay.s2h.model.S2HInvoice.getOwnClassInfo());
  }

  public S2HInvoiceGenerator(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    setOf(net.nanopay.s2h.model.S2HInvoice.getOwnClassInfo());
  }
  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Unsupported operation: select_");
  }

  @Override
  public FObject find_(X x, Object id) {
    throw new UnsupportedOperationException("Unsupported operation: find_");
  }

  @Override
  public FObject remove_(X x, FObject obj)
  {
    throw new UnsupportedOperationException("Unsupported operation: remove_");
  }
  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate)
  {
    throw new UnsupportedOperationException("Unsupported operation: removeAll_");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    S2HInvoice s2hInvoice = (S2HInvoice) obj;
    Invoice inv = s2hInvoice.generateNanoInvoice();
    return getDelegate().put(inv);
  }
}
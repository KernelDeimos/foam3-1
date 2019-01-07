package net.nanopay.integration;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.integration.quick.QuickIntegrationService;
import net.nanopay.integration.xero.XeroIntegrationService;
import java.util.List;

/**
 * This DAO selects bank accounts for Xero
 * or Quickbooks and returns the results in a sink
 */

public class BankIntegrationDAO
  extends ProxyDAO {
  public BankIntegrationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  public foam.dao.Sink select_(foam.core.X x, foam.dao.Sink sink, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    DAO                         userDAO    = (DAO) x.get("userDAO");
    User                        user       = (User) userDAO.find(((User) x.get("user")).getId());
    XeroIntegrationService      xero       = (XeroIntegrationService) x.get("xeroSignIn");
    QuickIntegrationService     quick      = (QuickIntegrationService) x.get("quickSignIn");
    List<AccountingBankAccount> bankList;

    switch ( user.getIntegrationCode().ordinal() ) {
      case 1: { bankList = xero.pullBanks(x); break; }
      case 2: { bankList = quick.pullBanks(x); break; }
      default:{ bankList = null; break; }
    }
    if ( sink == null ) {
      sink = new ArraySink();
    }
    if ( bankList != null ) {
      for ( AccountingBankAccount bank : bankList ) {
        sink.put(bank, null);
      }
    }
    return sink;
  }
}
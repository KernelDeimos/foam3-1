package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;

import java.security.AccessControlException;

import static foam.mlang.MLang.EQ;

public class AuthenticatedAccountDAO
    extends ProxyDAO
{
  public final static String GLOBAL_ACCOUNT_CREATE = "account.create.x";
  public final static String GLOBAL_ACCOUNT_READ = "account.read.x";
  public final static String GLOBAL_ACCOUNT_UPDATE = "account.update.x";
  public final static String GLOBAL_ACCOUNT_DELETE = "account.delete.x";

  public AuthenticatedAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    Account account = (Account) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    // if current user doesn't have permissions to create or update, force account's owner to be current user id
    if ( account.findOwner(x) == null || ! auth.check(x, GLOBAL_ACCOUNT_CREATE) || ! auth.check(x, GLOBAL_ACCOUNT_UPDATE) ) {
      account.setOwner(user.getId());
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    // fetch account from delegate and verify user either owns the account or has global read access
    Account account = (Account) getDelegate().find_(x, id);
    if ( account != null && account.getOwner()!= user.getId() && ! auth.check(x, GLOBAL_ACCOUNT_READ) ) {
      return null;
    }

    return account;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    boolean global = auth.check(x, GLOBAL_ACCOUNT_READ);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(Account.OWNER, user.getId()));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = (User) x.get("user");
    Account account = (Account) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    if ( account != null && account.getOwner() != user.getId() && ! auth.check(x, GLOBAL_ACCOUNT_DELETE) ) {
      throw new RuntimeException("Unable to delete bank account");
    }

    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    boolean global = auth.check(x, GLOBAL_ACCOUNT_DELETE);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(Account.OWNER, user.getId()));
    dao.removeAll_(x, skip, limit, order, predicate);
  }
}

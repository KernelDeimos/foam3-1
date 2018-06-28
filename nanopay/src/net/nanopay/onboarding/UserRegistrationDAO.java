package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import foam.nanos.session.Session;
import static foam.mlang.MLang.EQ;

public class UserRegistrationDAO
  extends ProxyDAO
{
  protected String spid_;
  protected String group_;
  protected DAO sessionDAO_;

  public UserRegistrationDAO(X x, String group, DAO delegate) {
    this(x, "nanopay", group, delegate);
  }

  public UserRegistrationDAO(X x, String spid, String group, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    spid_  = spid;
    group_ = group;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;
    sessionDAO_  = (DAO) getX().get("sessionDAO");

    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("user", user));
    sessionDAO_.put(session);

    if ( user == null || SafetyUtil.isEmpty(user.getEmail()) ) {
      throw new RuntimeException("Email required");
    }

    if ( getDelegate().inX(x).find(EQ(User.EMAIL, user.getEmail())) != null ) {
      throw new RuntimeException("User with same email address already exists: " + user.getEmail());
    }

    user.setSpid(spid_);
    user.setGroup(group_);
    return super.put_(x, user);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return null;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    return null;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {

  }
}

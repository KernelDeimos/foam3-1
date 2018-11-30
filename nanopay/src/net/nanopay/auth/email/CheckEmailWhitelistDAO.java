package net.nanopay.auth.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import net.nanopay.contacts.Contact;

public class CheckEmailWhitelistDAO
    extends ProxyDAO
{
  public DAO whitelistedEmailDAO_;
  public DAO groupDAO_;

  public CheckEmailWhitelistDAO(X x, DAO delegate) {
    super(x, delegate);
    whitelistedEmailDAO_ = (DAO) x.get("whitelistedEmailDAO");
    groupDAO_ = (DAO) x.get("groupDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {

    // We only care about new users and businesses being created here.
    boolean isUpdate = getDelegate().inX(x).find(obj.getProperty("id")) != null;
    boolean isContact = obj instanceof Contact;
    if ( isUpdate || isContact ) {
      return super.put_(x, obj);
    }

    User userBeingCreated = (User) obj;

    // We only want to apply the whitelist to Ablii users.
    Group group = (Group) groupDAO_.find(userBeingCreated.getGroup());
    boolean isAbliiUser = group != null && group.isDescendantOf("sme", groupDAO_);
    if ( ! isAbliiUser ) {
      return super.put_(x, obj);
    }

    boolean isEmailWhitelisted = whitelistedEmailDAO_.inX(x).find(userBeingCreated.getEmail()) != null;
    if ( ! isEmailWhitelisted ) {
      throw new AuthorizationException("Hi! We're currently in beta, so only whitelisted emails can be used to sign up. Please email us at hello@ablii.com if you'd like to participate in the beta.");
    }

    return super.put_(x, obj);
  }
}

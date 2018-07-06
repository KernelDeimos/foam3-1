package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;

import java.security.AccessControlException;
import java.util.Date;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

public class AuthenticatedInvitationDAO
  extends ProxyDAO
{
  public final static String GLOBAL_INVITATION_READ = "invitation.read.x";
  public final static String GLOBAL_INVITATION_UPDATE = "invitation.update.x";
  public final static String GLOBAL_INVITATION_DELETE = "invitation.delete.x";

  public AuthenticatedInvitationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    AuthService auth = (AuthService) x.get("auth");

    if ( auth.check(x, GLOBAL_INVITATION_UPDATE) ) {
      return super.put_(x, obj);
    }

    Invitation invite = (Invitation) obj;

    if ( invite == null ) {
      throw new RuntimeException("Cannot put null");
    }

    invite = (Invitation) invite.fclone();
    Invitation existingInvite = (Invitation) getDelegate().find_(x, invite);

    if ( existingInvite != null ) {
      this.checkPermissions(x, existingInvite, GLOBAL_INVITATION_UPDATE);

      // Valid business case #1: User is responding to an invite
      User user = this.getUser(x);
      boolean isRespondingToInvite =
          existingInvite.getStatus() == InvitationStatus.SENT &&
          (invite.getStatus() == InvitationStatus.ACCEPTED ||
          invite.getStatus() == InvitationStatus.IGNORED) &&
          existingInvite.getInviteeId() == user.getId();

      if ( isRespondingToInvite ) {
        InvitationStatus status = invite.getStatus();
        this.copyReadOnlyFields(existingInvite, invite);
        invite.setStatus(status);
        return getDelegate().put_(x, invite);
      }

      // Note to developer: If you're adding a feature that requires that users
      // be able to put to this DAO from the client, add a conditional statement
      // above that allows only the specific properties through that are
      // required for your feature, but only under the conditions that it makes
      // sense to do so.

    } else {
      this.prepareNewInvite(x, invite);
    }

    return super.put_(x, invite);
  }

  @Override
  public FObject find_(X x, Object id) {
    Invitation invite = (Invitation) getDelegate().find_(x, id);

    if ( invite == null ) return null;

    this.checkPermissions(x, invite, GLOBAL_INVITATION_READ);
    return invite;
  }

  @Override
  public Sink select_(
      X x,
      Sink sink,
      long skip,
      long limit,
      Comparator order,
      Predicate predicate
  ) {
    DAO dao = this.getSecureDAO(x, GLOBAL_INVITATION_READ);
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Invitation invite = (Invitation) obj;

    if ( invite == null ) return null;

    this.checkPermissions(x, invite, GLOBAL_INVITATION_DELETE);
    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(
      X x,
      long skip,
      long limit,
      Comparator order,
      Predicate predicate
  ) {
    DAO dao = this.getSecureDAO(x, GLOBAL_INVITATION_DELETE);
    dao.removeAll_(x, skip, limit, order, predicate);
  }

  protected void checkPermissions(X x, Invitation invite, String permission) {
    User user = this.getUser(x);
    AuthService auth = (AuthService) x.get("auth");
    boolean hasPermission =
        this.isOwner(user, invite) || auth.check(x, permission);

    if ( ! hasPermission ) {
      throw new RuntimeException("Permission denied");
    }
  }

  protected DAO getSecureDAO(X x, String permission) {
    User user = this.getUser(x);
    long id = user.getId();
    AuthService auth = (AuthService) x.get("auth");
    boolean hasGlobalPermission = auth.check(x, permission);
    return hasGlobalPermission
      ? getDelegate()
      : getDelegate().where(OR(
          EQ(Invitation.CREATED_BY, id),
          EQ(Invitation.INVITEE_ID, id)));
  }

  protected User getUser(X x) {
    User user = (User) x.get("user");
    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }
    return user;
  }

  protected boolean isOwner(User user, Invitation invite) {
    long id = user.getId();
    return invite.getInviteeId() == id || invite.getCreatedBy() == id;
  }

  protected void prepareNewInvite(X x, Invitation invite) {
    User user = this.getUser(x);

    if ( invite.getCreatedBy() != user.getId() ) {
      throw new RuntimeException("If you want to create a new invite, you " +
          "have to set `createdBy` to the id of the current user.");
    }

    if ( user.getEmail().equals(invite.getEmail()) )  {
      throw new RuntimeException("Cannot invite yourself to be partners");
    }

    DAO userDAO = (DAO) x.get("localUserDAO");
    User recipient = this.getUserByEmail(userDAO, invite.getEmail());
    boolean internal = recipient != null;

    long createdBy = invite.getCreatedBy();
    String email = invite.getEmail();
    this.copyReadOnlyFields(new Invitation(), invite);
    invite.setCreatedBy(createdBy);
    invite.setEmail(email);
    invite.setInternal(internal);
    invite.setStatus(InvitationStatus.SENT);

    // Set to date in distant past so that SendInvitationDAO will send the
    // email
    invite.setTimestamp(new Date(0L));

    if ( internal ) invite.setInviteeId(recipient.getId());
  }

  protected User getUserByEmail(DAO userDAO, String emailAddress) {
    ArraySink usersWithMatchingEmail = (ArraySink) userDAO
        .where(EQ(User.EMAIL, emailAddress))
        .limit(1)
        .select(new ArraySink());
    return usersWithMatchingEmail.getArray().size() == 1
        ? (User) usersWithMatchingEmail.getArray().get(0)
        : null;
  }

  protected void copyReadOnlyFields(Invitation from, Invitation to) {
    to.setCreatedBy(from.getCreatedBy());
    to.setInviteeId(from.getInviteeId());
    to.setEmail(from.getEmail());
    to.setId(from.getId());
    to.setInternal(from.getInternal());
    to.setTimestamp(from.getTimestamp());
    to.setMessage(from.getMessage());
  }
}

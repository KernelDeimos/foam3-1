package net.nanopay.onboarding;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.auth.token.Token;
import foam.util.Auth;
import foam.util.SafetyUtil;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessUserJunction;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;

/**
 * When a new user is signing up and wants to create a business, this decorator
 * will create the business for them. Since the user is signing up, they don't
 * have a User in the system yet which could create the business. Therefore,
 * this decorator creates the business as the system, but makes sure that the
 * business is owned by the user, not the system.
 */
public class NewUserCreateBusinessDAO extends ProxyDAO {
  private DAO localBusinessDAO_;
  private DAO agentJunctionDAO_;
  private DAO signingOfficerJunctionDAO_;
  private DAO tokenDAO_;
  private DAO invitationDAO_;

  public NewUserCreateBusinessDAO(X x, DAO delegate) {
    super(x, delegate);
    localBusinessDAO_ = (DAO) x.get("localBusinessDAO");
    agentJunctionDAO_ = (DAO) x.get("agentJunctionDAO");
    signingOfficerJunctionDAO_ = (DAO) x.get("signingOfficerJunctionDAO");
    tokenDAO_ = (DAO) x.get("localTokenDAO");
    invitationDAO_ = (DAO) x.get("businessInvitationDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;

    if ( user == null ) {
      throw new RuntimeException("Cannot put null.");
    }

    if ( SafetyUtil.isEmpty(user.getOrganization()) ) {
      throw new RuntimeException("Organization is required.");
    }

    // We want the system user to be putting the User we're trying to create. If
    // we didn't do this, the user in the context's id would be 0 and many
    // decorators down the line would fail because of authentication checks.

    // If we want use the system user, then we need to copy the http request/appconfig to system context
    X sysContext = getX()
      .put(HttpServletRequest.class, x.get(HttpServletRequest.class))
      .put("appConfig", x.get("appConfig"));

    // Set the user's status to Active so that they can be found in publicUserDAO.
    user.setStatus(AccountStatus.ACTIVE);

    if ( ! SafetyUtil.isEmpty(user.getSignUpToken()) ) {
      // Check if Token exists
      Token token = (Token) tokenDAO_.find(EQ(Token.DATA, user.getSignUpToken()));
      user.setEmailVerified(token != null);

      if ( token == null ) {
        throw new RuntimeException("Unable to process user registration");
      }

      Map<String, Object> params = (Map) token.getParameters();

      try {
        // Process token
        Token clone = (Token) token.fclone();
        clone.setProcessed(true);
        tokenDAO_.inX(sysContext).put(clone);
      } catch (Exception ignored) { }

      // There can be different tokens with different parameters used.
      // When adding a user to a business, we'll have the group
      // and businessId parameters set, so check for those here.
      if ( params.containsKey("group") && params.containsKey("businessId") ) {
        String group = (String) params.get("group");
        long businessId = (long) params.get("businessId");
        boolean isSigningOfficer = params.containsKey("isSigningOfficer") ? (boolean) params.get("isSigningOfficer") : false;
        UserUserJunction junction;

        if ( businessId != 0 ) {
          Business business = (Business) localBusinessDAO_.inX(sysContext).find(businessId);
          if ( business == null ) {
            throw new RuntimeException("Business doesn't exist");
          }

          user = (User) super.put_(sysContext, user);

          // Set up new connection between user and business
          junction = new UserUserJunction.Builder(x)
            .setSourceId(user.getId())
            .setTargetId(business.getId())
            .setGroup(business.getBusinessPermissionId() + "." + group)
            .build();

          agentJunctionDAO_.inX(sysContext).put(junction);

          if ( isSigningOfficer ) {
            signingOfficerJunctionDAO_.inX(sysContext).put(
              new BusinessUserJunction.Builder(x)
                .setSourceId(business.getId())
                .setTargetId(user.getId())
                .build());
          }

          // Get a context with the Business in it so we can update the invitation.
          X businessContext = Auth.sudo(sysContext, business);

          // Update the invitation to mark that they joined.
          Invitation invitation = (Invitation) invitationDAO_
            .inX(businessContext)
            .find(
              AND(
                EQ(Invitation.CREATED_BY, businessId),
                EQ(Invitation.EMAIL, user.getEmail())
              )
            ).fclone();
          invitation.setStatus(InvitationStatus.COMPLETED);
          invitationDAO_.inX(businessContext).put(invitation);

          CreateOnboardingCloneService createOnboardingCloneService = new CreateOnboardingCloneService(sysContext);
          List<Object> onboardings = createOnboardingCloneService.getSourceOnboarding(businessId);

          if ( onboardings.size() > 0 )
            createOnboardingCloneService.putOnboardingClone(sysContext, onboardings, user.getId());

          // Return here because we don't want to create a duplicate business
          // with the same name. Instead, we just want to create(external)/update(internal) the user and
          // add them to an existing business.
          return user;
        }
      }
    }

    // Put the user so that it gets an id.
    // Remove business address collected from signup form.
    Address businessAddress = user.getAddress();
    user.setAddress(null);
    user = (User) super.put_(sysContext, obj).fclone();

    assert user.getId() != 0;

    X userContext = Auth.sudo(x, user);

    Business business = new Business.Builder(userContext)
      .setBusinessName(user.getOrganization())
      .setOrganization(user.getOrganization())
      .setAddress(businessAddress)
      .setSpid(user.getSpid())
      .setEmailVerified(true)
      .build();

    localBusinessDAO_.inX(userContext).put(business);

    return user;
  }
}

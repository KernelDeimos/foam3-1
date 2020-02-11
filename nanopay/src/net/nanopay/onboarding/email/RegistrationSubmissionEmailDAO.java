package net.nanopay.onboarding.email;

import java.util.HashMap;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import net.nanopay.admin.model.AccountStatus;

public class RegistrationSubmissionEmailDAO
  extends ProxyDAO
  {

  public RegistrationSubmissionEmailDAO(X x, DAO delegate) {
    super(x, delegate);
  }

    @Override
    public FObject put_(X x, FObject obj) {
      // Checks if User exists and is login enabled.
      User user = (User) obj;
      if ( find(user.getId()) == null || ! user.getLoginEnabled())
        return getDelegate().put_(x, obj);

      //Makes sure to only send on status change
      User oldUser = (User) getDelegate().find(user.getId());
      if ( ! AccountStatus.PENDING.equals(oldUser.getStatus()) || ! AccountStatus.SUBMITTED.equals(user.getStatus()) )
        return getDelegate().put_(x, obj);

      user = (User) super.put_(x , obj);
      User                      admin        = (User) getDelegate().find(user.getInvitedBy());
      String                    url           = admin.findGroup(x).getAppConfig(x).getUrl().replaceAll("/$", "");
      EmailMessage            message      = new EmailMessage();
      EmailMessage            adminMessage = new EmailMessage();
      HashMap<String, Object> args         = new HashMap<>();

      message.setTo(new String[]{user.getEmail()});
      args.put("name",        user.getFirstName());
      args.put("lastName",    user.getLastName());
      args.put("id",          user.getId());
      args.put("link",        url);
      args.put("memberLink",  url+"#members");

      try {
        EmailsUtility.sendEmailFromTemplate(x, user, message, "reg-pending", args);
      } catch (Throwable t) {
        (x.get(Logger.class)).error("Error sending pending submission email.", t);
      }

      adminMessage.setTo(new String[]{admin.getEmail()});
      try {
        EmailsUtility.sendEmailFromTemplate(x, admin, adminMessage, "reg-note", args);
      } catch (Throwable t) {
        (x.get(Logger.class)).error("Error sending admin notification submission email.", t);
      }
      return user;
  }
}

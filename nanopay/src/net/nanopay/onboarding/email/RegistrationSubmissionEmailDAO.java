package net.nanopay.onboarding.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.util.HashMap;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;

public class RegistrationSubmissionEmailDAO
  extends ProxyDAO
  {

  public RegistrationSubmissionEmailDAO(X x, DAO delegate) {
    super(x, delegate);
  }

    @Override
    public FObject put_(X x, FObject obj) {
      if ( obj instanceof Business || obj instanceof Contact ) {
        return super.put_(x, obj);
      }
      // Checks if User exists
      User user = (User) obj;
      if ( find(user.getId()) == null )
        return getDelegate().put_(x, obj);

      //Makes sure to only send on status change
      User oldUser = (User) getDelegate().find(user.getId());
      if ( ! AccountStatus.PENDING.equals(oldUser.getStatus()) || ! AccountStatus.SUBMITTED.equals(user.getStatus()) )
        return getDelegate().put_(x, obj);

      user = (User) super.put_(x , obj);
      User                    admin        = (User) getDelegate().find(user.getInvitedBy());
      AppConfig               config       = (AppConfig) x.get("appConfig");
      EmailService            email        = (EmailService) x.get("email");
      EmailMessage            message      = new EmailMessage();
      EmailMessage            adminMessage = new EmailMessage();
      HashMap<String, Object> args         = new HashMap<>();

      message.setTo(new String[]{user.getEmail()});
      args.put("name",        user.getFirstName());
      args.put("lastName",    user.getLastName());
      args.put("id",          user.getId());
      args.put("link",        config.getUrl());
      args.put("memberLink",  config.getUrl()+"#members");

      try {
        email.sendEmailFromTemplate(x, user, message, "reg-pending", args);
      } catch (Throwable t) {
        (x.get(Logger.class)).error("Error sending pending submission email.", t);
      }

      adminMessage.setTo(new String[]{admin.getEmail()});
      try {
        email.sendEmailFromTemplate(x, admin, adminMessage, "reg-note", args);
      } catch (Throwable t) {
        (x.get(Logger.class)).error("Error sending admin notification submission email.", t);
      }
      return user;
  }
}

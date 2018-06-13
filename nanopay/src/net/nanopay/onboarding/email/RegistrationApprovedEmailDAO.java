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
import net.nanopay.admin.model.AccountStatus;
import java.util.HashMap;

public class RegistrationApprovedEmailDAO
    extends ProxyDAO
  {
    public RegistrationApprovedEmailDAO(X x, DAO delegate) {
      super(x, delegate);
    }

    @Override
    public FObject put_(X x, FObject obj) {

      // Checks if User exists
      User user = (User) obj;
      if ( getDelegate().find(user.getId()) == null )
        return getDelegate().put_(x, obj);

      // Makes sure to only send on status change
      User oldUser = (User) getDelegate().find(user.getId());
      if ( oldUser.getStatus().equals(user.getStatus()) )
        return getDelegate().put_(x, obj);

      // Makes sure the user is not already ACTIVE
      if ( ! AccountStatus.ACTIVE.equals(user.getStatus()) )
        return getDelegate().put_(x, obj);

      user = (User) super.put_(x , obj);
      AppConfig               config    = (AppConfig) x.get("appConfig");
      EmailService            email     = (EmailService) x.get("email");
      EmailMessage            message   = new EmailMessage();
      HashMap<String, Object> args      = new HashMap<>();

      message.setTo(new String[]{user.getEmail()});
      args.put("name",    user.getFirstName());
      args.put("link",    config.getUrl());

      try {
        email.sendEmailFromTemplate(user, message, "reg-approved", args);
      } catch (Throwable t) {
        (x.get(Logger.class)).error("Error sending approval email.", t);
      }

      return user;
    }
  }


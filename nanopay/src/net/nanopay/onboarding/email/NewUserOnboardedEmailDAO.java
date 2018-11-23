package net.nanopay.onboarding.email;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.util.SafetyUtil;
import net.nanopay.admin.model.AccountStatus;

public class NewUserOnboardedEmailDAO extends ProxyDAO {
  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public NewUserOnboardedEmailDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User newUser = (User) obj;
    User oldUser = (User) getDelegate().find(newUser.getId());
    PropertyInfo prop = (PropertyInfo) User.getOwnClassInfo().getAxiomByName("status");

    // Send email only when user status changes from PENDING to SUBMITTED
    if (SafetyUtil.equals(prop.get(oldUser), AccountStatus.PENDING)
      && SafetyUtil.equals(prop.get(newUser), AccountStatus.SUBMITTED))
    {
      EmailService emailService = (EmailService) x.get("email");
      EmailMessage message = new EmailMessage();
      StringBuilder builder = sb.get()
        .append("<p>New user onboarded:<p>")
        .append("<ul><li>")
        .append(newUser.getLegalName())
        .append(" - ")
        .append(newUser.getEmail())
        .append("</li></ul>");

      message.setTo(new String[] { "enrollment@nanopay.net" });
      message.setBcc(new String[] { "chanmann@nanopay.net" });
      message.setSubject("New User Onboarded");
      message.setBody(builder.toString());
      emailService.sendEmail(x, message);
    }

    return super.put_(x, obj);
  }
}

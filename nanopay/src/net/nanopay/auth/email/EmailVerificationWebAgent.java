package net.nanopay.auth.email;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.notification.email.DAOResourceLoader;
import foam.nanos.notification.email.EmailTemplate;
import org.apache.commons.lang3.StringUtils;
import org.jtwig.JtwigModel;
import org.jtwig.JtwigTemplate;
import org.jtwig.environment.EnvironmentConfiguration;
import org.jtwig.environment.EnvironmentConfigurationBuilder;
import org.jtwig.resource.loader.TypedResourceLoader;

import javax.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

public class EmailVerificationWebAgent
  implements WebAgent
{
  protected EnvironmentConfiguration config_;

  @Override
  public void execute(X x) {
    String             message          = "Your email has now been verified.";
    PrintWriter        out              = x.get(PrintWriter.class);

    DAO                groupDAO         = (DAO) x.get("groupDAO");
    DAO                userDAO          = (DAO) x.get("localUserDAO");
    AppConfig          config           = (AppConfig) x.get("appConfig");
    EmailTokenService  emailToken       = (EmailTokenService) x.get("emailToken");

    HttpServletRequest request          = x.get(HttpServletRequest.class);
    String             token            = request.getParameter("token");
    String             userId           = request.getParameter("userId");
    User               user             = (User) userDAO.find(Long.valueOf(userId));
    Group              group            = (Group) groupDAO.find(user.getGroup());

    try {
      if ( token == null || "".equals(token) ) {
        throw new Exception("Token not found");
      }

      if ( "".equals(userId) || !StringUtils.isNumeric(userId) ) {
        throw new Exception("User not found.");
      }

      if ( user.getEmailVerified() ) {
        throw new Exception("Email already verified.");
      }

      emailToken.processToken(user, token);
    } catch (Throwable t) {
      message = "Problem verifying your email.<br>" + t.getMessage();
    } finally {
      if ( config_ == null ) {
        config_ = EnvironmentConfigurationBuilder
            .configuration()
            .resources()
            .resourceLoaders()
            .add(new TypedResourceLoader("dao", new DAOResourceLoader(x, (String) user.getGroup())))
            .and().and()
            .build();
      }

      String link = config.getUrl() + "/" + group.getLogo();
      Map<String, Object> args = new HashMap<>();
      args.put("msg", message);
      args.put("link", link);

      EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(x, "verify-email-link", (String) user.getGroup());
      JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config_);
      JtwigModel model = JtwigModel.newModel(args);
      out.write(template.render(model));
    }
  }
}

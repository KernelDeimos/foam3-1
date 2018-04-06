package net.nanopay.flinks;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import foam.nanos.notification.email.EmailTemplate;
import org.jtwig.JtwigModel;
import org.jtwig.JtwigTemplate;
import org.jtwig.environment.EnvironmentConfiguration;
import org.jtwig.environment.EnvironmentConfigurationBuilder;

import javax.servlet.http.HttpServletResponse;

import static foam.mlang.MLang.EQ;

public class FlinksRedirectWebAgent
    implements WebAgent
{
  protected EnvironmentConfiguration config_ =
      EnvironmentConfigurationBuilder.configuration().build();

  @Override
  public void execute(X x) {
    DAO emailTemplateDAO = (DAO) x.get("emailTemplateDAO");
    HttpServletResponse resp = x.get(HttpServletResponse.class);

    try {
      EmailTemplate emailTemplate = (EmailTemplate) emailTemplateDAO.inX(x)
          .find(EQ(EmailTemplate.NAME, "flinksConnect"));
      JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config_);
      resp.getWriter().write(template.render(JtwigModel.newModel()));
    } catch (Throwable ignored) {}
  }
}
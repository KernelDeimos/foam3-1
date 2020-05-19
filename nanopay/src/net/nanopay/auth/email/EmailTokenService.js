foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'EmailTokenServiceRefine',
  refines: 'foam.nanos.auth.email.EmailTokenService',

  imports: [
    'Logger logger'
  ],

  javaImports: [
    'foam.nanos.app.AppConfig',
    'foam.nanos.logger.Logger',
    'foam.util.Emails.EmailsUtility'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        try {
          DAO tokenDAO = (DAO) x.get("localTokenDAO");
          AppConfig appConfig = user.findGroup(x).getAppConfig(x);
          String url = appConfig.getUrl();

          Token token = new Token();
          token.setUserId(user.getId());
          token.setExpiry(generateExpiryDate());
          token.setData(UUID.randomUUID().toString());
          token = (Token) tokenDAO.put(token);

          EmailMessage message = new EmailMessage();
          message.setTo(new String[]{user.getEmail()});

          HashMap<String, Object> args = new HashMap<>();
          args.put("name", user.getFirstName());
          args.put("email", user.getEmail());
          args.put("link", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=/");
          args.put("sendTo", user.getEmail());

          // add app store / play store links
          if ( "Personal".equals(user.getType()) && user.getPortalAdminCreated() ) {
            args.put("applink", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect="+appConfig.getAppLink());
            args.put("playlink", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect="+appConfig.getPlayLink());
          }

          String template = (user.getWelcomeEmailSent())? "verifyEmail" : "welcome-email";
          EmailsUtility.sendEmailFromTemplate(x, user, message, template, args);
          return true;
        } catch (Throwable t) {
          ((Logger) getLogger()).error(t);
          return false;
        }
      `
  }
  ]
});

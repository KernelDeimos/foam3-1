foam.CLASS({
  package: 'net.nanopay.onboarding',
  name: 'InvitationTokenService',
  extends: 'foam.nanos.auth.email.EmailTokenService',

  imports: [
    'email',
    'localUserDAO',
    'logger',
    'tokenDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.util.Password',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.UUID',
    'org.apache.commons.text.CharacterPredicates',
    'org.apache.commons.text.RandomStringGenerator'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(foam.java.Code.create({
          data:
`protected static RandomStringGenerator passgen = new RandomStringGenerator.Builder()
    .filteredBy(CharacterPredicates.LETTERS, CharacterPredicates.DIGITS)
    .withinRange('0', 'z')
    .build();`
        }))
      }
    }
  ],

  methods: [
    {
      name: 'generateExpiryDate',
      javaCode:
`Calendar calendar = Calendar.getInstance();
calendar.add(Calendar.DAY_OF_MONTH, 14);
return calendar.getTime();`
    },
    {
      name: 'generateToken',
      javaCode:
      `try {
        AppConfig config = (AppConfig) getX().get("appConfig");
        EmailService email = (EmailService) getEmail();
        DAO tokenDAO = (DAO) getTokenDAO();
        DAO userDAO = (DAO) getLocalUserDAO();
        String url = config.getUrl()
            .replaceAll("/$", "");


        // keep generating a new password until a valid one is generated
        String password = passgen.generate(8);
        while ( ! Password.isValid(password) ) {
          password = passgen.generate(8);
        }
        user.setPassword(Password.hash(password));
        user.setPasswordExpiry(generateExpiryDate());

        // save password and generate a valid id.
        user = (User) userDAO.put(user);
       
        Token token = new Token();
        token.setUserId(user.getId());
        token.setExpiry(generateExpiryDate());
        token.setData(UUID.randomUUID().toString());
        token = (Token) tokenDAO.put(token);

        EmailMessage message = new EmailMessage.Builder(getX())
          .setTo(new String[] { user.getEmail() })
          .build();

        HashMap<String, Object> args = new HashMap<>();
        args.put("name", user.getFirstName());
        args.put("email", user.getEmail());
        args.put("link", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=/");
        args.put("password", password);

        email.sendEmailFromTemplate(user, message, "welcome-email", args);

        user.setPortalAdminCreated(false);
        user.setWelcomeEmailSent(true);
        user.setInviteAttempts(user.getInviteAttempts() + 1);

        userDAO.put(user);
        
        return true;
      } catch (Throwable t) {
        ((Logger) getLogger()).error("Error generating invitation", t);
        throw new RuntimeException(t.getMessage());
      }`
    }
  ]
});

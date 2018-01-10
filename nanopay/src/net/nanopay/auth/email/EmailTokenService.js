foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'EmailTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for verifying email addresses',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ListSink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.nanos.auth.token.Token',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode:
`DAO tokenDAO = (DAO) getX().get("tokenDAO");
AppConfig appConfig = (AppConfig) getX().get("appConfig");
Token token = new Token();
token.setUserId(user.getId());
token.setExpiry(generateExpiryDate());
token.setData(UUID.randomUUID().toString());
token = (Token) tokenDAO.put(token);

EmailService email = (EmailService) getX().get("email");
EmailMessage message = new EmailMessage();
message.setFrom("info@nanopay.net");
message.setReplyTo("noreply@nanopay.net");
message.setTo(new String[]{user.getEmail()});
message.setSubject("MintChip email verification");

HashMap<String, Object> args = new HashMap<>();
args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
args.put("link", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData());

email.sendEmailFromTemplate(user, message, "welcome-email", args);
return true;`
    },
    {
      name: 'processToken',
      javaCode:
`DAO userDAO = (DAO) getX().get("userDAO");
DAO tokenDAO = (DAO) getX().get("tokenDAO");
Calendar calendar = Calendar.getInstance();

Sink sink = new ListSink();
sink = tokenDAO.where(MLang.AND(
  MLang.EQ(Token.USER_ID, user.getId()),
  MLang.EQ(Token.PROCESSED, false),
  MLang.GT(Token.EXPIRY, calendar.getTime()),
  MLang.EQ(Token.DATA, token)
)).limit(1).select(sink);

List list = ((ListSink) sink).getData();
if ( list == null || list.size() == 0 ) {
  // token not found
  throw new RuntimeException("Token not found");
}

// set token processed to true
Token result = (Token) list.get(0);
result.setProcessed(true);
tokenDAO.put(result);

// set user email verified to true
user.setEmailVerified(true);
userDAO.put(user);
return true;`
    }
  ]
});

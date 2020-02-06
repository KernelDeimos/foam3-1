foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'MicroDepositFailed',

  documentation: `Send email when micro deposit from bank account verification fails`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.cico.VerificationTransaction',
    'java.util.HashMap',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
          @Override
           public void execute(X x) {
            VerificationTransaction txn = (VerificationTransaction) obj;
            DAO accountDAO = (DAO) x.get("accountDAO");
            Logger logger = (Logger) x.get("logger");
            BankAccount acc = (BankAccount) accountDAO.find(EQ(Account.ID, txn.getDestinationAccount()));
            User user = (User) acc.findOwner(x);
            AppConfig config = (AppConfig) x.get("appConfig");

            HashMap<String, Object> args = new HashMap<>();
            args.put("name", User.FIRST_NAME);
            args.put("institution", acc.getInstitutionNumber());
            args.put("accountNumber", acc.getAccountNumber().substring(4));
            args.put("accountType", acc.getType());
            args.put("userEmail", User.EMAIL);
            args.put("sendTo", User.EMAIL);
            args.put("link", config.getUrl());

            Notification notification = new Notification.Builder(x)
            .setBody(acc.getAccountNumber() + " verification failed!")
            .setNotificationType("bankNotifications")
            .setEmailName("micro-deposit-failed")
            .setEmailArgs(args)
            .build();
            user.doNotify(x, notification);
            try {
              accountDAO.remove(acc);
            } catch (Exception E) { logger.error("Failed to remove bankaccount. "+E); };
          }
      }, "send notification");
      `
    }
  ]
});

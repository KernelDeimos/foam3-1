foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'BusinessCompliancePassedEmailRule',

    documentation: `Sends email to signing officer after their business passes compliance.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.app.AppConfig',
      'foam.nanos.auth.Address',
      'foam.nanos.auth.Group',
      'foam.nanos.auth.User',
      'foam.nanos.logger.Logger',
      'foam.nanos.notification.Notification',
      'net.nanopay.model.Business',
      'java.util.HashMap',
      'java.util.Map',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Business business = (Business) obj;
            Address businessAddress = business.getAddress();

            if( businessAddress != null && ! businessAddress.getCountryId().equals("US") ){
              Logger                  logger         = (Logger) x.get("logger");
              Group                   group          = business.findGroup(x);
              AppConfig               config         = group != null ? (AppConfig) group.getAppConfig(x) : (AppConfig) x.get("appConfig");
              Map<String, Object>     args           = new HashMap<>();

              args.put("link",   config.getUrl() + "#sme.main.dashboard");
              args.put("sendTo", User.EMAIL);
              args.put("business", business.getOrganization());
              
              if ( group == null ) {
                logger.error("Error sending compliance-notification-to-user email, group is null.");
                return;
              }
              try {

                Notification businessCompliancePassedNotification = new Notification.Builder(x)
                  .setBody("This business can now make payments")
                  .setNotificationType("Latest_Activity")
                  .setGroupId(group.toString())
                  .setEmailArgs(args)
                  .setEmailName("compliance-notification-to-user")
                  .build();

                business.doNotify(x, businessCompliancePassedNotification);

              } catch (Exception e) {
                logger.error("Error sending compliance-notification-to-user email.", e);
              }
            }
          }
        }, "send business compliance passed email");
        `
      }
    ]
});

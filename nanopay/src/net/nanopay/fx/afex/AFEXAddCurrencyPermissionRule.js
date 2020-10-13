/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXAddCurrencyPermissionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Adds currency.read.FX_CURRENCY permissions to a business when AFEXBUsiness is created.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
    'javax.security.auth.AuthPermission',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          Logger logger = (Logger) x.get("logger");

          if ( ! (obj instanceof AFEXBusiness) ) {
            return;
          }

          AFEXBusiness afexBusiness = (AFEXBusiness) obj;
          DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "afexBusinessDAO"),
            EQ(ApprovalRequest.OBJ_ID, afexBusiness.getId())
          ));

          ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
          if ( approval == ApprovalStatus.APPROVED ) {
            DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
            DAO localGroupDAO = (DAO) x.get("localGroupDAO");

            Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexBusiness.getUser()));
            if ( null != business ) {
              Address businessAddress = business.getAddress();
              if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {

                // TODO check and remove if currency.read permissions still need to be given here and update rule name

                DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
                UserCapabilityJunction ucj = (UserCapabilityJunction) ucjDAO.find("554af38a-8225-87c8-dfdf-eeb15f71215f-20");
                ucj.setStatus(CapabilityJunctionStatus.GRANTED);
                ucjDAO.put(ucj);

                String permissionString = "currency.read.";
                permissionString = businessAddress.getCountryId().equals("CA") ? permissionString + "USD" : permissionString + "CAD";
                Permission permission = new Permission.Builder(x).setId(permissionString).build();
                Group group = (Group) localGroupDAO.find(business.getGroup());
                while ( group != null ) {

                  group = (Group) group.findParent(x);
                  if ( group != null && group.getId().endsWith("employee") ) break;
                }
                if ( null != group && ! group.implies(x, new AuthPermission(permissionString)) ) {
                  try {
                    group.getPermissions(x).add(permission);
                    sendUserNotification(x, business);

                    // add permission for USBankAccount strategizer
                    if ( ! group.implies(x, new AuthPermission("strategyreference.read.9319664b-aa92-5aac-ae77-98daca6d754d")) ) {
                      permission = new Permission.Builder(x).setId("strategyreference.read.9319664b-aa92-5aac-ae77-98daca6d754d").build();
                      group.getPermissions(x).add(permission);
                    }

                  } catch(Throwable t) {
                    logger.error("Error adding " + permissionString + " to business " + business.getId(), t);
                  }
                }
              }
            }
          }

        }

      }, "Adds currency.read.FX_CURRENCY permissions to business when AFEXBUsiness is created.");
      `
    },
    {
      name: 'sendUserNotification',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        }
      ],
      javaCode:`
        Map<String, Object>  args           = new HashMap<>();
        Group                group          = business.findGroup(x);
        AppConfig            config         = group != null ? group.getAppConfig(x) : (AppConfig) x.get("appConfig");

        String toCountry = business.getAddress().getCountryId().equals("CA") ? "USA" : "Canada";
        String toCurrency = business.getAddress().getCountryId().equals("CA") ? "USD" : "CAD";
        args.put("business", business.toSummary());
        args.put("toCurrency", toCurrency);
        args.put("toCountry", toCountry);
        args.put("link",   config.getUrl() + "#sme.main.dashboard");
        args.put("sendTo", User.EMAIL);
        args.put("name", User.FIRST_NAME);

        try {

          if ( group == null ) throw new RuntimeException("Group is null");

          Notification notification = business.getAddress().getCountryId().equals("CA") ?
            new Notification.Builder(x)
              .setBody("AFEX Business can make international payments.")
              .setNotificationType("AFEXBusinessInternationalPaymentsEnabled")
              .setGroupId(group.toString())
              .setEmailArgs(args)
              .setEmailName("international-payments-enabled-notification")
              .build() :
            new Notification.Builder(x)
              .setBody("This business can now make international payments")
              .setNotificationType("Latest_Activity")
              .setGroupId(group.toString())
              .setEmailArgs(args)
              .setEmailName("compliance-notification-to-user")
              .build();

          business.doNotify(x, notification);

        } catch (Throwable t) {
          String msg = String.format("Email meant for business Error: User (id = %1$s) has been enabled for international payments.", business.getId());
          ((Logger) x.get("logger")).error(msg, t);
        }
      `
    }
  ]

});

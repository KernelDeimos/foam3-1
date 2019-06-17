foam.CLASS({
  package: 'net.nanopay.alarming',
  name: 'Alarming',

  documentation: 'Send Alert Notifications on alarm',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'java.util.Date',
    'foam.nanos.analytics.Candlestick',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
    
      DAO configDAO = (DAO) x.get("alarmConfigDAO");
      Logger logger = (Logger) x.get("logger");

      Alarm old = (Alarm) oldObj;
      Alarm newAlarm = (Alarm) obj;
      AlarmConfig config = (AlarmConfig) configDAO.find(EQ(AlarmConfig.NAME, newAlarm.getName()));
      
      if ( config == null || ! config.getEnabled() ) {
        logger.warning("No Alarm config found for " + newAlarm.getName());
        return;
      }
      
      if ( old == null && newAlarm.getIsActive() || old != null && (! old.getIsActive()) && newAlarm.getIsActive() ) {
        try {
          Notification notification = new Notification();
          notification.setUserId(config.getAlertUser());
          notification.setGroupId(config.getAlertGroup());
          notification.setEmailIsEnabled(config.getSendEmail());
          notification.setNotificationType("Alarm");
          notification.setBody("An alarm has been triggered for " + config.getName());
          ((DAO) x.get("notificationDAO")).put(notification);
        } catch (Exception e) {
          logger.error(e);
        }
      }
     `
    }
  ]

});

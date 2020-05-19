foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'IPLoggingAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Service that records request IP adresses when login is attempted',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'DAO loginAttemptDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'javax.servlet.http.HttpServletRequest',
    'net.nanopay.auth.LoginAttempt'
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        if ( getDelegate() instanceof foam.nanos.NanoService ) {
          ((foam.nanos.NanoService) getDelegate()).start();
        }`
    },
    {
      name: 'login',
      javaCode: `
        LoginAttempt loginAttempt = new LoginAttempt();
        HttpServletRequest request = x.get(HttpServletRequest.class);
        String ipAddress = request.getRemoteAddr();
        loginAttempt.setIpAddress(ipAddress);
        loginAttempt.setLoginIdentifier(identifier);

        try {
          User user = super.login(x, identifier, password);
          loginAttempt.setLoginAttemptedFor(user.getId());
          loginAttempt.setGroup(user.getGroup());
          loginAttempt.setLoginSuccessful(true);
          ((DAO) getLoginAttemptDAO()).inX(getX()).put(loginAttempt);
          return user;
        } catch (Throwable t) {
          loginAttempt.setLoginSuccessful(false);
          ((DAO) getLoginAttemptDAO()).put(loginAttempt);
          throw t;
        }
      `
    }
  ]
});

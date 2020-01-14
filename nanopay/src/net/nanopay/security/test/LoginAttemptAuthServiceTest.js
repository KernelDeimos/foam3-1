foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'LoginAttemptAuthServiceTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.nanos.session.Session'
  ],

  constants: [
    {
      name: 'MAX_ATTEMPTS',
      value: 3,
      type: 'Short'
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // set up user dao
        x = x.put("localUserDAO", new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo()));
        foam.dao.DAO userDAO = (foam.dao.DAO) x.get("localUserDAO");
        ResetLoginCount(x, userDAO);

        // Override session user and context for tests
        Session session = x.get(Session.class);
        session.setUserId(1000);
        session.setContext(session.applyTo(x));

        net.nanopay.security.auth.LoginAttemptAuthService auth;
        try {
          // set up login attempt auth service
          auth = new net.nanopay.security.auth.LoginAttemptAuthService.Builder(x)
            .setMaxAttempts(MAX_ATTEMPTS)
            .setDelegate(new foam.nanos.auth.UserAndGroupAuthService(x))
            .build();
          auth.start();
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        // test login attempts reset by email
        Test_LoginAttemptAuthService_LoginAttemptsReset(x, userDAO, auth, "kirk@nanopay.net", "login in by email");
        ResetLoginCount(x, userDAO);

        // test login by email
        Test_LoginAttemptAuthService_LoginAttemptsExceeded(x, userDAO, auth, "kirk@nanopay.net", "login in by email");
        ResetLoginCount(x, userDAO);
      `
    },
    {
      name: 'Test_LoginAttemptAuthService_LoginAttemptsReset',
      documentation: 'Tests that the login attempts are reset',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userDAO',
          type: 'foam.dao.DAO'
        },
        {
          name: 'auth',
          type: 'foam.nanos.auth.AuthService'
        },
        {
          name: 'id',
          type: 'String'
        },
        {
          name: 'method',
          type: 'String'
        }
      ],
      javaCode: `
        try {
          // login with invalid credentials
          LoginWithInvalidCredentials(x, auth, id);
        } catch ( Throwable ignored ) { }

        // verify login attempts increased
        test(VerifyLoginAttempts(x, userDAO, id, 1), "Login attempts is equal to 1 after using " + method);

        // login with valid credentials
        LoginWithValidCredentials(x, auth, id);

        // verify login attempts reset
        test(VerifyLoginAttempts(x, userDAO, id, 0), "Login attempts is reset to 0 after using " + method);
      `
    },
    {
      name: 'Test_LoginAttemptAuthService_LoginAttemptsExceeded',
      documentation: 'Tests logging in and exceeding the allotted number of login attempts',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userDAO',
          type: 'foam.dao.DAO'
        },
        {
          name: 'auth',
          type: 'foam.nanos.auth.AuthService'
        },
        {
          name: 'id',
          type: 'String'
        },
        {
          name: 'method',
          type: 'String'
        }
      ],
      javaCode: `
        // test login
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
          try {
            // login with invalid credentials
            LoginWithInvalidCredentials(x, auth, id);
          } catch ( Throwable t ) {
            // verify login attempts increased
            test(VerifyLoginAttempts(x, userDAO, id, i), "Login attempts is equal to " + i + " after using " + method);
          }
        }

        // attempt to exceed login attempts with invalid credentials
        test(foam.test.TestUtils.testThrows(() -> LoginWithInvalidCredentials(x, auth, id),
          GetNextLoginAttemptAllowedAtMsg(x, userDAO, id), foam.nanos.auth.AuthenticationException.class),
          "LoginAttemptAuthService throws AuthenticationException with the message \\"Account locked. Please contact customer service.\\" with invalid credentials after using " + method);

        // attempt to exceed login attempts with valid credentials
        test(foam.test.TestUtils.testThrows(() -> LoginWithValidCredentials(x, auth, id),
          GetNextLoginAttemptAllowedAtMsg(x, userDAO, id), foam.nanos.auth.AuthenticationException.class),
          "LoginAttemptAuthService throws AuthenticationException with the message \\"Account locked. Please contact customer service.\\" with valid credentials after using " + method);
      `
    },
    {
      name: 'LoginWithValidCredentials',
      documentation: 'Attempts to login with valid credentials',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'auth',
          type: 'foam.nanos.auth.AuthService'
        },
        {
          name: 'id',
          type: 'String'
        },
      ],
      javaCode: `
        auth.loginByEmail(x, id, "Test123");
      `
    },
    {
      name: 'LoginWithInvalidCredentials',
      documentation: 'Attempts to login with invalid credentials',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'auth',
          type: 'foam.nanos.auth.AuthService'
        },
        {
          name: 'id',
          type: 'String'
        },
      ],
      javaCode: `
        auth.loginByEmail(x, id, "Test124");
      `
    },
    {
      name: 'VerifyLoginAttempts',
      documentation: 'Verifies the amount of login attempts',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userDAO',
          type: 'foam.dao.DAO'
        },
        {
          name: 'id',
          type: 'String'
        },
        {
          name: 'attempts',
          type: 'Integer'
        }
      ],
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User)
          userDAO.inX(x).find(foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, id));
          return user != null && user.getLoginAttempts() == attempts;
      `
    },
    {
      name: 'ResetLoginCount',
      documentation: 'Resets the user\'s login attempt counter',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userDAO',
          type: 'foam.dao.DAO'
        }
      ],
      javaCode: `
        userDAO.inX(x).put(new foam.nanos.auth.User.Builder(x)
          .setId(1000).setEmail("kirk@nanopay.net").setGroup("admin")
          .setPassword(foam.util.Password.hash("Test123"))
          .setLoginAttempts((short) 0)
          .build());
      `
    },
    {
      name: 'GetNextLoginAttemptAllowedAtMsg',
      documentation: 'Get user next login allowed time message',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userDAO',
          type: 'foam.dao.DAO'
        },
        {
          name: 'id',
          type: 'String'
        }
      ],
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User)
          userDAO.inX(x).find(foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, id));
          java.text.SimpleDateFormat df =  new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
          df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
          return user == null ? "" : "Account temporarily locked. You can attempt to login after " + df.format(user.getNextLoginAttemptAllowedAt());
      `
    }
  ]
});

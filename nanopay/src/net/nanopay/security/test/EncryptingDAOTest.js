foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'EncryptingDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x = SecurityTestUtil.CreateSecurityTestContext(x);

        foam.core.ClassInfo of = net.nanopay.security.EncryptedObject.getOwnClassInfo();
        foam.dao.MDAO delegate = new foam.dao.MDAO(of);

        net.nanopay.security.EncryptingDAO dao = new net.nanopay.security.EncryptingDAO.Builder(x)
          .setAlias("EncryptingDAOTest").setOf(of).setDelegate(delegate).build();

        foam.nanos.auth.User user = new foam.nanos.auth.User.Builder(x)
          .setId(1000)
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@nanopay.net")
          .build();

        // put user in dao
        foam.core.FObject result = dao.inX(x).put(user);
        test(result instanceof net.nanopay.security.EncryptedObject, "EncryptingDAO's \\"put\\" returns EncryptedObject");
        test(foam.util.SafetyUtil.equals(result.getProperty("id"), 1000), "EncryptedObject's id matches original user id of 1000");
        test(! foam.util.SafetyUtil.isEmpty((String) result.getProperty("data")), "EncryptedObject's data is not empty");

        // find user from dao
        result = dao.inX(x).find(1000);
        test(result instanceof foam.nanos.auth.User, "EncryptingDAO's \\"find\\" returns original User");
        test(foam.util.SafetyUtil.equals(result.getProperty("id"), 1000), "User's id is 1000");
        test(foam.util.SafetyUtil.equals(result.getProperty("firstName"), "Kirk"), "User's firstName is \\"Kirk\\"");
        test(foam.util.SafetyUtil.equals(result.getProperty("lastName"), "Eaton"), "User's lastName is \\"Eaton\\"");
        test(foam.util.SafetyUtil.equals(result.getProperty("email"), "kirk@nanopay.net"), "User's email is \\"kirk@nanopay.net\\"");
      `
    }
  ]
});

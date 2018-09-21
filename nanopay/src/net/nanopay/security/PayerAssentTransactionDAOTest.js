foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PayerAssentTransactionDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // set up test context
        x = SecurityTestUtil.CreateSecurityTestContext(x);

        // get keypair & public key dao
        foam.dao.DAO keyPairDAO = (foam.dao.DAO) x.get("keyPairDAO");
        foam.dao.DAO publicKeyDAO = (foam.dao.DAO) x.get("publicKeyDAO");

        // create user key pair generation dao
        foam.dao.DAO userKeyPairGenerationDAO = new UserKeyPairGenerationDAO.Builder(x)
          .setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo()))
          .build();

        // create payer assent transaction dao
        foam.dao.DAO payerAssentTransactionDAO = new PayerAssentTransactionDAO.Builder(x)
          .setDelegate(new foam.dao.MDAO(net.nanopay.tx.model.Transaction.getOwnClassInfo()))
          .build();

        // create user
        foam.nanos.auth.User user = new foam.nanos.auth.User.Builder(x)
          .setId(1000)
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@nanopay.net")
          .build();

        net.nanopay.tx.model.Transaction tx = new net.nanopay.tx.model.Transaction.Builder(x)
          .setId(java.util.UUID.randomUUID().toString())
          .setPayerId(1000)
          .setPayeeId(1001)
          .setAmount(10000)
          .build();

        // authenticate as user
        x = foam.util.Auth.sudo(x, user);

        // put to user key pair generation dao to create keys
        userKeyPairGenerationDAO.put_(x, user);

        // put to the payer assent transaction dao to sign transaction
        tx = (net.nanopay.tx.model.Transaction) payerAssentTransactionDAO.put_(x, tx);

        // verify signature added
        test(tx != null, "Transaction is not null");
        test(tx.getSignatures() != null, "Transaction signatures is not null");
        test(tx.getSignatures().size() == 1, "Transaction has one signature");

        // get key pair and public key entry
        KeyPairEntry keyPairEntry = (KeyPairEntry) keyPairDAO.inX(x).find(foam.mlang.MLang.EQ(KeyPairEntry.OWNER, user.getId()));
        PublicKeyEntry publicKeyEntry = (PublicKeyEntry) publicKeyDAO.inX(x).find(keyPairEntry.getPublicKeyId());
        java.security.PublicKey publicKey = publicKeyEntry.getPublicKey();

        try {
          // verify signature
          byte[] signature = tx.getSignatures().get(0).getSignature();
          test(tx.verify(signature, publicKey), "PublicKey verifies signature");
        } catch ( Throwable t ) {
          test(false, "PublicKey verifies signature");
        }
      `
    }
  ]
});

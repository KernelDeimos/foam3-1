foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PGPPublicKeyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Converts base64 encoded keys to a PGP compatible PublicKey',

  javaImports: [
    'java.io.ByteArrayInputStream',
    'java.io.InputStream',
    'java.security.KeyFactory',
    'java.security.PublicKey',
    'java.security.spec.X509EncodedKeySpec',
    'java.util.Iterator',

    'org.bouncycastle.openpgp.PGPPublicKey',
    'org.bouncycastle.openpgp.PGPPublicKeyRing',
    'org.bouncycastle.openpgp.PGPPublicKeyRingCollection',
    'org.bouncycastle.openpgp.operator.jcajce.JcaKeyFingerprintCalculator',
    'org.bouncycastle.openpgp.operator.jcajce.JcaPGPKeyConverter',
    'org.bouncycastle.util.encoders.Base64',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        foam.core.FObject obj = getDelegate().find_(x, id);
        PublicKeyEntry entry = (PublicKeyEntry) obj;
        if ( entry == null ) return entry;

        if ( ! "OpenPGP".equals(entry.getAlgorithm()) ) return entry;

        try {
          byte[] decodedBytes = Base64.decode(entry.getEncodedPublicKey());
          InputStream pubKeyIs = new ByteArrayInputStream(decodedBytes);
          PGPPublicKey PGPPublicKey = PGPKeyUtil.publicKeyParse(decodedBytes);
          PgpPublicKeyWrapper publicKey = new PgpPublicKeyWrapper(PGPPublicKey);
          entry.setPublicKey(publicKey);
          return entry;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
  ]
});

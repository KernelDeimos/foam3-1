foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PrivateKeyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Stores the encrypted version of the private key',

  imports: [
    'keyStoreManager'
  ],

  javaImports: [
    'net.nanopay.security.util.SecurityUtil',
    'org.bouncycastle.util.encoders.Base64',
    'javax.crypto.Cipher',
    'javax.crypto.KeyGenerator',
    'javax.crypto.SecretKey',
    'java.security.KeyStore',
    'java.security.PrivateKey'
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Key algorithm for key used to encrypt private key',
      value: 'AES'
    },
    {
      class: 'Int',
      name: 'keySize',
      documentation: 'Key size for key used to encrypt private key',
      value: 256
    },
    {
      class: 'String',
      name: 'alias',
      documentation: 'Alias for key used to encrypt private key'
    },
    {
      class: 'Object',
      name: 'secretKey',
      documentation: 'Secret key used to wrap the private key',
      javaType: 'javax.crypto.SecretKey',
      javaFactory: `
        try {
          KeyStoreManager manager = (KeyStoreManager) getKeyStoreManager();
          KeyStore keyStore = manager.getKeyStore();

          // check if key store contains alias
          if ( keyStore.containsAlias(getAlias()) ) {
            // return secret key from key store
            KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) manager.loadKey(getAlias());
            return entry.getSecretKey();
          }

          // initialize keygen
          KeyGenerator keygen = KeyGenerator.getInstance(getAlgorithm());
          keygen.init(getKeySize(), SecurityUtil.GetSecureRandom());

          // generate secret key and store
          SecretKey key = keygen.generateKey();
          manager.storeKey(getAlias(), new KeyStore.SecretKeyEntry(key));
          return key;
        } catch ( Throwable t ) {
          // TODO: log exception
          throw new RuntimeException(t);
        }
      `
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        foam.core.FObject obj = super.find_(x, id);
        PrivateKeyEntry entry = (PrivateKeyEntry) obj;
        if ( entry == null ) {
          throw new RuntimeException("Private key not found");
        }

        try {
          // initialize cipher for key unwrapping
          KeyStoreManager manager = (KeyStoreManager) getKeyStoreManager();
          KeyStore keyStore = manager.getKeyStore();

          // check if key store contains alias
          if ( ! keyStore.containsAlias(entry.getAlias()) ) {
            throw new RuntimeException("Private key not found");
          }

          // load secret key from keystore
          KeyStore.SecretKeyEntry keyStoreEntry = (KeyStore.SecretKeyEntry) manager.loadKey(entry.getAlias());
          SecretKey key = keyStoreEntry.getSecretKey();
          Cipher cipher = Cipher.getInstance(key.getAlgorithm());
          cipher.init(Cipher.UNWRAP_MODE, key);

          // unwrap private key
          byte[] encryptedBytes = Base64.decodeBase64(entry.getEncryptedPrivateKey());
          PrivateKey privateKey = (PrivateKey) cipher.unwrap(encryptedBytes, entry.getAlgorithm(), Cipher.PRIVATE_KEY);
          entry.setPrivateKey(privateKey);
          return entry;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'put_',
      javaCode: `
        PrivateKeyEntry entry = (PrivateKeyEntry) obj;
        PrivateKey privateKey = entry.getPrivateKey();
        if ( privateKey == null ) {
          throw new RuntimeException("Private key not found");
        }

        try {
          // initialize cipher for key wrapping
          SecretKey key = getSecretKey();
          Cipher cipher = Cipher.getInstance(key.getAlgorithm());
          cipher.init(Cipher.WRAP_MODE, key, SecurityUtil.GetSecureRandom());
          entry.setEncryptedPrivateKey(Base64.toBase64String(cipher.wrap(privateKey)));
          entry.setAlias(getAlias());
          entry.setPrivateKey(null);
          return super.put_(x, entry);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});

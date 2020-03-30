foam.CLASS({
  package: 'net.nanopay.security',
  name: 'JKSKeyStoreManager',
  extends: 'net.nanopay.security.AbstractFileKeyStoreManager',

  documentation: 'KeyStoreManager that stores keys to a file using JKS.',

  properties: [
    ['type', 'JKS'],
    ['keyStorePath', '/opt/nanopay/var/keys/keystore.jks'],
    ['passphrasePath', '/opt/nanopay/var/keys/passphrase']
  ]
});

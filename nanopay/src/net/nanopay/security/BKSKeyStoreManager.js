foam.CLASS({
  package: 'net.nanopay.security',
  name: 'BKSKeyStoreManager',
  extends: 'net.nanopay.security.AbstractFileKeyStoreManager',

  documentation: 'KeyStoreManager that stores keys to a file using BKS.',

  properties: [
    ['type', 'BKS'],
    ['provider', 'BC' ],
    ['keyStorePath', '/opt/nanopay/var/keys/keystore.bks'],
    ['passphrasePath', '/opt/nanopay/var/keys/passphrase']
  ]
});

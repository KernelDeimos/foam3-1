foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingJournal',
  extends: 'foam.dao.FileJournal',

  javaImports: [
    'foam.lib.json.OutputterMode',
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA-256',
      documentation: 'Hashing algorithm to use'
    },
    {
      class: 'Boolean',
      name: 'rollDigests',
      value: false,
      documentation: 'Roll digests together'
    },
    {
      class: 'String',
      name: 'previousDigest',
      documentation: 'Previous digest to use in rolling'
    },
    {
      name: 'outputter',
      javaFactory: `
        try {
          return new HashingOutputter(this, OutputterMode.STORAGE);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'parser',
      javaFactory: `return new HashedJSONParser(getX(), this);`
    }
  ]
});

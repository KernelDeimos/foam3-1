foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HexStringArray',
  extends: 'foam.core.Property',
  flags: ['java'],

  properties: [
    ['javaType', 'byte[][]'],
    ['javaValue', 'null'],
    ['javaInfoType', 'net.nanopay.security.AbstractHexStringArrayPropertyInfo'],
    ['javaJSONParser', 'new net.nanopay.security.HexStringArrayParser()']
  ]
});

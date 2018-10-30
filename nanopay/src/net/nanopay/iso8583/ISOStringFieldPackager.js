foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOStringFieldPackager',
  extends: 'net.nanopay.iso8583.AbstractISOFieldPackager',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.interpreter.Interpreter',
      name: 'interpreter',
      javaValue: 'net.nanopay.iso8583.interpreter.LiteralInterpreter.INSTANCE'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.padder.Padder',
      name: 'padder',
      javaValue: 'net.nanopay.iso8583.padder.NullPadder.INSTANCE'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.prefixer.Prefixer',
      name: 'prefixer',
      javaValue: 'net.nanopay.iso8583.prefixer.NullPrefixer.INSTANCE'
    }
  ],

  methods: [
    {
      name: 'pack',
      javaCode: `
        String data = ( c.getValue() instanceof byte[] ) ?
          new String(c.getBytes(), java.nio.charset.StandardCharsets.ISO_8859_1) : (String) c.getValue();
        if ( data.length() > getLength() ) {
          throw new IllegalArgumentException("Field length " + data.length() + " too long. Max: " + getLength());
        }

        String padded = getPadder().pad(data, getLength());
        getPrefixer().encodeLength(padded.length(), out);
        out.write(padded.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
      `
    },
    {
      name: 'unpack',
      javaCode: `
        int length = getPrefixer().getPackedLength() == 0 ? getLength() : getPrefixer().decodeLength(in);
        if ( getLength() > 0 && length > 0 && length > getLength() ) {
          throw new IllegalStateException("Field length " + length + " too long. Max: " + getLength());
        }
        c.setValue(getInterpreter().uninterpret(length, in));
      `
    }
  ]
});

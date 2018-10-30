foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOPackager',
  abstract: true,

  documentation: `
    Abstract implementation of an ISO Packager. To implement a new ISOPackager, extend this interface
    and provide an array of all fields required in the implementation.
  `,

  implements: [
    'net.nanopay.iso8583.ISOPackager'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.iso8583.ISOFieldPackager',
      name: 'fields',
      documentation: 'ISO 8583 fields'
    }
  ],

  methods: [
    {
      name: 'emitBitMap',
      javaReturns: 'boolean',
      javaCode: `
        return getFields().length > 1 && getFields()[1] instanceof ISOBitMapFieldPackager;
      `
    },
    {
      name: 'getFirstField',
      javaReturns: 'int',
      javaCode: `
        return getFields().length > 1 ? getFields()[1] instanceof ISOBitMapFieldPackager ? 2 : 1 : 0;
      `
    },
    {
      name: 'pack',
      javaCode: `
        int first = getFirstField();
        java.util.Map fields = m.getChildren();
        ISOComponent c = (ISOComponent) fields.get(0);

        // pack MTI
        if ( first > 0 && c != null ) {
          getFields()[0].pack(c, out);
        }

        // pack bitmap
        if ( emitBitMap() ) {
          // get bitmap field and pack
          c = (ISOComponent) fields.get(-1);
          getBitMapFieldPackager().pack(c, out);
        }

        // pack fields
        int maxField = Math.min(m.getMaxField(), 128);
        for ( int i = first ; i <= maxField ; i++ ) {
          if ( ( c = (ISOComponent) fields.get(i)) == null ) {
            continue;
          }

          ISOFieldPackager fp = getFields()[i];
          if ( fp == null ) {
            throw new IllegalStateException("Null field " + i + " packager");
          }

          fp.pack(c, out);
        }
      `
    },
    {
      name: 'unpack',
      javaCode: `
        // unpack MTI
        if ( ! ( getFields()[0] instanceof ISOBitMapFieldPackager ) ) {
          ISOComponent mti = getFields()[0].createComponent(0);
          getFields()[0].unpack(mti, in);
          m.set(mti);
        }

        // unpack BitMap
        FixedBitSet bmap = null;
        int maxField = getFields().length;
        if ( emitBitMap() ) {
          ISOBitMapField bitmap = new ISOBitMapField.Builder(getX()).setFieldNumber(-1).build();
          getBitMapFieldPackager().unpack(bitmap, in);
          bmap = bitmap.getValue();
          m.set(bitmap);
          maxField = Math.min(maxField, bmap.size());
        }

        // unpack fields
        for ( int i = getFirstField() ; i < maxField ; i++ ) {
          if ( bmap == null && getFields()[1] == null ) {
            continue;
          }

          // check if field exists in bitmap
          if ( bmap == null || bmap.get(i) ) {
            if ( getFields()[i] == null ) {
              throw new IllegalStateException("Null field " + i + " packager");
            }

            // unpack component and set in message
            ISOComponent c = getFields()[i].createComponent(i);
            getFields()[i].unpack(c, in);
            m.set(c);
          }
        }
      `
    },
    {
      name: 'getFieldPackager',
      javaReturns: 'net.nanopay.iso8583.ISOFieldPackager',
      args: [
        {
          name: 'fieldNumber',
          javaType: 'int',
        }
      ],
      javaCode: `
        return getFields() != null && fieldNumber < getFields().length ? getFields()[fieldNumber] : null;
      `
    },
    {
      name: 'getBitMapFieldPackager',
      javaReturns: 'net.nanopay.iso8583.ISOFieldPackager',
      javaCode: `
        return getFields()[1];
      `
    }
  ]
});

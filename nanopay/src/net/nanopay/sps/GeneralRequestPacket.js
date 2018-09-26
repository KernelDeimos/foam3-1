foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'GeneralRequestPacket',
  extends: 'net.nanopay.sps.RequestPacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType',
      value: 20
    },
    {
      class: 'Int',
      name: 'packetType',
      value: 2010
    },
    {
      class: 'Int',
      name: 'msgModifierCode'
    },
    {
      class: 'String',
      name: 'localTxnTime'
    },
    {
      class: 'String',
      name: 'field5NotUsed',
      value: ''
    },
    {
      class: 'String',
      name: 'TID'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.sps.TxnDetail',
      name: 'txnDetail'
    },
    {
      class: 'String',
      name: 'MICR'
    },
    {
      class: 'String',
      name: 'routeCode'
    },
    {
      class: 'String',
      name: 'account'
    },
    {
      class: 'String',
      name: 'checkNum'
    },
    {
      class: 'String',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'invoice'
    },
    {
      class: 'String',
      name: 'clerkId'
    },
    {
      class: 'String',
      name: 'field15NotUsed',
      value: ''
    },
    {
      class: 'String',
      name: 'socialSecurityNum'
    },
    {
      class: 'String',
      name: 'itemId'
    },
    {
      class: 'String',
      name: 'optionsSelected',
      value: 'EV'
    },
    {
      class: 'String',
      name: 'driversLicense'
    },
    {
      class: 'String',
      name: 'DLStateCode'
    },
    {
      class: 'String',
      name: 'dateOfBirth'
    },
    {
      class: 'String',
      name: 'phoneNumber'
    }
  ],

  javaImports: [
    'java.util.*',
    'foam.core.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  {
    list = new ArrayList<>();
    list.add(MSG_TYPE);
    list.add(PACKET_TYPE);
    list.add(MSG_MODIFIER_CODE);
    list.add(LOCAL_TXN_TIME);
    list.add(FIELD5NOT_USED);
    list.add(TID);
    list.add(TXN_DETAIL);
    list.add(MICR);
    list.add(ROUTE_CODE);
    list.add(ACCOUNT);
    list.add(CHECK_NUM);
    list.add(AMOUNT);
    list.add(INVOICE);
    list.add(CLERK_ID);
    list.add(FIELD15NOT_USED);
    list.add(SOCIAL_SECURITY_NUM);
    list.add(ITEM_ID);
    list.add(OPTIONS_SELECTED);
    list.add(DRIVERS_LICENSE);
    list.add(DLSTATE_CODE);
    list.add(DATE_OF_BIRTH);
    list.add(PHONE_NUMBER);
  }
        `);
      }
    }
  ]

});

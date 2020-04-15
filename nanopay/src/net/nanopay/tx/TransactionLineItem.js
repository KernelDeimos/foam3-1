/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      factory: function() {
        return foam.uuid.randomGUID();
      },
      javaFactory: `return java.util.UUID.randomUUID().toString();`
    },
    {
      documentation: 'Assigned when line items are added to a transaction. All lineitems add at the same time are assigned to the same group so line items can be shown together.  For example, FX rate, expiry, fee can be grouped in the output.',
      name: 'group',
      class: 'String'
    },
    {
      name: 'sourceAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      hidden: true
    },
    {
      name: 'destinationAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      hidden: true
    },
    {
      documentation: 'By default, show Transaction Line Item class name - to distinguish sub-classes.',
      name: 'name',
      class: 'String',
      visibility: 'RO',
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: 'return getClass().getSimpleName();'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'type'
    },
    {
      name: 'note',
      class: 'String'
    },
    {
      name: 'amount',
      class: 'UnitValue',
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      documentation: 'Used to format amount',
      name: 'currency',
      class: 'String',
      value: 'CAD',
      hidden: true
    },
    {
      name: 'reversable',
      label: 'Refundable',
      class: 'Boolean',
      visibility: 'RO',
      value: true
    }
  ],

  methods: [
    function toSummary() {
      return this.name;
    },
    {
      name: 'validate',
      type: 'Void',
      javaCode: `
        // TODO/REVIEW : require access to parent Transaction lastModifiedTime
        // if ( getFxExpiry().getTime() < lastModifiedTime + some window ) {
        //   throw new RuntimeException("FX quote expired.");
        // }
      `
    }
  ]
});

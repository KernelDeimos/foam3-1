/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Short',
      name: 'loginAttempts',
      value: 0,
      createVisibility: 'HIDDEN',
      section: 'administrative'
    },
    {
      documentation: 'Visibility in Global Directory / Parners lookup',
      name: 'isPublic',
      class: 'Boolean',
      value: true,
      writePermissionRequired: true,
      section: 'administrative'
    },
    {
      class: 'DateTime',
      name: 'nextLoginAttemptAllowedAt',
      type: 'Date',
      javaFactory: 'return new Date();',
      section: 'administrative',
      // storageOptional ensures user entry is not updated on each successful login. If login fails, then loginAttempts will be non-zero and this property will be persisted.
      storageOptional: true
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'TransactionRefine',
  refines: 'net.nanopay.tx.model.Transaction',
  properties: [
    {
      class: 'List',
      name: 'signatures',
      documentation: 'List of signatures for a given transaction',
      javaType: 'java.util.ArrayList<net.nanopay.security.Signature>',
      visibility: function(signatures) {
        return signatures ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'TransferRefine',
  refines: 'net.nanopay.tx.Transfer',
  properties: [
    {
      class: 'List',
      name: 'signatures',
      documentation: 'List of signatures for a given transaction',
      javaType: 'java.util.ArrayList<net.nanopay.security.Signature>',
    }
  ]
});

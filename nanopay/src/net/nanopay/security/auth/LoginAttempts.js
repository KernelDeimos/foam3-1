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
  package: 'net.nanopay.security.auth',
  name: 'LoginAttempts',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'id',
    },
    {
      class: 'Short',
      name: 'loginAttempts',
      createVisibility: 'HIDDEN',
      section: 'administrative'
    },
    {
      class: 'DateTime',
      name: 'nextLoginAttemptAllowedAt',
      type: 'Date',
      javaFactory: 'return new Date();',
      section: 'administrative',
      storageOptional: true
    },
    {
      class: 'Boolean',
      name: 'clusterable',
      value: true,
      visibility: 'HIDDEN',
      storageTransient: true,
      clusterTransient: true
    }
  ]
});

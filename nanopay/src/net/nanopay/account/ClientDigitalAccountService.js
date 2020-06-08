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
  package: 'net.nanopay.account',
  name: 'ClientDigitalAccountService',

  implements: [
    'net.nanopay.account.DigitalAccountServiceInterface'
  ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName',
      value: 'digitalAccount'
    },
    {
      class: 'Stub',
      of: 'net.nanopay.account.DigitalAccountServiceInterface',
      name: 'delegate',
      factory: function() {
        return this.SessionClientBox.create({
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: this.serviceName
          })
        });
      },
   }
  ]
});

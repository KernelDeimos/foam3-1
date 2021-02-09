/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.auth',
  name: 'ServiceProviderRefine',
  refines: 'foam.nanos.auth.ServiceProvider',
  properties: [
    {
      class: 'String',
      name: 'paymentIssuerTag',
      factory: function() {
        return this.id.charAt(0).toUpperCase() + this.id.slice(1) + ' powered by nanopay';
      },
      javaFactory: `
        return getId().substring(0, 1).toUpperCase() + getId().substring(1) + " powered by nanopay";
      `
    }
  ]
});

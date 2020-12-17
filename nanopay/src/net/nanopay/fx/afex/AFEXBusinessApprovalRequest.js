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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessApprovalRequest',

  documentation: 'Approval request to allow 5minutes delay in AFEX Client Onboarding',

  extends: 'foam.nanos.approval.ApprovalRequest',

  properties: [
    {
      class: 'String',
      name: 'afexBusinessId',
      visibility: function(afexBusinessId) {
        return afexBusinessId ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    }
  ]
});

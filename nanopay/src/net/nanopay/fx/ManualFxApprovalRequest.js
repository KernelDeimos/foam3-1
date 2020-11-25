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
  package: 'net.nanopay.fx',
  name: 'ManualFxApprovalRequest',

  documentation: 'Approval request that stores a CAD to INR FX rate',

  extends: 'foam.nanos.approval.ApprovalRequest',

  properties: [
    {
      class: 'String',
      name: 'dealId',
      section: 'requestDetails'
    },
    {
      class: 'Double',
      name: 'fxRate',
      section: 'requestDetails'
    },
    {
      class: 'DateTime',
      name: 'valueDate',
      section: 'requestDetails',
      visibility: function(valueDate) {
        return valueDate ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'DateTime',
      name: 'expiryDate',
      section: 'requestDetails',
      visibility: function(expiryDate) {
        return expiryDate ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    }
  ]
});

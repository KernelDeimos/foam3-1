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

foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'FeeType',

  documentation: 'Types for CICO transactions',

  values: [
    {
      name: 'NONE',
      label: 'None'
    },
    {
      name: 'SENDING',
      label: 'Sending Fee'
    },
    {
      name: 'RECEIVING',
      label: 'Receiving Fee'
    },
    {
      name: 'FX_MARGIN',
      label: 'FX Margin'
    },
    {
      name: 'INFORMATIONAL',
      label: 'Informational Fee'
    }
  ]
});
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
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniDataSources',

  properties: [
    {
      class: 'String',
      name: 'verificationSource'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'reference'
    },
    {
      class: 'String',
      name: 'date'
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndDOB'
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndAddress'
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndAccount'
    },
    {
      class: 'String',
      name: 'creditFileAge'
    }
  ]
});

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
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.SecurefactResponse',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
    'id', 'entityName', 'entityId', 'closeMatches', 'searchId'
  ],

  properties: [
    {
      class: 'Int',
      name: 'searchId',
      documentation: 'Securefact unique search id.'
    },
    {
      class: 'String',
      name: 'closeMatches',
      label: 'Close Matches'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'jurisdictionsUnavailable',
      documentation: 'If a jurisdiction is unavailable at the time of the search and results cannot be returned, it will be listed here.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVResult',
      name: 'results'
    }
  ],

  methods: [
    {
      type: 'Boolean',
      name: 'hasCloseMatches',
      javaCode: `
        if ( ! SafetyUtil.isEmpty(getCloseMatches()) ) {
          int count = Integer.parseInt(getCloseMatches().split("/")[0]);
          return count > 0;
        }
        return false;
      `
    }
  ]
});

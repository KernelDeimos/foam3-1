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
  name: 'AFEXBusinessCreatedPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      if ( ! (NEW_OBJ.f(obj) instanceof AFEXBusiness) ) return false;
      AFEXBusiness afexBusiness = (AFEXBusiness) NEW_OBJ.f(obj);
      return ! SafetyUtil.isEmpty(afexBusiness.getApiKey())
        && ! SafetyUtil.isEmpty(afexBusiness.getAccountNumber())
        && ! "Disabled".equals(afexBusiness.getStatus())
        && afexBusiness.getEnabled();
      `
    }
  ]
});

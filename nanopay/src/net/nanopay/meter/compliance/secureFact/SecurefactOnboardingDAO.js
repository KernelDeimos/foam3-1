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
   package: 'net.nanopay.meter.compliance.secureFact',
   name: 'SecurefactOnboardingDAO',
   extends: 'foam.dao.ProxyDAO',

   documentation: `Decorating DAO for business onboarding through FlinksLoginId requests.`,

   javaImports: [
     'net.nanopay.flinks.external.FlinksLoginId'
   ],

   methods: [
     {
       name: 'put_',
       javaCode: `
        FlinksLoginId flinksLoginId = (FlinksLoginId) obj;
        return super.put_(x, flinksLoginId);
       `
     }
   ]
 });

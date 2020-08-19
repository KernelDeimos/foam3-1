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
  name: 'AFEXCredentials',

  //axioms: [foam.pattern.Singleton.create()],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'apiKey'
    },
    {
      class: 'String',
      name: 'apiPassword'
    },
    {
      class: 'String',
      name: 'partnerApi'
    },
    {
      class: 'String',
      name: 'AFEXApi'
    },
    {
      class: 'Int',
      name: 'quoteExpiryTime'
    },
    {
      class: 'Long',
      name: 'internationalFee',
      label: 'International fee'
    },
    {
      class: 'Long',
      name: 'domesticFee',
      label: 'Domestic fee'
    },
    {
      class: 'Int',
      name: 'clientApprovalDelay',
      value: 5,
      documentation: 'Wait time in minutes before AFEX business is approved.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    },
  ]
});

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
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'USDAFEXTerms',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_AFEX_AGREEMENT', message: 'Certification required' },
    { name: 'AGREEMENT_HASH', message: '87278b8b-81b3-6380-6b87-7f46680ba0c3'}
  ],

  sections: [
    {
      name: 'reviewAgreementDocumentsSection',
      title: 'Review and accept the terms and conditions',
      navTitle: 'Terms and Conditions',
      permissionRequired: true
    },
  ],

  properties: [
    {
      name: 'title',
      value: `AFEX terms and conditions`
    },
    {
      name: 'checkboxText',
      value: 'I certify that I have consent to submit all personal information provided, and that all information is correct. I have read, understood, and agree to '
    },
    {
      name: 'link',
      getter: function() {
        return this.AGREEMENT_HASH;
      }
    },
    {
      name: 'version',
      value: '1.0'
    },
    {
      name: 'issuedDate',
      factory: function() {
        return new Date('2019-08-09T00:00:00.0Z');
      }
    },
    {
      name: 'transactionType',
      value: 'AFEX'
    },
    {
      name: 'country',
      value: 'US'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .USDAFEXTerms.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_AFEX_AGREEMENT'
        }
      ]
    }
  ]
});

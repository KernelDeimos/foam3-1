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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'TransactionDetailsData',

  documentation: `
    This model represents the transactionDetailsSection of the onboarding model.
  `,

  implements: [
    'foam.core.Validatable'
  ],

  imports: [
    'user'
  ],

  sections: [
    {
      name: 'transactionSection',
      title: 'Enter the transaction details',
      help: `require some details on the company's transactions.`,
      order: 1
    },
    {
      name: 'purposeSection',
      title: ' ',
      order: 2
    }
  ],

  messages: [
    { name: 'NO_TARGET_CUSTOMERS_ERROR', message: 'Please enter target customers.' },
    { name: 'NO_SUGGESTED_USER_TXN_INFO_ERROR', message: 'Please enter suggested user transaction info.' }
  ],

  properties: [
    net.nanopay.model.Business.TARGET_CUSTOMERS.clone().copyFrom({
      section: 'purposeSection',
      view: {
        class: 'foam.u2.tag.TextArea',
        onKey: true,
        placeholder: 'Example: Small manufacturing businesses in North America'
      },
      validationPredicates: [
        {
          args: ['targetCustomers'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: net.nanopay.crunch.onboardingModels.TransactionDetailsData.TARGET_CUSTOMERS
              }), 0);
          },
          errorMessage: 'NO_TARGET_CUSTOMERS_ERROR'
        }
      ]
    }),
    net.nanopay.model.Business.SUGGESTED_USER_TRANSACTION_INFO.clone().copyFrom({
      label: '',
      section: 'transactionSection',
      factory: function() {
        let baseCurrency = 'USD';
        if ( this.user.address && this.user.address.countryId && this.user.address.countryId === 'CA' ) {
          // TODO need connection between address.country and currency : use domestic corridor ****
          baseCurrency = 'CAD';
        }
        return net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.create({ baseCurrency: baseCurrency });
      },
      validationPredicates: [
        {
          args: ['suggestedUserTransactionInfo'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
              arg1: net.nanopay.crunch.onboardingModels.TransactionDetailsData.SUGGESTED_USER_TRANSACTION_INFO
            }), true);
          },
          errorMessage: 'NO_SUGGESTED_USER_TXN_INFO_ERROR'
        }
      ]
    })
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});

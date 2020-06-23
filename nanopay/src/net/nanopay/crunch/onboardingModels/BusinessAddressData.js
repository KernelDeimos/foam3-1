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
  name: 'BusinessAddressData',

  implements: [
    'foam.core.Validatable'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.model.Business'
  ],

  imports: [
    'countryDAO',
    'user'
  ],

  javaImports: [
    'foam.nanos.auth.Address'
  ],

  sections: [
    {
      name: 'businessAddressSection',
      title: 'Enter the business address',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on the company…`
    }
  ],

  messages: [
    { name: 'COUNTRY_MISMATCH_ERROR', message: 'Country of business address must match the country of business registration.' },
    { name: 'QUEBEC_NOT_SUPPORTED_ERROR', message: 'This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' },
    { name: 'INVALID_ADDRESS_ERROR', message: 'Invalid address.' }
  ],

  properties: [
    {
      name: 'countryId',
      class: 'String',
      hidden: true,
      storageTransient: true,
      factory: function() {
        return this.user && this.user.address ? this.user.address.countryId : null;
      }
    },
    net.nanopay.model.Business.ADDRESS.clone().copyFrom({
      section: 'businessAddressSection',
      label: '',
      view: function(_, X) {
        var m = foam.mlang.Expressions.create();
        var countryId = X.data ? X.data.countryId : null;
        var dao = countryId ? 
          X.countryDAO.where(m.EQ(foam.nanos.auth.Country.ID, countryId)) : 
          X.countryDAO;

        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao,
          showValidation: true
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          args: ['address', 'address$countryId', 'address$errors_', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.NEQ(net.nanopay.crunch.onboardingModels.BusinessAddressData.COUNTRY_ID, null),
                e.EQ(
                  e.DOT(net.nanopay.crunch.onboardingModels.BusinessAddressData.ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 
                  net.nanopay.crunch.onboardingModels.BusinessAddressData.COUNTRY_ID
                )
              ),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessAddressData.COUNTRY_ID, null)
            );
          },
          errorMessage: 'COUNTRY_MISMATCH_ERROR'
        },
        {
          args: ['address', 'address$regionId', 'address$errors_'],
          predicateFactory: function(e) {
            return e.NEQ(e.DOT(net.nanopay.crunch.onboardingModels.BusinessAddressData.ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC');
          },
          errorMessage: 'QUEBEC_NOT_SUPPORTED_ERROR'
        },
        {
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessAddressData.ADDRESS
              }), true);
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
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

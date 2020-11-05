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
  package: 'net.nanopay.sme.ui',
  name: 'AddressView',
  extends: 'foam.u2.View',

  documentation: 'SME specific address view used in forms.',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.Country',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  imports: [
    'countryDAO',
    'regionDAO',
    'translationService'
  ],

  css: `
    ^ .foam-u2-tag-Select {
      width: 100%;
    }
    ^ .label {
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
    }
    ^container {
      margin-bottom: 20px;
    }
    ^disclaimer {
      font-size: 16px;
      color: #525455;
      margin-top: 40px;
    }
    ^ .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 16px;
    }
    ^ .three-column {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-gap: 16px;
    }
    ^ .one-three-one-column {
      display: grid;
      grid-template-columns: 1fr 3fr 1fr;
      grid-gap: 16px;
    }
    ^ .one-two-column {
      display: grid;
      grid-template-columns: 1fr 2fr;
      grid-gap: 16px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'showValidation',
      value: true,
      documentation: 'Use this property if the value of validationTextVisible is situational.'
    },
    {
      class: 'Boolean',
      name: 'showDisclaimer',
      value: false,
      documentation: 'Displays PO boxes not allowed disclaimer if true.'
    },
    {
      class: 'Boolean',
      name: 'withoutCountrySelection',
      value: false,
      documentation: `If the value of this property is true, then hide country selection dropdown.`
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'customCountryDAO',
      documentation: 'Can be set if you want a filtered version of countryDAO.',
      factory: function() {
        return this.countryDAO;
      }
    },
    {
      class: 'String',
      name: 'regionLabel'
    },
    {
      class: 'String',
      name: 'defaultRegionLabel'
    },
    {
      class: 'String',
      name: 'postalCodeLabel'
    },
    {
      class: 'String',
      name: 'defaultPostalCodeLabel'
    }
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' },
    { name: 'PO_DISCLAIMER', message: '* PO Boxes are not Allowed' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      // default translations
      self.defaultRegionLabel = self.regionLabel = this.translationService.getTranslation(foam.locale, `${foam.locale}.region.label`);
      self.defaultPostalCodeLabel = self.postalCodeLabel = this.translationService.getTranslation(foam.locale, `${foam.locale}.postalCode.label`);
      
      // update translations
      this.data$.dot('countryId').sub(() => {
        const country = self.data.countryId.toLowerCase();
        let translatedRegionLabel = self.translationService.getTranslation(foam.locale, `${country}.region.label`);
        self.regionLabel = translatedRegionLabel ? translatedRegionLabel : self.defaultRegionLabel;
        let translatedPostalCodeLabel = self.translationService.getTranslation(foam.locale, `${country}.postalCode.label`);
        self.postalCodeLabel = translatedPostalCodeLabel ? translatedPostalCodeLabel : self.defaultPostalCodeLabel;
      });

      // Queried out American states from state/province list that are not supported by AscendantFX
      var choices = this.data$.dot('countryId').map(function(countryId) {
        if ( countryId === 'US' ) {
          return self.regionDAO.where(
            self.EQ(self.Region.COUNTRY_ID, countryId || '')
          );
        }
        return self.regionDAO.where(self.EQ(self.Region.COUNTRY_ID, countryId || ''));
      });

      this
        .addClass(this.myClass())
        .callIf( ! this.withoutCountrySelection, () => {
          this.start().addClass(this.myClass('container'))
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.COUNTRY_ID.clone().copyFrom({
                  view: {
                    class: 'foam.u2.view.ChoiceView',
                    placeholder: this.PLACE_HOLDER,
                    dao: this.customCountryDAO,
                    objToChoice: function(a) {
                      return [a.id, a.name];
                    },
                    mode$: this.mode$
                  },
                  validationTextVisible: this.showValidation
                })
              })
            .end()
          .end();
        })
        .start().addClass(this.myClass('container'))
          .start().addClass('one-three-one-column')
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.STREET_NUMBER.clone().copyFrom({
                  validationTextVisible: this.showValidation
                })
              })
            .end()
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.STREET_NAME.clone().copyFrom({
                  validationTextVisible: this.showValidation
                })
              })
            .end()
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.SUITE.clone().copyFrom({
                  validationTextVisible: this.showValidation
                })
              })
            .end()
          .end()
        .end()
        .start().addClass(this.myClass('container'))
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.CITY.clone().copyFrom({
                validationTextVisible: this.showValidation
              })
            })
          .end()
        .end()
        .start().addClass(this.myClass('container'))
          .start().addClass('one-two-column')
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.REGION_ID.clone().copyFrom({
                  view: {
                    class: 'foam.u2.view.ChoiceView',
                    placeholder: this.PLACE_HOLDER,
                    objToChoice: function(region) {
                      return [region.id, region.name];
                    },
                    dao$: choices,
                    mode$: this.mode$
                  },
                  label$: this.regionLabel$,
                  validationTextVisible: this.showValidation
                })
              })
            .end()
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.POSTAL_CODE.clone().copyFrom({
                  label$: this.postalCodeLabel$,
                  validationTextVisible: this.showValidation
                })
              })
            .end()
          .end()
        .end()
        .callIf( this.showDisclaimer, () => {
          this.start().addClass(this.myClass('container'))
            .addClass(this.myClass('disclaimer'))
            .add(this.PO_DISCLAIMER)
          .end();
        })
      .end();
    }
  ]
});

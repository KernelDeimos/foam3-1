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
    'regionDAO'
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
    ^ .two-column{
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 16px;
    }
    ^ .three-column{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-gap: 16px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'showValidationText',
      documentation: 'Use this property if the value of validationTextVisible is situational'
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
    }
  ],

  messages: [
    { name: 'PROVINCE_LABEL', message: 'Province/State' },
    { name: 'POSTAL_CODE', message: 'Postal Code/ZIP Code' },
    { name: 'PLACE_HOLDER', message: 'Please select...' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

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
          this.start()
            .addClass('two-column')
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
                  validationTextVisible: this.showValidationText
                })
              })
            .end()
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
                  label: this.PROVINCE_LABEL,
                  validationTextVisible: this.showValidationText
                })
              })
            .end()
          .end();
        })
        .start()
          .addClass('two-column')
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.STREET_NUMBER.clone().copyFrom({
                validationTextVisible: this.showValidationText
              })
            })
          .end()
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.STREET_NAME.clone().copyFrom({
                validationTextVisible: this.showValidationText
              })
            })
          .end()
        .end()
        .start()
          .addClass('two-column')
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.CITY.clone().copyFrom({
                validationTextVisible: this.showValidationText
              })
            })
          .end()
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.POSTAL_CODE.clone().copyFrom({
                label: this.POSTAL_CODE,
                validationTextVisible: this.showValidationText
              })
            })
          .end()
        .end()
        .start().addClass('label-input')
          .tag(this.SectionedDetailPropertyView, {
            data$: this.data$,
            prop: this.Address.SUITE.clone().copyFrom({
              validationTextVisible: this.showValidationText
            })
          })
        .end();
    }
  ]
});

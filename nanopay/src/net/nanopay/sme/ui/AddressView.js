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
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
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
      name: 'withoutCountrySelection',
      value: false,
      documentation: `If the value of this property is true, then hide country selection dropdown.`
    }
  ],

  messages: [
    { name: 'COUNTRY_LABEL', message: 'Country' },
    { name: 'STREET_NUMBER_LABEL', message: 'Street Number' },
    { name: 'STREET_NAME_LABEL', message: 'Street Name' },
    { name: 'ADDRESS_LABEL', message: 'Address Line 2 (Optional)' },
    { name: 'ADDRESS_HINT', message: 'Apartment, suite, etc.' },
    { name: 'PROVINCE_LABEL', message: 'Province/State' },
    { name: 'CITY_LABEL', message: 'City' },
    { name: 'POSTAL_CODE_LABEL', message: 'Postal Code/Zip Code' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      // Queried out American states from state/province list that are not supported by AscendantFX
      var choices = this.data$.dot('countryId').map(function(countryId) {
        if ( countryId == 'US' ) {
          return self.regionDAO.where(
            self.AND(
              self.EQ(self.Region.COUNTRY_ID, countryId || ''),
              self.NOT(
                self.IN(self.Region.NAME, ['Alaska', 'Hawaii', 'Utah', 'South Dakota', 'Iowa',
                  'Arkansas', 'Louisiana', 'Mississippi', 'South Carolina',
                  'West Virginia', 'Ohio', 'Michigan', 'Rhode Island', 'Vermont']
                )
              )
            )
          );
        } else {
          return self.regionDAO.where(self.EQ(self.Region.COUNTRY_ID, countryId || ''));
        }
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
                  placeholder: 'Select...',
                  dao: self.countryDAO.where(self.OR(
                    self.EQ(self.Country.NAME, 'Canada')
                    // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
                    // self.EQ(self.Country.NAME, 'USA')
                  )),
                  objToChoice: function(a) {
                    return [a.id, a.name];
                  },
                  mode$: this.mode$
                }
                })
              })
            .end()
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.REGION_ID.clone().copyFrom({
                  view: {
                    class: 'foam.u2.view.ChoiceView',
                    placeholder: 'Select...',
                    objToChoice: function(region) {
                      return [region.id, region.name];
                    },
                    dao$: choices,
                    mode$: this.mode$
                  },
                  label: this.PROVINCE_LABEL
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
              prop: this.Address.STREET_NUMBER
            })
          .end()
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.STREET_NAME
            })
          .end()
        .end()
        .start().addClass('label-input')
          .tag(this.SectionedDetailPropertyView, {
            data$: this.data$,
            prop: this.Address.SUITE
          })
        .end()
        .start()
          .enableClass('three-column', this.withoutCountrySelection)
          .enableClass('two-column', ! this.withoutCountrySelection)
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.CITY
            })
          .end()
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.POSTAL_CODE
            })
          .end()
        .end();
    }
  ]
});
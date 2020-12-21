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
  package: 'net.nanopay.business',
  name: 'NatureOfBusiness',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.view.RichChoiceView',
    'net.nanopay.model.BusinessSector'
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'businessSectorDAO'
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' },
    { name: 'SPECIFIC_INDUSTRIES', message: 'Specific Industries' },
    { name: 'INDUSTRIES', message: 'Industries' },
    { name: 'SEARCH', message: 'Search...' },
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'parentChoice',
      postSet: function(o, n) {
        if ( o != n && o !== 0 )
          this.data = 0;
      },
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      value: '',
      visibility: 'HIDDEN'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      expression: function(parentChoice, country) {
        return parentChoice ?
          this.AND(
            this.EQ(this.BusinessSector.PARENT, parentChoice),
            this.EQ(this.BusinessSector.COUNTRY_ID, country)
          ):
          this.FALSE;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function(businessSectorDAO, predicate) {
        return businessSectorDAO.where(predicate);
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'data',
      postSet: function(_, n) {
        this.data$find.then((o) => { if (o) this.parentChoice = o.parent });
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start(this.Cols)
          .start()
            .style({ 'flex': 1, 'margin-right': '16px' })
            .tag(this.RichChoiceView, {
              data$: this.parentChoice$,
              sections: [
                {
                  heading: this.INDUSTRIES,
                  dao: this.businessSectorDAO.where(this.EQ(this.BusinessSector.PARENT, 0))
                }
              ],
              search: true,
              searchPlaceholder: this.SEARCH,
              choosePlaceholder: this.PLACE_HOLDER
            })
          .end()

          .start()
            .style({ flex: 1 })
            .add(this.parentChoice$.map((id) => {
              return this.E()
                .tag(this.RichChoiceView, {
                  visibility: id != 0 ? 'RW' : 'DISABLED',
                  data$: this.data$,
                  sections: [
                    {
                      heading: this.SPECIFIC_INDUSTRIES,
                      dao: this.filteredDAO$proxy
                    }
                  ],
                  search: true,
                  searchPlaceholder: this.SEARCH,
                  choosePlaceholder: this.PLACE_HOLDER
                });
            }))
          .end()
        .end();
    }
  ]
})

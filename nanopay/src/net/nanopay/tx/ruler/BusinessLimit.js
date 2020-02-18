foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'BusinessLimit',
  extends: 'net.nanopay.tx.ruler.TransactionLimitRule',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.ruler.BusinessLimitPredicate',
    'static foam.mlang.MLang.*',
  ],

  sections: [
    {
      name: '_defaultSection',
      isAvailable: () => false
    }
  ],

  tableColumns: [
    'businessName',
    'description',
    'business',
    'enabled'
  ],

  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'priority',
      hidden: true,
      javaGetter: `
        return getPeriod().ordinal() * 10;
      `
    },
    {
      name: 'documentation',
      hidden: true
    },
    {
      name: 'ruleGroup',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'business',
      section: 'basicInfo',
      view: function(_, x) {
        return foam.u2.view.ChoiceView.create({
          dao: x.businessDAO,
          placeholder: '---- Please Select a Business ----',
          objToChoice: function(a) {
            return [a.id, a.businessName];
          }
        }, x);
      },
      tableHeaderFormatter: function() {
        this.add('Business ID');
      },
      tableWidth: 120,
      readVisibility: 'HIDDEN' // Show business name instead in read mode.
    },
    {
      class: 'String',
      name: 'businessName',
      label: 'Business',
      documentation: 'This property exists so we can display the business name in the table without doing a lookup for each row.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      section: 'basicInfo'
    },
    {
      name: 'predicate',
      javaGetter: `
        BusinessLimitPredicate blp = new BusinessLimitPredicate();
        blp.setBusiness(getBusiness());
        blp.setSend(getSend());
        return blp;
      `
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        super.validate(x);
        BusinessLimit old = (BusinessLimit) ((DAO) x.get("ruleDAO")).find(AND(
          EQ(BusinessLimit.BUSINESS, this.getBusiness()),
          EQ(BusinessLimit.PERIOD, this.getPeriod()),
          EQ(BusinessLimit.SEND, this.getSend())
        ));
        if ( old != null && getId() != old.getId() ) {
          throw new IllegalStateException("BusinessLimit for the business and period already exists. ");
        }
      `
    }
  ]
});

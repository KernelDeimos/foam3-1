foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'MerchantKYC',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(Business.class)), true),
          EQ(DOT(NEW_OBJ, Business.COMPLIANCE), ComplianceStatus.REQUESTED),
          OR(
            EQ(OLD_OBJ, null),
            NEQ(DOT(OLD_OBJ, Business.COMPLIANCE), ComplianceStatus.REQUESTED)
          )
        ).f(obj);
      `
    }
  ]
});

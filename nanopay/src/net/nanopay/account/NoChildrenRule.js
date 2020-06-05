foam.CLASS({
  package: 'net.nanopay.account',
  name: 'NoChildrenRule',

  documentation: `Validator that checks if account has any children which were not deleted.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.LifecycleState',
    'net.nanopay.account.Account',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( obj instanceof Account ) {
          Count count = new Count();
          Account account = (Account) obj;
          count = (Count) ((DAO) x.get("localAccountDAO"))
            .where(
              AND(
                EQ(Account.PARENT, account.getId()),
                EQ(Account.DELETED, false),
                OR(
                  // we don't want to included REJECTED or DELETED accounts
                  // TODO: on wiring cascade delete we will account for LifecycleState.PENDING
                  EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                  EQ(Account.LIFECYCLE_STATE, LifecycleState.PENDING)
                )
              )
            )
            .limit(1)
            .select(count);

          if ( count.getValue() > 0 ) {
            Logger logger = (Logger) x.get("logger");
            logger.log("Cannot delete account " + account.getId() + " as it has children account(s) or pending child accounts request(s)");
            throw new RuntimeException("Cannot delete this account as it has children account(s) or pending child account request(s)");
          }
        }
      `
    }
  ]
});

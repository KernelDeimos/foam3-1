foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquidityRule',

  documentation: `
    This rule triggers the liquidity service for CICO and Digital Transactions, on put or create in status completed.
    If the owners of the accounts in question are different, it will trigger liquidity on the Digital accounts involved.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.util.Frequency'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        if ( obj instanceof DigitalTransaction || obj instanceof CITransaction || obj instanceof COTransaction ) {
          Transaction txn = (Transaction) obj;
          LiquidityService ls = (LiquidityService) x.get("liquidityService");
          Account source = txn.findSourceAccount(x);
          Account destination = txn.findDestinationAccount(x);
          if ( ! SafetyUtil.equals(source.getOwner(), destination.getOwner()) {
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                if( source instanceof DigitalAccount )
                  ls.liquifyAccount(source.getId(), Frequency.PER_TRANSACTION, -txn.getAmount());
                if ( destination instanceof DigitalAccount )
                  ls.liquifyAccount(destination.getId(), Frequency.PER_TRANSACTION, txn.getAmount());
              }
            }
          }
        }
      `
    }
  ]
});

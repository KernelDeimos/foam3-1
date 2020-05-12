foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuote',

  documentation: `Select the best transactions and discard the remainder.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.Transfer',
    'java.util.ArrayList',

  ],

  properties: [
    {
      documentation: `Request quote on behalf of this transaction.`,
      name: 'requestTransaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      type: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plans',
      javaValue: 'new Transaction[] {}'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plan'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      networkTransient: true,
      documentation: 'helper property to be used during planning in order to avoid overuse of transaction.findSourceAccount'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      networkTransient: true,
      documentation: 'helper property to be used during planning in order to avoid overuse of transaction.findDestinationAccount'
    },
    {
      class: 'String',
      name: 'sourceUnit',
      networkTransient: true,
      documentation: 'helper property to be used during planning'
    },
    {
      class: 'String',
      name: 'destinationUnit',
      networkTransient: true,
      documentation: 'helper property to be used during planning'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.TransactionQuote',
      name: 'parent',
      networkTransient: true,
      documentation: 'helper property used during planning to keep track of parent quote when a planner spawns child quotes'
    },
    {
      name: 'myTransfers_',
      class: 'List',
      javaFactory: 'return new ArrayList<Transfer>();',
      networkTransient: true,
      documentation: 'helper property used by planners'
    },
    {
      name: 'alternatePlans_',
      class: 'List',
      javaFactory: 'return new ArrayList<Transaction>();',
      networkTransient: true,
      documentation: 'helper property used by planners'
    },
    {
      name: 'eligibleProviders',
      class: 'Map',
      javaFactory: `
        return new java.util.HashMap<String, Boolean>();
      `,
      networkTransient: true,
      documentation: 'helper property used by planners'
    },
    {
      name: 'corridorsEnabled',
      class: 'Boolean',
      value: false,
      networkTransient: true,
      documentation: 'helper property used by planners'
    },
  ],

  methods: [
    {
      name: 'addPlan',
      args: [
        {
          name: 'plan',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      Transaction[] plans = new Transaction[getPlans().length + 1];
      if ( getPlans().length != 0 ) {
        System.arraycopy(getPlans(), 0, plans, 0, getPlans().length);
        plans[getPlans().length] = plan;
        setPlans(plans);
      } else {
        setPlans(new Transaction[] { plan });
      }
      `
    },
    {
      name: 'addTransfer',
      documentation: 'helper function for adding transfers to the plan',
      args: [
        { name: 'account', type: 'Long' },
        { name: 'amount', type: 'Long' }
      ],
      javaCode: `
        Transfer t = new Transfer();
        t.setAccount(account);
        t.setAmount(amount);
        getMyTransfers_().add(t);
      `
    },
  ]
});

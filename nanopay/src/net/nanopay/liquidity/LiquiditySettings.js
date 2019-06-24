foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquiditySettings',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.analytics.Foldable'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],
  imports: [
    'liquiditySettingsDAO'
  ],

  //relationship: 1:* LiquiditySettings : DigitalAccount

  //ids: ['account'],

  plural: 'Liquidity Settings',

  css: `
  .foam-u2-view-RichChoiceView-container {
    z-index:1;
  }
  `,
  properties: [
    {
      class: 'Long',
      name: 'id',
      label: 'ID',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userToEmail',
      documentation: 'The user that is supposed to receive emails for this liquidity Setting'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'cashOutFrequency',
      factory: function() { return net.nanopay.util.Frequency.DAILY; },
      documentation: 'Determines how often an automatic cash out can occur.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.Liquidity',
      name: 'highLiquidity',
      factory: function() {
        return net.nanopay.liquidity.Liquidity.create({
          rebalancingEnabled: false,
          enabled: false,
        });
      },
      javaFactory: `
        net.nanopay.liquidity.Liquidity high = new net.nanopay.liquidity.Liquidity();
        high.setRebalancingEnabled(false);
        high.setEnabled(false);
        return high;
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.Liquidity',
      name: 'lowLiquidity',
      factory: function() {
        return net.nanopay.liquidity.Liquidity.create({
          rebalancingEnabled: false,
          enabled: false,
        });
      },
      javaFactory: `
        net.nanopay.liquidity.Liquidity low = new net.nanopay.liquidity.Liquidity();
        low.setRebalancingEnabled(false);
        low.setEnabled(false);
        return low;
      `,
    }
  ],
  methods: [
    {
      name: 'toSummary',
      documentation: `
        When using a reference to the accountDAO, the labels associated to it will show a chosen property
        rather than the first alphabetical string property. In this case, we are using the account name.
      `,
      code: function(x) {
        var self = this;
        return this.name;
      },
    },
    {
      name: 'doFolds',
      javaCode: `
fm.foldForState(getId()+":high", new java.util.Date(), getHighLiquidity().getThreshold());
fm.foldForState(getId()+":low", new java.util.Date(), getLowLiquidity().getThreshold());
      `
    }
  ]
});

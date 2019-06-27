foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts',
    'net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity',
    'net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposureDAO',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure',
    'net.nanopay.liquidity.ui.dashboard.recentTransactions.DashboardRecentTransactions',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposureDAO',
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.layout.Cards',
    'foam.u2.layout.Card',
    'foam.u2.layout.Rows',
  ],

  imports: [
    'accountBalanceWeeklyCandlestickDAO as accountBalancesOverTime',
    'liquidityThresholdWeeklyCandlestickDAO',
    'transactionDAO'
  ],

  exports: [
    'baseDenomination',
    'conversionService'
  ],

  css: `
    ^header {
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
      padding: 32px 0px 0px 32px;;
    }

    ^dashboard-container {
      padding: 32px;
    }

    ^dashboard-container .foam-u2-layout-Cards {
      margin-bottom: 32px;
    }
  `,

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'denominations',
      targetDAOKey: 'currencyDAO',
      value: 'CAD'
    },
    {
      class: 'String',
      name: 'baseDenomination',
      expression: function(denominations) {
        return denominations.alphabeticCode;
      }
    },
    {
      name: 'conversionService',
      hidden: true,
      value: {
        getRate: function(from, to) {
          return Promise.resolve(1);
        }
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'currencyExposureDAO',
      factory: function() {
        return this.CurrencyExposureDAO.create();
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'recentTransactionsDAO',
      view: { class: 'foam.comics.v2.DAOBrowserView' },
      documentation: `
        DAO for recent transactions in entire ecosystem
      `,
      expression: function(transactionDAO) {
        return transactionDAO;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
          .start().add(this.cls_.name).addClass(this.myClass('header')).end()
          .start(this.Rows).addClass(this.myClass('dashboard-container'))
            .start(this.Cards)
              .start(this.Card, { columns: 7 }).addClass(this.myClass('accounts'))
                .tag(this.DashboardAccounts, { 
                  currency$: this.currencyExposureDAO$,
                  denomination$: this.denominations$,
                })
              .end()
              .start(this.Card, { columns: 5 }).addClass(this.myClass('liquidity'))
                .tag(this.DashboardLiquidity)
              .end()
            .end()
            .start(this.Cards)
              .start(this.Card, { columns: 1 }).addClass(this.myClass('currency-exposure'))
                .tag(this.DashboardCurrencyExposure, { data: this.currencyExposureDAO })
              .end()
              .start(this.Card, { columns: 11 })
                .tag(this.DashboardCicoShadow)
              .end()
            .end()
            .start(this.Cards)
              .start(this.Card, { columns: 12 }).addClass(this.myClass('recent-transactions'))
                .tag(this.DashboardRecentTransactions, { data: this.recentTransactionsDAO })
              .end()
            .end()
          .end();
    }
  ]
});

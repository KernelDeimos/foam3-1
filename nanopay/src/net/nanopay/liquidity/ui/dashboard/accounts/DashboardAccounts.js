/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.accounts',
  name: 'DashboardAccounts',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'balanceDAO',
    'user'
  ],

  documentation: `
    A configurable view to to render a card with 
    configurable contents and rich choice view dropdowns
  `,

  css:`
    ^card-header-title {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }

    ^card-header-container {
      margin-bottom: 8px;
    }

    ^card-container {
      padding: 34px 16px;
    }

    ^balance-note {
      font-style: italic;
      font-size: 12px;
      line-height: 1.5;
      color: #5e6061;
    }

    ^balance {
      font-size: 20px;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 4px;
    }
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder',
    'foam.dao.ArraySink',
    'foam.mlang.sink.GroupBy',
    'net.nanopay.account.Account'
  ],
  exports: [
    'controllerMode'
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'ACCOUNTS',
    },
    {
      name: 'BALANCE_NOTE',
      message: 'Total value shown in home currency',
    },
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'currency'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'denomination',
    },
    {
      name: 'conversionService',
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(accountDAO, denomination, currency) {
          return self.E()
              .start(self.Rows).addClass(this.myClass('card-container'))
                .start().addClass(this.myClass('balance-card'))
                  .start(self.Rows)
                    .start(self.Cols).style({'align-items': 'center'}).addClass(this.myClass('card-header-container'))
                      .start().add(self.CARD_HEADER).addClass(this.myClass('card-header-title')).end()
                      .startContext({ data: this, controllerMode: self.ControllerMode.EDIT })
                        .tag(this.DENOMINATION)
                      .endContext()
                    .end()
                    .start().addClass(this.myClass('balance'))
                      .add(
                            currency.select().then(denomBalances => {
                              let baseTotal = 0;
                              denomBalances.array.forEach(denomBalance => {
                                baseTotal += denomBalance.total;
                              })
                              return self.__subSubContext__.currencyDAO.find(denomination).then(curr => baseTotal != null ?  curr.format(baseTotal) : 0);
                            })
                          )
                    .end()
                    .start().addClass(this.myClass('balance-note'))
                      .add(self.BALANCE_NOTE)
                      .add(` (${denomination})`)
                    .end()
                  .end()
                .end()
                .start()
                  .start(foam.comics.v2.DAOBrowserView, {
                    data: accountDAO.where(self.TRUE)
                  })
                    .addClass(this.myClass('accounts-table'))
                  .end()
                .end()
            .end();
        }));
    }
  ]
});

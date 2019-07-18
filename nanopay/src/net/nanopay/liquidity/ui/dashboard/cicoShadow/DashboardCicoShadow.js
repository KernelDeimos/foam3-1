foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.cicoShadow',
  name: 'DashboardCicoShadow',
  extends: 'foam.u2.Element',
  description: 'Displays a horizontal bar graph for the cash flow of shadow accounts',

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
  ^ {
    padding: 32px 16px;
  }

  ^ .property-account {
    display: inline-block;
  }

  ^ .property-timeFrame {
    display: inline-block;
  }

  ^card-header-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  ^ .foam-u2-tag-Select {
    margin-left: 16px;
  }

  ^chart {
    margin-top: 32px;
  }
`,

  requires: [
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.analytics.Candlestick',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'org.chartjs.HorizontalBarDAOChartView',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.u2.detail.SectionedDetailPropertyView',
    'net.nanopay.liquidity.ui.dashboard.cicoShadow.TransactionCICOType'
  ],

  exports: [
    'shadowAccountDAO'
  ],
  imports: [
    'accountDAO',
    'transactionDAO'
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'CASH IN / OUT OF SHADOW ACCOUNTS',
    }
  ],

  properties: [
    {
      class: 'Date',
      name: 'startDate',
      factory: function () {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return oneWeekAgo;
      }
    },
    {
      class: 'Date',
      name: 'endDate',
      factory: function () {
        return new Date();
      }
    },
    {
      class: 'Map',
      name: 'config',
      factory: function () {
        var self = this;
        return {
          type: 'horizontalBar',
          options: {
            legend: {
              display: false
            },
            elements: {
              rectangle: {
                borderWidth: 2,
              }
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    // convert to millions
                    callback: function (value, index, values) {
                      const dateArray = value.toLocaleDateString('en-US').split('/');
                      const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];
                      const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

                      switch (self.dateFrequency) {
                        case net.nanopay.liquidity.ui.dashboard.DateFrequency.MONTHLY:
                          return `${monthNames[Number.parseInt(dateArray[0] - 1)]} ${dateArray[2]}`

                        case net.nanopay.liquidity.ui.dashboard.DateFrequency.QUARTERLY:
                          return `${quarterNames[Number.parseInt(dateArray[0]) / 3 - 1]} ${dateArray[2]}`

                        case net.nanopay.liquidity.ui.dashboard.DateFrequency.ANNUALLY:
                          return dateArray[2];

                        default:
                          return value.toLocaleDateString('en-US');
                      }
                    }
                  }
                }
              ],
            }
          },
        };
      }
    },
    {
      class: 'Map',
      name: 'customDatasetStyling',
      documentation: `
        Property map that would hold the customization for each key type
        1. Key must equal the candlestick's key.
        2. Value mapped with key must be a 1:1 mapping defined in chartjs.org's documentation.
      `,
      factory: function(){
        return {
          CITransaction: {
            backgroundColor: '#b8e5b3'
          },
          COTransaction: {
            backgroundColor: '#f79393'
          }
        }
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      targetDAOKey: 'shadowAccountDAO',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'shadowAccountDAO',
      documentation: `
        A predicatedAccountDAO which only pulls shadow accounts
      `,
      expression: function () {
        return this.accountDAO.where(this.INSTANCE_OF(this.ShadowAccount));
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'cicoTransactionsDAO',
      documentation: `
      DAO for recent transactions in entire ecosystem
    `,
      expression: function (account, startDate, endDate) {
        return this.transactionDAO.where(
          this.AND(
            this.AND(
              this.GTE(net.nanopay.tx.model.Transaction.COMPLETION_DATE, startDate),
              this.LTE(net.nanopay.tx.model.Transaction.COMPLETION_DATE, endDate)
            ),
            this.EQ(this.Transaction.STATUS, this.TransactionStatus.COMPLETED),
            this.OR(
              this.AND(
                this.INSTANCE_OF(net.nanopay.tx.cico.CITransaction),
                this.EQ(this.Transaction.DESTINATION_ACCOUNT, account)
              ),
              this.AND(
                this.INSTANCE_OF(net.nanopay.tx.cico.COTransaction),
                this.EQ(this.Transaction.SOURCE_ACCOUNT, account)
              )
            )
          )
        );
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.ui.dashboard.DateFrequency',
      name: 'dateFrequency',
      value: 'WEEKLY'
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start(this.Cols)
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header-title')).end()
          .startContext({ data: this })
            .start(this.Cols).addClass(this.myClass('buttons'))
              .start().add(this.ACCOUNT).end()
              .start().add(this.DATE_FREQUENCY).end()
            .end()
          .endContext()
        .end()
        .add(this.slot(
          function(
            account, account$find, currencyDAO, config, 
            cicoTransactionsDAO, dateFrequency, customDatasetStyling
          ){
          return self.E()
            .start().style({ 'width': '1150px', 'height': '320px' }).addClass(self.myClass('chart'))
              .add(account ? account$find.then(a => currencyDAO.find(a.denomination).then(c => {
                var configAdded = config.clone();
                
                var xAxisConfigured =  [
                  {
                    ticks: {
                      callback: function (value, index, values) {
                        return c.format(value);
                      }
                    }
                  }
                ];
                
                configAdded.options.scales.xAxes = xAxisConfigured; 
              
                return self.E().add(self.HorizontalBarDAOChartView.create({
                    data$: cicoTransactionsDAO,
                    keyExpr: self.TransactionCICOType.create(),
                    config: configAdded,
                    xExpr: net.nanopay.tx.model.Transaction.AMOUNT,
                    yExpr$: dateFrequency.map(d => d.glang.clone().copyFrom({
                      delegate: net.nanopay.tx.model.Transaction.COMPLETION_DATE
                    })),
                    customDatasetStyling: customDatasetStyling,
                    width: 1100,
                    height: 320
                  })
                )
              }))
              : self.HorizontalBarDAOChartView.create({
                  data$: cicoTransactionsDAO,
                  keyExpr: self.TransactionCICOType.create(),
                  config: config,
                  xExpr: net.nanopay.tx.model.Transaction.AMOUNT,
                  yExpr$: dateFrequency.map(d => d.glang.clone().copyFrom({
                    delegate: net.nanopay.tx.model.Transaction.COMPLETION_DATE
                  })),
                  customDatasetStyling: customDatasetStyling,
                  width: 1100,
                  height: 320
                })
              )
            .end()
        }))
        .startContext({ data: this })
          .start(this.Cols).addClass(this.myClass('buttons'))
            .tag(this.SectionedDetailPropertyView, {
              data: this,
              prop: this.START_DATE
            })
            .tag(this.SectionedDetailPropertyView, {
              data: this,
              prop: this.END_DATE
            })
          .end()
        .endContext()
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.cicoShadow',
  name: 'TransactionCICOType',
  extends: 'foam.mlang.AbstractExpr',
  implements: ['foam.core.Serializable'],

  requires: [
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction'
  ],

  javaImports: [
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction'
  ],

  methods: [
    {
      name: 'f',
      code: function (obj) {
        return this.CITransaction.isInstance(obj) 
          ? 'CITransaction'
          : this.COTransaction.isInstance(obj) 
            ? 'COTransaction' 
            : 'Other';
      },
      javaCode: `
        return obj instanceof CITransaction 
          ? "CITransaction"
          : obj instanceof COTransaction 
            ? "COTransaction"
            : "Other";
      `
    }
  ]
});

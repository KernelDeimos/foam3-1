foam.CLASS({
  package: 'net.nanopay.ui.transfer',
  name: 'PlanSelectionWizard',
  extends: 'net.nanopay.ui.transfer.TransferView',

  documentation: 'Transaction plans selection',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.ui.transfer.TransferUserCard',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'foam.nanos.auth.User',
    'net.nanopay.tx.TransactionQuote'
  ],

  imports: [
    'currentAccount',
    'findBalance',
    'formatCurrency',
    'accountDAO as bankAccountDAO',
    'publicUserDAO',
    'balance',
    'user',
    'type',
    'transactionQuotePlanDAO',
    'quote',
    'addCommas'
  ],

  css: `
    ^ .foam-u2-tag-Select {
      width: 320px;
      height: 40px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding: 12px 20px;
      padding-right: 35px;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      background-color: white;
      outline: none;
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }

    ^ input[type='checkbox'] {
      display: inline-block;
      vertical-align: top;
      margin:0 ;
      border: solid 1px rgba(164, 179, 184, 0.75);
      cursor: pointer;
    }

    ^ input[type='checkbox']:checked {
      background-color: black;
    }

    ^ .confirmationLabel {
      display: inline-block;
      vertical-align: top;
      width: 80%;
      margin-left: 20px;
      font-size: 12px;
      cursor: pointer;
    }
    ^ .checkbox {
    margin-left: 20px;
  }
    ^ .checkbox > input {
      width: 14px;
      height: 14px;
      border-radius: 2px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
    }
    ^ .checkBox-Text{
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      display: inline-block;
      letter-spacing: 0.2px;
      margin-left: 20px;
      color: #093649;
      padding-bottom: 10px;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'checkedPlan',
      value: 0
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
          .start()
            .addClass('checkbox')
            .call(this.addCheckBoxes, [self])
          .end();
    },

    function addCheckBoxes(self) {
        var self2 = this;
        return this.call(function() {
          self.quote
          .then(function(q) {
           self.viewData.transaction = q.plans[0].transaction;
            for ( var i = 0; i < q.plans.length; ++i ) {
            if ( q.plans[i].transaction != undefined ) {

              let checkBox = foam.u2.md.CheckBox.create({ id: i, data: i === 0 });
              checkBox.data$.sub(function() {
                if ( checkBox.data ) {
                  self.checkedPlan = checkBox.id;
                  //self.viewData.transaction = q.plans[checkBox.id].transaction;
                }
              });

              self.checkedPlan$.sub(function() {
                checkBox.data = (checkBox.id === self.checkedPlan);
                self.viewData.transaction = q.plans[self.checkedPlan].transaction;
              });

              self2
              .tag(checkBox)
              .start('p')
                .addClass('confirmationLabel')
                .add('Estimated time of completion: ', self.formatTime(q.plans[i].etc))
                .br()
                .add('Expires: ', q.plans[i].expiry == null ? 'never' : self.formatTime(q.plans[i].expiry - Date.now()) )
                .br();
                if ( q.plans[i].transaction.transfers.length != 0 ) {
                  self2
                  .add('Additional transfers: ')
                  .br();
                  for ( k = 0; k< q.plans[i].transaction.transfers.length; k++ ) {
                    transfer = q.plans[i].transaction.transfers[k];
                    if ( transfer.account == self.currentAccount.id ) {
                      self2
                      .add(transfer.description, ' ', transfer.amount/100)
                      .br();
                    }
                  }
                }
                self2
                .add('Cost: $', self.addCommas(parseFloat(q.plans[i].cost/100).toFixed(2)))
                .br()
              .end();
            }
           }
          });
        });
    },

    function formatTime(time) {
      var days = time / 3600000 / 24;
      if ( days >= 1 ) {
        var parsedDays = parseInt(days);
        return parsedDays + ( parsedDays > 1 ?  ' days' : ' day' );
      }
      var hrs = time / 3600000;
      if ( hrs >= 1 ) {
        var parsedHrs = parseInt(hrs);
        return parsedHrs + ( parsedHrs > 1 ? ' hrs' : ' hr');
      }
      return 'instant';
    }
  ],
});

foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'InvoiceRateView',
  extends: 'foam.u2.View',

  documentation: `
    View related to paying or requesting money for an invoice. Display rate,
    account choice view on cross border payments.
    The view is capable of going into a read only state which is toggeable by the isReadOnly property.
    Pass transaction quote as property (quote) and bank account as (chosenBankAccount)
    to populate values on the views in read only. The view handles both payable and receivables
    to allow users to choose a bank account for paying invoices, using the isPayable view property.
  `,

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.ascendantfx.AscendantFXTransaction',
    'net.nanopay.fx.ascendantfx.AscendantFXUser',
    'net.nanopay.fx.client.ClientFXService',
    'net.nanopay.ui.LoadingSpinner',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.ui.modal.TandCModal',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountDAO',
    'appConfig',
    'fxService',
    'ascendantFXUserDAO',
    'bareUserDAO',
    'ctrl',
    'currencyDAO',
    'invoice',
    'invoiceDAO',
    'transactionQuotePlanDAO',
    'localTransactionQuotePlanDAO',
    'notify',
    'user',
    'viewData'
  ],

  javaImports: [
    'net.nanopay.fx.ascendantfx.AscendantFXServiceProvider'
  ],

  exports: [
    'quote'
  ],

  css: `
    ^ .inline {
      margin-right: 5px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin: 10px 0px;
    }
    ^ .exchange-amount-container{
      margin-top: 15px;
    }
    ^ .wizardBoldLabel {
      margin-bottom: 15px;
    }
    ^ .account-container {
      margin-top: 40px;
    }
    ^ .form-label {
      margin-bottom: 5px;
      font-weight: 500;
    }
    ^ .amount-container {
      margin-top: 20px;
    }
    ^ .net-nanopay-ui-LoadingSpinner img{
      width: 35px;
    }
    ^ .net-nanopay-ui-LoadingSpinner {
      width: 65px;
      position: relative;
      margin: auto;
      margin-bottom: 10px;
    }
    ^ .rate-msg-container {
      width: 110px;
      margin: auto;
    }
    ^ .loading-spinner-container {
      margin: 40px 0px;
    }
    ^label-value-row {
      margin-bottom: 5px;
    }
    ^large-margin-row {
      margin-bottom: 30px;
    }
    ^exchange-rate-text {
      color: #8e9090
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isPayable',
      documentation: 'Determines if invoice is a payable.',
      factory: function() {
        return this.invoice.payerId === this.user.id;
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.bank.BankAccount',
      name: 'accountChoice',
      documentation: 'Choice view for displaying and choosing user bank accounts.',
      factory: function() {
        return this.isPayable
          ? this.invoice.account
          : this.invoice.destinationAccount;
      },
      view: function(_, X) {
        var m = foam.mlang.ExpressionsSingleton.create();
        var BankAccount = net.nanopay.bank.BankAccount;
        var BankAccountStatus = net.nanopay.bank.BankAccountStatus;
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.bank.ui.BankAccountSelectionView' },
          rowView: { class: 'net.nanopay.bank.ui.BankAccountCitationView' },
          sections: [
            {
              heading: 'Your bank accounts',
              dao: X.accountDAO.where(
                m.AND(
                  m.EQ(BankAccount.OWNER, X.user.id),
                  m.EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
                )
              )
            }
          ]
        };
      }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    },
    {
      class: 'Boolean',
      name: 'isReadOnly',
      documentation: 'Used to make view read only.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'quote',
      documentation: `
        Stores the fetched transaction quote from transactionQuotePlanDAO.
        Pass a transaction quote as (quote) into view if setting isReadOnly.
        (This will populate values within the view)
      `,
      postSet: function(_, nu) {
        this.viewData.quote = nu;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'sourceCurrency',
      documentation: 'Stores the source currency for the exchange.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'chosenBankAccount',
      factory: function() {
        if ( this.viewData.bankAccount ) return this.viewData.bankAccount;
        return null;
      },
      documentation: `
        Stores the chosen bank account from accountChoice view.
        Pass a bankAccount as (chosenBankAccount) into view if setting isReadOnly.
        (This will populate values within the view)
      `
    },
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
    },
    {
      name: 'isFx',
      expression: function(chosenBankAccount, invoice$destinationCurrency) {
        return chosenBankAccount != null &&
          invoice$destinationCurrency !== chosenBankAccount.denomination;
      }
    },
    {
      name: 'showExchangeRateSection',
      expression: function(isPayable, isFx, loadingSpinner$isHidden) {
        return isPayable && loadingSpinner$isHidden && isFx;
      }
    },
    {
      name: 'isEmployee',
      expression: function(user) {
        return user.group.includes('.employee');
      }
    },
    {
      name: 'exchangeRateNotice',
      expression: function(isEmployee, isFx) {
        return isEmployee && isFx;
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Payment details' },
    { name: 'REVIEW_TITLE', message: 'Review this payment' },
    { name: 'REVIEW_RECEIVABLE_TITLE', message: 'Review this receivable' },
    { name: 'ACCOUNT_WITHDRAW_LABEL', message: 'Withdraw from' },
    { name: 'ACCOUNT_DEPOSIT_LABEL', message: 'Deposit to' },
    { name: 'AMOUNT_DUE_LABEL', message: 'Amount Due' },
    { name: 'EXCHANGE_RATE_LABEL', message: 'Exchange Rate' },
    { name: 'CONVERTED_AMOUNT_LABEL', message: 'Converted Amount' },
    { name: 'TRANSACTION_FEE_LABEL', message: 'Transaction Fees' },
    { name: 'AMOUNT_PAID_LABEL', message: 'Amount To Be Paid' },
    { name: 'AMOUNT_PAID_TO_LABEL', message: 'Amount Paid To You' },
    { name: 'CROSS_BORDER_PAYMENT_LABEL', message: 'Cross-border Payment' },
    { name: 'FETCHING_RATES', message: 'Fetching Rates...' },
    { name: 'LOADING', message: 'Getting quote...' },
    { name: 'TO', message: ' to ' },
    { name: 'ACCOUNT_FIND_ERROR', message: 'Error: Could not find account.' },
    { name: 'CURRENCY_FIND_ERROR', message: 'Error: Could not find currency.' },
    { name: 'RATE_FETCH_FAILURE', message: 'Error fetching rates: ' },
    { name: 'NOTICE_TITLE', message: '*NOTICE: EXCHANGE RATE SUBJECT TO CHANGE.' },
    { name: 'NOTICE_WARNING', message: 'The final exchange rate and resulting amount to be paid will be displayed to the approver.' }
  ],

  methods: [
    function init() {
      this.loadingSpinner.hide();

      // Fetch the rates every time we load because we need to make sure that
      // the quote and chosen account are available when rendering in read-only
      // mode in the approval flow.
      this.fetchRates();
    },
    function initE() {
      // Update the rates every time the selected account changes.
      this.accountChoice$.sub(this.fetchRates);

      // Format the amount & add the currency symbol
      if ( this.invoice.destinationCurrency !== undefined ) {
        this.currencyDAO.find(this.invoice.destinationCurrency)
          .then((currency) => {
          this.formattedAmount = currency.format(this.invoice.amount);
        });
      }

      this
        .start()
          .addClass(this.myClass())
          .start('h2')
            .add(! this.isReadOnly ? this.TITLE :
              this.isPayable ? this.REVIEW_TITLE :
              this.REVIEW_RECEIVABLE_TITLE)
          .end()
          .start().addClass(this.myClass('large-margin-row'))
            .start().addClass('inline').addClass('body-copy')
              .add(this.AMOUNT_DUE_LABEL)
            .end()
            .start().addClass('float-right').addClass('body-copy')
              .add(this.formattedAmount$)
              .add(` ${this.invoice.destinationCurrency}`)
            .end()
          .end()

          /** Account choice view with label, choice and advisory note. **/
          .start()
            .addClass('input-wrapper')
            .hide(this.isReadOnly)
            .start()
            .addClass('form-label')
              .add( this.isPayable ?
                this.ACCOUNT_WITHDRAW_LABEL :
                this.ACCOUNT_DEPOSIT_LABEL )
            .end()
            .startContext({ data: this })
              .start()
                .add(this.ACCOUNT_CHOICE)
              .end()
            .endContext()
          .end()
          /** Show chosen bank account from previous step. **/
          .start()
            .addClass(this.myClass('large-margin-row'))
            .show(this.isReadOnly)
            .start().addClass('inline')
              .add( this.isPayable ?
                this.ACCOUNT_WITHDRAW_LABEL :
                this.ACCOUNT_DEPOSIT_LABEL )
            .end()
            .start().addClass('float-right')
              .add(this.chosenBankAccount$.map((bankAccount) => {
                if ( ! bankAccount ) return;
                var accountNumber = bankAccount.accountNumber;
                return bankAccount.name + ' ****'
                  + accountNumber.substr(accountNumber.length - 5) +
                  ' - ' + bankAccount.denomination;
              }))
            .end()
          .end()
          //  loading spinner.
          .start().addClass('loading-spinner-container').hide(this.isReadOnly)
            .start().add(this.loadingSpinner).end()
            .start()
              .hide(this.loadingSpinner.isHidden$)
              .addClass('rate-msg-container')
              .add(this.isFx$.map((bool) => {
                return bool ? this.FETCHING_RATES : this.LOADING;
              }))
            .end()
          .end()

          /** Exchange rate details **/
        .add(this.slot(function(showExchangeRateSection) {
          return ! showExchangeRateSection ? null :
            this.E()
              .start().show(this.showExchangeRateSection$)
                .start().addClass('exchange-amount-container')
                  .start()
                    .addClass(this.myClass('label-value-row'))
                    .addClass(this.myClass('exchange-rate-text'))
                    .start()
                      .addClass('inline')
                      .add(this.EXCHANGE_RATE_LABEL)
                    .end()
                    .start()
                      .addClass('float-right')
                      .add(
                        this.quote$.dot('fxRate').map((rate) => {
                          if ( rate ) return 1;
                        }), ' ',
                        this.quote$.dot('destinationCurrency'),
                        this.quote$.dot('fxRate').map((rate) => {
                          if ( rate ) return this.TO + (1 / rate).toFixed(4);
                        }), ' ',
                        this.quote$.dot('sourceCurrency'),
                        this.exchangeRateNotice$.map((value) => value ? '*' : '')
                      )
                    .end()
                  .end()
                  .start()
                    .addClass(this.myClass('label-value-row'))
                    .start()
                      .addClass('inline')
                      .add(this.CONVERTED_AMOUNT_LABEL)
                    .end()
                    .start()
                      .addClass('float-right')
                      .add(
                        this.quote$.dot('amount').map((fxAmount) => {
                          if ( fxAmount ) {
                            return this.sourceCurrency.format(fxAmount);
                          }
                        }), ' ',
                        this.quote$.dot('sourceCurrency'),
                        this.exchangeRateNotice$.map((value) => value ? '*' : '')
                      )
                    .end()
                  .end()
                  .start().show(this.chosenBankAccount$)
                    .start()
                      .addClass('inline')
                      .add(this.TRANSACTION_FEE_LABEL)
                    .end()
                    .start()
                      .addClass('float-right')
                      .add(
                        this.quote$.dot('fxFees').dot('totalFees').map((fee) => {
                          return fee ?
                            this.sourceCurrency.format(fee) :
                            this.sourceCurrency.format(0);
                        }), ' ',
                        this.quote$.dot('fxFees').dot('totalFeesCurrency')
                      )
                    .end()
                  .end()
                .end()
              .end();
          }))
          // amount to be paid.
          .add(this.slot(function(quote, loadingSpinner$isHidden) {
            return ! quote || ! loadingSpinner$isHidden ? null :
            this.E().start().addClass('label-value-row').addClass('amount-container').show(this.loadingSpinner.isHidden$)
              .start().addClass('inline')
                .add(this.isPayable ? this.AMOUNT_PAID_LABEL : this.isReadOnly ? this.AMOUNT_PAID_TO_LABEL : '').addClass('bold-label')
              .end()
              .start().addClass('float-right').addClass('bold-label')
                .add(
                  this.quote$.dot('amount').map((amount) => {
                    if ( Number.isSafeInteger(amount) ) {
                      return this.sourceCurrency.format(amount);
                    }
                  }), ' ',
                  this.quote$.dot('sourceCurrency'),
                  this.exchangeRateNotice$.map((value) => value ? '*' : '')
                )
              .end()
            .end();
          }))
        .end()
        .start().show(this.exchangeRateNotice$)
          .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.NOTICE_WARNING, title: this.NOTICE_TITLE })
        .end();
    },

    async function getDomesticQuote() {
      this.viewData.isDomestic = true;
      var transaction = this.AbliiTransaction.create({
        sourceAccount: this.invoice.account,
        destinationAccount: this.invoice.destinationAccount,
        sourceCurrency: this.invoice.sourceCurrency,
        destinationCurrency: this.invoice.destinationCurrency,
        payerId: this.invoice.payerId,
        payeeId: this.invoice.payeeId,
        amount: this.invoice.amount
      });
      var quote = await this.transactionQuotePlanDAO.put(
        this.TransactionQuote.create({
          requestTransaction: transaction
        })
      );
      return quote.plan;
    },
    async function getFXQuote() {
      var transaction = this.AbliiTransaction.create({
        sourceAccount: this.invoice.account,
        destinationAccount: this.invoice.destinationAccount,
        sourceCurrency: this.invoice.sourceCurrency,
        destinationCurrency: this.invoice.destinationCurrency,
        payerId: this.invoice.payerId,
        payeeId: this.invoice.payeeId,
        destinationAmount: this.invoice.amount
      });

      var quote = await this.transactionQuotePlanDAO.put(
        this.TransactionQuote.create({
          requestTransaction: transaction
        })
      );
      return quote.plan;
    },

    function createFxTransaction(fxQuote) {
      var fees = this.FeesFields.create({
        totalFees: fxQuote.fee,
        totalFeesCurrency: fxQuote.feeCurrency
      });
      return this.AscendantFXTransaction.create({
        payerId: this.user.id,
        payeeId: this.invoice.payeeId,
        sourceAccount: this.invoice.account,
        destinationAccount: this.invoice.destinationAccount,
        amount: fxQuote.sourceAmount,
        destinationAmount: fxQuote.targetAmount,
        sourceCurrency: this.invoice.sourceCurrency,
        destinationCurrency: this.invoice.destinationCurrency,
        invoiceId: this.invoice.id,
        fxExpiry: fxQuote.expiryTime,
        fxQuoteId: fxQuote.id,
        fxRate: fxQuote.rate,
        fxFees: fees,
        invoiceId: this.invoice.id,
        isQuoted: true,
        paymentMethod: fxQuote.paymentMethod
      });
    },
  ],

  listeners: [
    async function fetchRates() {
      this.loadingSpinner.show();

      // If the user selects the placeholder option in the account dropdown,
      // clear the data.
      if ( ! this.accountChoice && ! this.isReadOnly ) {
        this.viewData.bankAccount = null;
        // Clean the default account choice view
        if ( this.isPayable ) {
          this.quote = null;
          this.viewData.quote = null;
        }
        this.loadingSpinner.hide();
        return;
      }

      // Fetch chosen bank account.
      try {
        this.chosenBankAccount = await this.accountDAO.find(this.accountChoice);
        this.viewData.bankAccount = this.chosenBankAccount;
      } catch (error) {
        this.notify(this.ACCOUNT_FIND_ERROR + '\n' + error.message, 'error');
      }

      if ( ! this.isPayable ) {
        this.loadingSpinner.hide();
        return;
      }

      // Set currency variables
      try {
        // get currency for the selected account
        if ( this.chosenBankAccount.denomination ) {
          this.sourceCurrency = await this.currencyDAO
            .find(this.chosenBankAccount.denomination);
        }
      } catch (error) {
        this.notify(this.CURRENCY_FIND_ERROR + '\n' + error.message, 'error');
        this.loadingSpinner.hide();
        return;
      }

      // Update fields on Invoice, based on User choice
      this.invoice.account = this.chosenBankAccount.id;
      this.invoice.sourceCurrency = this.chosenBankAccount.denomination;

      try {
        this.viewData.isDomestic = ! this.isFx;
        if ( ! this.isFx ) {
          this.quote = await this.getDomesticQuote();
        } else {
          this.quote = await this.getFXQuote();
        }
        this.viewData.quote = this.quote;
      } catch (error) {
        this.notify(this.RATE_FETCH_FAILURE + error.message, 'error');
      }

      this.loadingSpinner.hide();
    }
  ]
});

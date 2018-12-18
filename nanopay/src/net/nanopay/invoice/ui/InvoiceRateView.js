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
    ^ .foam-u2-view-RichChoiceView-selection-view {
      background: rgb(247, 247, 247, 1);
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
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Payment details' },
    { name: 'REVIEW_TITLE', message: 'Review this payment' },
    { name: 'REVIEW_RECEIVABLE_TITLE', message: 'Review this receivable' },
    { name: 'ACCOUNT_WITHDRAW_LABEL', message: 'Withdraw from' },
    { name: 'ACCOUNT_DEPOSIT_LABEL', message: 'Deposit to' },
    { name: 'CURRENCY_RATE_ADVISORY', message: 'Currency conversion fees will be applied.' },
    { name: 'AMOUNT_DUE_LABEL', message: 'Amount Due' },
    { name: 'EXCHANGE_RATE_LABEL', message: 'Exchange Rate' },
    { name: 'CONVERTED_AMOUNT_LABEL', message: 'Converted Amount' },
    { name: 'TRANSACTION_FEE_LABEL', message: 'Transaction Fees' },
    { name: 'AMOUNT_PAID_LABEL', message: 'Amount To Be Paid' },
    { name: 'AMOUNT_PAID_TO_LABEL', message: 'Amount Paid To You' },
    { name: 'CROSS_BORDER_PAYMENT_LABEL', message: 'Cross-border Payment' },
    { name: 'FETCHING_RATES', message: 'Fetching Rates...' },
    { name: 'LOADING', message: 'Getting quote...' },
    { name: 'TO', message: ' to ' }
  ],

  methods: [
    function init() {
      this.loadingSpinner.hide();
    },
    function initE() {
      this.accountChoice$.sub(this.fetchRates);
      this.accountChoice = this.viewData.bankAccount ?
          this.viewData.bankAccount.id : this.accountChoice;

      // Format the amount & add the currency symbol
      if ( this.invoice.destinationCurrency !== undefined ) {
        this.invoice.destinationCurrency$find.then((currency) => {
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

          .start().addClass('label-value-row')
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
              .add( this.isPayable ? this.ACCOUNT_WITHDRAW_LABEL : this.ACCOUNT_DEPOSIT_LABEL ).addClass('form-label')
            .end()
            .startContext({ data: this })
              .start()
                .add(this.ACCOUNT_CHOICE)
              .end()
            .endContext()
            .start()
              .add( this.isPayable ? this.CURRENCY_RATE_ADVISORY : null )
            .end()
          .end()
          /** Show chosen bank account from previous step. **/
          .start().addClass('label-value-row').show(this.isReadOnly)
            .start().addClass('inline')
              .add( this.isPayable ?
                this.ACCOUNT_WITHDRAW_LABEL :
                this.ACCOUNT_DEPOSIT_LABEL )
            .end()
            .start().addClass('float-right')
              .add(this.chosenBankAccount$.map((bankAccount) => {
                if ( ! bankAccount ) return;
                var accountNumber = bankAccount.accountNumber;
                return bankAccount.name + ' ****' + accountNumber.substr(accountNumber.length - 5) + ' - ' + bankAccount.denomination;
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
                  .start().addClass('label-value-row')
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
                        this.quote$.dot('sourceCurrency'),
                        this.quote$.dot('fxRate').map((rate) => {
                          if ( rate ) return this.TO + rate.toFixed(4);
                        }), ' ',
                        this.quote$.dot('destinationCurrency')
                      )
                    .end()
                  .end()
                  .start()
                    .addClass('label-value-row')
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
                        this.quote$.dot('sourceCurrency')
                      )
                    .end()
                  .end()
                  .start().show(this.chosenBankAccount$)
                    .addClass('label-value-row')
                    .start()
                      .addClass('inline')
                      .add(this.TRANSACTION_FEE_LABEL)
                    .end()
                    .start()
                      .addClass('float-right')
                      .add(
                        this.quote$.dot('fxFees').dot('totalFees').map((fee) => {
                          return fee ? this.sourceCurrency.format(fee) : '';
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
                  this.quote$.dot('sourceCurrency')
                )
              .end()
            .end();
          }))
        .end();
    },

    async function getDomesticQuote() {
      this.viewData.isDomestic = true;
      var transaction = this.AbliiTransaction.create({
        sourceAccount: this.invoice.account,
        // destinationAccount: this.invoice.destinationAccount,
        sourceCurrency: this.invoice.sourceCurrency,
        destinationCurrency: this.invoice.destinationCurrency,
        invoiceId: this.invoice.id,
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

    async function getFxQuote() {
      this.viewData.isDomestic = false;
      await this.getCreateAfxUser();
      var fxQuote = await this.fxService.getFXRate(
        this.invoice.sourceCurrency,
        this.invoice.destinationCurrency,
        0, this.invoice.amount, 'Buy',
        null, this.user.id, null);
      return this.createFxTransaction(fxQuote);
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
    // TODO: remove this function. No need for this.
    async function getCreateAfxUser() {
      // Check to see if user is registered with ascendant.
      var ascendantUser = await this.ascendantFXUserDAO
        .where(this.EQ(this.AscendantFXUser.USER, this.user.id)).select();
        ascendantUser = ascendantUser.array[0];

        // TODO: this should not be manual
          // Create ascendant user if none exists. Permit fetching ascendant rates.
        if ( ! ascendantUser ) {
          ascendantUser = this.AscendantFXUser.create({
            user: this.user.id,
            orgId: '5904960', // Manual for now. Will be automated on the ascendantFXUserDAO service in the future. Required for KYC on Ascendant.
            name: this.user.organization ? this.user.organization :
              this.user.label()
          });
          ascendantUser = await this.ascendantFXUserDAO.put(ascendantUser);
        }
    }
  ],

  listeners: [
    async function fetchRates() {
      this.loadingSpinner.show();
      // set quote as empty when select the placeholder
      if ( ! this.accountChoice ) {
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
        ctrl.add(this.NotificationMessage.create({
          message: `Internal Error: In Bank Choice, please try again in a few minutes. ${error.message}`, type: 'error'
        }));
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
        ctrl.add(this.NotificationMessage.create({
          message: `Internal Error: In finding Currencies. ${error.message}`, type: 'error'
        }));
        this.loadingSpinner.hide();
        return;
      }

      // Update fields on Invoice, based on User choice
      var isAccountChanged = this.invoice.account ? this.invoice.account !== this.chosenBankAccount.id : true;
      this.invoice.account = this.chosenBankAccount.id;
      this.invoice.sourceCurrency = this.chosenBankAccount.denomination;

      // first time doing a put on the invoice to get the invoice Id.
      if ( this.invoice.id <= 0 || isAccountChanged ) {
        try {
          this.invoice = await this.invoiceDAO.put(this.invoice);
        } catch (error) {
          ctrl.add(this.NotificationMessage.create({ message: `Internal Error: invoice update failed ${error.message}`, type: 'error' }));
          this.loadingSpinner.hide();
          return;
        }
      }

      if ( ! this.isFx ) {
        // Using the created transaction, put to transactionQuotePlanDAO and retrieve quote for transaction.
        try {
          this.quote = await this.getDomesticQuote();
        } catch (error) {
          ctrl.add(this.NotificationMessage.create({ message: `Error fetching rates ${error.message}`, type: 'error' }));
          this.loadingSpinner.hide();
          return;
        }
      } else {
        try {
          this.quote = await this.getFxQuote();
        } catch (error) {
          ctrl.add(this.NotificationMessage.create({ message: `Error fetching rates ${error.message}`, type: 'error' }));
          this.loadingSpinner.hide();
          return;
        }
      }
      this.loadingSpinner.hide();
    }
  ]
});

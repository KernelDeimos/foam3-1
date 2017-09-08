foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferAmount',
  extends: 'net.nanopay.interac.ui.etransfer.TransferView',

  documentation: 'Transfer amount details',

  imports: [
    'exchangeRate'
  ],

  requires: [
    'net.nanopay.interac.ui.shared.LoadingSpinner'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .transferRateContainer {
          position: relative;
          width: 100%;
          margin-bottom: 30px;
        }

        ^ .currencyContainer {
          box-sizing: border-box;
          width: 320px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          margin-bottom: 13px;
        }

        ^ .currencyDenominationContainer {
          display: inline-block;
          width: 85px;
          height: 100%;
          padding: 8px;
          box-sizing: border-box;
        }

        ^ .currencyFlag {
          display: inline-block;
          width: 24px;
          height: 14px;
          margin: 4px 0;
        }

        ^ .currencyName {
          display: inline-block;
          font-size: 12px;
          letter-spacing: 0.2px;
          color: #093649;

          vertical-align: top;
          margin: 5px 0;
          margin-left: 15px;
        }

        ^ .currencyContainer:last-child {
          margin-bottom: 0;
        }

        ^ .rateLabel {
          line-height: 20px;
          height: 20px;
        }

        ^ .rateLabelMargin {
          margin-left: 100px;
          margin-bottom: 13px;
        }

        ^ .rateDivider {
          position: absolute;
          width: 2px;
          height: 100%;
          background-color: #a4b3b8;
          opacity: 0.3;
          top: 0;
          left: 86px;
        }

        ^ .property-fromAmount,
          .property-toAmount {
          display: inline-block;
          box-sizing: border-box;
          vertical-align: top;
          margin-left: 2px;
          width: 231px;
          height: 38px;
          padding: 0 20px;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          border: none;
          outline: none;
        }

        ^ .property-fromAmount:focus,
          .property-toAmount:focus {
          border: solid 1px #59A5D5;
          padding: 0 19px;
        }

        ^ input[type=number]::-webkit-inner-spin-button,
        ^ input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        ^ .net-nanopay-interac-ui-shared-LoadingSpinner {
          margin-left: 100px;
          margin-bottom: 13px;
        }
      */}
    })
  ],

  messages: [
    { name: 'AmountError', message: 'Amount needs to be greater than $0.00' },
    { name: 'SendingFeeLabel', message: 'Sending Fee:' },
    { name: 'ReceivingFeeLabel', message: 'Receiving Fee:' },
    { name: 'TotalLabel', message: 'Total Amount:' },
    { name: 'EstimatedDeliveryLabel', message: 'Estimated Delivery Date:' },
    { name: 'FromLabel', message: 'From' },
    { name: 'ToLabel', message: 'To' },
    { name: 'InvoiceNoLabel', message: 'Invoice No.' },
    { name: 'PONoLabel', message: 'PO No.' },
    { name: 'PDFLabel', message: 'View Invoice PDF' }
  ],

  properties: [
    {
      class: 'Double',
      name: 'fees',
      factory: function() {
        this.viewData.fees = 1.5; // TODO: Make this dynamic eventually
        return 1.5;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.fees = newValue;
      }
    },
    {
      // TODO: Pull FX rate from somewhere
      class: 'Double',
      name: 'rate',
      postSet: function(oldValue, newValue) {
        // TODO: enable input
        this.viewData.rate = newValue;
        // NOTE: This is a one way conversion. It is very lossy on certain fx rates.
        if ( newValue ) this.toAmount = (this.fromAmount - this.fees) * newValue;
      },
      validateObj: function(rate) {
        if ( ! rate ) {
          return 'Rate expired';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'feedback_',
      value: false
    },
    {
      class: 'Double',
      name: 'fromAmount',
      value: 1.5,
      min: 1.5,
      precision: 2,
      view: 'net.nanopay.interac.ui.shared.FixedFloatView',
      preSet: function(oldValue, newValue) {
        // TODO: Use mode of the view later on.
        if ( this.invoice ) return this.invoice.amount + this.fees;
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.fromAmount = newValue;

        if ( this.feedback ) return;
        this.feedback = true;
        this.toAmount = (newValue - this.fees) * this.rate;
        this.feedback = false;
      },
      validateObj: function(fromAmount) {
        if ( fromAmount <= this.fees ) {
          return this.AmountError;
        }
      }
    },
    {
      class: 'Double',
      name: 'toAmount',
      min: 0,
      value: 0,
      precision: 2,
      view: 'net.nanopay.interac.ui.shared.FixedFloatView',
      postSet: function(oldValue, newValue) {
        this.viewData.toAmount = newValue;

        if ( this.feedback ) return;
        this.feedback = true;
        this.fromAmount = (newValue / this.rate) + this.fees;
        this.feedback = false;
      },
      validateObj: function(toAmount) {
        if ( toAmount <= 0 ) {
          return this.AmountError;
        }
      }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      // TODO: Get FX Rate
      this.countdownView.onExpiry = function() {
        self.refreshRate();
      };

      // TODO: Get FX Rate
      if ( ! this.viewData.rateLocked ) {
        this.refreshRate();
      } else {
        this.loadingSpinner.hide();
      }

      // NOTE: This order is important. If we pull rate first, it will break
      //       the fromAmount value
      if ( this.viewData.fromAmount ) {
        this.fromAmount = this.viewData.fromAmount;
      }

      if ( this.viewData.rate ) {
        this.rate = this.viewData.rate;
      }
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('div').addClass('transferRateContainer')
            .start('div').addClass('currencyContainer')
              // TODO: Get currency & total
              .start('div').addClass('currencyDenominationContainer')
                .start({class: 'foam.u2.tag.Image', data: 'images/canada.svg'}).addClass('currencyFlag').end()
                .start('p').addClass('currencyName').add('CAD').end() // TODO: Make it dyamic.
              .end()
              .start(this.FROM_AMOUNT, {onKey: true, mode: this.invoice ? foam.u2.DisplayMode.RO : undefined})
                .attrs({
                  step: 0.01,
                  onchange: '(function(el){ el.value ? el.value=parseFloat(el.value).toFixed(2) : el.value = (0).toFixed(2); })(this)'
                })
              .end()
            .end()
            .start('p').addClass('pDetails').addClass('rateLabel').addClass('rateLabelMargin')
              // TODO: Get Fees rates
              .add('Fees: CAD ', this.fees.toFixed(2) , ' (included)')
            .end()
            .start('p').addClass('pDetails').addClass('rateLabel').addClass('rateLabelMargin').enableClass('hidden', this.loadingSpinner.isHidden$, true)
              // TODO: Get FX rates
              .add('Rate: ', this.rate$)
            .end()
            .add(this.loadingSpinner)
            .start('div').addClass('currencyContainer')
              // TODO: Get currency & total
              .start('div').addClass('currencyDenominationContainer')
                .start({class: 'foam.u2.tag.Image', data: 'images/india.svg'}).addClass('currencyFlag').end()
                .start('p').addClass('currencyName').add('INR').end() // TODO: Make it dyamic.
              .end()
              .start(this.TO_AMOUNT, {onKey: true, mode: this.invoice ? foam.u2.DisplayMode.RO : undefined})
                .attrs({
                  step: 0.01,
                  onchange: '(function(el){ el.value ? el.value=parseFloat(el.value).toFixed(2) : el.value = (0).toFixed(2); })(this)'
                })
              .end()
            .end()
            .start('div').addClass('rateDivider').end()
          .end()
          .start('div').addClass('pricingCol')
            .start('p').addClass('pPricing').add(this.EstimatedDeliveryLabel).end()
          .end()
          .start('div').addClass('pricingCol')
            .start('p').addClass('pPricing').add('Near Real Time (IMPS)').end()
          .end()
        .end()
        .start('div').addClass('divider').end()
        .start('div').addClass('fromToCol')
          .start('div').addClass('invoiceDetailContainer').enableClass('hidden', this.invoice$, true)
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.InvoiceNoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.invoiceNumber).end()
            .br()
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.PONoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.purchaseOrder).end()
          .end()
          .start('a').addClass('invoiceLink').enableClass('hidden', this.invoice$, true)
            .attrs({href: this.viewData.invoiceFileUrl})
            .add(this.PDFLabel)
          .end()
          // TODO: Make card based on from and to information
          .start('p').add(this.FromLabel).addClass('bold').end()

          .tag({ class: 'net.nanopay.interac.ui.shared.TransferUserCard', user: this.fromUser })

          .start('p').add(this.ToLabel).addClass('bold').end()

          .tag({ class: 'net.nanopay.interac.ui.shared.TransferUserCard', user: this.viewData.payee })

        .end();
    },

    function refreshRate() {
      var self = this;
      this.rate = 0;
      this.loadingSpinner.show();
      this.countdownView.hide();
      this.countdownView.reset();
      this.viewData.rateLocked = false;

      // NOTE: fxRate returns too quickly. Added .5 second delay.
      setTimeout(function(){
        self.exchangeRate.getRate('CAD', 'INR', 100).then(function(response){
          self.rate = response.toAmount;
          self.loadingSpinner.hide();
          self.startTimer();
          self.viewData.rateLocked = true;
        });
      }, 500);
    },

    function startTimer() {
      this.countdownView.show();
      this.countdownView.start();
    }
  ]
});

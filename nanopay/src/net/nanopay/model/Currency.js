foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Currency',

  documentation: `The base model for storing, using and managing currency information. 
    All class properties require a return of *true* in order to pass.`,

  ids: [
    'alphabeticCode'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
    'name',
    'alphabeticCode',
    'country',
    'symbol'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: `This is the [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html) 
        international standard for currency codes.`,
      required: true
    },
    {
      class: 'String',
      name: 'alphabeticCode',
      label: 'Code',
      documentation: 'The alphabetic code associated with a type of currency.',
      required: true
    },
    {
      class: 'Long',
      name: 'numericCode',
      documentation: 'The numeric code associated with a type of currency.',
      required: true
    },
    {
      class: 'Int',
      name: 'precision',
      documentation: 'Defines the number of digits that come after the decimal point. ',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      documentation: `The name of the country associated with the currency. 
        This should be set by the child class.`,
      name: 'country',
      required: true
    },
    {
      class: 'String',
      name: 'delimiter',
      documentation: 'The character used to delimit groups of 3 digits.',
      required: true
    },
    {
      class: 'String',
      name: 'decimalCharacter',
      documentation: 'The character used as a decimal.',
      required: true
    },
    {
      class: 'String',
      name: 'symbol',
      documentation: 'The symbol used for the type of currency. Eg: $ for CAD.',
      required: true
    },
    {
      class: 'String',
      name: 'leftOrRight',
      documentation: `The side of the digits that the symbol should be displayed on.`,
      required: true,
      validateObj: function(value) {
        if ( value !== 'left' && value !== 'right' ) return `Property 'leftOrRight' must be set to either "left" or "right".`;
      }
    },
    {
      class: 'String',
      name: 'flagImage',
      documentation: `The flag image used in relation to currencies from countries currently
        supported by the platform.`,
    },
    {
      class: 'String',
      name: 'flagEmoji',
      documentation: `
        The flag emoji used in relation to currencies from countries 
        currently supported by the platform
      `
    },
    {
      class: 'Boolean',
      name: 'showSpace',
      documentation: `Determines whether there is a space between the symbol and 
        the number when the currency is displayed.
      `,
      required: true
    }
  ],

  methods: [
    {
      name: 'toSummary',
      documentation: `When using a reference to the currencyDAO, the labels associated 
        to it will show a chosen property rather than the first alphabetical string 
        property. In this case, we are using the alphabeticCode.
      `,
      code: function(x) {
        var self = this;
        return this.alphabeticCode;
      }
    },
    {
      name: 'format',
      code: function(amount) {
        /**
         * Given a number, display it as a currency using the appropriate
         * precision, decimal character, delimiter, symbol, and placement
         * thereof.
         */
        var isNegative = amount < 0;
        amount = amount.toString();
        if ( isNegative ) amount = amount.substring(1);
        while ( amount.length < this.precision ) amount = '0' + amount;
        var beforeDecimal = amount.substring(0, amount.length - this.precision);
        var formatted = isNegative ? '-' : '';
        if ( this.leftOrRight === 'left' ) {
          formatted += this.symbol;
          if ( this.showSpace ) formatted += ' ';
        }
        formatted += beforeDecimal.replace(/\B(?=(\d{3})+(?!\d))/g, this.delimiter) || '0';
        if ( this.precision > 0 ) {
          formatted += this.decimalCharacter;
          formatted += amount.substring(amount.length - this.precision);
        }
        if ( this.leftOrRight === 'right' ) {
          if ( this.showSpace ) formatted += ' ';
          formatted += this.symbol;
        }
        return formatted;
      },
      args: [
        {
          class: 'foam.core.Currency',
          name: 'amount'
        }
      ],
      type: 'String',
      javaCode: `
        Boolean isNegative = amount < 0;
        String amountStr = Long.toString(amount);
        if ( isNegative ) amountStr = amountStr.substring(1);
        while ( amountStr.length() < this.getPrecision() ) {
          amountStr = "0" + amountStr;
        }
        String beforeDecimal = amountStr.substring(0, amountStr.length() - this.getPrecision());
        String formatted = isNegative ? "-" : "";
        if ( SafetyUtil.equals(this.getLeftOrRight(), "left") ) {
          formatted += this.getSymbol();
          if ( this.getShowSpace() ) {
            formatted += " ";
          }
        }
        formatted += beforeDecimal.length() > 0 ?
          beforeDecimal.replaceAll("\\\\B(?=(\\\\d{3})+(?!\\\\d))", this.getDelimiter()) :
          "0";
        if ( this.getPrecision() > 0 ) {
          formatted += this.getDecimalCharacter();
          formatted += amountStr.substring(amountStr.length() - this.getPrecision());
        }
        if ( SafetyUtil.equals(this.getLeftOrRight(), "right") ) {
          if ( this.getShowSpace() ) {
            formatted += " ";
          }
          formatted += this.getSymbol();
        }
        return formatted;
      `
    }
  ]
});

/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for creating and managing all bank accounts.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.Currency',
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.Address',
    'foam.nanos.iban.ValidationIBAN',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.Popup',

    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.payment.PaymentProviderCorridor',
    'net.nanopay.sme.ui.SMEModal'
  ],

  imports: [
    'branchDAO',
    'capabilityDAO',
    'countryDAO',
    'institutionDAO',
    'paymentProviderCorridorDAO'
  ],

  javaImports: [
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.util.regex.Pattern',
    'net.nanopay.account.Account',
    'static foam.mlang.MLang.*'
  ],

  tableColumns: [
    'name',
    'summary',
    'flagImage',
    'balance',
    'homeBalance'
  ],

  // relationships: branch (Branch)
  constants: [
    {
      name: 'ACCOUNT_NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    },
    {
      name: 'SWIFT_CODE_PATTERN',
      type: 'Regex',
      factory: function() { return /^[A-z0-9a-z]{8,11}$/; }
    }
  ],

  sections: [
    {
      name: 'pad',
      permissionRequired: true,
      isAvailable: function(forContact) {
        return ! forContact;
      }
    },
    {
      name: 'complianceInformation',
      permissionRequired: true
    }
  ],

  messages: [
    { name: 'BANK_ACCOUNT_LABEL', message: 'Bank Account' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required' },
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number invalid' },
    { name: 'NICKNAME_REQUIRED', message: 'Nickname required' },
    { name: 'INSTITUTION_NUMBER_REQUIRED', message: 'Institution number required' },
    { name: 'INSTITUTION_NUMBER_INVALID', message: 'Institution number invalid' },
    { name: 'CHECK_DIGIT_REQUIRED', message: 'Check digit required' },
    { name: 'CHECK_DIGIT_INVALID', message: 'Check digit invalid' },
    { name: 'BRANCH_ID_REQUIRED', message: 'Branch id required' },
    { name: 'BRANCH_ID_INVALID', message: 'Branch id invalid' },
    { name: 'SWIFT_CODE_REQUIRED', message: 'SWIFT/BIC code required' },
    { name: 'SWIFT_CODE_INVALID', message: 'SWIFT/BIC code invalid' },
    { name: 'IBAN_REQUIRED', message: 'IBAN required' },
    { name: 'IBAN_INVALID', message: 'IBAN invalid' },
    { name: 'IBAN_INVALIDATION_FAILED', message: 'IBAN validation failed' },
    { name: 'IBAN_COUNTRY_MISMATCHED', message: 'IBAN country code mismatched' },
    { name: 'AVAILABLE_CURRENCIES_MSG', message: 'Available Currencies' },
    { name: 'DELETE_DEFAULT', message: 'Unable to delete default accounts. Please select a new default account if one exists.' },
    { name: 'UNABLE_TO_DELETE', message: 'Error deleting account: ' },
    { name: 'SUCCESSFULLY_DELETED', message: 'Bank account deleted' },
    { name: 'IS_DEFAULT', message: 'is now your default bank account. Funds will be automatically transferred to and from this account.' },
    { name: 'UNABLE_TO_DEFAULT', message: 'Unable to set non verified bank accounts as default' },
    { name: 'STATUS_ACTIVE', message: 'Active' },
    { name: 'STATUS_PENDING', message: 'Pending' },
    { name: 'STATUS_DISABLED', message: 'Disabled' }
  ],

  css: `
    .bank-account-popup .net-nanopay-sme-ui-SMEModal-inner {
      width: 515px;
      height: 500px;
    }
    .bank-account-popup .net-nanopay-sme-ui-SMEModal-content {
      overflow: scroll !important;
      padding: 30px;
    }
    .bank-account-detail-popup .net-nanopay-sme-ui-SMEModal-inner {
      max-height: 100vh;
      overflow: scroll;
    }
  `,

  properties: [
    {
      name: 'id',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'accountNumber',
      documentation: 'The account number of the bank account.',
      updateVisibility: 'RO',
      section: 'accountInformation',
      view: {
          class: 'foam.u2.view.StringView'
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str) {
        if ( ! str ) return;
        var displayAccountNumber = '***' + str.substring(str.length - 4, str.length);
        this.start()
          .add(displayAccountNumber);
        this.tooltip = displayAccountNumber;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'summary',
      updateVisibility: 'RO',
      networkTransient: false,
      tableCellFormatter: function(_, obj) {
        this.start()
        .start()
          .add(obj.slot((accountNumber) => {
              if ( accountNumber ) {
                return this.E()
                  .start('span').style({ 'font-weight' : '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('accountNumber').label} `).end()
                  .start('span').add(`*** ${accountNumber.substring(accountNumber.length - 4, accountNumber.length)}`).end();
              }
          }))
        .end();
      },
      javaFactory: `
        return "***" + getAccountNumber().substring(Math.max(getAccountNumber().length() - 4, 0));
      `
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.bank.BankAccountStatus',
      name: 'status',
      documentation: 'Tracks the status of the bank account.',
      tableWidth: 82,
      section: 'operationsInformation',
      writePermissionRequired: true,
      tableCellFormatter: function(a) {
        var backgroundColour = 'transparent';
        var colour = '#545d87';
        var label = a.label;
        switch ( a ) {
          case net.nanopay.bank.BankAccountStatus.VERIFIED :
            colour = '#2cab70';
            backgroundColour = colour;
            label = net.nanopay.bank.BankAccount.STATUS_ACTIVE;
            break;
          case net.nanopay.bank.BankAccountStatus.DISABLED :
            colour = '#f91c1c';
            backgroundColour = colour;
            label = net.nanopay.bank.BankAccount.STATUS_DISABLED;
            break;
          case net.nanopay.bank.BankAccountStatus.UNVERIFIED :
            label = net.nanopay.bank.BankAccount.STATUS_PENDING;
            break;
        }
        this.start()
          .start()
            .style({
              'display': 'inline-block',
              'vertical-align': 'middle',
              'box-sizing': 'border-box',
              'width': '6px',
              'height': '6px',
              'margin-right': '6px',
              'background-color': backgroundColour,
              'border': '1px solid',
              'border-color': colour,
              'border-radius': '6px'
            })
          .end()
          .start()
            .style({
              'display': 'inline-block',
              'vertical-align': 'middle',
              'font-size': '11px',
              'color': colour,
              'text-transform': 'capitalize',
              'line-height': '11px'
            })
            .add(label)
          .end()
        .end();
      }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      section: 'accountInformation',
      documentation: `International bank code that identifies banks worldwide. BIC/SWIFT`,
      updateVisibility: 'RO',
      storageTransient: true
    },
    {
      class: 'String',
      name: 'branchId',
      section: 'accountInformation',
      storageTransient: true
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      documentation:`A small financial sum deposited into a bank account to test
        onboarding onto our system.`,
      section: 'operationsInformation',
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      documentation: `Defines the number of times it is attempted to verify
        ownership of the bank account.`,
      value: 0,
      section: 'operationsInformation',
      writePermissionRequired: true
    },
    {
      class: 'DateTime',
      name: 'microVerificationTimestamp',
      documentation: 'The date and time of when ownership of the bank account is verified.',
      section: 'operationsInformation'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: `The name of the country associated with the bank account.
        This should be set by the child class.
      `,
      section: 'accountInformation',
      visibility: 'RO',
      view: {
        class: 'foam.u2.view.ReferencePropertyView',
        readView: { class: 'foam.u2.view.StringView' }
      }
    },
    {
      class: 'URL',
      name: 'flagImage',
      label: 'Country', // To set table column heading
      documentation: `A URL link to an image of the country's flag. Used for
        display purposes. This should be set by the child class.
      `,
      tableWidth: 91,
      section: 'accountInformation',
      visibility: 'RO',
      view: function(_, X) {
        return {
          class: 'foam.u2.tag.Image',
          displayWidth: '44px',
          displayHeight: '30px'
        };
      },
      tableCellFormatter: function(value, obj, axiom) {
        this.start('img').attr('src', value).end();
      }
    },
    {
      class: 'String',
      name: 'integrationId',
      documentation:`A unique identifier for a bank account within the
        client's accounting software.`,
      section: 'systemInformation'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      section: 'ownerInformation',
      documentation: `User pad authorization address.`,
      // section: 'pad',
      // Note: To be removed
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'bankAddress',
      section: 'accountInformation',
      visibility: 'HIDDEN',
      documentation: `Returns the bank account address from the Address model.`,
      // section: 'pad',
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'availableCurrencies',
      documentation: `Contains list of available currencies to receive or send in selected account country`,
      visibility: 'HIDDEN',
      section: 'accountInformation',
      expression: function(user, currencyDAO, forContact) {
        let propInfo = forContact ? this.PaymentProviderCorridor.TARGET_COUNTRY : this.PaymentProviderCorridor.SOURCE_COUNTRY;
        let propInfoCurrency = forContact ? this.PaymentProviderCorridor.TARGET_CURRENCIES : this.PaymentProviderCorridor.SOURCE_CURRENCIES;
        return this.PromisedDAO.create({
          of: 'foam.core.Currency',
          promise: this.paymentProviderCorridorDAO.where(this.AND(
              this.EQ(propInfo, this.country),
              this.INSTANCE_OF(this.PaymentProviderCorridor)
            ))
            .select(this.MAP(propInfoCurrency))
            .then((sink) => {
              let currencies = sink.delegate.array ? sink.delegate.array : [];
              currencies.push(this.denomination);
              return currencyDAO.where(
                this.IN(this.Currency.ID, currencies.flat())
              );
            })
        });
      }
    },
    {
      class: 'Boolean',
      name: 'forContact',
      section: 'ownerInformation',
      documentation: `Flag for whether bank account is owned by a contact.
          Required for visibility property expressions.`
    },
    {
      name: 'denomination',
      label: 'Currency',
      updateVisibility: 'RO',
      writePermissionRequired: false,
      gridColumns: 12,
      section: 'accountInformation',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: { class: 'foam.u2.view.ReferenceView' },
          writeView: {
            class: 'foam.u2.view.RichChoiceView',
            data$: X.data.denomination$,
            sections: [
              {
                heading: X.data.AVAILABLE_CURRENCIES_MSG,
                dao$: X.data.availableCurrencies$
              }
            ]
          }
        };
      }
    },
    {
      name: 'name',
      label: 'Nickname',
      section: 'accountInformation',
      order: 4,
      tableWidth: 168,
      validateObj: function(name) {
        if ( name === '' || ! name ) {
          return this.NICKNAME_REQUIRED;
        }
      }
    },
    {
      class: 'String',
      name: 'swiftCode',
      label: 'SWIFT/BIC',
      updateVisibility: 'RO',
      section: 'accountInformation',
      validateObj: function(swiftCode, iban) {
        if ( iban )
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ! iban || (iban && ibanMsg != 'passed') ) {
          if ( ! swiftCode || swiftCode === '' ) {
            return this.SWIFT_CODE_REQUIRED;
          } else if ( ! this.SWIFT_CODE_PATTERN.test(swiftCode) ) {
            return this.SWIFT_CODE_INVALID;
          }
        }
      }
    },
    {
      class: 'String',
      name: 'iban',
      label: 'International Bank Account Number (IBAN)',
      updateVisibility: 'RO',
      section: 'accountInformation',
      documentation: `Standard international numbering system developed to
          identify a bank account.`,
      validateObj: function(iban, swiftCode, country) {
        if ( ! iban )
          return this.IBAN_REQUIRED;

        if ( iban && country !== iban.substring(0, 2) )
          return this.IBAN_COUNTRY_MISMATCHED;

        var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ibanMsg && ibanMsg != 'passed')
          return ibanMsg;
      }
    },
    {
      class: 'String',
      name: 'verifiedBy',
      section: 'operationsInformation'
    },
    {
      class: 'String',
      name: 'ownerType',
      flags: ['js'],
      tableCellFormatter: function(_, obj) {
        obj.owner$find.then((user) => {
          this.add(user.cls_.name);
        });
      },
      visibility: 'HIDDEN'
    }
  ],

  actions: [
    {
      name: 'verifyAccount',
      isAvailable: function() {
        return this.cls_.id == this.CABankAccount.id;
      },
      isEnabled: function() {
        return this.status === this.BankAccountStatus.UNVERIFIED;
      },
      code: function(X) {
        this.ctrl.add(this.Popup.create().tag({
          class: 'net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm',
          bank: this
        }));
      }
    },
    {
      name: 'edit',
      isAvailable: function() {
        return ! this.verifiedBy
      },
      code: async function(X) {
        var self = this.__subContext__;
        var account = await self.accountDAO.find(this.id);
        self.ctrl.add(this.SMEModal.create().addClass('bank-account-popup')
          .startContext({ controllerMode: this.ControllerMode.EDIT })
            .tag({
              class: 'net.nanopay.account.ui.BankAccountWizard',
              data: account,
              useSections: ['accountInformation', 'pad']
            })
          .endContext()
          );
      }
    },
    {
      name: 'setAsDefault',
      isEnabled: function() {
        return ! this.isDefault
      },
      code: function(X) {
        this.isDefault = true;
        this.subject.user.accounts.put(this).then(() =>{
          this.notify(`${ this.name } ${ this.IS_DEFAULT }`, '', this.LogLevel.INFO, true);
        }).catch((err) => {
          this.isDefault = false;
          this.notify(this.UNABLE_TO_DEFAULT, '', this.LogLevel.ERROR, true);
        });

        this.purgeCachedDAOs();
      }
    },
    {
      name: 'delete',
      code: function(X) {
        if ( this.isDefault ) {
          this.notify(this.DELETE_DEFAULT, '', this.LogLevel.ERROR, true);
          return;
        }

        this.deleted = true;
        this.status = this.BankAccountStatus.DISABLED;

        this.__subContext__.ctrl.add(this.Popup.create().tag({
          class: 'foam.u2.DeleteModal',
          dao: this.subject.user.accounts,
          data: this
        }));
      }
    }
  ],

  methods: [
    function toSummary() {
      return `${ this.name } ${ this.country } ${ this.BANK_ACCOUNT_LABEL } (${this.denomination})`;
    },
    {
      name: 'calcCheckSum',
      type: 'String',
      documentation: `
        Calculates check digits for IBAN number. Some countries may not share the same calculation.
        Calculation based on following document https://www.bpfi.ie/wp-content/uploads/2014/08/MOD-97-Final-May-2013-4.pdf
      `,
      code: function() {
        var requiredDigits = 10 - this.accountNumber.length;
        var numericCode = this.replaceChars(this.institutionNumber) + "0".repeat(requiredDigits >= 0 ? requiredDigits : 0) + this.accountNumber + this.replaceChars(this.country) + '00';
        while ( numericCode.length > 10 ) {
          var part = numericCode.substring(0, 10);
          numericCode = (part % 97) + numericCode.substring(10);
        }
        var checkSum = (98 - numericCode % 97).toString();
        return checkSum.length == 1 ? "0" + checkSum : checkSum;
      },
      javaCode: `
        int requiredDigits = 10 - getAccountNumber().length();
        String numericCode = replaceChars(getInstitutionNumber() + "0".repeat(requiredDigits >= 0 ? requiredDigits : 0) + getAccountNumber() + replaceChars(getCountry()) + "00");
        while ( numericCode.length() > 10 ) {
          long part = Long.parseLong(numericCode.substring(0, 10));
          numericCode = Long.toString(part % 97) + numericCode.substring(10);
        }
        String checkSum = Long.toString(98 - Long.parseLong(numericCode) % 97);
        return checkSum.length() == 1 ? "0" + checkSum : checkSum;
      `
    },
    {
      name: 'replaceChars',
      documentation: `Replace string with ascii related int.`,
      code: function(str) {
        return str.replace(/./g, function(c) {
          var a = 'A'.charCodeAt(0);
          var z = 'Z'.charCodeAt(0);
          var code = c.charCodeAt(0);
          return (a <= code && code <= z) ? code - a + 10 : parseInt(c);
        });
      },
      type: 'String',
      args: [
        { name: 'str', type: 'String'}
      ],
      javaCode: `
        StringBuilder sb = new StringBuilder();
        for (char c : str.toCharArray()) {
          int a = 'A';
          int z = 'Z';
          int code = c;
          if ( a <= code && code <= z ) {
              sb.append((int) code - a  + 10) ;
          } else {
            sb.append(c);
          }
        }
        return sb.toString();
      `
    },
    {
      name: 'getInstitutionNumber',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return getInstitutionNumber();
      `
    },
    {
      name: 'getRoutingCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return "";
      `
    },
    function purgeCachedDAOs() {
      this.__subContext__.accountDAO.cmd_(this, foam.dao.CachingDAO.PURGE);
    },
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String name = this.getName();
        if ( ((DAO)x.get("currencyDAO")).find(this.getDenomination()) == null ) {
          throw new RuntimeException("Please select a Currency");
        }
        if ( SafetyUtil.isEmpty(name) ) {
          throw new IllegalStateException("Please enter an account name.");
        }
        // length
        if ( name.length() > ACCOUNT_NAME_MAX_LENGTH ) {
          throw new IllegalStateException("Account name must be less than or equal to 70 characters.");
        }

        //To-do : IBAN validation
      `
    },
    {
      name: 'validateAmount',
      javaCode: `
        //NOP
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public BankAccount findDefault(X x, User user, String currency) {
            BankAccount bankAccount = null;
            Logger logger = (Logger) x.get("logger");
              // Select currency of user's country
              String denomination = currency;
              if ( SafetyUtil.isEmpty(denomination) ) {
                denomination = "CAD";
                Address address = user.getAddress();
                if ( address != null && address.getCountryId() != null ) {
                  String country = address.getCountryId();
                  DAO currencyDAO = (DAO) x.get("currencyDAO");
                  List currencies = ((ArraySink) currencyDAO
                      .where(
                          EQ(Currency.COUNTRY, country)
                      ).limit(2)
                      .select(new ArraySink())).getArray();
                  if ( currencies.size() == 1 ) {
                    denomination = ((Currency) currencies.get(0)).getId();
                  } else if ( currencies.size() > 1 ) {
                    logger.warning(BankAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                  }
                }
              }
              bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO"))
                .find(
                  AND(
                    EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                    EQ(Account.DELETED, false),
                    EQ(BankAccount.OWNER, user.getId()),
                    INSTANCE_OF(BankAccount.class),
                    EQ(Account.DENOMINATION, denomination),
                    EQ(Account.IS_DEFAULT, true)
                  )
                );
            return bankAccount;
          }
        `);
      }
    }
  ]
});

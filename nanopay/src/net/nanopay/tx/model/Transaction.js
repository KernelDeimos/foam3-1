foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.analytics.Foldable',
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.LifecycleAware'
  ],

  imports: [
    'accountDAO',
    'addCommas',
    'complianceHistoryDAO',
    'ctrl',
    'currencyDAO',
    'group',
    'homeDenomination',
    'stack?',
    'user',
    'exchangeRateService'
  ],

  javaImports: [
    'foam.core.X',
    'foam.core.PropertyInfo',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.*',
    'java.util.Arrays',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.contacts.Contact',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.model.Business',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.HistoricStatus',
    'net.nanopay.account.Balance',
    'static foam.mlang.MLang.EQ'
  ],

  requires: [
   'net.nanopay.bank.CanReceiveCurrency',
   'net.nanopay.tx.ETALineItem',
   'net.nanopay.tx.FeeLineItem',
   'net.nanopay.tx.TransactionLineItem',
   'net.nanopay.tx.model.TransactionStatus',
   'net.nanopay.tx.HistoricStatus'
  ],

  constants: [
    {
      name: 'STATUS_BLACKLIST',
      javaType: 'Set<TransactionStatus>',
      javaValue: `Collections.unmodifiableSet(new HashSet<TransactionStatus>() {{
        add(TransactionStatus.REFUNDED);
        add(TransactionStatus.PENDING);
      }});`
    }
  ],

  searchColumns: [
    'searchName',
    'invoiceId',
    'type',
    'status',
    'sourceAccount',
    'destinationAccount',
    'created',
    'total',
    'completionDate'
  ],

  tableColumns: [
    'type',
    'status',
    'summary',
    'created',
    'completionDate'
  ],

  sections: [
    {
      name: 'paymentInfoSource',
      help: 'The information here will be for the source of the transfer.',
      index: 0
    },
    {
      name: 'paymentInfoDestination',
      help: 'The information here will be for the destination of the transfer.',
      index: 1
    },
    {
      name: 'amountSelection',
      help: 'The amount inputted will be refelective of the source currency account.',
      index: 2
    },
    {
      name: 'basicInfo',
      title: 'Transaction Info',
      isAvailable: function(mode) {
        return mode !== 'create';
      }
    },
    {
      name: 'lineItemsSection',
      title: 'Additional Detail',
      isAvailable: function(id, lineItems, mode) {
        return (! id || lineItems.length) && mode !== 'create';
      }
    },
    {
      name: 'reverseLineItemsSection',
      title: 'Reverse Line Items',
      isAvailable: function(reverseLineItems, mode) {
        return reverseLineItems.length && mode !== 'create';
      }
    },
    {
      name: '_defaultSection',
      isAvailable: function(mode) {
        return mode !== 'create';
      },
      permissionRequired: true,
      hidden: true
    }
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Scheduled',
      predicateFactory: function(e) {
        return e.EQ(
          net.nanopay.tx.model.Transaction.STATUS,
          net.nanopay.tx.model.TransactionStatus.SCHEDULED);
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Pending',
      predicateFactory: function(e) {
        return e.EQ(
          net.nanopay.tx.model.Transaction.STATUS,
          net.nanopay.tx.model.TransactionStatus.PENDING);
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Completed',
      predicateFactory: function(e) {
        return e.EQ(
          net.nanopay.tx.model.Transaction.STATUS,
          net.nanopay.tx.model.TransactionStatus.COMPLETED);
      }
    }
  ],


  // relationships: parent, children

  properties: [
    {
      class: 'String',
      name: 'mode',
      hidden: true
    },
    {
      name: 'name',
      class: 'String',
      visibility: 'RO',
      section: 'basicInfo',
      createMode: 'HIDDEN',
      factory: function() {
        return this.type;
      },
      javaFactory: `
    return getType();
      `,
    },
    {
      name: 'balances',
      class: 'FObjectArray',
      of: 'net.nanopay.account.Balance',
      javaFactory: 'return new Balance[0];',
      hidden: true
    },
    {
      name: 'type',
      class: 'String',
      visibility: 'HIDDEN',
      storageTransient: true,
      section: 'basicInfo',
      getter: function() {
         return this.cls_.name;
      },
      javaToCSVLabel: 'outputter.outputValue("Transaction Type");',
      javaGetter: `
    return getClass().getSimpleName();
      `,
      tableWidth: 160
    },
    {
      name: 'isQuoted',
      class: 'Boolean',
      hidden: true
    },
    {
      name: 'transfers',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Transfer',
      javaFactory: 'return new Transfer[0];',
      hidden: true
    },
    {
      name: 'reverseTransfers',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Transfer',
      javaFactory: 'return new Transfer[0];',
      hidden: true
    },
    {
      class: 'String',
      name: 'id',
      label: 'ID',
      visibility: 'RO',
      section: 'basicInfo',
      createMode: 'HIDDEN',
      javaJSONParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.json.StringParser())`,
      javaCSVParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.csv.CSVStringParser())`,
      javaToCSVLabel: 'outputter.outputValue("Transaction ID");',
      tableWidth: 150,
      includeInDigest: true
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date the transaction was created.`,
      visibility: 'RO',
      storageTransient: true,
      section: 'basicInfo',
      createMode: 'HIDDEN',
      javaToCSVLabel: 'outputter.outputValue("Transaction Request Date");',
      expression: function(statusHistory) {
        return Array.isArray(statusHistory)
          && statusHistory.length > 0 ? statusHistory[0].timeStamp : null;
      },
      javaGetter: `
        if ( getStatusHistory().length > 0 ){
          return getStatusHistory()[0].getTimeStamp();
        }
        return new java.util.Date();
      `,
      javaFactory: `
        if ( getStatusHistory().length > 0 ) {
          return getStatusHistory()[0].getTimeStamp();
        }
        return new java.util.Date();
      `,
      tableWidth: 172,
      includeInDigest: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the transaction.`,
      visibility: 'RO',
      section: 'basicInfo',
      createMode: 'HIDDEN',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: `The id of the agent who created the transaction.`,
      visibility: 'RO',
      section: 'basicInfo',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      createMode: 'HIDDEN',
      documentation: `The date the transaction was last modified.`,
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      createMode: 'HIDDEN',
      documentation: `The id of the user who last modified the transaction.`,
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceId',
      createMode: 'HIDDEN',
      visibilityExpression: function(invoiceId) {
        return invoiceId ?
          foam.u2.Visibility.FINAL :
          foam.u2.Visibility.HIDDEN;
      },
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select invoice' },
      javaToCSVLabel: 'outputter.outputValue("Payment Id/Invoice Id");',
    },
    {
      name: 'invoiceNumber',
      hidden: true,
      factory: function() {
        return this.invoiceId;
      },
      tableCellFormatter: function(value, obj) {
        this.__subSubContext__.invoiceDAO.find(value).then((invoice) => {
          if ( invoice ) this.start().add(invoice.invoiceNumber).end();
        });
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      section: 'basicInfo',
      createMode: 'HIDDEN',
      value: 'COMPLETED',
      includeInDigest: true,
      writePermissionRequired: true,
      javaFactory: 'return TransactionStatus.COMPLETED;',
      javaToCSVLabel: `
        // Outputting two columns: "this transaction status" and "Returns childrens status"
        outputter.outputValue("Transaction Status");
        outputter.outputValue("Transaction State");
      `,
      javaToCSV: `
        // Outputting two columns: "this transaction status" and "Returns childrens status"
        outputter.outputValue(get_(obj));
        outputter.outputValue(((Transaction)obj).getState(x));
      `,
      tableWidth: 130,
      view: function(_, x) {
        return { class: 'foam.u2.view.ChoiceView', choices: x.data.statusChoices };
      },
      visibilityExpression: function(lifecycleState){
        return lifecycleState === foam.nanos.auth.LifecycleState.ACTIVE ? foam.u2.Visibility.RO : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'statusChoices',
      hidden: true,
      factory: function() {
        return ['No status to choose'];
      },
      documentation: 'Returns available statuses for each transaction depending on current status'
    },
    {
    // can this also be storage transient and just take the first entry in the historicStatus array?
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'COMPLETED',
      javaFactory: 'return TransactionStatus.COMPLETED;',
      hidden: true,
    },
    {
      class: 'String',
      name: 'referenceNumber',
      createMode: 'HIDDEN',
      visibility: 'RO',
      label: 'Reference',
      includeInDigest: true
    },
     {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payer',
      label: 'Sender',
      section: 'paymentInfoSource',
      createMode: 'HIDDEN',
      visibilityExpression: function(payer) {
        return payer ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: x.data.payer$.map((p) => p ? [[p, p.toSummary()]] : [])
        };
      },
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.displayName : 'na')
          .end()
        .end();
      }
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payee',
      label: 'Receiver',
      storageTransient: true,
      visibilityExpression: function(payee) {
        return payee ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      section: 'paymentInfoDestination',
      createMode: 'HIDDEN',
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: x.data.payee$.map((p) => p ? [[p, p.toSummary()]] : [])
        };
      },
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.displayName : 'na')
          .end()
        .end();
      }
    },
    {
      class: 'Long',
      name: 'payeeId',
      section: 'paymentInfoDestination',
      storageTransient: true,
      visibility: 'HIDDEN',
    },
    {
      class: 'Long',
      name: 'payerId',
      label: 'payer',
      section: 'paymentInfoSource',
      createMode: 'HIDDEN',
      visibilityExpression: function(payerId) {
        return payerId ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      storageTransient: true,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          dao: X.userDAO,
          objToChoice: function(user) {
            return [user.id, user.label()];
          }
        };
      }
    },
    {
      class: 'UnitValue',
      name: 'amount',
      label: 'Source Amount',
      section: 'amountSelection',
      required: true,
      gridColumns: 6,
      visibility: 'RO',
      help: `This is the amount to be withdrawn from payer's chosen account (Source Account).`,
      view: function(_, X) {
        return {
          class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
          linkCurrency$: X.data.destinationCurrency$,
          currency$: X.data.sourceCurrency$,
          linkAmount$: X.data.destinationAmount$
        };
      },
      tableCellFormatter: function(value, obj) {
        obj.currencyDAO.find(obj.sourceCurrency).then(function(c) {
          if ( c ) {
            this.add(c.format(value));
          }
        }.bind(this));
      },
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        String srcCurrency = ((Transaction)obj).getSourceCurrency();
        foam.core.Currency currency = (foam.core.Currency) currencyDAO.find(srcCurrency);

        // Outputting two columns: "amount", "Currency"
          // Hacky way of making get_(obj) into String below
        outputter.outputValue(currency.format(get_(obj)));
        outputter.outputValue(srcCurrency);
      `,
      javaToCSVLabel: `
        // Outputting two columns: "amount", "Currency"
        outputter.outputValue("Source Amount");
        outputter.outputValue("Source Currency");
      `,
      includeInDigest: true
    },
    {
      class: 'String',
      name: 'summary',
      createMode: 'HIDDEN',
      section: 'basicInfo',
      visibilityExpression: function(summary) {
        return summary ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table
        views of Transactions.
      `,
      tableCellFormatter: function(_, obj) {
        this.add(obj.slot(function(
            sourceCurrency,
            destinationCurrency,
            currencyDAO,
            homeDenomination  /* Do not remove b/c the cell needs to re-render if homeDenomination changes */
          ) {
            return Promise.all([
              currencyDAO.find(sourceCurrency),
              currencyDAO.find(destinationCurrency)
            ]).then(([srcCurrency, dstCurrency]) => {
              let output = '';

              if ( sourceCurrency === destinationCurrency ) {
                output += srcCurrency ? srcCurrency.format(obj.amount) : `${obj.amount} ${sourceCurrency}`;
              } else {
                output += srcCurrency ? srcCurrency.format(obj.amount) : `${obj.amount} ${sourceCurrency}`;
                output += ' → ';
                output += dstCurrency
                            ? dstCurrency.format(obj.destinationAmount)
                            : `${obj.destinationAmount} ${destinationCurrency}`;
              }

              if ( obj.payer && obj.payee ) {
                output += (' | ' + obj.payer.displayName + ' → ' + obj.payee.displayName);
              }

              return output;
            });
        }));
      },
      tableWidth: 250,
    },
    {
      // REVIEW: why do we have total and amount?
      class: 'UnitValue',
      name: 'total',
      visibility: 'RO',
      label: 'Total Amount',
      transient: true,
      visibility: 'HIDDEN',
      expression: function(amount) {
        return amount;
      },
      javaGetter: `
        return this.getAmount();
      `,
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        this
          .start()
          .addClass('amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'UnitValue',
      name: 'destinationAmount',
      label: 'Destination Amount',
      gridColumns: 6,
      help: `This is the amount to be transfered to payee's account (destination account).`,
      view: function(_, X) {
        return {
          class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
          linkAmount$: X.data.amount$,
          linkCurrency$: X.data.sourceCurrency$,
          currency$: X.data.destinationCurrency$,
          linked: true
        };
      },
      documentation: 'Amount in Receiver Currency',
      section: 'amountSelection',
      tableCellFormatter: function(value, obj) {
        obj.currencyDAO.find(obj.destinationCurrency).then(function(c) {
          if ( c ) {
            this.add(c.format(value));
          }
        }.bind(this));
      },
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        String dstCurrency = ((Transaction)obj).getDestinationCurrency();
        foam.core.Currency currency = (foam.core.Currency) currencyDAO.find(dstCurrency);

        // Outputting two columns: "amount", "Currency"
        outputter.outputValue(currency.format(get_(obj)));
        outputter.outputValue(dstCurrency);
      `,
      javaToCSVLabel: `
        // Outputting two columns: "amount", "Currency"
        outputter.outputValue("Destination Amount");
        outputter.outputValue("Destination Currency");
      `
    },
    {
      // REVIEW: processDate and completionDate are Alterna specific?
      class: 'DateTime',
      name: 'processDate',
      createMode: 'HIDDEN',
      visibilityExpression: function(processDate) {
        return processDate ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
    },
    {
      class: 'DateTime',
      name: 'completionDate',
      visibilityExpression: function(completionDate) {
        return completionDate ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      section: 'basicInfo',
      createMode: 'HIDDEN',
      tableWidth: 172
    },
    {
      documentation: `Defined by ISO 20220 (Pacs008)`,
      class: 'String',
      name: 'messageId',
      visibility: 'RO',
      hidden: true
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      aliases: ['sourceDenomination'],
      section: 'paymentInfoSource',
      gridColumns: 5,
      visibility: 'RO',
      factory: function() {
        return this.ctrl.homeDenomination ? this.ctrl.homeDenomination : 'CAD';
      },
      javaFactory: `
        return "CAD";
      `,
      includeInDigest: true,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.currencyDAO,
          objToChoice: function(unit) {
            return [unit.id, unit.id];
          }
        });
      }
    },
    {
      documentation: `referenceData holds entities such as the pacs008 message.`,
      name: 'referenceData',
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      createMode: 'HIDDEN',
      visibilityExpression: function(referenceData) {
        return referenceData.length > 0 ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
    },
    {
      class: 'String',
      name: 'dstAccountError',
      documentation: 'This is used strictly for the synchronizing of dstAccount errors on create.',
      hidden: true,
      transient: true
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      aliases: ['destinationDenomination'],
      visibility: 'RO',
      section: 'paymentInfoDestination',
      gridColumns: 5,
      value: 'CAD'
    },
    {
      name: 'next',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'statusHistory',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.HistoricStatus',
      createMode: 'HIDDEN',
      visibilityExpression: function(statusHistory) {
        return statusHistory.length > 0 ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      javaFactory: `
        net.nanopay.tx.HistoricStatus[] h = new net.nanopay.tx.HistoricStatus[1];
        h[0] = new net.nanopay.tx.HistoricStatus();
        h[0].setStatus(getStatus());
        h[0].setTimeStamp(new Date());
        return h;`
    },
    // schedule TODO: future
    {
      // TODO: Why do we have this and scheduledTime?
      name: 'scheduled',
      class: 'DateTime',
      section: 'basicInfo',
      createMode: 'HIDDEN',
      visibilityExpression: function(scheduled) {
        return scheduled ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'lastStatusChange',
      class: 'DateTime',
      section: 'basicInfo',
      documentation: 'The date that a transaction changed to its current status',
      visibilityExpression: function(lastStatusChange) {
        return lastStatusChange ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      createMode: 'HIDDEN',
      storageTransient: true,
      expression: function(statusHistory) {
        return Array.isArray(statusHistory)
          && statusHistory.length > 0 ? statusHistory[statusHistory.length - 1].timeStamp : null;
      }
    },
    {
      name: 'lineItems',
      label: '',
      section: 'lineItemsSection',
      createMode: 'HIDDEN',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      javaValue: 'new TransactionLineItem[] {}',
      visibility: 'RO'
    },
    {
      name: 'reverseLineItems',
      label: '',
      section: 'reverseLineItemsSection',
      createMode: 'HIDDEN',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      javaValue: 'new TransactionLineItem[] {}',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'scheduledTime',
      section: 'basicInfo',
      createMode: 'HIDDEN',
      visibilityExpression: function(scheduledTime) {
        return scheduledTime ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      documentation: `The scheduled date when transaction should be processed.`
    },
    {
      class: 'Boolean',
      name: 'deleted',
      value: false,
      writePermissionRequired: true,
      createMode: 'HIDDEN',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'searchName',
      label: 'Payer/Payee Name',
      documentation: 'This property exists only as a means to let users filter transactions by payer or payee name.',
      transient: true,
      hidden: true,
      searchView: { class: 'net.nanopay.tx.ui.PayeePayerSearchView' }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      createMode: 'HIDDEN',
      value: foam.nanos.auth.LifecycleState.ACTIVE,
      visibility: foam.u2.Visibility.HIDDEN
    }
  ],

  methods: [
    {
      name: 'doFolds',
      javaCode: `
        for ( Balance b : getBalances() ) {
          fm.foldForState(b.getAccount(), getLastModified(), b.getBalance());
        }
      `
    },
    {
      name: 'limitedClone',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        if ( oldTxn == null || oldTxn.getStatus() == TransactionStatus.SCHEDULED ) return this;
        Transaction newTx = (Transaction) oldTxn.fclone();
        newTx.limitedCopyFrom(this);
        return newTx;
      `,
      documentation: 'Updates only the properties that were specified in limitedCopy method'
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      setInvoiceId(other.getInvoiceId());
      setStatus(other.getStatus());
      setReferenceData(other.getReferenceData());
      setReferenceNumber(other.getReferenceNumber());
      setLifecycleState(other.getLifecycleState());
      `
    },
    {
      name: 'isActive',
      type: 'Boolean',
      javaCode: `
         return false;
      `
    },
    {
      name: 'add',
      code: function add(transferArr) {
        this.transfers = this.transfers.concat(transferArr);
      },
      args: [
        {
          name: 'transferArr',
          type: 'net.nanopay.tx.Transfer[]'
        }
      ],
      javaCode: `
        Transfer[] queued = getTransfers();
        synchronized (queued) {
          Transfer[] replacement = Arrays.copyOf(queued, queued.length + transferArr.length);
          System.arraycopy(transferArr, 0, replacement, queued.length, transferArr.length);
          setTransfers(replacement);
        }
      `
    },
    {
      documentation: `return true when status change is such that normal Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        // Allow transfer when status=COMPLETED and lifecycleState=ACTIVE
        // - for new transaction and
        // - for old transaction that just transitions to status=COMPLETED or lifecycleState=ACTIVE
        if ( getStatus() == TransactionStatus.COMPLETED
          && getLifecycleState() == LifecycleState.ACTIVE
          && ( oldTxn == null
            || oldTxn.getStatus() != TransactionStatus.COMPLETED
            || oldTxn.getLifecycleState() != LifecycleState.ACTIVE )
        ) {
          return true;
        }
        return false;
      `
    },
    {
      documentation: `return true when status change is such that reveral Transfers should be executed (applied)`,
      name: 'canReverseTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return false;
      `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        if (! canTransfer(x, oldTxn) ) {
          return new Transfer[0];
        }

        List all = new ArrayList();
        TransactionLineItem[] lineItems = getLineItems();
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }
        Transfer[] transfers = getTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
      AppConfig appConfig = (AppConfig) x.get("appConfig");
      DAO userDAO = (DAO) x.get("bareUserDAO");
      if ( getSourceAccount() == 0 ) {
        throw new RuntimeException("sourceAccount must be set");
      }

      if ( getDestinationAccount() == 0 ) {
        throw new RuntimeException("destinationAccount must be set");
      }

      User sourceOwner = (User) userDAO.find(findSourceAccount(x).getOwner());
      if ( sourceOwner == null ) {
        throw new RuntimeException("Payer user with id " + findSourceAccount(x).getOwner() + " doesn't exist");
      }

      // TODO: Move user checking to user validation service
      if ( AccountStatus.DISABLED == sourceOwner.getStatus() ) {
        throw new RuntimeException("Payer user is disabled.");
      }

      User destinationOwner = (User) userDAO.find(findDestinationAccount(x).getOwner());
      if ( destinationOwner == null ) {
        throw new RuntimeException("Payee user with id "+ findDestinationAccount(x).getOwner() + " doesn't exist");
      }

      // TODO: Move user checking to user validation service
      if ( AccountStatus.DISABLED == destinationOwner.getStatus() ) {
        throw new RuntimeException("Payee user is disabled.");
      }

      if ( ! sourceOwner.getEmailVerified() ) {
        throw new AuthorizationException("You must verify email to send money.");
      }

      if ( ! (destinationOwner instanceof Contact) && ! destinationOwner.getEmailVerified() ) {
        throw new AuthorizationException("Receiver must verify email to receive money.");
      }

      if ( getAmount() < 0) {
        throw new RuntimeException("Amount cannot be negative");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getSourceCurrency()) == null && ((DAO)x.get("securitiesDAO")).find(getSourceCurrency()) == null) { //TODO switch to just unitDAO
        throw new RuntimeException("Source denomination is not supported");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getDestinationCurrency()) == null && ((DAO)x.get("securitiesDAO")).find(getDestinationCurrency()) == null ) { //TODO switch to just unitDAO
        throw new RuntimeException("Destination denomination is not supported");
      }
/* //We currently dont have or use schedueled txns
      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null && oldTxn.getStatus() != TransactionStatus.SCHEDULED && getStatus() == TransactionStatus.SCHEDULED ) {
        throw new RuntimeException("Only new transaction can be scheduled");
      }*/
      `
    },
    {
      documentation: 'Returns childrens status.',
      name: 'getState',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'net.nanopay.tx.model.TransactionStatus',
      javaCode: `
      if ( getStatus() != TransactionStatus.COMPLETED ) {
        return getStatus();
      }
      DAO dao = (DAO) x.get("localTransactionDAO");
      List children = ((ArraySink) dao.where(EQ(Transaction.PARENT, getId())).select(new ArraySink())).getArray();
// REVIEW: the following is very slow going through authenticated transactionDAO rather than unauthenticated localTransactionDAO
//      List children = ((ArraySink) getChildren(x).select(new ArraySink())).getArray();
      for ( Object obj : children ) {
        Transaction child = (Transaction) obj;
        TransactionStatus status = child.getState(x);
        if ( status != TransactionStatus.COMPLETED ) {
          return status;
        }
      }
      return getStatus();
      `
    },
    {
      name: 'findRoot',
      code: async function findRoot() {
        var txnParent = await this.parent$find;
        if ( txnParent ) {
          // Find the root transaction in the chain
          while ( txnParent.parent != '' ) {
            txnParent = await txnParent.parent$find;
          }
        }
        return txnParent;
      },
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Transaction',
      javaCode: `
        Transaction txnParent = this.findParent(x);
        if ( txnParent != null ) {
          // Find the root transaction in the chain
          while ( ! SafetyUtil.isEmpty(txnParent.getParent()) ) {
            txnParent = txnParent.findParent(x);
          }
        }
        return txnParent;
      `
    },
    {
      name: 'addLineItems',
      code: function addLineItems(forward, reverse) {
        if ( Array.isArray(forward) && forward.length > 0 ) {
          this.lineItems = this.copyLineItems(forward, this.lineItems);
        }

        if ( Array.isArray(reverse) && reverse.length > 0 ) {
          this.reverseLineItems = this.copyLineItems(reverse, this.reverseLineItems);
        }
      },
      args: [
        { name: 'forward', type: 'net.nanopay.tx.TransactionLineItem[]' },
        { name: 'reverse', type: 'net.nanopay.tx.TransactionLineItem[]' }
      ],
      javaCode: `
    if ( forward != null && forward.length > 0 ) {
      setLineItems(copyLineItems(forward, getLineItems()));
    }
    if ( reverse != null && reverse.length > 0 ) {
      setReverseLineItems(copyLineItems(forward, getReverseLineItems()));
    }
`
    },
    {
      name: 'copyLineItems',
      code: function copyLineItems(from, to) {
      if ( from.length > 0 ) {
          to = to.concat(from);
        }
        return to;
      },
      args: [
        { name: 'from', type: 'net.nanopay.tx.TransactionLineItem[]' },
        { name: 'to', type: 'net.nanopay.tx.TransactionLineItem[]' },
     ],
      type: 'net.nanopay.tx.TransactionLineItem[]',
      javaCode: `
      ArrayList<TransactionLineItem> list1 = new ArrayList<>(Arrays.asList(to));
      Arrays.asList(from).forEach((item) -> {
        boolean hasItem = list1.stream().filter(t -> t.getId().equals(item.getId())).toArray().length != 0;
        if (! hasItem) {
          list1.add(item);
        }
      });
      return list1.toArray(new TransactionLineItem[list1.size()]);
      `
    },
    {
      name: 'getCost',
      code: function getCost() {
        var value = 0;
        for ( var i = 0; i < this.lineItems.length; i++ ) {
          if ( this.FeeLineItem.isInstance( this.lineItems[i] ) ) {
            value += this.lineItems[i].amount;
          }
        }
        return value;
      },
      type: 'Long',
      javaCode: `
        TransactionLineItem[] lineItems = getLineItems();
        Long value = 0L;
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( lineItem instanceof FeeLineItem ) {
            value += (Long) ((FeeLineItem) lineItem).getAmount();
          }
        }
        return value;
`
    },
    {
      name: 'getEta',
      code: function getEta() {
        var value = 0;
        for ( var i = 0; i < this.lineItems.length; i++ ) {
          if ( this.ETALineItem.isInstance( this.lineItems[i] ) ) {
            value += this.lineItems[i].eta;
          }
        }
        return value;
      },
      type: 'Long',
      javaCode: `
        TransactionLineItem[] lineItems = getLineItems();
        Long value = 0L;
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( lineItem instanceof ETALineItem ) {
            value += (Long) ((ETALineItem)lineItem).getEta();
          }
        }
        return value;
        `
    },
    {
      name: 'addNext',
      documentation: 'For adding multiple child transactions use CompositeTransaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      Transaction tx = this;
      if ( tx.getNext() != null && tx.getNext().length >= 1 ) {
         if ( tx.getNext().length > 1) {
           throw new RuntimeException("Error, this non-Composite transaction has more then 1 child");
         }
         Transaction [] t = tx.getNext();
         t[0].addNext(txn);
      }
      else {
        txn.setInitialStatus(txn.getStatus());
        txn.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
        Transaction [] t2 = new Transaction [1];
        t2[0] = txn;
        tx.setNext(t2);
      }
    `
  },
  {
    documentation: `Method to execute additional logic for each transaction before it was written to journals`,
    name: 'executeBeforePut',
    args: [
      {
        name: 'x',
        type: 'Context'
      }
    ],
    type: 'net.nanopay.tx.model.Transaction',
    javaCode: `
    this.validate(x);
    return this;
    `
  },
  {
    documentation: `Method to execute additional logic for each transaction after it was written to journals`,
    name: 'executeAfterPut',
    //TODO: delete this.
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'oldTxn',
        type: 'net.nanopay.tx.model.Transaction'
      }
    ],
    javaCode: `
    `
  },
  {
    name: 'authorizeOnCreate',
    args: [
      { name: 'x', type: 'Context' }
    ],
    javaThrows: ['AuthorizationException'],
    javaCode: `
      // TODO: Move logic in AuthenticatedTransactionDAO here.
    `
  },
  {
    name: 'authorizeOnUpdate',
    args: [
      { name: 'x', type: 'Context' },
      { name: 'oldObj', type: 'foam.core.FObject' }
    ],
    javaThrows: ['AuthorizationException'],
    javaCode: `
      // TODO: Move logic in AuthenticatedTransactionDAO here.
    `
  },
  {
    name: 'authorizeOnDelete',
    args: [
      { name: 'x', type: 'Context' },
    ],
    javaThrows: ['AuthorizationException'],
    javaCode: `
      // TODO: Move logic in AuthenticatedTransactionDAO here.
    `
  },
  {
    name: 'authorizeOnRead',
    args: [
      { name: 'x', type: 'Context' },
    ],
    javaThrows: ['AuthorizationException'],
    javaCode: `
      // TODO: Move logic in AuthenticatedTransactionDAO here.
    `
  },
  {
    name: 'getApprovableKey',
    type: 'String',
    javaCode: `
      return getId();
    `
  },
  {
    name: 'getOutgoingAccount',
    type: 'Long',
    javaCode: `
      return getSourceAccount();
    `
  }
],
  actions: [
    {
      name: 'viewComplianceHistory',
      label: 'View Compliance History',
      isAvailable: function(group) {
        return group.id !== 'liquidBasic';
      },
      availablePermissions: ['service.compliancehistorydao'],
      code: async function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        this.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.id}'s Compliance History`,
          data: this.complianceHistoryDAO.where(m.AND(
            m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_ID, this.id),
            m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_DAO_KEY, 'localTransactionDAO')
          ))
        });
      }
    }
  ]
});

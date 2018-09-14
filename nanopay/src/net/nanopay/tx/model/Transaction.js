foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  tableColumns: [
    'id',
    'status',
    'payer',
    'payee',
    'amount',
    'processDate',
    'completionDate',
    'created'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'addCommas',
    'userDAO'
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'java.util.*',
    'java.util.Date',
    'java.util.List',
    'java.util.Arrays',
    'net.nanopay.tx.alterna.AlternaTransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionType',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.account.Balance',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.Transfer'
  ],

  constants: [
    {
      name: 'STATUS_BLACKLIST',
      type: 'Set<TransactionStatus>',
      value: `Collections.unmodifiableSet(new HashSet<TransactionStatus>() {{
        add(TransactionStatus.REFUNDED);
        add(TransactionStatus.PENDING);
      }});`
    }
  ],

  searchColumns: [
    'id', 'status', 'type'
  ],

  properties: [
    {
      name: 'isQuoted',
      class: 'Boolean'
    },
    {
      name: 'transfers',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Transfer',
      javaFactory: 'return new Transfer[] {};'
    },
    {
      class: 'String',
      name: 'id',
      label: 'Transaction ID',
      visibility: 'RO',
      javaJSONParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.json.StringParser())`,
      javaCSVParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.csv.CSVStringParser())`

    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date the transaction was created.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the transaction.`,
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: `The date the transaction was last modified.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The id of the user who last modified the transaction.`,
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.TransactionType',
      name: 'type',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceId',
      flags: ['js'],
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select invoice' }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'String',
      name: 'referenceNumber',
      visibility: 'RO'
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payee',
      label: 'Receiver',
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.fullName : 'na')
          .end()
        .end();
      }
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payer',
      label: 'Sender',
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.fullName : 'na')
          .end()
        .end();
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      targetDAOKey: 'localAccountDAO',
    },
    {
      class: 'Long',
      name: 'payeeId',
      storageTransient: true,
    },
    {
      class: 'Long',
      name: 'payerId',
      storageTransient: true,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      targetDAOKey: 'localAccountDAO',
    },
    {
      class: 'Currency',
      name: 'amount',
      label: 'Amount',
      visibility: 'RO',
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'Currency',
      name: 'total',
      visibility: 'RO',
      label: 'Total Amount',
      transient: true,
      expression: function(amount) {
        return amount;
      },
      javaGetter: `return getAmount();`,
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
      class: 'DateTime',
      name: 'processDate'
    },
    {
      class: 'DateTime',
      name: 'completionDate'
    },
    {
      documentation: `Defined by ISO 20220 (Pacs008)`,
      class: 'String',
      name: 'messageId'
    },
    {
      documentation: `Defined by ISO 20220 (Pacs008)`,
      class: 'String',
      name: 'pacs008EndToEndId'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      value: 'CAD'
    },
    {
      documentation: `Show Transaction class name - to distinguish sub-classes.`,
      class: 'String',
      name: 'cls', // TODO: rename to type if/when type is dropped.
      transient: true,
      visibility: foam.u2.Visibility.RO,
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: `
        return getClass().getSimpleName();
`
},
    {
      class: 'String',
      name: 'destinationCurrency',
      value: 'CAD'
    },
  ],

  methods: [
    {
      name: 'isActive',
      javaReturns: 'boolean',
      javaCode: `
         return
           getStatus().equals(TransactionStatus.COMPLETED) ||
           getType().equals(TransactionType.CASHOUT) ||
           getType().equals(TransactionType.NONE);
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
          javaType: 'Transfer[]'
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
      name: 'createTransfers',
      javaReturns: 'Transfer[]',
      javaCode: `
      if ( ! isActive() ) return new Transfer[] {};
          Transfer[] tr = new Transfer [] {
           new Transfer.Builder(getX()).setAccount(getSourceAccount()).setAmount(-getTotal()).build(),
           new Transfer.Builder(getX()).setAccount(getDestinationAccount()).setAmount(getTotal()).build()
          };
          add(tr);
          return getTransfers();

      `
    },
    {
      name: 'toString',
      javaReturns: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(this.getClass().getSimpleName());
        sb.append("(");
        sb.append("id: ");
        sb.append(getId());
        sb.append(", ");
        sb.append("type: ");
        sb.append(getType());
        sb.append(", ");
        sb.append("status: ");
        sb.append(getStatus());
        sb.append(")");
        return sb.toString();
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaCode: `
      if ( getSourceAccount() == 0 ) {
        throw new RuntimeException("sourceAccount must be set");
      }

      if ( getDestinationAccount() == 0 ) {
        throw new RuntimeException("destinationAccount must be set");
      }

      if ( getPayerId() != 0 ) {
        if ( findSourceAccount(x).getOwner() != getPayerId() ) {
          throw new RuntimeException("sourceAccount doesn't belong to payer");
        }
      }

      if ( getPayeeId() != 0 ) {
        if ( findDestinationAccount(x).getOwner() != getPayeeId() ) {
          throw new RuntimeException("destinationAccount doesn't belong to payee");
        }
      }

      if ( findSourceAccount(x).findOwner(x) == null ) {
        throw new RuntimeException("Payer user doesn't exist");
      }

      if ( findDestinationAccount(x).findOwner(x) == null ) {
        throw new RuntimeException("Payee user doesn't exist");
      }

      if ( ! findSourceAccount(x).findOwner(x).getEmailVerified() ) {
        throw new AuthorizationException("You must verify email to send money.");
      }

      if ( ! findDestinationAccount(x).findOwner(x).getEmailVerified() ) {
        throw new AuthorizationException("Receiver must verify email to receive money.");
      }

      if ( getAmount() < 0) {
        throw new RuntimeException("Amount cannot be negative");
      }

      if ( getAmount() == 0) {
        throw new RuntimeException("Amount cannot be zero");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getSourceCurrency()) == null ) {
        throw new RuntimeException("Source currency is not supported");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getDestinationCurrency()) == null ) {
        throw new RuntimeException("Destination currency is not supported");
      }

      if ( getTotal() > 7500000 ) {
        throw new AuthorizationException("Transaction limit exceeded.");
      }
      `
    }
  ]
});

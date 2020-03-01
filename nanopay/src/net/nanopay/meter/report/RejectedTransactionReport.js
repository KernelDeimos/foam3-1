foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'RejectedTransactionReport',

  documentation: `
    A report for rejected transactions with the following columns:
    * Transaction ID
    * Created
    * Status
    * State
    * Type
    * Source Account
    * Destination Account
    * Source Amount
    * Source Currency
    * Destination Amount
    * Destination Currency
  `,

  tableColumns: [
    'id',
    'created',
    'status',
    'state',
    'type',
    'senderUserId',
    'senderName',
    'receiverUserId',
    'receiverName',
    'sourceAmount',
    'sourceCurrency',
    'destinationAmount',
    'destinationCurrency'
  ],

  searchColumns: [
    'dateRange'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'dateRange',
      documentation: 'This is a "virtual" property for catching user\'s selection.',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'id',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction ID");
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction Status");
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'state',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction State");
      }
    },
    {
      class: 'String',
      name: 'type',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Type");
      }
    },
    {
      class: 'Long',
      name: 'senderUserId',
      visibility: 'RO',
      tableWidth: 60,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Sender User ID");
      }
    },
    {
      class: 'String',
      name: 'senderName',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      class: 'Long',
      name: 'receiverUserId',
      visibility: 'RO',
      tableWidth: 60,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Receiver User ID");
      }
    },
    {
      class: 'String',
      name: 'receiverName',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      class: 'UnitValue',
      name: 'sourceAmount',
      unitPropName: 'sourceCurrency',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      visibility: 'RO'
    },
    {
      class: 'UnitValue',
      name: 'destinationAmount',
      unitPropName: 'destinationCurrency',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      visibility: 'RO'
    }
  ]
})
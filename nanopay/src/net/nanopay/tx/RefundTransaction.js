foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'RefundTransaction',
  extends: 'net.nanopay.tx.RetailTransaction',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.RetailTransaction',
      name: 'refundTransactionId',
      visibility: 'RO'
    },
    {
      class: 'UnitValue',
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
          .addClass('amount-Color-Red')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    }
  ]
});

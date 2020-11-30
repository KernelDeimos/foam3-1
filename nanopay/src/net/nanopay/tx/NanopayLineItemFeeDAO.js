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
  package: 'net.nanopay.tx',
  name: 'NanopayLineItemFeeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'foam.util.SafetyUtil'
  ],

  properties: [
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);

      for ( int i = 0; i < quote.getPlans().length; i++ ) {
        quote.getPlans()[i] = applyFees(x, quote.getPlans()[i], quote.getPlans()[i]);
      }
      return quote;
`
    },
    {
      name: 'applyFees',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'applyTo',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `if ( transaction == null ||
        ! ( transaction instanceof InvoiceTransaction ) ||
        ! ((InvoiceTransaction) transaction).getPayable() ) {
        return transaction;
      }
      DAO lineItemFeeDAO = (DAO) x.get("lineItemFeeDAO");
      DAO typeAccountDAO = (DAO) x.get("lineItemTypeAccountDAO");
      for ( TransactionLineItem lineItem : transaction.getLineItems() ) {
        List fees = ((ArraySink) lineItemFeeDAO
          .where(
            MLang.AND(
              MLang.EQ(LineItemFee.ENABLED, true),
              MLang.EQ(LineItemFee.FOR_TYPE, lineItem.getType())
            )
          )
          .select(new ArraySink())).getArray();
          for (Object f : fees ) {
            LineItemFee fee = (LineItemFee) f;
            User payee = applyTo.findDestinationAccount(x).findOwner(x);
            String feeAccountId = "";
            LineItemTypeAccount lineItemTypeAccount = (LineItemTypeAccount) typeAccountDAO.find(
              MLang.AND(
                MLang.EQ(LineItemTypeAccount.ENABLED, true),
                MLang.EQ(LineItemTypeAccount.USER, payee.getId()),
                MLang.EQ(LineItemTypeAccount.TYPE, fee.getFeeType())
              )
            );

            if ( lineItemTypeAccount == null ) {
              Account account = DigitalAccount.findDefault(x, payee, "CAD");
              feeAccountId = account.getId();
            } else {
              feeAccountId = lineItemTypeAccount.getAccount();
            }
            Long amount = fee.getFeeAmount(lineItem.getAmount());
            if ( ! foam.util.SafetyUtil.isEmpty(feeAccountId) &&
                 amount > 0L ) {
              LineItemType lineItemType = fee.findFeeType(x);
              FeeLineItem[] forward = new FeeLineItem [] {
                new FeeLineItem.Builder(x).setType(fee.getFeeType()).setDestinationAccount(feeAccountId).setAmount(amount).setNote(lineItemType.getName()).build()
              };
              TransactionLineItem[] reverse;
              if ( fee.getRefundable() ) {
                // REVIEW - see FeeLineItem.createTransfers and sourcePaysFee
                reverse = new FeeLineItem[] {
                  new FeeLineItem.Builder(x).setType(fee.getFeeType()).setDestinationAccount(transaction.getSourceAccount()).setAmount(amount).setNote(lineItemType.getName()).build()
                };
              } else {
                reverse = new InfoLineItem [] {
                  new InfoLineItem.Builder(x).setType(fee.getFeeType()).setNote(lineItemType.getName()+ " Non-refundable").setAmount(amount).build()
                };
              }
              applyTo.addLineItems(forward);
            }
          }
        }
      return applyTo;`
    },
  ]
});

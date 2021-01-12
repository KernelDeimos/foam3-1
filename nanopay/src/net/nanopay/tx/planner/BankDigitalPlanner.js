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
  package: 'net.nanopay.tx.planner',
  name: 'BankDigitalPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for bank to digital where the owners differ`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.List',
  ],

  properties: [
    {
      name: 'multiPlan_',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        Transaction txn;
        if ( requestTxn.getType().equals("Transaction") ) {
          txn = new SummaryTransaction(x);
          txn.copyFrom(requestTxn);
        } else {
          txn = (Transaction) requestTxn.fclone();
        }

        txn.setStatus(TransactionStatus.PENDING);
        txn.setInitialStatus(TransactionStatus.COMPLETED);

        Account sourceAccount = quote.getSourceAccount();
        DAO dao = (DAO) x.get("localAccountDAO");
        List digitalList = ((ArraySink) dao.where(
          AND(
            EQ(Account.OWNER, sourceAccount.getOwner()),
            CLASS_OF(DigitalAccount.class)
          )).select(new ArraySink())).getArray();

        for ( Object obj : digitalList ) {
          Account digital = (DigitalAccount) obj;
          // Split 1: ABank -> ADigital
          Transaction t1 = new Transaction(x);
          t1.copyFrom(requestTxn);
          t1.setDestinationAccount(digital.getId());

          // ADigital -> BDigital
          Transaction t2 = new Transaction(x);
          t2.copyFrom(requestTxn);
          t2.setSourceAccount(digital.getId());

          Transaction[] digitals = multiQuoteTxn(x, t2, quote);
          Transaction[] CIs = multiQuoteTxn(x, t1, quote);
          for ( Transaction tx1 : digitals ) {
            for ( Transaction tx2 : CIs ) {
              Transaction CI = (Transaction) tx2.fclone();
              CI.addNext((Transaction) tx1.fclone());
              CI.setPlanCost(CI.getPlanCost() + tx1.getPlanCost());
              Transaction t = (Transaction) txn.fclone();
              t.addNext(CI);
              quote.getAlternatePlans_().add(t);
            }
          }
        }
        return null;
      `
    },
  ]
});

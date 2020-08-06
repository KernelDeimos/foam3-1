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
  name: 'DigitalBankPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for digital to bank where the owners differ`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction'
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
        Account destinationAccount = quote.getDestinationAccount();
        foam.nanos.auth.User bankOwner = destinationAccount.findOwner(x);
        Account digital = DigitalAccount.findDefault(x, bankOwner, requestTxn.getDestinationCurrency());

        // digital -> digital
        Transaction digitalTxn = new Transaction();
        digitalTxn.copyFrom(requestTxn);
        digitalTxn.setDestinationAccount(digital.getId());

        // cash out
        Transaction co = new Transaction();
        co.copyFrom(requestTxn);
        co.setSourceAccount(digital.getId());

        Transaction[] digitals = multiQuoteTxn(x, digitalTxn, quote);
        Transaction[] COs = multiQuoteTxn(x, co, quote, false);
        for ( Transaction tx1 : digitals ) {
          for ( Transaction tx2 : COs ) {
            Transaction Digital = (Transaction) tx1.fclone();
            Digital.addNext((Transaction) tx2.fclone());
            quote.getAlternatePlans_().add(Digital);
          }
        }
        return null;
      `
    },
  ]
});

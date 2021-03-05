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
  package: 'net.nanopay.tx.creditengine',
  name: 'CreditCodeLoadAction',
  abstract: true,

  documentation: 'Abstract rule action for compliance validator.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.core.X',
    'net.nanopay.tx.creditengine.AbstractCreditCodeAccount',
    'net.nanopay.tx.creditengine.CreditCodeTransaction',
    'foam.core.ContextAwareAgent',

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            AbstractCreditCodeAccount promo = (AbstractCreditCodeAccount) obj;
            CreditCodeTransaction tx = new CreditCodeTransaction();
            tx.setAmount(promo.getInitialQuantity());
            tx.setSourceAccount(promo.getId());
            tx.setDestinationAccount(promo.getId());
            ((DAO) getX().get("localTransactionDAO")).put(tx);
          }
        },"CreditCode Load Action executing");
      `
    },
  ]
});


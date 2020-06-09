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
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'EstimateTransactionCompletionDate',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Estimates transaction completionDate according to clearing time.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Date',
    'net.nanopay.meter.clearing.ClearingTimeService',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO dao = (DAO) x.get("localTransactionDAO");
            Transaction transaction = (Transaction) obj.fclone();
            ClearingTimeService clearingTimeService = (ClearingTimeService) x.get("clearingTimeService");

            Date completionDate = clearingTimeService.estimateCompletionDateSimple(x, transaction);
            transaction.setCompletionDate(completionDate);
            dao.put(transaction);
          }
        }, "Estimate Transaction Completion Date");
      `
    }
  ]
});

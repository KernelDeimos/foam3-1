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
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ComplianceTransactionValidator',
  extends: 'net.nanopay.meter.compliance.identityMind.AbstractIdentityMindComplianceRuleAction',

  documentation: 'Validates transaction via IdentityMind Transfer API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          Transaction transaction = (Transaction) obj;
          ComplianceValidationStatus status = ComplianceValidationStatus.PENDING;
          ComplianceApprovalRequest approvalRequest =
            new ComplianceApprovalRequest.Builder(x)
              .setObjId(transaction.getId())
              .setServerDaoKey("localTransactionDAO")
              .setDaoKey("transactionDAO")
              .setClassification("Validate Transaction Using IdentityMind")
              .build();

          IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
          IdentityMindResponse response = identityMindService.evaluateTransfer(x, transaction);
          status = response.getComplianceValidationStatus();

          // Create approval request
          approvalRequest.setCauseId(response.getId());
          approvalRequest.setCauseDaoKey("identityMindResponseDAO");
          approvalRequest.setStatus(getApprovalStatus(status));
          approvalRequest.setApprover(getApprover(status));
          requestApproval(x, approvalRequest);
          ruler.putResult(status);
        }
      }, "Compliance Transaction Validator");
      `
    }
  ]
});

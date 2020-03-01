foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'AbstractComplianceRuleAction',
  abstract: true,

  documentation: 'Abstract rule action for compliance validator.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'String',
      name: 'approverGroupId',
      value: 'fraud-ops'
    }
  ],

  methods: [
    {
      name: 'requestApproval',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'approvalRequest',
          type: 'foam.nanos.approval.ApprovalRequest'
        }
      ],
      javaCode: `
        approvalRequest.setGroup(getApproverGroupId());
        ((DAO) x.get("approvalRequestDAO")).put(approvalRequest);
      `
    }
  ]
});
 

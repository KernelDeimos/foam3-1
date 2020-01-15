foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'FulfilledApprovableRule',

  documentation: `
    A rule to determine what to do with an approvable once the 
    approval request has been APPROVED
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.core.FObject',
    'java.util.Map',
    'foam.nanos.ruler.Operations',
    'net.nanopay.account.Account',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.liquidity.approvalRequest.Approvable',
    'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            Approvable approvable = (Approvable) obj;

            DAO dao = (DAO) getX().get(approvable.getDaoKey());

            FObject currentObjInDao = dao.find(approvable.getObjId());
            FObject objToUpdate = currentObjInDao.fclone();

            Map propsToUpdate = approvable.getPropertiesToUpdate();

            Object[] keyArray = propsToUpdate.keySet().toArray();

            for ( int i = 0; i < keyArray.length; i++ ){
              objToUpdate.setProperty((String) keyArray[i],propsToUpdate.get(keyArray[i]));
            }

            dao.put_(getX(), objToUpdate);
          }
        }, "Updated the object based on a approved approvable");
      `
    }
  ]
});

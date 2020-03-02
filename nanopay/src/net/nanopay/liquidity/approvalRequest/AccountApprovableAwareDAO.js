foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'AccountApprovableAwareDAO',
  extends: 'foam.nanos.approval.ApprovableAwareDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Map',
    'java.util.List',
    'java.util.Set',
    'foam.mlang.MLang',
    'foam.mlang.MLang.*',
    'foam.core.FObject',
    'java.util.HashSet',
    'foam.dao.ArraySink',
    'java.util.ArrayList',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.User',
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.nanos.logger.Logger',
    'foam.lib.PropertyPredicate',
    'net.nanopay.account.Account',
    'foam.nanos.ruler.Operations',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.LifecycleAware',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.approval.ApprovalRequest',
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService',
    'foam.nanos.approval.Approvable',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'foam.nanos.approval.ApprovableAware',
    'foam.nanos.approval.RoleApprovalRequest',
    'net.nanopay.liquidity.approvalRequest.AccountApprovableAware',
    'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest'
  ],

  methods: [
    {
      name: 'sendSingleAccountRequest',
      type: 'void',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'req', type: 'AccountRoleApprovalRequest' },
        { name: 'userId', type: 'long' }
      ],
      javaCode: `
        AccountRoleApprovalRequest request = (AccountRoleApprovalRequest) req.fclone();
        request.clearId();
        request.setApprover(userId);
        ((DAO) x.get("approvalRequestDAO")).put_(x, request);
      `
    },
    {
      name: 'fullSend',
      type: 'void',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'RoleApprovalRequest' },
        { name: 'obj', type: 'FObject' }
      ],
      javaCode:`
      Logger logger = (Logger) x.get("logger");

      // AccountRoleApprovalRequest and set the outgoing account
      AccountRoleApprovalRequest accountRequest = new AccountRoleApprovalRequest.Builder(getX())
        .setDaoKey(request.getDaoKey())
        .setObjId(request.getObjId())
        .setClassification(request.getClassification())
        .setOperation(request.getOperation())
        .setInitiatingUser(request.getInitiatingUser())
        .setStatus(request.getStatus()).build();

      AccountApprovableAware accountApprovableAwareObj = (AccountApprovableAware) obj;
  
      if ( accountRequest.getOperation() == Operations.CREATE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountCreate(x));
      } else if ( accountRequest.getOperation() == Operations.UPDATE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountUpdate(x));
      } else if ( accountRequest.getOperation() == Operations.REMOVE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountDelete(x));
      } else {
        logger.error("Using an invalid operation!");
        throw new RuntimeException("Using an invalid operation!");
      }
  
      DAO requestingDAO;
  
      if ( accountRequest.getDaoKey().equals("approvableDAO") ){
        DAO approvableDAO = (DAO) x.get("approvableDAO");
  
        Approvable approvable = (Approvable) approvableDAO.find(accountRequest.getObjId());
  
        requestingDAO = (DAO) x.get(approvable.getDaoKey());
      } else {
        requestingDAO = (DAO) x.get(request.getDaoKey());
      }
  
      String modelName = requestingDAO.getOf().getObjClass().getSimpleName();
  
      AccountUCJQueryService ucjQueryService = (AccountUCJQueryService) x.get("accountUcjQueryService");
  
      List<Long> approverIds = ucjQueryService.getAllApprovers(getX(), modelName, accountRequest.getOutgoingAccount());
  
      if ( approverIds.size() <= 0 ) {
        logger.log("No Approvers exist for the model: " + modelName);
        throw new RuntimeException("No Approvers exist for the model: " + modelName);
      }

      if ( approverIds.size() == 1 && approverIds.get(0) == accountRequest.getInitiatingUser() ){
        logger.log("The only approver of " + modelName + " is the maker of this request!");
        throw new RuntimeException("The only approver of " + modelName + " is the maker of this request!");
      }
  
      if ( getIsTrackingRequestSent() ){
        AccountRoleApprovalRequest accountTrackingRequest = (AccountRoleApprovalRequest) accountRequest.fclone();
        accountTrackingRequest.setIsTrackingRequest(true);

        sendSingleAccountRequest(x, accountTrackingRequest, accountTrackingRequest.getInitiatingUser());

        approverIds.remove(accountTrackingRequest.getInitiatingUser());
      }
  
      for ( int i = 0; i < approverIds.size(); i++ ){
        sendSingleAccountRequest(getX(), accountRequest, approverIds.get(i));
      }
      `
    }
  ]
});

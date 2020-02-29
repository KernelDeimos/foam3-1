foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'RemoveDomesticCurrencyPermission',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Removes currency.read.Domestic_Currency from business, typically when busness fails compliance',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'javax.security.auth.AuthPermission',
    'net.nanopay.model.Business',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! (obj instanceof Business) ) {
	            return;
            }
            Business business = (Business) obj.fclone();
            DAO localGroupDAO = (DAO) x.get("localGroupDAO");
            Address businessAddress = business.getAddress();
            
            if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {
              String currencyPermissionString = "currency.read.";
              currencyPermissionString += businessAddress.getCountryId().equals("CA") ? "CAD" :  "USD";
              Permission currencyPermission = new Permission.Builder(x).setId(currencyPermissionString).build();
              Group group = (Group) localGroupDAO.find(business.getGroup());
              while ( group != null ) {
                group = (Group) group.findParent(x);
                if ( group != null && group.getId().endsWith("employee") ) break;
              }

              if ( null != group && group.implies(x, new AuthPermission(currencyPermissionString)) ) {
                try {
                  group.getPermissions(x).remove(currencyPermission);  
                } catch(Throwable t) {
                    ((Logger) x.get("logger")).error("Error removing " + currencyPermissionString + " permission from business " + business.getId(), t);
                } 
              } 
            }
          }
        }, "Removes currency.read.Domestic_Currency from business, typically when busness fails compliance");
      `
    }
  ]
});

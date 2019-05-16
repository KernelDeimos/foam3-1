foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'BusinessToPublicBusinessInfoDAO',
  extends: 'foam.dao.ReadOnlyDAO',
  flags: ['java'],

  documentation: `
    Decorates a DAO of Businesses and converts them to PublicBusinessInfos on
    read. Extends ReadOnlyDAO.
  `,

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.nanos.auth.AuthService',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        Business business = (Business) super.find_(x, id);

        if ( business == null ) return null;
        
        return new PublicBusinessInfo(business);
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink s = sink != null ? sink : new ArraySink();
        ProxySink proxy = new ProxySink(x, s) {
          public void put(Object o, Detachable d) {
            Business business = (Business) o;
            if ( isPublic(x, business) ) {
              PublicBusinessInfo bInfo = new PublicBusinessInfo(business);
              getDelegate().put(bInfo, d);
            }
          }
        };

        getDelegate().select_(x, proxy, skip, limit, order, predicate);

        // Return the proxy's delegate - the caller may explicitly be expecting
        // this array sink they passed.  See foam.dao.RequestResponseClientDAO
        return proxy.getDelegate();
      `
    },
    {
      name: 'isPublic',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'business', type: 'net.nanopay.model.Business' }
      ],
      javaCode: `
        Boolean rtn = business != null &&
          SafetyUtil.equals(business.getStatus(), AccountStatus.ACTIVE) &&
          SafetyUtil.equals(business.getCompliance(), ComplianceStatus.PASSED) &&
          business.getIsPublic();

        if ( ((AuthService) x.get("auth")).check(x, "currency.read.USD") ) {
          return rtn;
        }

        ArraySink results = (ArraySink) ((DAO) x.get("accountDAO")).where(
          AND(
            EQ(Account.OWNER, business.getId()),
            EQ(BankAccount.DENOMINATION, "USD"),
            NEQ(Account.DELETED, true)
          )
        ).select(new ArraySink());

        return rtn && (results.getArray().size() == 0);

      `
    }
  ]
});

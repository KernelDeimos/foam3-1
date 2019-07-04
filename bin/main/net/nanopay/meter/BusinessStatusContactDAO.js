foam.CLASS({
    package: 'net.nanopay.meter',
    name: 'BusinessStatusContactDAO',
    extends: 'foam.dao.ProxyDAO',

    documentation: `Decorator DAO which set businessStatus property for 
      contact object. It is set to DISABLED if the referenced business 
      record could not be retrieved.`,

    imports: [
      'localBusinessDAO'
    ],

    javaImports: [
      'foam.core.FObject',
      'foam.dao.DAO',
      'foam.dao.ProxySink',
      'net.nanopay.admin.model.AccountStatus',
      'net.nanopay.contacts.Contact',
      'net.nanopay.model.Business'
    ],

    methods: [
        {
          name: 'find_',
          javaCode: `
            return fillBusinessStatus(x, super.find_(x, id));
          `
        },
        {
          name: 'select_',
          javaCode: `
            if (sink != null) {
              ProxySink decoratedSink = new ProxySink(x, sink) {
                @Override
                public void put(Object obj, foam.core.Detachable sub) {
                  FObject result = fillBusinessStatus(getX(), (FObject) obj);
                  super.put(result, sub);
                }
              };
              super.select_(x, decoratedSink, skip, limit, order, predicate);
              return sink;
            }
            return super.select_(x, sink, skip, limit, order, predicate);
          `
        },
        {
          name: 'fillBusinessStatus',
          type: 'net.nanopay.contacts.Contact',
          args: [
            { type: 'Context', name: 'x' },
            { type: 'foam.core.FObject', name: 'obj' }
          ],
          javaCode: `
            Contact result = (Contact) obj;
    
            if ( result != null
              && result.getBusinessId() != 0
            ) {
              result = (Contact) result.fclone();
              DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
              Business business = (Business) localBusinessDAO.inX(x).find(result.getBusinessId());
              result.setBusinessStatus(business != null
                ? business.getStatus()
                : AccountStatus.DISABLED);
            }
            return result;
          `
        }
      ]
  });

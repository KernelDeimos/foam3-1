foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'BusinessAgentAuthService',
  extends: 'net.nanopay.auth.ProxyAgentAuthService',

  documentation: 'Allows users to act as businesses and regular users.',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'agentJunctionDAO',
    'bareUserDAO',
    'groupDAO',
    'sessionDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.NanoService',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.session.Session',
    'net.nanopay.contacts.Contact',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.NOT'
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        if ( getDelegate() instanceof NanoService ) {
          ((NanoService) getDelegate()).start();
        }
      `
    },
    {
      name: 'actAs',
      javaReturns: 'foam.nanos.auth.User',
      javaThrows: [
        'foam.nanos.auth.AuthorizationException',
        'foam.nanos.auth.AuthenticationException'
      ],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'entity',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        if ( entity == null ) {
          throw new AuthorizationException("Entity user doesn't exist.");
        } else if ( entity instanceof Contact ) {
          throw new RuntimeException("You cannot act as a contact.");
        }

        User currentAgent = (User) x.get("agent");
        User currentUser = (User) x.get("user");

        // The user could already be acting as someone else and want to switch
        // who they're acting as.
        User agent = currentAgent != null ? currentAgent : currentUser;

        // Make sure you're logged in as yourself before trying to act as
        // someone else.
        if ( agent == null ) {
          throw new AuthenticationException();
        }

        Group group = (Group) ((DAO) getGroupDAO()).find(entity.getGroup());
        if ( group == null ) {
          throw new AuthorizationException("Entity must exist within a group.");
        } else if ( ! group.getEnabled() ) {
          throw new AuthorizationException("Entity's group must be enabled.");
        }

        // Finds the UserUserJunction object to see if user can act as the
        // passed in user. Source (agent) users are permitted to act as
        // target (entity) users, not vice versa.
        UserUserJunction permissionJunction = (UserUserJunction) ((DAO) getAgentJunctionDAO()).find(AND(
          EQ(UserUserJunction.SOURCE_ID, agent.getId()),
          EQ(UserUserJunction.TARGET_ID, entity.getId())
        ));
        if ( permissionJunction == null ) {
          throw new AuthorizationException("You don't have access to act as the requested entity.");
        }

        // Junction object contains a group which has a unique set of
        // permissions specific to the relationship.
        Group actingWithinGroup = (Group) ((DAO) getGroupDAO()).find(permissionJunction.getGroup());
        if ( actingWithinGroup == null || ! actingWithinGroup.getEnabled() ) {
          throw new AuthorizationException("No permissions are appended to the entity relationship.");
        }

        // Clone user and associate new junction group with user. Clone and
        // freeze both user and agent.
        entity = (User) entity.fclone();
        entity.setGroup(actingWithinGroup.getId());
        entity.freeze();
        agent = (User) agent.fclone();
        agent.freeze();

        // Set user and agent objects into the session context and place into sessionDAO.
        Session session = x.get(Session.class);
        session.setUserId(entity.getId());
        session.setContext(session.getContext().put("user", entity));
        session.setContext(session.getContext().put("agent", agent));
        DAO sessionDAO = (DAO) getX().get("sessionDAO");
        sessionDAO.put(session);
        return agent;
      `
    }
  ]
});

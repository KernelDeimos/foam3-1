foam.CLASS({
  package: 'net.nanopay.security.pii',
  name: 'ViewPIIRequestDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserAndGroupAuthService',
    'foam.util.Auth',

    'java.util.ArrayList',
    'java.util.Date'
  ],

  constants: [
    {
      type: 'User',
      name: 'INPUT',
      documentation: 'Original input',
      value: `
        new User.Builder(EmptyX.instance())
          .setId(1100)
          .setFirstName("Rumple")
          .setLastName("Stiltskin")
          .setEmail("rumple@stiltskin.au")
          .build()
      `
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        DAO vprDAO = (DAO) x.get("viewPIIRequestDAO");
        // run tests
        ViewPIIRequestDAO_DAOIsAuthenticated(x);
        ViewPIIRequestDAO_EnforcesOnlyValidOneRequestPerUser(x, vprDAO);
        ViewPIIRequestDAO_ApprovedValidRequestIsFrozen(x, vprDAO);
        ViewPIIRequestDAO_DownloadTimesAreLogged(x, vprDAO);
      `
    },
    {
      name: 'ViewPIIRequestDAO_DAOIsAuthenticated',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
        // create mock userDAO as localUserDAO
        x = x.put("localUserDAO", new MDAO(User.getOwnClassInfo()));
        DAO userDAO = (DAO) x.get("localUserDAO");

        // create mock viewPIIRequestDAO and add Authentication decorator
        DAO viewPIIRequestDAO = new MDAO(ViewPIIRequest.getOwnClassInfo());
        DAO dao = new AuthenticatedPIIRequestDAO(x, viewPIIRequestDAO);

        // start auth service
        UserAndGroupAuthService newAuthService = new UserAndGroupAuthService(x);
        newAuthService.start();
        x = x.put("auth", newAuthService);

        // create new admin user and context with them logged in
        User admin = new User();
        admin.setId(1300);
        admin.setFirstName("Ranier Maria");
        admin.setLastName("Rilke");
        admin.setEmail("ranier@mailinator.com");
        admin.setGroup("admin");
        userDAO.inX(x).put(admin);
        X adminContext = Auth.sudo(x, admin);

        // create new basic user and context with them logged in
        User basicUser = new User();
        basicUser.setId(1380);
        basicUser.setFirstName("Franz");
        basicUser.setLastName("Kappus");
        basicUser.setEmail("franzkappus@mailinator.com");
        basicUser.setGroup("basicUser");
        userDAO.inX(x).put(basicUser);
        X basicUserContext = Auth.sudo(x, basicUser);

        // create PII request by admin
        ViewPIIRequest adminViewPIIRequest = new ViewPIIRequest();
        adminViewPIIRequest.setId(1l);
        adminViewPIIRequest.setCreatedBy(1300);
        dao.put_(basicUserContext, adminViewPIIRequest);

        // create PII request by basicUser
        ViewPIIRequest basicUserViewPIIRequest = new ViewPIIRequest();
        basicUserViewPIIRequest.setId(2l);
        basicUserViewPIIRequest.setCreatedBy(1380);
        dao.put_(basicUserContext, basicUserViewPIIRequest);

        // try to find admin request by basicUser
        FObject basicUserFindUnownedRequest = dao.find_(basicUserContext, 1l);
        test( basicUserFindUnownedRequest == null , "Non admin user cannot find unowned requests");

        // try to find own request by basic user
        FObject basicUserFindOwnRequest = dao.find_(basicUserContext, 2l);
        test( (basicUserFindOwnRequest.getClassInfo()).equals(ViewPIIRequest.getOwnClassInfo()), "Non admin user can find own request" );

        // basic user try to delete request
        boolean basicUserDeleteThrew = false;
        try {
          dao.remove_(basicUserContext, basicUserViewPIIRequest);
        } catch (Exception e) {
          basicUserDeleteThrew = true;
        }
        test( basicUserDeleteThrew , "Non admin user cannot delete own request");

        // admin user try to delete request
        boolean adminUserDeleteThrew = false;
        dao.put_(adminContext, basicUserViewPIIRequest);
        try {
        dao.remove_(adminContext, basicUserViewPIIRequest);
        } catch (Exception e) {
          adminUserDeleteThrew = true;
        }
        test( !adminUserDeleteThrew , "Admin user can delete basicUser request");
      `
    },
    {
      name: 'ViewPIIRequestDAO_ApprovedValidRequestIsFrozen',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'vprDAO', javaType: 'foam.dao.DAO'
        }
      ],
      javaCode: `
        // Create new request, set it to approved and put to DAO
        ViewPIIRequest piiRequest = new ViewPIIRequest();
        piiRequest.setId(100);
        piiRequest.setViewRequestStatus(PIIRequestStatus.APPROVED);
        vprDAO.inX(x).put(piiRequest);
        // Find object from DAO
        FObject daoRequestObject = vprDAO.find(100);
        // Modify the object and put it to DAO again
        piiRequest.setViewRequestStatus(PIIRequestStatus.PENDING);
        piiRequest.setCreated(new Date());
        piiRequest.setRequestExpiresAt(new Date());
        vprDAO.inX(x).put(piiRequest);
        // Find the object again
        FObject modifiedDaoRequestObject = vprDAO.find(100);
        // Confirm that the dao Object was not modified
        test( daoRequestObject.equals(modifiedDaoRequestObject) , "updating an approved request doesn\'t work" );
      `
    },
    {
      name: 'ViewPIIRequestDAO_DownloadTimesAreLogged',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'vprDAO', javaType: 'foam.dao.DAO'
        }
      ],
      javaCode: `
        // Create new request, set it to approved and put to DAO
        ViewPIIRequest piiRequest = new ViewPIIRequest();
        piiRequest.setId(100);
        piiRequest.setCreatedBy(((User) x.get("user")).getId());
        piiRequest.setViewRequestStatus(PIIRequestStatus.APPROVED);
        vprDAO.inX(x).put(piiRequest);
        // Find object from DAO
        FObject daoRequestObject = vprDAO.find(100);
        ArrayList downloadedAt = (ArrayList) daoRequestObject.getProperty("downloadedAt");
        // Simulate a download and get the object again
        PIIReportGenerator prg = new PIIReportGenerator();
        prg.addTimeToPIIRequest(x);
        FObject modifiedDaoRequestObject = vprDAO.find(100);
        ArrayList modifiedDownloadedAt = (ArrayList) modifiedDaoRequestObject.getProperty("downloadedAt");
        // Test that the downloadedAt array is larger than before
        test( downloadedAt.size() < modifiedDownloadedAt.size() , "downloadedAt is modified when a download is triggered" );
      `
    },
    {
      name: 'ViewPIIRequestDAO_EnforcesOnlyValidOneRequestPerUser',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'vprDAO', javaType: 'foam.dao.DAO'
        }
      ],
      javaCode: `
        // Create a request and put to the DAO, get a count of objects in the DAO
        ViewPIIRequest piiRequest = new ViewPIIRequest();
        piiRequest.setCreatedBy(INPUT.getId());
        vprDAO.inX(x).put(piiRequest);
        Count count = (Count) vprDAO.select(new Count());
        // Create another request and put to the DAO, get an updated count
        ViewPIIRequest newPiiRequest = new ViewPIIRequest();
        newPiiRequest.setCreatedBy(INPUT.getId());
        vprDAO.inX(x).put(newPiiRequest);
        Count updatedCount = (Count) vprDAO.select(new Count());
        // Assert that the second request was not actually put to the DAO
        test( updatedCount.equals(count), "User cannot have more than one active request in the system at a time" );
      `
    }
  ]
});

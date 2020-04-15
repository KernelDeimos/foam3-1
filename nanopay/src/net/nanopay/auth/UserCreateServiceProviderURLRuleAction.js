/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'UserCreateServiceProviderURLRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Set ServiceProvider on User Create based on AppConfig URL',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.net.URL',
    'java.net.MalformedURLException',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        final ServiceProviderURL spu_ = new ServiceProviderURL();

        UserCreateServiceProviderURLRule myRule = (UserCreateServiceProviderURLRule) rule;
        if ( myRule.getConfig() == null ||
             myRule.getConfig().length == 0 ) {
          return;
        }

        AppConfig app = (AppConfig) x.get("appConfig");
        URL url = null;
        try {
          url = new URL(app.getUrl());
        } catch ( MalformedURLException e ) {
          throw new RuntimeException(e);
        }

        String host = url.getHost();
        outerLoop:
        for ( ServiceProviderURL spu : myRule.getConfig() ) {
          for ( String u : spu.getUrls() ) {
            if ( u.equals(host) ) {
              spu_.setSpid(spu.getSpid());
              break outerLoop;
            }
          }
        }
        if ( SafetyUtil.isEmpty(spu_.getSpid()) ) {
          return;
        }

        User user = (User) obj;
        user.setSpid(spu_.getSpid());
      `
    }
  ]
});

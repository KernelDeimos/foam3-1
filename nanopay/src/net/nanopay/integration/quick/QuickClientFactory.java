package net.nanopay.integration.quick;

import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.config.Environment;
import com.intuit.oauth2.config.OAuth2Config;
import com.intuit.oauth2.config.Scope;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;

import java.util.ArrayList;
import java.util.List;

public class QuickClientFactory {


	OAuth2PlatformClient client;
	OAuth2Config oauth2Config;

	public void init(X x) {
	  /*
    Info:   Creates the urls based on the system you chose
    Input:  x: The context to allow access to services that will store the information obtained when contacting QuickBooks
    */
    User              user         = (User) x.get("user");
    Group             group        = user.findGroup(x);
    AppConfig         app          = group.getAppConfig(x);
    DAO               configDAO    = (DAO) x.get("quickConfigDAO");
    QuickConfig       config       = (QuickConfig) configDAO.find(app.getUrl());
    QuickOauth        auth         = (QuickOauth) x.get("quickAuth");
    DAO               store        = (DAO)  x.get("quickTokenStorageDAO");
    QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());

    // If the user has never tried logging in to Xero before
    if ( tokenStorage == null ) {
      tokenStorage = new QuickTokenStorage();
      tokenStorage.setId(user.getId());
      tokenStorage.setAccessToken(" ");
      tokenStorage.setCsrf(" ");
      tokenStorage.setRealmId(" ");
      tokenStorage.setAppRedirect(" ");
    }
   
    System.out.println(app);
    System.out.println(config);

    // Configures the oauth and gets the correct urls
    oauth2Config = new OAuth2Config.OAuth2ConfigBuilder(config.getClientId(), config.getClientSecret()) //set client id, secret
				.callDiscoveryAPI("sand".equals(config.getPortal())?Environment.SANDBOX:Environment.PRODUCTION) // call discovery API to populate urls
				.buildConfig();
		client  = new OAuth2PlatformClient(oauth2Config);
		auth.setOAuth(client);
    tokenStorage.setCsrf(oauth2Config.generateCSRFToken());
    List<Scope> scopes = new ArrayList<>();
    scopes.add(Scope.Accounting);
    try {
      // Attempts to build the url for the login to QB
      tokenStorage.setAppRedirect(oauth2Config.prepareUrl(scopes, config.getAppRedirect(), tokenStorage.getCsrf()));
    } catch ( Exception e ) {
      e.printStackTrace();
      Logger logger =  (Logger) x.get("logger");
      logger.error(e);
    }
    store.put(tokenStorage);
    x.put("quickAuth",auth);
	}

}

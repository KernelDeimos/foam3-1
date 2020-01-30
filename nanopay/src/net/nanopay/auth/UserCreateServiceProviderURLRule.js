/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'UserCreateServiceProviderURLRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Set ServiceProvider on User Create based on AppConfig URL',

  properties: [
    {
      name: 'config',
      class: 'FObjectArray',
      of: 'net.nanopay.auth.ServiceProviderURL',
      factory: function(){
        return  [];
      },
      javaFactory: 'return new ServiceProviderURL[0];'
    }
  ]
});

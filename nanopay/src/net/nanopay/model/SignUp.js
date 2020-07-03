/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.model',
  name: 'SignUp',
  extends: 'foam.nanos.u2.navigation.SignUp',

  documentation: `Model used for registering/creating an ABLII user.`,

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'acceptanceDocumentService',
    'userCapabilityJunctionDAO'
  ],

  messages: [
    { name: 'DISCLAIMER', message: '*Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' }
  ],

  properties: [
    {
      class: 'Password',
      name: 'desiredPassword',
      label: 'Password',
      view: {
        class: 'net.nanopay.ui.NewPasswordView',
        passwordIcon: true
      },
      minLength: 6
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'acceptanceDoc',
      docName: 'NanopayTermsAndConditions',
      label: '',
      validationPredicates: [
        {
          args: ['acceptanceDoc'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.model.SignUp.ACCEPTANCE_DOC, 0);
          },
          errorString: 'Please agree to proceed.'
        }
      ]
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'acceptanceDoc2',
      docName: 'privacyPolicy',
      label: '',
      validationPredicates: [
        {
          args: ['acceptanceDoc2'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.model.SignUp.ACCEPTANCE_DOC2, 0);
          },
          errorString: 'Please agree to proceed.'
        }
      ]
    },
    {
      class: 'String',
      name: 'group_',
      documentation: 'No group choice in Ablii - always sme',
      value: 'sme',
      hidden: true,
      required: false
    },
    {
      name: 'backLink_',
      value: 'https://www.ablii.com',
      hidden: true
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        // arrayOfProperties is to arrange the properties in the view.
        // extending foam SignUp sets the acceptanceDocuments at the top, thus rearranging here
        var arrayOfProperties = this.cls_.getAxiomsByClass(foam.core.Property);
        arrayOfProperties.push(arrayOfProperties.shift());
        arrayOfProperties.push(arrayOfProperties.shift());
        arrayOfProperties.push(arrayOfProperties.shift());

        this.LOGIN.label = 'Create account';
      }
    },
    {
      name: 'updateUser',
      documentation: 'update user accepted terms and condition here. Need to login because we need CreatedByDAO',
      code: function(x) {
        let userId = this.user.id;
        let agentId = this.agent && this.agent.id || 0;
        let accDoc = this.acceptanceDoc;
        let accDoc2 = this.acceptanceDoc2;

        if ( accDoc == 0 || accDoc2 == 0 ) {
          console.error('There was a problem accepting the Acceptance Document(s).');
          return;
        }
        this.isLoading_ = true;
        this.auth
          .login(null, this.email, this.desiredPassword)
          .then((user) => {
            this.user.copyFrom(user);
            if ( !! user ) {
              Promise.all([
                this.acceptanceDocumentService.
                  updateUserAcceptanceDocument(x, agentId, userId, accDoc, (accDoc != 0)),
                this.acceptanceDocumentService.
                  updateUserAcceptanceDocument(x, agentId, userId, accDoc2, (accDoc2 != 0))
              ])
              .finally(() => {
                this.finalRedirectionCall();
                this.isLoading_ = false;
              });
            }
          })
          .catch((err) => {
            this.notify(err.message || 'There was a problem while signing you in.', '', this.LogLevel.ERROR, true);
          });
      }
    }
  ]
});

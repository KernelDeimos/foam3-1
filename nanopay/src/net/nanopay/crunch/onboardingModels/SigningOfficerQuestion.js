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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SigningOfficerQuestion',

  implements: [ 
    'foam.core.Validatable'
  ],

  sections: [
    {
      name: 'signingOfficerQuestionSection',
      title: 'Are you considered a signing officer at the company?'
    },
    {
      name: 'signingOfficerEmailSection',
      title: 'Enter the signing officer\'s email',
      isAvailable: function( isSigningOfficer ) { return ! isSigningOfficer }
    }
  ],

  messages: [
    { name: 'SIGNING_OFFICER_EMAIL_ERROR', message: 'Please provide an email for the signing officer.' },
    { name: 'ADMIN_FIRST_NAME_ERROR', message: 'Please enter first name with least 1 character.' },
    { name: 'ADMIN_LAST_NAME_ERROR', message: 'Please enter last name with least 1 character.' },
    { name: 'NO_JOB_TITLE_ERROR', message: 'Please select job title.' },
    { name: 'INVALID_PHONE_NUMBER_ERROR', message: 'Invalid phone number.' }
  ],

  properties: [
    // Signing Officer Question Section
    {
      section: 'signingOfficerQuestionSection',
      name: 'isSigningOfficer',
      class: 'Boolean',
      help: `A signing officer is a person legally authorized to act on behalf of the business (e.g CEO, COO, board director)`,
      documentation: `A signing officer is a person legally authorized to act on behalf of the business (e.g CEO, COO, board director)`,
      label: '',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes, I am a signing officer'],
          [false, 'No, I am not']
        ]
      }
    },

    // Signing Officer Email
    {
      section: 'signingOfficerEmailSection',
      name: 'signingOfficerEmail',
      class: 'String',
      label: 'Enter your signing officer\'s email',
      documentation: 'Business signing officer emails. To be sent invitations to join platform.',
      placeholder: 'example@email.com',
      validationPredicates: [
        {
          args: ['isSigningOfficer', 'signingOfficerEmail'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.SIGNING_OFFICER_EMAIL, /.+@.+/);
          },
          errorMessage: 'SIGNING_OFFICER_EMAIL_ERROR'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( getIsSigningOfficer() ) return;

        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});
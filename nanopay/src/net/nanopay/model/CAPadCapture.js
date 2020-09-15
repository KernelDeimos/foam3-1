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
  name: 'CAPadCapture',
  documentation: 'Captures the event when a CA bank has been PAD authorizated.',
  extends: 'net.nanopay.model.PadCapture',

  javaImports: ['java.util.Date'],

  requires: [
    'foam.nanos.auth.Address',
  ],

  messages: [
    { name: 'INVALID_ACCOUNT_NUMBER', message: 'Invalid account number.' },
    { name: 'INVALID_INSTITUTION_NUMBER', message: 'Invalid institution number.' },
    { name: 'INVALID_TRANSIT_NUMBER', message: 'Invalid transit number.' }
  ],

  properties: [
    // Required for correct property order rendering. TODO: apply orders on subclassed instances.
    // in sectionViews
    'firstName',
    'lastName',
    'companyName',
    'address',
    {
      class: 'String',
      name: 'branchId',
      label: 'Transit No.',
      documentation: 'Transit/Branch associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 4,
      validateObj: function(branchId) {
        var transNumRegex = /^[0-9]{5}$/;

        if ( ! transNumRegex.test(branchId) ) {
          return this.INVALID_TRANSIT_NUMBER;
        }
      }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      label: 'Inst No.',
      documentation: 'Institution associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 2,
      validateObj: function(institutionNumber) {
        var instNumRegex = /^[0-9]{3}$/;

        if ( ! instNumRegex.test(institutionNumber) ) {
          return this.INVALID_INSTITUTION_NUMBER;
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
      documentation: 'Account associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 6,
      tableCellFormatter: function(str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length));
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{5,12}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return this.INVALID_ACCOUNT_NUMBER;
        }
      }
    },
    {
      name: 'capableRequirements',
      factory: () => {
        return [
          '554af38a-8225-87c8-dfdf-eeb15f71215e-13', // Certify Bank Account Ownership Agreement
          '554af38a-8225-87c8-dfdf-eeb15f71215e-20', // CA Bank Account Auth Agreement
          '554af38a-8225-87c8-dfdf-eeb15f71215e-21', // Recourse/Reimbursement Agreement
          '554af38a-8225-87c8-dfdf-eeb15f71215e-22'  // CA Cancellation Agreement
        ];
      }
    },
    {
      name: 'capablePayloads',
      visibility: 'HIDDEN',
    },
    {
      name: 'userCapabilityRequirements',
      visibility: 'HIDDEN'
    }
  ]
});

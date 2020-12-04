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
  package: 'net.nanopay.bank',
  name: 'LVBankAccount',
  label: 'Latvia Bank',
  extends: 'net.nanopay.bank.EUBankAccount',

  documentation: 'Latvian bank account information.',

  properties: [
    {
      name: 'country',
      value: 'LV',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/latvia.svg',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      section: 'accountInformation',
      gridColumns: 12,
      value: 'EUR',
    },
    {
      name: 'institutionNumber',
      updateVisibility: 'RO',
      validateObj: function(institutionNumber) {
        var regex = /^[A-z0-9a-z]{4}$/;

        if ( institutionNumber === '' ) {
          return this.INSTITUTION_NUMBER_REQUIRED;
        } else if ( ! regex.test(institutionNumber) ) {
          return this.INSTITUTION_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'accountNumber',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str) {
        if ( ! str ) return;
        var displayAccountNumber = '***' + str.substring(str.length - 4, str.length)
        this.start()
          .add(displayAccountNumber);
        this.tooltip = displayAccountNumber;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{13}$/;

        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    }
  ]
});

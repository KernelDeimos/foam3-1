foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BankAccount',

  documentation: 'Bank account information.',

  tableColumns: ['accountName', 'institutionNumber', 'transitNumber', 'accountNumber', 'status', 'actionsMenu'],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'accountName',
      label: 'Account Name',
      validateObj: function (accountName) {
        if ( accountName.length > 70 ) {
          return 'Account name cannot exceed 70 characters.';
        }
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institutionId',
      label: 'Institution'
    },
    {
      // TODO: deprecate and replace with institutionId
      class: 'String',
      name: 'institutionNumber',
      label: 'Institution No.',
      validateObj: function (institutionNumber) {
        var instNumRegex = /^[0-9]{3}$/;

        if ( ! instNumRegex.test(institutionNumber) ) {
          return 'Invalid institution number.';
        }
      }
    },
    {
      class: 'String',
      name: 'transitNumber',
      label: 'Transit No.',
      validateObj: function (transitNumber) {
        var transNumRegex = /^[0-9]{5}$/;

        if ( ! transNumRegex.test(transitNumber) ) {
          return 'Invalid transit number.';
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
      tableCellFormatter: function (str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length))
      },
      validateObj: function (accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.model.BankAccountStatus',
      name: 'status',
      tableCellFormatter: function (a) {
        var colour = ( a === net.nanopay.model.BankAccountStatus.VERIFIED ) ? '#2cab70' : '#f33d3d';
        this.start()
          .add(a.label)
          .style({
            'color': colour,
            'text-transform': 'capitalize'
          })
        .end();
      }
    },
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'currencyCode'
    },
    // Handled via Relationship
    // {
    //   class: 'Reference',
    //   of: 'net.nanopay.model.Branch',
    //   name: 'branchId'
    // },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'setAsDefault',
      value: false
    }
  ],

  actions: [
    {
      name: 'run',
      icon: 'images/ic-options-hover.svg',
      code: function () {
        foam.nanos.menu.SubMenuView.create({menu: foam.nanos.menu.Menu.create({id: 'accountSettings'})});
      }
    }
  ]
});

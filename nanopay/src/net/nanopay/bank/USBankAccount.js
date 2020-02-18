foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'USBankAccount',
  label: 'United States',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.util.SafetyUtil',
    'net.nanopay.model.Branch',
    'java.util.regex.Pattern'
  ],

  documentation: 'US Bank account information.',

  constants: [
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{9}$")'
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{6,17}$")'
    }
  ],

  properties: [
    {
      name: 'country',
      value: 'US',
      createVisibility: 'HIDDEN'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/us.png',
      createVisibility: 'HIDDEN'
    },
    {
      name: 'denomination',
      value: 'USD'
    },
    {
      name: 'desc',
    },
    { // REVIEW: remove
      class: 'String',
      name: 'institutionNumber',
      hidden: true
    },
    {
      name: 'voidChequeImage',
      class: 'String',
      label: '',
      value: 'images/USA-Check.png',
      section: 'accountDetails',
      visibility: 'RO',
      transient: true,
      view: function(_, X) {
        return {
          class: 'foam.u2.tag.Image'
        };
      }
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'voidCheckImage',
      documentation: 'void check image for this bank account',
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'supportingDocuments',
      documentation: 'Supporting documents to verify bank account',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView' }
    },
    {
      name: 'branchId',
      label: 'ACH Routing Number',
      section: 'accountDetails',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '123456789',
        maxLength: 9,
        onKey: true
      },
      gridColumns: 6,
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      validateObj: function(branchId) {
        var accNumberRegex = /^[0-9]{9}$/;

        if ( branchId === '' ) {
          return 'Routing number required.';
        } else if ( ! accNumberRegex.test(branchId) ) {
          return 'Invalid routing number.';
        }
      }
    },
    {
      name: 'accountNumber',
      label: 'ACH Account Number',
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{6,17}$/;

        if ( accountNumber === '' ) {
          return 'Please enter an account number.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Account number must be between 6 and 17 digits long.';
        }
      },
      gridColumns: 6
    },
    // {
    //   name: 'branch',
    //   //visibility: 'HIDDEN'
    //   label: 'Routing No.',
    // },
    // {
    //   name: 'institution',
    //   visibility: 'HIDDEN'
    // },
    // {
    //   name: 'institutionNumber',
    //   visibility: 'HIDDEN',
    //   value: 'US0000000'
    // },
    {
      //REVIEW: Set by Plaid, not read
      class: 'String',
      name: 'wireRouting',
      documentation: 'The ACH wire routing number for the account, if available.',
      section: 'accountDetails',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'summary',
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table
        views of BankAccounts.
      `,
      tableCellFormatter: function(_, obj) {
        this.start()
          .add(obj.slot((branch, branchDAO) => {
            return branchDAO.find(branch).then((result) => {
              if ( result ) {
                return this.E()
                  .start('span').style({ 'font-weight': '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('branch').label}`).end()
                  .start('span').add(` ${result.branchId} |`).end();
              }
            });
          }))
        .end()

        .start()
          .add(obj.slot((accountNumber) => {
              if ( accountNumber ) {
                return this.E()
                  .start('span').style({ 'font-weight' : '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('accountNumber').label} `).end()
                  .start('span').add(`*** ${accountNumber.substring(accountNumber.length - 4, accountNumber.length)}`).end();
              }
          }))
        .end();
      }
    }
  ],
  
  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        super.validate(x);
        String branchId = this.getBranchId();
        String accountNumber = this.getAccountNumber();
        
        if ( SafetyUtil.isEmpty(branchId) ) {
          throw new IllegalStateException("Please enter a routing number.");
        }
        if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
          throw new IllegalStateException("Routing number must be 9 digits long.");
        }

        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new IllegalStateException("Please enter an account number.");
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new IllegalStateException("Account number must be between 6 and 17 digits long.");
        }
      `
    },
    {
      name: 'getBankCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return "";
      `
    },
    {
      name: 'getRoutingCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return getBranchId();
      `
    },
 ]
});

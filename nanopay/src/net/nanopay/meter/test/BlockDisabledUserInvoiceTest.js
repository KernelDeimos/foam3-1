foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'BlockDisabledUserInvoiceTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.test.TestUtils',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.invoice.model.Invoice',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x_ = x;
        setUp();
        BlockDisabledUserInvoiceTest_when_payer_is_disabled();
        BlockDisabledUserInvoiceTest_when_payee_is_disabled();
      `
    },
    {
      name: 'setUp',
      javaCode: `
        // DAOs
        userDAO_ = (DAO) x_.get("localUserDAO");
        accountDAO_ = (DAO) x_.get("localAccountDAO");
        invoiceDAO_ = (DAO) x_.get("invoiceDAO");
      `
    },
    {
      name: 'setUserEnabled',
      javaReturns: 'User',
      args: [
        { of: 'String', name: 'email' },
        { of: 'boolean', name: 'enabled' }
      ],
      javaCode: `
        User user = (User) userDAO_.find(MLang.EQ(User.EMAIL, email));
        if ( user == null ) {
          user = new User.Builder(x_)
            .setEmail(email)
            .setEmailVerified(true).build();
        } else {
          user = (User) user.fclone();
        }
        user.setEnabled(enabled);
        return (User) userDAO_.put(user).fclone();
      `
    },
    {
      name: 'findOrCreateBankAccount',
      javaReturns: 'CABankAccount',
      args: [
        { of: 'User', name: 'user' }
      ],
      javaCode: `
        CABankAccount bankAccount = (CABankAccount) accountDAO_.find(
          MLang.AND(
            MLang.EQ(CABankAccount.OWNER, user.getId()),
            MLang.INSTANCE_OF(CABankAccount.class)));
        if ( bankAccount == null ) {
          bankAccount = new CABankAccount.Builder(x_)
            .setAccountNumber("2131412443534534")
            .setOwner(user.getId()).build();
        } else {
          bankAccount = (CABankAccount) bankAccount.fclone();
        }
        bankAccount.setStatus(BankAccountStatus.VERIFIED);
        return (CABankAccount) accountDAO_.put(bankAccount).fclone();
      `
    },
    {
      name: 'buildInvoice',
      javaReturns: 'Invoice',
      args: [
        { of: 'User', name: 'payer' },
        { of: 'User', name: 'payee' }
      ],
      javaCode: `
        return new Invoice.Builder(x_)
          .setPayerId(payer.getId())
          .setPayeeId(payee.getId())
          .setAccount(findOrCreateBankAccount(payer).getId())
          .setSourceCurrency("CAD")
          .setDestinationCurrency("CAD")
          .setAmount(100l).build();
      `
    },
    {
      name: 'BlockDisabledUserInvoiceTest_when_payer_is_disabled',
      javaCode: `
        User disabledUser = setUserEnabled("disabled_user@nanopay.net", false);
        User payee = setUserEnabled("test_user@nanopay.net", true);
        Invoice invoice = buildInvoice(disabledUser, payee);

        test(
          TestUtils.testThrows(
            () -> invoiceDAO_.put(invoice),
            "Payer is disabled.",
            RuntimeException.class
          ),
          "Create invoice with disabled payer user throws RuntimeException"
        );
      `
    },
    {
      name: 'BlockDisabledUserInvoiceTest_when_payee_is_disabled',
      javaCode: `
        User disabledUser = setUserEnabled("disabled_user@nanopay.net", false);
        User payer = setUserEnabled("test_user@nanopay.net", true);
        Invoice invoice = buildInvoice(payer, disabledUser);

        test(
          TestUtils.testThrows(
            () -> invoiceDAO_.put(invoice),
            "Payee is disabled.",
            RuntimeException.class
          ),
          "Create invoice with disabled payee user throws RuntimeException"
        );
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          private foam.core.X x_;
          private foam.dao.DAO userDAO_;
          private foam.dao.DAO accountDAO_;
          private foam.dao.DAO invoiceDAO_;
        `);
      }
    }
  ]
});

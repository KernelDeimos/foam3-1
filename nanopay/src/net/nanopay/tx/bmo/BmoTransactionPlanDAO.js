foam.CLASS({
  package: 'net.nanopay.tx.bmo',
  name: 'BmoTransactionPlanDAO',
  extends: 'net.nanopay.tx.cico.CABankTransactionPlanDAO',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'net.nanopay.payment.PaymentProvider',
    'net.nanopay.tx.alterna.*',
    'net.nanopay.tx.bmo.cico.*',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList',
    'java.util.List'
  ],

  constants: [
    {
      name: 'PROVIDER_ID',
      type: 'String',
      value: 'BMO'
    },
    {
      name: 'institutionNumber',
      type: 'String',
      value: '001'
    },
  ],
  
  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    
    if ( ! this.getEnabled() ) {
      return getDelegate().put_(x, obj);
    }
        
    Logger logger = (Logger) x.get("logger");
    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = (Transaction) quote.getRequestTransaction();
    
    if ( request instanceof BmoVerificationTransaction ) {
        request.setIsQuoted(true);
        quote.addPlan(request);
        return quote;
      } else if ( request instanceof VerificationTransaction ) {
        return getDelegate().put_(x, obj);
      }

    Account sourceAccount = quote.getSourceAccount();
    Account destinationAccount = quote.getDestinationAccount();

    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount ) {
      
      if ( ! usePaymentProvider(x, PROVIDER_ID, (BankAccount) sourceAccount, true /* default */ ) ) return this.getDelegate().put_(x, obj);

      if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) {
        logger.warning("Bank account needs to be verified for cashin for bank account id: " + sourceAccount.getId() +
              " and transaction id: " + request.getId());
        throw new RuntimeException("Bank account needs to be verified for cashin");
      };

      BmoCITransaction t = new BmoCITransaction.Builder(x).build();
      t.copyFrom(request);
      t.setInstitutionNumber(institutionNumber);
      t.setTransfers(createCITransfers(t, institutionNumber));

      // TODO: use EFT calculation process
      t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    } else if ( sourceAccount instanceof DigitalAccount &&
                destinationAccount instanceof CABankAccount &&
                sourceAccount.getOwner() == destinationAccount.getOwner() ) {

      if ( ! usePaymentProvider(x, PROVIDER_ID, (BankAccount) destinationAccount, true /* default */) ) return this.getDelegate().put_(x, obj);

      if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) { 
        logger.warning("Bank account needs to be verified for cashout for bank account id: " + sourceAccount.getId() +
              " and transaction id: " + request.getId());
        throw new RuntimeException("Bank account needs to be verified for cashout"); 
      }

      BmoCOTransaction t = new BmoCOTransaction.Builder(x).build();
      t.copyFrom(request);
      t.setInstitutionNumber(institutionNumber);
      t.setTransfers(createCOTransfers(t, institutionNumber));
      // TODO: use EFT calculation process - ClearingTimeService
      t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    }

    return getDelegate().put_(x, quote);
    `
    }
  ]
});

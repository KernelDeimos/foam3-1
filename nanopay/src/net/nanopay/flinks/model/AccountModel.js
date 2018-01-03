foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountModel',

  documentation: 'model for Flinks account model',

  imports: [ 'bankAccountDAO' ],
  
  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.model.BankAccount',
    'java.util.Random'
  ],

  properties: [
    {
      class: 'String',
      name: 'Title'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    },
    {
      class: 'String',
      name: 'Category'
    },
    {
      class: 'String',
      name: 'Currency'
    },
    {
      class: 'String',
      name: 'Id'
    },
    //maybe dangerous if property=null or property={}
    {
      // javaType: 'net.nanopay.flinks.model.BalanceModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.BalanceModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.BalanceModel',
      name: 'Balance'
    }
  ],

  methods: [
    {
      name: 'generateBankAccount',
      javaReturns: 'net.nanopay.model.BankAccount',
      javaCode:
`DAO bankAccountDAO = (DAO) getX().get("bankAccountDAO");
BankAccount account = new BankAccount();
Random rand = new Random();
account.setId(rand.nextLong());
account.setX(getX());
account.setAccountNumber(getAccountNumber());
account.setCurrencyCode(getCurrency());
account.setAccountName(getTitle());
try {
  bankAccountDAO.put(account);
} catch ( Throwable t ) {
  System.out.println("bank account same name");
}
return account;
`
    }
  ]
});
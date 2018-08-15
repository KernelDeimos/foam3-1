package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.*;
import foam.mlang.sink.Count;
import net.nanopay.bank.BankAccount;

/**
 * This DAO prevents the adding of duplicate bank accounts
 * based on the account owner, account number, branch,
 * and instition number
 */
public class PreventDuplicateBankAccountDAO
    extends ProxyDAO
{
  public PreventDuplicateBankAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof BankAccount ) ) {
      return getDelegate().put_(x, obj);
    }

    BankAccount account = (BankAccount) obj;

    // if new account, check to see if existing account exists
    // with same account information
    if ( getDelegate().find(account.getId()) == null ) {
      Count count = new Count();

      // prevent registration of account with same account name
      count = (Count) getDelegate().where(AND(
        INSTANCE_OF(BankAccount.class),
          EQ(BankAccount.OWNER, account.getOwner()),
          EQ(BankAccount.NAME, account.getName())
      )).limit(1).select(count);
      if ( count.getValue() > 0 ) {
        throw new RuntimeException("Bank account with same name already registered");
      }

      // prevent registration of account with same account details
      count = new Count();
      // REVIEW: AccountRefactor - switched TRANSIT_NUMBER to BRANCH and
      // INSTITUTION_ID to INSTITUION
      count = (Count) getDelegate()
        .where(
               AND(
                   INSTANCE_OF(BankAccount.class),
                   EQ(BankAccount.OWNER, account.getOwner()),
                   EQ(BankAccount.ACCOUNT_NUMBER, account.getAccountNumber()),
                   EQ(BankAccount.BRANCH, account.getBranch()),
                   EQ(BankAccount.INSTITUTION, account.getInstitution())
                   )
               )
        .limit(1)
        .select(count);
      if ( count.getValue() > 0 ) {
        throw new RuntimeException("Bank account with same details already registered");
      }
    }

    return super.put_(x, obj);
  }
}

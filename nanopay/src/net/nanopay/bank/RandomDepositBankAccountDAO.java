package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.tx.alterna.AlternaVerificationTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.cico.VerificationTransaction;

public class RandomDepositBankAccountDAO
  extends ProxyDAO
{
  //TODO: Delete this class and enable "VerifyBankRule" after planner rewrite merge.
  protected DAO transactionDAO_;
  protected DAO transactionQuotePlanDAO_;

  private boolean useBMO;

  public RandomDepositBankAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);

    this.setUseBMO(true);
  }

  public DAO getTransactionDAO() {
    if ( transactionDAO_ == null ) {
      transactionDAO_ = (DAO) getX().get("localTransactionDAO");
    }
    return transactionDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof CABankAccount ) ) {
      return super.put_(x, obj);
    }

    if ( getDelegate().find_(x, obj) != null ) {
      return super.put_(x, obj);
    }

    BankAccount account = (BankAccount) obj;
    boolean newAccount = ( getDelegate().find(account.getId()) == null );

    // if new account and status is unverified make micro deposit

    // TODO: prevent a user from submitting their own status
    // generate random deposit amount and set in bank account model
    if ( newAccount && BankAccountStatus.UNVERIFIED.equals(account.getStatus()) ) {
      long randomDepositAmount = (long) (1 + Math.floor(Math.random() * 99));
      account.setRandomDepositAmount(randomDepositAmount);
      super.put_(x, account);
      User user = (User) x.get("user");

      // create new transaction and store
      VerificationTransaction transaction = null;
      if ( this.isUseBMO() ) {
        transaction = new BmoVerificationTransaction();
      } else {
        transaction = new AlternaVerificationTransaction();
      }

      transaction.setPayerId(user.getId());
      transaction.setDestinationAccount(account.getId());
      transaction.setAmount(randomDepositAmount);
      transaction.setSourceCurrency(account.getDenomination());

      getTransactionDAO().put_(x, transaction);
    }

    return super.put_(x, account);
  }

  public boolean isUseBMO() {
    return useBMO;
  }

  public void setUseBMO(boolean useBMO) {
    this.useBMO = useBMO;
  }
}

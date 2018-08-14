package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.model.Transaction;

public class RandomDepositBankAccountDAO
  extends ProxyDAO
{
  protected DAO transactionDAO_;

  public RandomDepositBankAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  public DAO getTransactionDAO() {
    if ( transactionDAO_ == null ) {
      transactionDAO_ = (DAO) getX().get("transactionDAO");
    }
    return transactionDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof BankAccount ) ) {
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

    long randomDepositAmount = (long) (1 + Math.floor(Math.random() * 99));
    account.setRandomDepositAmount(randomDepositAmount);

    FObject ret = super.put_(x, account);
    if ( newAccount && BankAccountStatus.UNVERIFIED.equals(account.getStatus()) ) {
      User user = (User) x.get("user");

      // create new transaction and store
      Transaction transaction = new Transaction.Builder(x)
        .setDestinationAccount(account.getId())
        .setPayerId(user.getId())
        .setAmount(randomDepositAmount)
        .setType(TransactionType.VERIFICATION)
        .setStatus(TransactionStatus.PENDING)
        .setSourceCurrency(account.getDenomination())
        .build();
      getTransactionDAO().put_(x,transaction);
    }

    return ret;
  }
}

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

    BankAccount account = (BankAccount) obj;
    boolean newAccount = ( getDelegate().find(account.getId()) == null );

    // if new account and status is unverified make micro deposit
    // TODO: prevent a user from submitting their own status
    if ( newAccount && BankAccountStatus.UNVERIFIED.equals(account.getStatus()) ) {
      User user = (User) x.get("user");

      // generate random deposit amount and set in bank account model
      long randomDepositAmount = (long) (1 + Math.floor(Math.random() * 99));
      account.setRandomDepositAmount(randomDepositAmount);

      // create new transaction and store
      Transaction transaction = new Transaction.Builder(x)
        .setPayeeId(user.getId())
        .setPayerId(user.getId())
        .setBankAccountId(account.getId())
        .setAmount(randomDepositAmount)
        .setType(TransactionType.VERIFICATION)
        .setStatus(TransactionStatus.PENDING)
        .build();
      getTransactionDAO().put(transaction);
    }

    return super.put_(x, account);
  }
}

package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.model.BankAccountStatus;
import net.nanopay.tx.model.CashOutFrequency;
import net.nanopay.tx.model.LiquiditySettings;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.List;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/*
    Cronjob checks Liquidity Settings.
    Does cash in/out depending on user/group Liquidity Settings setup
 */
public class LiquiditySettingsCheckCron implements ContextAgent {
  protected long             amount_;
  protected TransactionType  type_;
  protected CashOutFrequency frequency_;
  protected int pendingCashinAmount;

  public LiquiditySettingsCheckCron(CashOutFrequency frequency){
    this.frequency_ = frequency;
  }

  @Override
  public void execute(X x) {
    long bankId;
    DAO  userDAO_             = (DAO) x.get("localUserDAO");
    DAO  accountDAO_          = (DAO) x.get("localAccountDAO");
    DAO  bankAccountDAO_      = (DAO) x.get("localBankAccountDAO");
    DAO  liquiditySettingsDAO = (DAO) x.get("liquiditySettingsDAO");
    DAO  groupDAO             = (DAO) x.get("groupDAO");
    DAO transactionDAO_       = (DAO) x.get("localTransactionDAO");
    List users                = ((ArraySink)userDAO_.select(new ArraySink())).getArray();
    long balance;

    for ( int i = 0 ; i < users.size() ; i++ ) {
      User    user = (User) users.get(i);
      Account acc  = (Account) accountDAO_.find(((User) users.get(i)).getId());
      //DAO banks = user.getBankAccounts();
      BankAccount bank = (BankAccount) bankAccountDAO_.find(AND(
              EQ(BankAccount.OWNER, user.getId()),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
              )
      );

      if ( bank != null && acc != null ){
        balance = acc.getBalance();
        bankId = bank.getId();
      } else continue;

      LiquiditySettings ls = (LiquiditySettings) liquiditySettingsDAO.find(user.getId());

      List transactions = ((ArraySink) transactionDAO_.where(AND(
        EQ(Transaction.STATUS, TransactionStatus.PENDING),
        EQ(Transaction.TYPE, TransactionType.CASHIN),
        EQ(Transaction.PAYEE_ID, user.getId()),
        EQ(Transaction.PAYER_ID, user.getId())
      )).select(new ArraySink())).getArray();
      pendingCashinAmount = 0;
      for ( Object transaction: transactions) {
        pendingCashinAmount += ((Transaction) transaction).getAmount();
      }

      if ( ls != null  ) {
        if ( ls.getBankAccountId() > 0 && bankAccountDAO_.find(ls.getBankAccountId()) != null ) {
          if ( ((BankAccount) bankAccountDAO_.find(ls.getBankAccountId())).getStatus() == BankAccountStatus.VERIFIED )
          bankId = ls.getBankAccountId();
        }
        if( checkBalance(ls, balance) && (ls.getCashOutFrequency() == frequency_ || ls.getCashOutFrequency() == CashOutFrequency.PER_TRANSACTION) ){
          addTransaction(x, user.getId(), bankId);
        }
      } else{
        Group group = (Group) groupDAO.find(user.getGroup());
        ls = group.getLiquiditySettings();
        if( checkBalance(ls, balance) && (ls.getCashOutFrequency() == frequency_ || ls.getCashOutFrequency() == CashOutFrequency.PER_TRANSACTION) ){
          addTransaction(x, user.getId(), bankId);
        }
      }
    }
  }

  public boolean checkBalance(LiquiditySettings ls, long balance){
    if ( balance > ls.getMaximumBalance() && ls.getEnableCashOut() ) {
      amount_ = balance - ls.getMaximumBalance();
      type_ = TransactionType.CASHOUT;
      return true;
    }

    if ( balance + pendingCashinAmount < ls.getMinimumBalance() && ls.getEnableCashIn() ) {
      amount_ = ls.getMinimumBalance() - balance - pendingCashinAmount;
      type_ = TransactionType.CASHIN;
      return true;
    }

    return false;
  }

  public void addTransaction(X x, long userId, long bankId){
    Transaction transaction = new Transaction.Builder(x)
            .setPayeeId(userId)
            .setPayerId(userId)
            .setAmount(amount_)
            .setType(type_)
            .setBankAccountId(bankId)
            .build();
    DAO txnDAO = (DAO) x.get("transactionDAO");
    txnDAO.put_(x, transaction);
  }
}

package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.LiquiditySettings;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class TransactionDAOTest
  extends foam.nanos.test.Test
{
  User sender_, receiver_;
  X x_;
  CABankAccount senderBankAccount_;
  DAO txnDAO;
  public void runTest(X x) {
    txnDAO = (DAO) x.get("localTransactionDAO");
    // x = TestUtils.mockDAO(x, "localTransactionDAO");
    //x = TestUtils.mockDAO(x, "localAccountDAO");
    //x = addUsers(x);
    x_ = x;
    testEmailVerified();
    testNoneTxn();
    testCashIn();
    testCashOut();
  }

  public X addUsers() {
    //x = TestUtils.mockDAO(x, "localUserDAO");

    sender_ = (User) ((DAO)x_.get("localUserDAO")).find(EQ(User.EMAIL,"testuser1@nanopay.net" ));
    if ( sender_ == null ) {
      sender_ = new User();
      sender_.setEmail("testUser1@nanopay.net");
    }
    LiquiditySettings ls = new LiquiditySettings();
    ls.setId(DigitalAccount.findDefault(x_, sender_, "CAD").getId());
    ls.setEnableCashIn(false);
    ls.setEnableCashOut(false);
    ((DAO)x_.get("liquiditySettingsDAO")).put(ls);
    sender_ = (User) sender_.fclone();
    sender_.setEmailVerified(true);
    sender_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, sender_)).fclone();

    receiver_ = (User) ((DAO)x_.get("localUserDAO")).find(EQ(User.EMAIL,"testuser2@nanopay.net" ));
    if ( receiver_ == null ) {
      receiver_ = new User();
      receiver_.setEmail("testUser2@nanopay.net");
    }
    ls.setId(DigitalAccount.findDefault(x_, receiver_, "CAD").getId());
    ((DAO)x_.get("liquiditySettingsDAO")).put(ls);
    receiver_ = (User) receiver_.fclone();
    receiver_.setEmailVerified(true);
    receiver_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, receiver_)).fclone();

    return x_;
  }


  public void testEmailVerified() {
    addUsers();

    Transaction txn = new Transaction();
    //txn.setId(1);
    txn.setPayerId(sender_.getId());
    txn.setPayeeId(receiver_.getId());
    txn.setAmount(100L);

    receiver_.setEmailVerified(false);

    sender_.setEmailVerified(false);

    sender_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, sender_);
    receiver_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, receiver_);

    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "You must verify email to send money.",
      AuthorizationException.class
      ),
      "Exception: email must be verified");
  }

  public void testNoneTxn() {
    addUsers();
    Transaction txn = new Transaction();

    txn.setPayerId(sender_.getId());
    txn.setPayeeId(receiver_.getId());
    txn.setAmount(0L);


    receiver_.setEmailVerified(true);
    sender_.setEmailVerified(true);

    sender_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, sender_);
    receiver_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, receiver_);


    // Test amount cannot be zero
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Amount cannot be zero",
      RuntimeException.class), "Exception: Txn amount cannot be zero");

    // Test payer user exists
    txn.setAmount(1L);
    txn.setPayerId(3L);
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Payer not found",
      RuntimeException.class), "Exception: Payer user must exist");

    // Test payee user exists
    txn.setAmount(1L);
    txn.setPayerId(sender_.getId());
    txn.setPayeeId(3L);
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Payee not found",
      RuntimeException.class), "Exception: Payee user must exist");


    // Test amount cannot be negative
    txn.setAmount(-1L);
    txn.setPayeeId(receiver_.getId());
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Amount cannot be negative",
      RuntimeException.class), "Exception: Txn amount cannot be negative");


    txn.setAmount((DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_) == null ? 1 : (Long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_))+ 1);
    txn.setPayeeId(receiver_.getId());
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Insufficient balance in account " + DigitalAccount.findDefault(x_, sender_, "CAD"),
      RuntimeException.class), "Exception: Insufficient balance");

    // Test return transactionStatus
    cashIn();
    long initialBalanceSender = DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_) == null ? 0 : (Long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_);
    long initialBalanceReceiver = DigitalAccount.findDefault(x_, receiver_, "CAD").findBalance(x_) == null ? 0 : (Long) DigitalAccount.findDefault(x_, receiver_, "CAD").findBalance(x_);
    Transaction transaction = (Transaction) txnDAO.put_(x_, txn).fclone();
    test(transaction.getStatus() == TransactionStatus.COMPLETED, "transaction is completed");
    test(transaction instanceof DigitalTransaction, "transaction is NONE type");
    test(transaction.findSourceAccount(x_) instanceof DigitalAccount, "Source account is digital Account");
    test(transaction.findDestinationAccount(x_) instanceof DigitalAccount, "Destination account is digital Account");
    test(transaction.findDestinationAccount(x_).getOwner() == receiver_.getId(), "Destination account belongs to receiver");
    test(transaction.findSourceAccount(x_).getOwner() == sender_.getId(), "Source account belongs to receiver");
    Long receiverBalance = (Long) transaction.findDestinationAccount(x_).findBalance(x_);
    Long senderBalance = (Long) transaction.findSourceAccount(x_).findBalance(x_);
    test(senderBalance == initialBalanceSender - transaction.getAmount(), "Sender balance is correct");
    test(receiverBalance == initialBalanceReceiver + transaction.getAmount(), "Receiver balance is correct");

  }

  public void testCashIn() {
    Transaction txn = new Transaction();
    setBankAccount(BankAccountStatus.UNVERIFIED);
    txn.setPayeeId(sender_.getId());
    txn.setSourceAccount(senderBankAccount_.getId());
    txn.setAmount(1l);
    setBankAccount(BankAccountStatus.VERIFIED);
    long senderInitialBalance = (long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_);
    FObject obj = txnDAO.put_(x_, txn);
    FObject x =  obj.fclone();
    Transaction tx = (Transaction) x;
    test(tx instanceof CITransaction, "Transaction type is CASHIN" );
    test(tx.getStatus() == TransactionStatus.PENDING, "CashIn transaction has status pending" );
    test( senderInitialBalance ==  (long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_), "While cash in is pending balance remains the same" );
    tx.setStatus(TransactionStatus.COMPLETED);
    Transaction n = (Transaction) txnDAO.put_(x_, tx);
    tx = (Transaction) n.fclone();
    test(tx.getStatus() == TransactionStatus.COMPLETED, "CashIn transaction has status completed" );
    test( senderInitialBalance + tx.getAmount() ==  (Long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_), "After transaction is completed balance is updated" );
    tx.setStatus(TransactionStatus.DECLINED);
    tx = (Transaction) txnDAO.put_(x_, tx).fclone();
    test(tx.getStatus() == TransactionStatus.REVERSE, "CashIn transaction has status declined" );
    test( senderInitialBalance  ==  (Long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_), "After transaction is declined balance is reverted" );
  }

  public void testCashOut() {Transaction txn = new Transaction();
    setBankAccount(BankAccountStatus.UNVERIFIED);
    txn.setPayerId(sender_.getId());
    txn.setDestinationAccount(senderBankAccount_.getId());
    txn.setAmount(1l);
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Bank account must be verified",
      RuntimeException.class), "Exception: Bank account must be verified");
    setBankAccount(BankAccountStatus.VERIFIED);
    long senderInitialBalance = (long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_);
    Transaction tx = (Transaction) txnDAO.put_(x_, txn).fclone();
    test(tx instanceof COTransaction, "Transaction type is CASHOUT" );
    test(tx.getStatus() == TransactionStatus.PENDING, "CashOUT transaction has status pending" );
    test( senderInitialBalance - tx.getAmount() ==  (long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_), "For cashout transaction balance updated immediately" );
    tx.setStatus(TransactionStatus.COMPLETED);
    txnDAO.put_(x_, tx);
    test(tx.getStatus() == TransactionStatus.COMPLETED, "CashOut transaction has status completed" );
    test( senderInitialBalance - txn.getAmount() ==  (Long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_), "After cashout transaction is completed balance remains the same" );


  }

  public void setBankAccount(BankAccountStatus status) {
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).find(AND(EQ(CABankAccount.OWNER, sender_.getId()), INSTANCE_OF(CABankAccount.class)));
    if ( senderBankAccount_ == null ) {
      senderBankAccount_ = new CABankAccount();
      senderBankAccount_.setAccountNumber("2131412443534534");
      senderBankAccount_.setOwner(sender_.getId());
    } else {
      senderBankAccount_ = (CABankAccount)senderBankAccount_.fclone();
    }
    senderBankAccount_.setStatus(status);
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, senderBankAccount_).fclone();
  }

  public void cashIn() {
    setBankAccount(BankAccountStatus.VERIFIED);
    Transaction txn = new Transaction();
    txn.setAmount(100000L);
    txn.setSourceAccount(senderBankAccount_.getId());
    txn.setPayeeId(sender_.getId());
    txn.setStatus(TransactionStatus.COMPLETED);
    ((DAO) x_.get("localTransactionDAO")).put_(x_, txn);
  }

}


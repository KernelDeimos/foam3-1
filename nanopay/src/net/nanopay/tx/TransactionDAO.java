/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.nanopay.tx;

import java.util.*;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.ReadOnlyDAO;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.account.DebtAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

/**
 * TransactionDAO maintains the memory-only writable BalanceDAO,
 * and performs all put operations.
 * ReadOnly access is provided via getBalanceDAO. see LocalBalanceDAO
 */
public class TransactionDAO
  extends ProxyDAO
{
  protected DAO balanceDAO_;
  protected DAO userDAO_;
  private   DAO writableBalanceDAO_ = initWriteableBalanceDAO_();
  private final DAO initWriteableBalanceDAO_() {
    foam.dao.MDAO d = new foam.dao.MutableMDAO(Balance.getOwnClassInfo());
    d.addIndex(Balance.ACCOUNT);
    return d;
  }

  public TransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public TransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }


  protected DAO getBalanceDAO() {
    if ( balanceDAO_ == null ) {
      balanceDAO_ = new ReadOnlyDAO.Builder(getX()).setDelegate(new foam.dao.FreezingDAO(getX(), writableBalanceDAO_)).build();
    }
    return balanceDAO_;
  }


  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn    = (Transaction) obj;

    if ( SafetyUtil.isEmpty(txn.getId()) || ! txn.getIsQuoted() ) {
      throw new RuntimeException("Transaction must be quoted and have id set.");
    }

    Transaction oldTxn = (Transaction) getDelegate().find_(x, obj);

    if ( canExecute(x, txn, oldTxn) ) {
      txn = (Transaction) executeTransaction(x, txn, oldTxn);
    } else {
      txn = (Transaction) super.put_(x, txn);
    }
    return txn;
  }

  /**
   * return true when status change is such that Transfers should be executed (applied)
   */
  boolean canExecute(X x, Transaction txn, Transaction oldTxn) {
    X y = getX().put("transactionDAO", getDelegate());

    if ( ( ! SafetyUtil.isEmpty(txn.getId()) ||
           txn instanceof DigitalTransaction ) &&
         (txn.getNext() == null || txn.getNext().length == 0 ) &&
         (txn.canTransfer(y, oldTxn)) ) {
      return true;
    }
    // legacy support for REVERSE
    if ( txn instanceof net.nanopay.tx.alterna.AlternaCOTransaction &&
         txn.getStatus() == TransactionStatus.REVERSE &&
         oldTxn != null &&
         oldTxn.getStatus() != TransactionStatus.REVERSE ) {
      return true;
    }
    return false;
  }

  FObject executeTransaction(X x, Transaction txn, Transaction oldTxn) {
    X y = getX().put("balanceDAO",getBalanceDAO());
    Transfer[] ts = txn.createTransfers(y, oldTxn);

        // legacy support for REVERSE
    if ( txn instanceof net.nanopay.tx.alterna.AlternaCOTransaction &&
         txn.getStatus() == TransactionStatus.REVERSE &&
         oldTxn != null &&
         oldTxn.getStatus() != TransactionStatus.REVERSE ) {
      Logger logger = (Logger) x.get("logger");
      logger.warning(this.getClass().getSimpleName(), "executeTransaction", txn.getId(), "adding REVERSE transfers");
      List all = new ArrayList();
      Collections.addAll(all, ts);
      all.add(new Transfer.Builder(x)
              .setDescription("nanopay Alterna Trust Account (CAD) Cash-Out DECLINED")
              .setAccount(1L)
              .setAmount(-txn.getTotal())
              .build());
      all.add(new Transfer.Builder(x)
              .setDescription("Cash-Out DECLINED")
              .setAccount(txn.getSourceAccount())
              .setAmount(txn.getTotal())
              .build());
      ts = (Transfer[]) all.toArray(new Transfer[0]);
    }

    return lockAndExecute(x, txn, ts);
  }

  void validateTransfers(X x, Transaction txn, Transfer[] ts)
    throws RuntimeException
  {
    HashMap hm = new HashMap();
    Logger logger = (Logger) x.get("logger");
    for ( Transfer tr : ts ) {
      tr.validate();
      Account account = tr.findAccount(getX());
      if ( account == null ) {
        logger.error(this.getClass().getSimpleName(), "validateTransfers", txn.getId(), "transfer account not found: " + tr.getAccount(), tr);
        throw new RuntimeException("Unknown account: " + tr.getAccount());
      }
      account.validateAmount(x, (Balance) getBalanceDAO().find(account.getId()), tr.getAmount());
      if ( ! (account instanceof DebtAccount) )
        hm.put(account.getDenomination(), (hm.get(account.getDenomination()) == null ? 0 : (Long) hm.get(account.getDenomination())) + tr.getAmount());
    }

    for ( Object value : hm.values() ) {
      if ( (long)value != 0 ) {
        logger.error(this.getClass().getSimpleName(), "validateTransfers", txn.getId(), "Debits and credits don't match.", value);
        for ( Transfer tr : ts ) {
          logger.error(this.getClass().getSimpleName(), "validateTransfers", txn.getId(), "Transfer", tr);
        }
        throw new RuntimeException("Debits and credits don't match.");
      }
    }
  }

  /** Sorts array of transfers. **/
  FObject lockAndExecute(X x, Transaction txn, Transfer[] ts) {

    // Combine transfers to the same account
    HashMap<Long, Transfer> hm = new HashMap();

    for ( Transfer tr : ts ) {
       if ( hm.get(tr.getAccount()) != null ) {
         tr.setAmount((hm.get(tr.getAccount())).getAmount() + tr.getAmount());
       }
      hm.put(tr.getAccount(), tr);
    }
    Transfer [] newTs = hm.values().toArray(new Transfer[0]);

    //sort the transfer array
    java.util.Arrays.sort(newTs);

    // lock accounts in transfers
    return lockAndExecute_(x, txn, newTs, 0);
  }

  /** Lock each transfer's account then execute the transfers. **/
  FObject lockAndExecute_(X x, Transaction txn, Transfer[] ts, int i) {

    if ( i > ts.length - 1 ) {
      // validate the transfers we have combined.
      validateTransfers(x, txn, ts);

      return execute(x, txn, ts);
    }
    synchronized ( ts[i].getLock() ) {
      return lockAndExecute_(x, txn, ts, i + 1);
    }
  }

  /** Called once all locks are locked. **/
  FObject execute(X x, Transaction txn, Transfer[] ts) {
    Balance [] finalBalanceArr = new Balance[ts.length];
    DAO localAccountDAO = (DAO) x.get("localAccountDAO");
    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      Account account = (Account) localAccountDAO.find(t.getAccount());
      Balance balance = (Balance) writableBalanceDAO_.find(account.getId());
      if ( balance == null ) {
        balance = new Balance();
        balance.setId(account.getId());
        balance = (Balance) writableBalanceDAO_.put(balance);
      }
      finalBalanceArr[i] = balance;
      try {
        account.validateAmount(x, balance, t.getAmount());
      } catch (RuntimeException e) {
        throw e;
      }
    }

    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      t.validate();
      Balance balance = finalBalanceArr[i];
      t.execute(balance);
      finalBalanceArr[i] = (Balance) balance.fclone();
    }
    txn.setBalances(finalBalanceArr);
    return getDelegate().put_(x, txn);
  }

  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    return super.find_(x, o);
  }
}

/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    TransactionDAO maintains the memory-only writable BalanceDAO,
    and performs all put operations.
    ReadOnly access is provided via getBalanceDAO. see LocalBalanceDAO
  `,

  javaImports: [
    'java.util.*',


    'foam.core.X',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.util.SafetyUtil',
    'foam.dao.ReadOnlyDAO',
    'foam.nanos.pm.PM',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  messages: [
    { name: 'TRANS_MISSING_ID_SET_ERROR_MSG', message: 'Transaction must have id set.' },
    { name: 'UNKNOWN_ACCOUNT_ERROR_MSG', message: 'Unknown account: ' },
    { name: 'DEBITS_CREDITS_NOT_MATCH_ERROR_MSG', message: 'Debits and credits don\'t match.' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private DAO balanceDAO_;
          private DAO writableBalanceDAO_ = initWriteableBalanceDAO_();
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
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "put");
      try {
        Transaction txn = (Transaction) obj;

        if ( SafetyUtil.isEmpty(txn.getId()) ) {
          throw new RuntimeException(TRANS_MISSING_ID_SET_ERROR_MSG);
        }

        Transaction oldTxn = (Transaction) getDelegate().find_(x, obj);

        if ( canExecute(x, txn, oldTxn) ) {
          txn = (Transaction) executeTransaction(x, txn);
        } else {
          txn = (Transaction) super.put_(x, txn);
        }
        return txn;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'find_',
      javaCode: `
        return super.find_(x, id);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return null;
      `
    },
    {
      name: 'getBalanceDAO',
      visibility: 'protected',
      type: 'DAO',
      javaCode: `
        if ( balanceDAO_ == null ) {
          balanceDAO_ = new ReadOnlyDAO.Builder(getX()).setDelegate(new foam.dao.FreezingDAO(getX(), writableBalanceDAO_)).build();
        }
        return balanceDAO_;
      `
    },
    {
      name: 'canExecute',
      visibility: '', // passing empty string to make method package scoped
      type: 'boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'txn' },
        { type: 'Transaction', name: 'oldTxn' }
      ],
      documentation: 'return true when status change is such that Transfers should be executed (applied)',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "canExecute");
      try {
        X y = getX().put("transactionDAO", getDelegate());

        if ( ( ! SafetyUtil.isEmpty(txn.getId()) ||
              txn instanceof DigitalTransaction ) &&
            (txn.getNext() == null || txn.getNext().length == 0 ) &&
            (txn.canTransfer(y, oldTxn)) ) {
          return true;
        }
        return false;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'executeTransaction',
      visibility: '', // passing empty string to make method package scoped
      type: 'FObject',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'txn' }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "executeTransaction");
      try {
        // Copy lineItem transfers to transaction (fees + taxes that were added)
        TransactionLineItem [] ls = txn.getLineItems();
        for ( TransactionLineItem li : ls ) {
          if ( li instanceof FeeLineItem && ((FeeLineItem)li).getTransfers() != null ) {
            txn.add(((FeeLineItem)li).getTransfers());
            ((FeeLineItem)li).setTransfers(null);
          }
        }

        Transfer[] ts = txn.getTransfers();
        return lockAndExecute(x, txn, ts);
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'validateTransfers',
      visibility: '', // passing empty string to make method package scoped
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'txn' },
        { type: 'Transfer[]', name: 'ts' }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "validateTransfers");
      try {
        HashMap hm = new HashMap();
        Logger logger = (Logger) x.get("logger");
        for ( Transfer tr : ts ) {
          tr.validate();
          Account account = tr.findAccount(getX());
          if ( account == null ) {
            logger.error(this.getClass().getSimpleName(), "validateTransfers", txn.getId(), "transfer account not found: " + tr.getAccount(), tr);
            throw new RuntimeException(UNKNOWN_ACCOUNT_ERROR_MSG + tr.getAccount());
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
            throw new RuntimeException(DEBITS_CREDITS_NOT_MATCH_ERROR_MSG);
          }
        }
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'lockAndExecute',
      visibility: '', // passing empty string to make method package scoped
      type: 'FObject',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'txn' },
        { type: 'Transfer[]', name: 'ts' }
      ],
      documentation: 'Sorts array of transfers.',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "lockAndExecute");
      try {
        // Combine transfers to the same account
        HashMap<Long, Transfer> hm = new HashMap();

        for ( Transfer tr : ts ) {
          if ( hm.get(tr.getAccount()) != null ) {
            tr.setAmount((hm.get(tr.getAccount())).getAmount() + tr.getAmount());
          }
          hm.put(tr.getAccount(), tr);
        }
        Transfer [] newTs = hm.values().toArray(new Transfer[0]);
        // sort the transfer array
        java.util.Arrays.sort(newTs);
        // persist condensed transfers
        txn.setTransfers(newTs);
        // lock accounts in transfers
        return lockAndExecute_(x, txn, newTs, 0);
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'lockAndExecute_',
      visibility: '', // passing empty string to make method package scoped
      type: 'FObject',
      documentation: 'Lock each transfer\'s account then execute the transfers.',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'txn' },
        { type: 'Transfer[]', name: 'ts' },
        { type: 'int', name: 'i' }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "lockAndExecute_");
      try {
        if ( i > ts.length - 1 ) {
          // validate the transfers we have combined.
          validateTransfers(x, txn, ts);
    
          return execute(x, txn, ts);
        }
        synchronized ( ts[i].getLock() ) {
          return lockAndExecute_(x, txn, ts, i + 1);
        }
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'execute',
      visibility: '', // passing empty string to make method package scoped
      type: 'FObject',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'txn' },
        { type: 'Transfer[]', name: 'ts' }
      ],
      documentation: 'Called once all locks are locked.',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "execute");
      try {
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
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});

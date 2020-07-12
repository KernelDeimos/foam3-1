package net.nanopay.liquidity.tx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import java.util.concurrent.ConcurrentHashMap;
import java.util.*;
import net.nanopay.account.Account;
import net.nanopay.liquidity.crunch.*;

import static foam.mlang.MLang.TRUE;

public class AccountHierarchyService
  implements AccountHierarchy
{
  protected Map<String, Set<Long>> map_;
  public Map<Long, List<Long>> userToViewableRootAccountsMap_;

  public AccountHierarchyService() { }

  @Override
  public List<Account> getViewableRootAccounts(X x, long userId) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    List<Account> ret = new ArrayList<Account>();

    Set<Long> roots = new HashSet<Long>(getViewableRootAccountIds(x, userId));

    for ( Long root : roots ) {
      ret.add((Account) accountDAO.find(root));
    }
    return ret;
  }

  public List<Long> getViewableRootAccountIds(X x, long userId) {
    if ( ! getUserToViewableRootAccountsMap().containsKey(userId) ) {
      // if not in map, get from dao and put in map
      DAO dao = (DAO) x.get("rootAccountsDAO");
      RootAccounts userRootAccounts = (RootAccounts) dao.find(userId);
      if ( userRootAccounts == null ) {
        return new ArrayList<Long>();
      }
      
      userRootAccounts = (RootAccounts) userRootAccounts.fclone();
      userToViewableRootAccountsMap_.put(userId, (ArrayList<Long>) userRootAccounts.getRootAccounts());
    }
    return getUserToViewableRootAccountsMap().get(userId);
  }

  @Override
  public void addViewableRootAccounts(X x, List<Long> userIds, List<Long> rootAccountIds) {
    DAO rootAccountsDAO = (DAO) x.get("rootAccountsDAO");

    for (  Long userId : userIds ){
      RootAccounts userRootAccounts = (RootAccounts) rootAccountsDAO.find(userId);

      List<Long> userRootAccountIds;

      if ( userRootAccounts == null ){
        userRootAccountIds = new ArrayList<Long>();
      } else {
        userRootAccountIds = userRootAccounts.getRootAccounts();
      }

      // need to ensure each element is unique
      Set<Long> userRootAccountIdsSet = new HashSet<Long>(userRootAccountIds);
      userRootAccountIdsSet.addAll(rootAccountIds);
      userRootAccountIds = new ArrayList<Long>(userRootAccountIdsSet);

      userRootAccounts = new RootAccounts.Builder(x).setUserId(userId).setRootAccounts(userRootAccountIds).build();

      rootAccountsDAO.put(userRootAccounts);
      getUserToViewableRootAccountsMap().put(userId, userRootAccountIds);
    }
  }

  protected Map<String, Set<Long>> getChildMap(X x) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    if ( map_ != null ) {
      return map_;
    }

    Sink purgeSink = new Sink() {
      public void put(Object obj, Detachable sub) {
        map_.clear();
        sub.detach();
      }
      public void remove(Object obj, Detachable sub) {
        map_.clear();
        sub.detach();
      }
      public void eof() {
      }
      public void reset(Detachable sub) {
        map_.clear();
        sub.detach();
      }
    };

    accountDAO.listen(purgeSink, TRUE);
    map_ = new ConcurrentHashMap<String, Set<Long>>();
    return map_;
  }

  protected Map<Long, List<Long>> getUserToViewableRootAccountsMap() {
    if ( userToViewableRootAccountsMap_ == null ) {
      userToViewableRootAccountsMap_ = new ConcurrentHashMap<Long, List<Long>>();
    }
    return userToViewableRootAccountsMap_;
  }

  @Override
  public Set<Long> getChildAccountIds(X x, long parentId) {
    Map <String, Set<Long>> map = getChildMap(x);
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    String parentIdString = Long.toString(parentId);

    // Check if parentId exists in map, if it doesn't fetch children and add them to map
    if ( ! map.containsKey(parentIdString) ) {
      Account parentAccount = (Account) accountDAO.find(parentId);
      List<Account> children = new ArrayList<Account>();
      List<Long> childIdList = new ArrayList<Long>();

      children = getChildAccounts(x, parentAccount);

      if ( children.size() > 0 ) {
        for ( int i = 0; i < children.size(); i++ ) {
          long childId = children.get(i).getId();
          childIdList.add(childId);
        }
      }

      Set<Long> childIdSet = new HashSet<>(childIdList);
      map.put(parentIdString, childIdSet);
    }

    return map.get(parentIdString);
  }

  @Override
  public List<Account> getChildAccounts(X x, Account account) {
     ArraySink allChildrenSink = (ArraySink) account.getChildren(x).select(new ArraySink());
     List<Account> allChildrenList = allChildrenSink.getArray();

    List<Account> allAccounts = new ArrayList<Account>();
    allAccounts.add(account);

    if ( allChildrenList.size() > 0 ) {
      for ( int i = 0; i < allChildrenList.size(); i++ ) {
        Account acc = (Account) allChildrenList.get(i);
        List<Account> childChildren = getChildAccounts(x, acc);
        allAccounts.addAll(childChildren);
      }
    }

    return allAccounts;
  }

  @Override
  public void removeRootFromUser(X x, long user, long account) {  
    List<Long> userRoots = getViewableRootAccountIds(x, user);

    if ( userRoots.contains(account) ) {
      userToViewableRootAccountsMap_.remove(user);
      userRoots.removeIf( accountId -> accountId.equals(account) );

      DAO dao = (DAO) x.get("rootAccountsDAO");
      RootAccounts obj = new RootAccounts.Builder(x).setUserId(user).setRootAccounts((ArrayList<Long>) userRoots).build();
      dao.put(obj);
    }
  }
}

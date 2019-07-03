package net.nanopay.fx.afex;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.fx.FXService;
import net.nanopay.fx.ascendantfx.AscendantFX;
import net.nanopay.fx.ascendantfx.AscendantFXServiceProvider;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.alterna.CsvUtil;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.model.Transaction;

/**
 * This DAO would accept FX Quote if it is not yet accepted and then submit deal to AscendantFX
 */
public class AFEXTransactionDAO
    extends ProxyDAO {

  public AFEXTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! (obj instanceof AFEXTransaction) ) {
      return getDelegate().put_(x, obj);
    }

    AFEXTransaction transaction = (AFEXTransaction) obj;
    if ( transaction.getStatus() != TransactionStatus.PENDING || getDelegate().find(transaction.getId()) != null) {
      return getDelegate().put_(x, obj);
    }

    AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("AFEXServiceProvider");

  ///Submit transation to AFEX
    try {
      Transaction txn = afexService.submitPayment(transaction);
      if ( SafetyUtil.isEmpty( transaction.getReferenceNumber()) ) {
        transaction.setStatus(TransactionStatus.SENT);
        transaction.setReferenceNumber(txn.getReferenceNumber());
      } else {
        ((Logger) x.get(Logger.class)).error("Error submitting payment to AFEX.");
        return getDelegate().put_(x, obj);
      }
    } catch (Throwable t) {
      transaction.setStatus(TransactionStatus.DECLINED);
      getDelegate().put_(x, transaction);
      throw new RuntimeException(t.getMessage());
    }
    
    return super.put_(x, transaction);
  }


}

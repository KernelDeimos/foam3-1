package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class UpdateInvoiceTransactionDAO extends ProxyDAO {
  public UpdateInvoiceTransactionDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    Invoice invoice = (Invoice) invoiceDAO.find_(x, transaction.getInvoiceId());

    if ( transaction.getInvoiceId() != 0 ) {
      if ( invoice == null ) {
        throw new RuntimeException("Invoice with id " + transaction.getInvoiceId() + " not found.");
      } else if ( invoice.getStatus() == InvoiceStatus.PENDING && transaction.getStatus() != TransactionStatus.DECLINED ) {
        throw new RuntimeException("Invoice already paid.");
      }
    }

    FObject ret = super.put_(x, obj);

    if ( transaction.getInvoiceId() != 0 && transaction.findSourceAccount(x).getOwner() != transaction.findDestinationAccount(x).getOwner() ) {
      if ( transaction.getStatus() == TransactionStatus.COMPLETED ) {
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.NANOPAY);
        invoiceDAO.put_(x, invoice);
      } else if ( transaction.getStatus() == TransactionStatus.PENDING ) {
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.PENDING);
        invoiceDAO.put_(x, invoice);
      } else if ( transaction.getStatus() == TransactionStatus.DECLINED ) {
        invoice.setPaymentId(null);
        invoice.setPaymentDate(null);
        invoice.setPaymentMethod(PaymentStatus.NONE);
        invoiceDAO.put_(x, invoice);
      }
    }

    return ret;
  }
}

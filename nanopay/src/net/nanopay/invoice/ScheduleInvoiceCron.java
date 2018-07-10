package net.nanopay.invoice;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.dao.*;
import foam.mlang.MLang;
import static foam.mlang.MLang.*;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;

import net.nanopay.account.Account;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.model.Transaction;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.text.SimpleDateFormat;

public class ScheduleInvoiceCron
  extends    ContextAwareSupport
  {
    protected DAO    invoiceDAO_;
    protected DAO    localTransactionDAO_;
    protected Logger logger;

    public void fetchInvoices() {
      try{
        logger.log("Finding scheduled Invoices...");
        ArraySink sink = (ArraySink) invoiceDAO_.where(
          AND(
            EQ(Invoice.PAYMENT_ID, 0),
            EQ(Invoice.PAYMENT_METHOD, PaymentStatus.NONE),
            NEQ(Invoice.PAYMENT_DATE, null)
          )
        ).select(new ArraySink());
          List invoiceList = sink.getArray();
          if ( invoiceList.size() < 1 ) {
            logger.log("No scheduled invoices found for today. ", new Date());
            return;
          }
          for ( int i = 0; i < invoiceList.size(); i++ ) {
            try {
              Invoice invoice = (Invoice) invoiceList.get(i);
              SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
              Date invPaymentDate = invoice.getPaymentDate();

              //Creates transaction only based on invoices scheduled for today.
              if( dateFormat.format(invPaymentDate).equals(dateFormat.format(new Date())) ){
                sendValueTransaction(invoice);
              }
            } catch ( Throwable e) {
              logger.error(this.getClass(), e.getMessage());
            }
          }
          logger.log("Cron Completed");
        } catch ( Throwable e ) {
          logger.error(this.getClass(), e.getMessage());
          // e.printStackTrace();
          throw new RuntimeException(e);
        }
    }

    public void sendValueTransaction(Invoice invoice){
      logger.log("Starting payment process...");
      try {
        Transaction transaction = new Transaction();

        // sets accountId to be used for CICO transaction
        if ( invoice.getAccount() != null ) {
          transaction.setBankAccountId(((Account)invoice.getAccount()).getId());
        }

        long invAmount = invoice.getAmount();
        transaction.setDestinationAccount((Long) invoice.getDestinationAccount());
        transaction.setSourceAccount((Long) invoice.getAccount());
        transaction.setInvoiceId(invoice.getId());
        transaction.setAmount(invAmount);

        try {
          Transaction completedTransaction = (Transaction) localTransactionDAO_.put(transaction);
          logger.log("Scheduled Transaction Completed");
        } catch (Throwable e) {
          logger.error(this.getClass(), e.getMessage());
          throw new RuntimeException(e);
        }

      } catch ( Throwable e ){
        logger.error(this.getClass(), e.getMessage());
      }
    }

    public void start() {
      logger = (Logger) getX().get("logger");
      logger.log("Scheduled payments on Invoice Cron Starting...");
      localTransactionDAO_ = (DAO) getX().get("localTransactionDAO");
      invoiceDAO_     = (DAO) getX().get("invoiceDAO");
      logger.log("DAO's fetched...");
      fetchInvoices();
    }
  }

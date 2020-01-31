package net.nanopay.tx.rbc;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.Date;

import net.nanopay.cico.model.EFTFileStatus;
import net.nanopay.iso20022.ISO20022Util;
import net.nanopay.iso20022.Pain00200103;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.iso20022file.RbcISO20022File;
import net.nanopay.tx.rbc.RbcPGPUtil;
import net.nanopay.tx.TransactionEvent;

import org.apache.commons.io.FileUtils;


public class RbcReportProcessor {

  private static final String PATH = System.getProperty("NANOPAY_HOME") + "/var" + "/rbc_aft/";
  private static final String RECEIPT_PROCESSED_FOLDER = PATH + "/processed/receipt/";
  private static final String REPORT_PROCESSED_FOLDER = PATH + "/processed/report/";
  private static final String REPORT_PROCESSED_FAILED_FOLDER = PATH + "/processed/report_failed/";
  private static final String ARCHIVE_FOLDER = PATH + "/archive/download/";

  private X x;
  private DAO transactionDAO;
  private Logger logger;
  RbcFTPSClient rbcFTPSClient;

  public RbcReportProcessor(X x) {
    this.x          = x;
    logger          = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    transactionDAO  = (DAO) x.get("localTransactionDAO");
    rbcFTPSClient   = new RbcFTPSClient(x);
  }

  /**
   * Process the receipt report
   */
  public void decryptFolder(X x) {
    File folder = new File(RbcFTPSClient.DOWNLOAD_FOLDER);   
    for (File file : folder.listFiles()) {
      if ( file.isDirectory() ) continue;
      try{
        if( null != RbcPGPUtil.decrypt(x, file) ) {
          FileUtils.moveFile(file, new File(ARCHIVE_FOLDER +
          file.getName()));
        }
      } catch (Exception e) {
        this.logger.error("Error decrypting file: " + file.getName(), e);
      }
    }
  }

  /**
   * Process the report to check file was accepted and valid 
   */
  public boolean processReceipt(RbcISO20022File isoFile) {
    if ( isoFile == null ) return false;

    /* Download status report files from RBC */
    try{
      rbcFTPSClient.batchDownload();
    } catch (Exception e) {
      this.logger.error("Error downloading status reports from RBC ", e);
      return false;
    }

    /* Decrypt file status report files */
    try{
      decryptFolder(x);
    } catch (Exception e) {
      this.logger.error("Error decrypting files from download folder", e);
      return false;
    }

    File folder = new File(RbcPGPUtil.DECRYPT_FOLDER);   
    for (File file : folder.listFiles()) {
      if ( file.isDirectory() ) continue;
      try{
        if( processReceipt(file, isoFile.getId()) ) {
          isoFile = (RbcISO20022File) isoFile.fclone();
          isoFile.setStatus(EFTFileStatus.ACCEPTED);
          ((DAO) x.get("rbcISOFileDAO")).inX(x).put(isoFile);
          return true;
        }
      } catch (Exception e) {
        this.logger.error("Error decrypting file: " + file.getName(), e);
      }
    }

    return false;
  }

  /**
   * Process the receipt file
   */
  public boolean processReceipt(File file, long fileId) {
    if (file == null) return false;

    try {
      ISO20022Util driver = new ISO20022Util();
      Pain00200103 pain = (Pain00200103) driver.fromXML(x, file, Pain00200103.class);
      if ( pain == null || pain.getCstmrPmtStsRpt() == null ) return false;
      net.nanopay.iso20022.OriginalGroupInformation20 grpInfo = pain.getCstmrPmtStsRpt().getOriginalGroupInformationAndStatus();
      if ( grpInfo == null || ! String.valueOf(fileId).equals(grpInfo.getOriginalMessageIdentification()) ) return false;

      // Confirm - ACTC status should occur at least once per batch - 
      if ( null != grpInfo.getGroupStatus() && net.nanopay.iso20022.TransactionGroupStatus3Code.ACTC == grpInfo.getGroupStatus() ) { 
        processTransactionReciepts(pain.getCstmrPmtStsRpt(), fileId);
        FileUtils.moveFile(file, new File(RECEIPT_PROCESSED_FOLDER + "/" + fileId + "/" +  file.getName() + Instant.now().toEpochMilli()));
        return true;
      }
    } catch (Exception e) {
      this.logger.error("Error when processing the receipt file. ", e);
      return false;
    }

    return false;
  }

  /**
   * Process transaction reciepts
   */
  protected void processTransactionReciepts(net.nanopay.iso20022.CustomerPaymentStatusReportV03 cstmrPmtStsRpt, long fileId) {
    try {
      if ( cstmrPmtStsRpt == null || null == cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() 
        || null == cstmrPmtStsRpt.getOriginalGroupInformationAndStatus() ) return;

      for( net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo : cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() ) {
        processAcceptedTransactions(paymentInfo, fileId);
      }
    } catch (Exception e) {
      this.logger.error("Error when processing file receipt ", e);
    }
  }

  /**
   * Process accepted transactions
   */
  protected void processAcceptedTransactions(net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo, long messageId) {
    if( null == paymentInfo || null == paymentInfo.getTransactionInformationAndStatus() ) return;

    for( net.nanopay.iso20022.PaymentTransactionInformation25 txnInfoStatus : paymentInfo.getTransactionInformationAndStatus() ) {
      try {
        Transaction transaction = getTransaction(messageId, txnInfoStatus.getOriginalEndToEndIdentification(), TransactionStatus.PENDING);
        transaction.setStatus(TransactionStatus.SENT);
        transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction sent and accepted. " ).build());  
        transactionDAO.inX(this.x).put(transaction);
      } catch (Exception e) {
        this.logger.error("Error when parsing sent report for transaction reference number " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
        BmoFormatUtil.sendEmail(x, "RBC Error when updating transaction to Sent: " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
      }
    }
  }

  /**
   * Process reports from RBC
   */
  public void processReports() throws IOException {
    File folder = new File(RbcPGPUtil.DECRYPT_FOLDER);   
    for (File file : folder.listFiles()) {
      if ( file.isDirectory() ) continue;
      try{
        processReport(file);
      } catch (Exception e) {
        this.logger.error("Error decrypting file: " + file.getName(), e);
        throw e;
      }
    }
  }

  /**
   * Process single report from RBC
   */
  public void processReport(File file) throws IOException {
    ISO20022Util driver = new ISO20022Util();
    Pain00200103 pain = null;
    try {
      pain = (Pain00200103) driver.fromXML(x, file, Pain00200103.class);
      if ( pain == null || pain.getCstmrPmtStsRpt() == null ) return;
      net.nanopay.iso20022.OriginalGroupInformation20 grpInfo = pain.getCstmrPmtStsRpt().getOriginalGroupInformationAndStatus();
      if ( grpInfo == null  || null == grpInfo.getGroupStatus()) return;

      if ( net.nanopay.iso20022.TransactionGroupStatus3Code.RJCT == grpInfo.getGroupStatus() ) { 
        processFailedReport(pain.getCstmrPmtStsRpt());
      } else {
        processPaymentReport(pain.getCstmrPmtStsRpt());
      }
      // Move file to processed
      FileUtils.moveFile(file, new File(REPORT_PROCESSED_FOLDER + "/" + getFileId(pain.getCstmrPmtStsRpt()) + "/" + file.getName() + Instant.now().toEpochMilli()));
    } catch (Exception e) {
      this.logger.error("Error when processing the receipt file. ", e);
      // Move file to processed
      if( pain != null ) {
        FileUtils.moveFile(file, new File(REPORT_PROCESSED_FAILED_FOLDER + "/" + getFileId(pain.getCstmrPmtStsRpt()) + "/" + file.getName() + Instant.now().toEpochMilli()));
      }
      
      throw e;
    }
  }

  /**
   * Process failed reports
   */
  protected void processFailedReport(net.nanopay.iso20022.CustomerPaymentStatusReportV03 cstmrPmtStsRpt) throws RuntimeException  {
    try {
      if ( cstmrPmtStsRpt == null || null == cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() 
        || null == cstmrPmtStsRpt.getOriginalGroupInformationAndStatus() ) return;

      long fileMessageId = Long.valueOf(getFileId(cstmrPmtStsRpt));
      for( net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo : cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() ) {
        processFailedPayment(paymentInfo, fileMessageId);
      }
    } catch (Exception e) {
      this.logger.error("Error when processing failed report ", e);
      throw e;
    }
  }

  /**
   * Process failed payment
   */
  protected void processFailedPayment(net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo, long messageId) {
    if( null == paymentInfo || null == paymentInfo.getTransactionInformationAndStatus() ) return;

    for( net.nanopay.iso20022.PaymentTransactionInformation25 txnInfoStatus : paymentInfo.getTransactionInformationAndStatus() ) {
      try {
        String rejectReason = getRejectReason(txnInfoStatus.getStatusReasonInformation());
        Transaction transaction = getTransaction(messageId, txnInfoStatus.getOriginalEndToEndIdentification(), TransactionStatus.SENT);
        transaction.setStatus(TransactionStatus.DECLINED);
        transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction rejected. " + rejectReason).build());
        ((RbcTransaction)transaction).setRejectReason(rejectReason);
        transaction.setCompletionDate(new Date());
  
        transactionDAO.inX(this.x).put(transaction);
        
      } catch (Exception e) {
        this.logger.error("Error when parsing failed report for transaction reference number " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
        BmoFormatUtil.sendEmail(x, "Error when process report for payment with reference number: " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
      }
    }
  }

  protected void processPaymentReport(net.nanopay.iso20022.CustomerPaymentStatusReportV03 cstmrPmtStsRpt) throws RuntimeException  {
    try {
      if ( cstmrPmtStsRpt == null || null == cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() 
        || null == cstmrPmtStsRpt.getOriginalGroupInformationAndStatus() ) return;

      long fileMessageId = Long.valueOf(getFileId(cstmrPmtStsRpt));
      for( net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo : cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() ) {
        processPaymentStatus(paymentInfo, fileMessageId);
      }
    } catch (Exception e) {
      this.logger.error("Error when processing failed report ", e);
      throw e;
    }
  }

  /**
   * Process payment status
   */
  protected void processPaymentStatus(net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo, long messageId) {
    if( null == paymentInfo || null == paymentInfo.getTransactionInformationAndStatus() ) return;

    for( net.nanopay.iso20022.PaymentTransactionInformation25 txnInfoStatus : paymentInfo.getTransactionInformationAndStatus() ) {
      if( net.nanopay.iso20022.TransactionIndividualStatus3Code.ACSC != txnInfoStatus.getTransactionStatus() ) continue;
      try {
        Transaction transaction = getTransaction(messageId, txnInfoStatus.getOriginalEndToEndIdentification(), TransactionStatus.SENT);
        transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction was settled by RBC.").build());
        ((RbcTransaction)transaction).setSettled(true);
  
        transactionDAO.inX(this.x).put(transaction);
        
      } catch (Exception e) {
        this.logger.error("Error when parsing failed report for transaction reference number " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
        BmoFormatUtil.sendEmail(x, "Error when process report for payment with reference number: " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
      }
    }
  }

  public Transaction getTransaction(long fileId,  String referenceNumber, TransactionStatus status) throws RuntimeException {

    Transaction transaction = (Transaction) this.transactionDAO.find(MLang.AND(
      MLang.EQ(RbcCITransaction.RBC_REFERENCE_NUMBER, referenceNumber),
      MLang.EQ(RbcCITransaction.RBC_FILE_CREATION_NUMBER, fileId),
      MLang.EQ(Transaction.STATUS, status)
    ));

    if ( transaction == null ) {
      transaction = (Transaction) this.transactionDAO.find(MLang.AND(
        MLang.EQ(RbcCOTransaction.RBC_REFERENCE_NUMBER, referenceNumber),
        MLang.EQ(RbcCOTransaction.RBC_FILE_CREATION_NUMBER, fileId),
        MLang.EQ(Transaction.STATUS, status)
      ));
    }

    if ( transaction == null ) {
      transaction = (Transaction) this.transactionDAO.find(MLang.AND(
        MLang.EQ(RbcVerificationTransaction.RBC_REFERENCE_NUMBER, referenceNumber),
        MLang.EQ(RbcVerificationTransaction.RBC_FILE_CREATION_NUMBER, fileId),
        MLang.EQ(Transaction.STATUS, status)
      ));
    }

    if ( transaction == null ) {
      throw new RuntimeException("Transaction reference number: " + referenceNumber + " not found");
    }

    return transaction = (Transaction) transaction.fclone();
  }

  protected String getRejectReason(net.nanopay.iso20022.StatusReasonInformation8 reasonInfos[]) {
    if( null == reasonInfos ) return "";
    StringBuilder str = new StringBuilder();

    for ( net.nanopay.iso20022.StatusReasonInformation8 reason : reasonInfos ) {
      if( null == reason.getReason() ) continue;
      String code = SafetyUtil.isEmpty(reason.getReason().getCd()) ? reason.getReason().getPrtry() : reason.getReason().getCd();
      str.append(code);
      str.append(" : ");
      System.out.println(" Getting additionla information");
      if( null != reason.getAdditionalInformation() ) {
        System.out.println(" reason.getAdditionalInformation() is not null ");
        System.out.println(" reason.getAdditionalInformation() val by index " + reason.getAdditionalInformation()[0] );
        for ( String additionalInfo : reason.getAdditionalInformation() ) {
          System.out.println(" reason.getAdditionalInformation() has valur " + additionalInfo);
          str.append(additionalInfo);
          str.append(" ");
        }
      }
    }
    return str.toString();
  }

  protected String getFileId(net.nanopay.iso20022.CustomerPaymentStatusReportV03 cstmrPmtStsRpt) {
    if ( cstmrPmtStsRpt == null || null == cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() 
        || null == cstmrPmtStsRpt.getOriginalGroupInformationAndStatus() ) return null;
        
    return cstmrPmtStsRpt.getOriginalGroupInformationAndStatus().getOriginalMessageIdentification();
  }
}

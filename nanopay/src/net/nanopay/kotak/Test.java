package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.kotak.model.paymentRequest.*;
import net.nanopay.kotak.model.paymentResponse.Acknowledgement;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.kotak.model.reversal.DetailsType;
import net.nanopay.kotak.model.reversal.HeaderType;
import net.nanopay.kotak.model.reversal.Reversal;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;

public class Test implements ContextAgent {

  private String paymentMessageId;

  @Override
  public void execute(X x) {
    //KotakService kotakService = new KotakService(x);

    try {
      byte[] array = Files.readAllBytes(Paths.get("/Users/zac/Desktop/test.png"));
      System.out.println(Arrays.toString(array));
    } catch (IOException e) {
      e.printStackTrace();
    }

//     paymentTest(kotakService);
//     reversalTest(kotakService);

  }

  public void paymentTest(KotakService kotakService, String payMode, int txnAmnt, String IFSCCode, String remitPurpose) {
    RequestHeaderType requestHeader = new RequestHeaderType();
    paymentMessageId = KotakUtils.getUniqueId();
    System.out.println("paymentMessageId: " + paymentMessageId);
    requestHeader.setMessageId(paymentMessageId);
    // requestHeader.setMsgSource("NANOPAY");
    requestHeader.setClientCode("TESTAPI");
    requestHeader.setBatchRefNmbr(paymentMessageId);

    InstrumentListType instrumentList = new InstrumentListType();
    InstrumentType instrument1 = new InstrumentType();
    instrument1.setInstRefNo(paymentMessageId);
    instrument1.setMyProdCode("NETPAY");
    instrument1.setPayMode(payMode);
    instrument1.setTxnAmnt(txnAmnt);
    instrument1.setAccountNo("9411128990");
    instrument1.setPaymentDt(KotakUtils.getCurrentIndianDate());

    // instrument1.setRecBrCd("BOFA0BG3978");
    instrument1.setRecBrCd(IFSCCode);
    instrument1.setBeneAcctNo("9111175690");
    instrument1.setBeneName("HELLO API");

    EnrichmentSetType enrichmentSet = new EnrichmentSetType();
    // enrichmentSet.setEnrichment(new String[]{"UAT TEST NAME~SAVING~Remitter address~9411128990~FAMILY_MAINTENANCE~~~"});
    enrichmentSet.setEnrichment(new String[]{"UAT TEST NAME~SAVING~Remitter address~9411128990~" + remitPurpose + "~~~"});

    instrument1.setEnrichmentSet(enrichmentSet);

    instrumentList.setInstrument(new InstrumentType[]{instrument1});

    Payment request = new Payment();
    request.setRequestHeader(requestHeader);
    request.setInstrumentList(instrumentList);

    AcknowledgementType paymentResponse = kotakService.submitPayment(request);
    Acknowledgement ackHeader = paymentResponse.getAckHeader();

    String paymentResponseMsgId = ackHeader.getMessageId();
    // System.out.println("paymentResponseMsgId: " + paymentResponseMsgId);

    String paymentResponseStatusCode = ackHeader.getStatusCd();
    System.out.println("paymentResponseStatusCode: " + paymentResponseStatusCode);

    String paymentResponseStatusRem = ackHeader.getStatusRem();
    System.out.println("paymentResponseStatusRem: " + paymentResponseStatusRem);

    System.out.println("===========================");
  }


  public void reversalTest(KotakService kotakService, String paymentMessageId) {
    HeaderType header = new HeaderType();
    header.setReq_Id(KotakUtils.getUniqueId());
    // header.setMsg_Src("NANOPAY");
    header.setClient_Code("TESTAPI");
    header.setDate_Post(KotakUtils.getCurrentIndianDate());

    DetailsType details = new DetailsType();
    details.setMsg_Id(new String[]{paymentMessageId});

    Reversal reversal = new Reversal();
    reversal.setHeader(header);
    reversal.setDetails(details);

    Reversal reversalResponse = kotakService.submitReversal(reversal);

    System.out.println("reqId: " + reversalResponse.getHeader().getReq_Id());
    // System.out.println("msgSrc: " + reversalResponse.getHeader().getMsg_Src());
    System.out.println("clientCode: " + reversalResponse.getHeader().getClient_Code());

    System.out.println("msgId: " + reversalResponse.getDetails().getRev_Detail()[0].getMsg_Id());
    System.out.println("statusCode: " + reversalResponse.getDetails().getRev_Detail()[0].getStatus_Code());
    System.out.println("statusDesc: " + reversalResponse.getDetails().getRev_Detail()[0].getStatus_Desc());
    // System.out.println("UTR: " + reversalResponse.getDetails().getRev_Detail()[0].getUTR());

    System.out.println("===========================");
  }
}

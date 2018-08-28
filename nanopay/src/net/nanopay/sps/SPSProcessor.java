package net.nanopay.sps;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.bank.BankAccount;
import net.nanopay.sps.exceptions.ClientErrorException;
import net.nanopay.sps.exceptions.HostErrorException;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import static foam.mlang.MLang.*;

public class SPSProcessor implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO    userDAO        = (DAO) x.get("localUserDAO");
    Logger logger         = (Logger) x.get("logger");

    transactionDAO
      .where(AND(
        INSTANCE_OF(SPSTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.PENDING),
        OR(
          EQ(Transaction.TYPE, TransactionType.CASHIN),
          EQ(Transaction.TYPE, TransactionType.CASHOUT),
          EQ(Transaction.TYPE, TransactionType.BANK_ACCOUNT_PAYMENT),
          EQ(Transaction.TYPE, TransactionType.VERIFICATION)
        )
        )
      ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          BankAccount bankAccount;
          SPSTransaction t = (SPSTransaction) ((SPSTransaction) obj).fclone();
          User user = (User) userDAO.find_(x, t.findSourceAccount(x).getOwner());

          if ( t.getType() == TransactionType.CASHIN || t.getType() == TransactionType.BANK_ACCOUNT_PAYMENT) {
            bankAccount = (BankAccount) t.findSourceAccount(x);
          } else if ( t.getType() == TransactionType.CASHOUT || t.getType() == TransactionType.VERIFICATION ) {
            bankAccount = (BankAccount) t.findDestinationAccount(x);
          } else {
            return;
          }

          if ( user == null ) return;
          if ( bankAccount == null ) return;

          // TODO: set generalRequestPacket, need discuss more about the different fields with George
          GeneralRequestPacket generalRequestPacket = new GeneralRequestPacket();
          generalRequestPacket.setMsgType(20);
          generalRequestPacket.setPacketType(2010);
          generalRequestPacket.setMsgModifierCode(10);
          generalRequestPacket.setLocalTransactionTime("20180820115959");
          generalRequestPacket.setTID("ZYX80");


          // send generalRequestPacket and parse the response
          GeneralRequestResponse generalRequestResponse = GeneralReqService(x, generalRequestPacket);

          t.setBatchId(generalRequestResponse.getBatchID());
          t.setItemId(generalRequestResponse.getItemID());

          // TODO: need discuss more about ApprovalCode with George
          if ( "A10".equals(generalRequestResponse.getApprovalCode()) ) {
            t.setStatus(TransactionStatus.COMPLETED);
          } else if ("D20".equals(generalRequestResponse.getApprovalCode())) {
            t.setStatus(TransactionStatus.DECLINED);
          }

          transactionDAO.put(t);

        } catch (Exception e) {
          logger.error(e);
        }
      }
    });
  }


  public GeneralRequestResponse GeneralReqService(X x, GeneralRequestPacket generalRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (GeneralRequestResponse) parse(request(x, generalRequestPacket));
  }

  public BatchDetailGeneralResponse BatchDetailReqService(X x, BatchDetailRequestPacket batchDetailRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (BatchDetailGeneralResponse) parse(request(x, batchDetailRequestPacket));
  }

  public DetailResponse DetailInfoService(X x, BatchDetailRequestPacket batchDetailRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (DetailResponse) parse(request(x, batchDetailRequestPacket));
  }

  private String request(X x, RequestPacket requestPacket) {
    Logger logger = (Logger) x.get("logger");
    SPSConfig spsConfig = (SPSConfig) x.get("SPSConfig");

    String url = spsConfig.getUrl();
    String requestMsg = requestPacket.toSPSString();

    CloseableHttpClient httpClient = HttpClients.createDefault();
    HttpPost post = new HttpPost(url);

    List<NameValuePair> urlParameters = new ArrayList<>();
    urlParameters.add(new BasicNameValuePair("packet", requestMsg));
    String response = null;

    try {
      post.setEntity(new UrlEncodedFormEntity(urlParameters));
      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try {
        if (httpResponse.getStatusLine().getStatusCode() == 200) {
          BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
          StringBuilder sb = new StringBuilder();
          String line;
          while ( (line = rd.readLine()) != null ) {
            sb.append(line);
          }
          response = sb.toString();
        } else {
          logger.warning("http status code was not 200");
        }
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      logger.error(e);
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        logger.error(e);
      }
    }

    return response;
  }

  private ResponsePacket parse(String response) throws ClientErrorException, HostErrorException {
    String responsePacketType = response.substring(4, 8);
    ResponsePacket responsePacket = null;

    switch ( responsePacketType ) {
      case "2011":
        // GeneralRequestResponse
        GeneralRequestResponse generalRequestResponse = new GeneralRequestResponse();
        generalRequestResponse.parseSPSResponse(response);
        responsePacket = generalRequestResponse;
        break;
      case "2031":
        // BatchDetailGeneralResponse
        BatchDetailGeneralResponse batchDetailGeneralResponse = new BatchDetailGeneralResponse();
        batchDetailGeneralResponse.parseSPSResponse(response);
        responsePacket = batchDetailGeneralResponse;
        break;
      case "2033":
        // DetailResponse
        DetailResponse detailResponse = new DetailResponse();
        detailResponse.parseSPSResponse(response);
        responsePacket = detailResponse;
        break;
      case "2090":
        // RequestMessageAndErrors
        RequestMessageAndErrors requestMessageAndErrors = new RequestMessageAndErrors();
        requestMessageAndErrors.parseSPSResponse(response);
        throw new ClientErrorException(requestMessageAndErrors);
      case "2091":
        // HostError
        HostError hostError = new HostError();
        hostError.parseSPSResponse(response);
        throw new HostErrorException(hostError);
    }

    return responsePacket;
  }
}

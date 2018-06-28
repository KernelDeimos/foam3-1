package net.nanopay.fresh;

import foam.core.*;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.json.Outputter;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.fresh.model.*;
import net.nanopay.invoice.model.Invoice;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.HttpClient;
import foam.lib.json.JSONParser;

import static foam.mlang.MLang.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import java.text.SimpleDateFormat;
import java.util.Date;


public class FreshBook
        implements WebAgent
{
  public void execute(X x)
  {
    HttpServletRequest req =  x.get( HttpServletRequest.class );
    HttpServletResponse resp =  x.get( HttpServletResponse.class );
    PrintWriter out =  x.get( PrintWriter.class );

    FreshConfig config = new FreshConfig();
    config.setCode(req.getParameter("code"));
    out.println(
            "<HTML>" +
                    "<BODY>" +
                    "<div  style=\" position: absolute; display: block; left: 40%; top: 40%;\">\n" +
                    "<p>\n" +
                    "FreshBooks Syncing in Progress Please wait......\n" +
                    "</p>\n" +
                    "</div> " +
                    "</BODY>"+
                    "</HTML>");
    try {
      //Sends the client info to FreshBooks to retrieve the access Token
      HttpClient httpclient = HttpClients.createDefault();
      HttpPost httppost = new HttpPost("https://api.freshbooks.com/auth/oauth/token");
      httppost.setHeader("Content-Type","application/json");
      httppost.setHeader("Api-Version","alpha");
      String body = "{ \n" +
              "\"grant_type\": \""+config.getGrant_type()+"\",\n" +
              "\"client_secret\": \""+config.getClient_secret()+"\",\n" +
              "\"code\": \""+config.getCode()+"\",\n" +
              "\"client_id\": \""+config.getClient_id()+"\",\n" +
              "\"redirect_uri\": \""+config.getRedirect_uri()+"\"\n" +
              "}";
      //System.out.println(body);
      httppost.setEntity(new StringEntity(body, ContentType.APPLICATION_FORM_URLENCODED));
      HttpResponse response = httpclient.execute(httppost);

      //Reads in the response
      BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      String line;
      line = rd.readLine();
      JSONParser parser = new JSONParser();
      FreshToken token = new FreshToken();

      //Parses the response and sets to a model that matches
      token = (FreshToken) parser.parseString(line,token.getClassInfo().getObjClass());
      //System.out.println(line);
      //System.out.println(token.getAccess_token());

      //Second call to api to retrieve the user using the accessToken
      HttpGet httpget =  new HttpGet("https://api.freshbooks.com/auth/api/v1/users/me");
      httpget.setHeader("Authorization", "Bearer "+token.getAccess_token());
      httpget.setHeader("Content-Type","application/json");
      httpget.setHeader("Api-Version","alpha");
      response = httpclient.execute(httpget);
      rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      line = rd.readLine();
      //System.out.println(line);
      FreshResponse fResponse = new FreshResponse();

      //Parses the response and sets to a model that matches
      Outputter jout = new Outputter();
      fResponse = (FreshResponse) parser.parseString(line,fResponse.getClassInfo().getObjClass());
      //System.out.println(jout.stringify(fResponse));
      //System.out.println((FreshCurrent) fResponse.getResponse());
      FreshCurrent current =  fResponse.getResponse();
      FreshBusiness business =  current.getBusiness_memberships()[0].getBusiness();

      //Get the account id to start grabbing invoices
      String accountId = business.getAccount_id();
      //System.out.println(accountId);


      httpclient = HttpClients.createDefault();
      httpget =  new HttpGet("https://api.freshbooks.com/accounting/account/"+accountId+"/invoices/invoices");
      //System.out.println(httpget.getURI());
      httpget.setHeader("Authorization", "Bearer "+token.getAccess_token());
      httpget.setHeader("Content-Type","application/json");
      httpget.setHeader("Api-Version","alpha");
      response = httpclient.execute(httpget);
      rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      line = rd.readLine();
      //System.out.println(line);

      FreshInvoiceResponse fLResponse = new FreshInvoiceResponse();
      fLResponse = (FreshInvoiceResponse) parser.parseString(line,fLResponse.getClassInfo().getObjClass());
      FreshInvoice[] invoices = fLResponse.getResponse().getResult().getInvoices();
      System.out.println(jout.stringify(invoices[0]));
      for (int i = 0; i<invoices.length; i++)
      {
        FreshInvoice invoice = invoices[i];
        User user = (User) x.get("user");
        DAO invoiceDAO = (DAO) x.get("invoiceDAO");
        Invoice account = new Invoice();
        String newStr = invoice.getAmount().getAmount().replace(".", "");
        account.setAmount(Long.parseLong(newStr));
        Date date;
        if(!SafetyUtil.isEmpty(invoice.getCreate_date())) {
          date = new SimpleDateFormat("yyyy-MM-dd").parse(invoice.getCreate_date());
          account.setIssueDate(date);
        }
        if(!SafetyUtil.isEmpty(invoice.getDue_date())) {
          date = new SimpleDateFormat("yyyy-MM-dd").parse(invoice.getDue_date());
          account.setDueDate(date);
        }
        if(!SafetyUtil.isEmpty(invoice.getDate_paid())) {
          date = new SimpleDateFormat("yyyy-MM-dd").parse(invoice.getDate_paid());
          account.setPaymentDate(date);
        }
        account.setFreshbooksInvoiceNumber(invoice.getInvoice_number());
        account.setPayeeId(user.getId());
        account.setCreatedBy(user.getId());
        account.setPayerId(Long.parseLong("1350"));
        account.setFreshbooksInvoiceId(invoice.getInvoiceid());
        account.setStatus(account.getStatus());
        account.setInvoiceNumber(invoice.getInvoice_number());
        if(invoice.getStatus() == 1) { account.setDraft(true);}
        //System.out.println(jout.stringify(account));
        DAO freshInvoices = invoiceDAO.where(
          AND(
            EQ(Invoice.FRESHBOOKS_INVOICE_NUMBER,invoice.getInvoice_number()),
            EQ(Invoice.CREATED_BY,user.getId())
          ));
        ArraySink sink = (ArraySink) freshInvoices.select(new ArraySink());

        if (  sink.getArray().isEmpty() ) invoiceDAO.put(account);
        

      }
      resp.sendRedirect("/");

    }catch (Throwable t){
      System.out.println("*******************************BAD NEWS");
      t.printStackTrace();
      return;
    }

  }
}
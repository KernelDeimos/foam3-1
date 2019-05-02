package net.nanopay.sps.cron;

import com.jcraft.jsch.*;
import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.csv.CSVSupport;
import foam.nanos.logger.Logger;
import net.nanopay.sps.SPSCredentials;
import net.nanopay.sps.SPSRejectFileRecord;
import net.nanopay.sps.SPSTransaction;
import net.nanopay.tx.model.TransactionStatus;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class SPSRejectFileProcessor implements ContextAgent {
  @Override
  public void execute(X x) {
    SPSCredentials spsCredentials = (SPSCredentials) x.get("SPSCredentials");
    Logger logger = (Logger) x.get("logger");
    CSVSupport csvSupport = new CSVSupport();
    csvSupport.setX(x);

    List<String> fileNames = new ArrayList<>();
    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;

    try {
      // create session with username and password
      JSch jsch = new JSch();
      session = jsch.getSession(spsCredentials.getUser(), spsCredentials.getHost(), spsCredentials.getPort());
      session.setPassword(spsCredentials.getPassword());
      String sftpPathSegment = "/" + spsCredentials.getUser();

      // add configuration
      Properties config = new Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.setTimeout(60000);
      session.connect(60000);

      // open SFTP connection and download file
      channel = session.openChannel("sftp");
      channel.connect();
      channelSftp = (ChannelSftp) channel;

      Vector fileList = channelSftp.ls(sftpPathSegment + "/test/");
      Pattern pattern = Pattern.compile("chargeback[0-9]{6}.csv");
      for ( Object entry : fileList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        Matcher matcher = pattern.matcher(e.getFilename());
        if ( matcher.find() ) {
          fileNames.add(matcher.group());
        }
      }

      for ( String fileName : fileNames ) {
        InputStream fileInputStream = channelSftp.get(sftpPathSegment + "/test/" + fileName);
        String input = editFirstRow(x, fileInputStream);
        InputStream is = new ByteArrayInputStream(input.getBytes());

        ArraySink arraySink = new ArraySink();
        csvSupport.inputCSV(is, arraySink, SPSRejectFileRecord.getOwnClassInfo());

        List list = arraySink.getArray();
        for ( Object record : list ) {
          SPSRejectFileRecord spsRejectFileRecord = (SPSRejectFileRecord) record;
          processTransaction(x, spsRejectFileRecord);
        }
      }

      Vector folderList = channelSftp.ls(sftpPathSegment);
      boolean exist = false;
      for ( Object entry : folderList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        if ( "Archive_ChargebackFile".equals(e.getFilename()) ) {
          exist = true;
          break;
        }
      }

      if ( ! exist ) {
        channelSftp.mkdir(sftpPathSegment + "/Archive_ChargebackFile");
        channelSftp.chmod(Integer.parseInt("777", 8), sftpPathSegment + "/Archive_ChargebackFile");
      }

      String srcFileDirectory = sftpPathSegment + "/test/";
      String dstFileDirectory = sftpPathSegment + "/Archive_ChargebackFile/";

      // move processed files
      for ( String fileName : fileNames ) {
        channelSftp.rename(srcFileDirectory + fileName, dstFileDirectory + fileName);
      }

      logger.debug("SPS Chargeback file processing finished");

    } catch (JSchException | SftpException e) {
      logger.error(e);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  public static void processTransaction(X x, SPSRejectFileRecord spsRejectFileRecord) {
    DAO transactionDao = (DAO)x.get("localTransactionDAO");
    SPSTransaction tran = (SPSTransaction) transactionDao.find(AND(
      EQ(SPSTransaction.BATCH_ID, spsRejectFileRecord.getBatch_ID()),
      EQ(SPSTransaction.ITEM_ID, spsRejectFileRecord.getItem_ID())
    ));

    if ( tran != null ) {
      tran = (SPSTransaction) tran.fclone();
      tran.setStatus(TransactionStatus.DECLINED);
      tran.setRejectReason(spsRejectFileRecord.getReason());
      tran.setChargebackTime(spsRejectFileRecord.getChargeBack());

      transactionDao.put(tran);
    }
  }

  private String editFirstRow(X x, InputStream is) {
    String line;
    StringBuilder sb = new StringBuilder();
    BufferedReader br = null;
    Logger logger = (Logger) x.get("logger");

    try {
      br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));

      if ( (line = br.readLine()) != null ) {
        line = line.replaceAll(" ", "_").replaceAll("/", "_");
        sb.append(line).append("\n");
      }

      while ( (line = br.readLine()) != null ) {
        sb.append(line).append("\n");
      }

    } catch (IOException e) {
      logger.error(e);
    } finally {
      if ( br != null ) {
        try {
          br.close();
        } catch (IOException e) {
          logger.error(e);
        }
      }
    }

    return sb.toString();
  }
}

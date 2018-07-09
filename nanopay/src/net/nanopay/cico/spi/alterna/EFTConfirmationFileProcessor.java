package net.nanopay.cico.spi.alterna;

import com.jcraft.jsch.*;
import foam.core.ContextAgent;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.cico.model.EFTConfirmationFileRecord;
import net.nanopay.cico.model.EFTReturnFileCredentials;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static foam.mlang.MLang.EQ;

public class EFTConfirmationFileProcessor implements ContextAgent
{
  @Override
  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");
    EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("EFTReturnFileCredentials");

    EFTConfirmationFileParser eftConfirmationFileParser = new EFTConfirmationFileParser();
    EFTUploadCSVFileParser eftUploadCSVFileParser = new EFTUploadCSVFileParser();

    DAO transactionDao = (DAO)x.get("localTransactionDAO");

    List<String> fileNames = new ArrayList<>();

    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;

    try {
      // create session with user name and password
      JSch jsch = new JSch();
      session = jsch.getSession(credentials.getUser(), credentials.getHost(), credentials.getPort());
      session.setPassword(credentials.getPassword());

      // add configuration
      Properties config = new Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.connect();

      // open SFTP connection and download file
      channel = session.openChannel("sftp");
      channel.connect();
      channelSftp = (ChannelSftp) channel;

      Vector fileList = channelSftp.ls("/Returns/");
      Pattern pattern = Pattern.compile("UploadLog_[0-9]{8}_B2B.csv.txt");
      for ( Object entry : fileList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        Matcher matcher = pattern.matcher(e.getFilename());
        if ( matcher.find() ) {
          fileNames.add(matcher.group());
        }
      }

      for ( int i = 0; i < fileNames.size(); i++ ) {
        InputStream confirmationFileStream = channelSftp.get("/Returns/" + fileNames.get(i));
        List<FObject> confirmationFileList = eftConfirmationFileParser.parse(confirmationFileStream);

        // UploadLog_yyyyMMdd_B2B.csv.txt -> yyyyMMdd_B2B.csv
        String uploadCSVFileName = fileNames.get(i).substring(10, 26);
        Vector uploadCSVList = channelSftp.ls("/Archive/");
        boolean uploadCSVExist = false;
        for ( Object entry : uploadCSVList ) {
          ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
          if ( e.getFilename().equals(uploadCSVFileName) ) {
            uploadCSVExist = true;
          }
        }

        if ( uploadCSVExist ) {
          InputStream uploadFileStream = channelSftp.get("/Archive/" + uploadCSVFileName);

          List<FObject> uploadFileList = eftUploadCSVFileParser.parse(uploadFileStream);

          for ( int j = 0; j < confirmationFileList.size(); j++ ) {
            EFTConfirmationFileRecord eftConfirmationFileRecord = (EFTConfirmationFileRecord) confirmationFileList.get(j);
            AlternaFormat eftUploadFileRecord = (AlternaFormat) uploadFileList.get(j);

            Transaction tran = (Transaction) transactionDao.find(
              EQ(Transaction.ID, eftUploadFileRecord.getReference()));

            if ( tran != null ) {
              tran = (Transaction) tran.fclone();
              tran.setConfirmationLineNumber(fileNames.get(i) + "_" + eftConfirmationFileRecord.getLineNumber());

              if ( "Failed".equals(eftConfirmationFileRecord.getStatus()) ) {
                tran.setStatus(TransactionStatus.FAILED);
                tran.setDescription(eftConfirmationFileRecord.getReason());
                sendEmail(x, "Transaction was rejected by EFT confirmation file",
                  "Transaction id: " + tran.getId() + ", Reason: " + tran.getDescription() + ", Confirmation line number: "
                    + fileNames.get(i) + "_" + eftConfirmationFileRecord.getLineNumber());
              } else if ( "OK".equals(eftConfirmationFileRecord.getStatus()) && tran.getStatus().equals(TransactionStatus.PENDING) ) {
                tran.setStatus(TransactionStatus.SENT);
              }

              transactionDao.put(tran);
            }
          }
        } else {
          logger.error("Can't find the corresponding upload CSV file in Archive folder", uploadCSVFileName);
        }
      }

      Vector folderList = channelSftp.ls("/");
      boolean folderExist = false;
      for ( Object entry : folderList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        if ( "Archive_EFTConfirmationFile".equals(e.getFilename()) ) {
          folderExist = true;
        }
      }

      if ( ! folderExist ) {
        channelSftp.mkdir("Archive_EFTConfirmationFile");
      }

      String srcFileDirectory = "/Returns/";
      String dstFileDirectory = "/Archive_EFTConfirmationFile/";

      // move processed files
      for ( int i = 0; i < fileNames.size(); i++ ) {
        channelSftp.rename(srcFileDirectory + fileNames.get(i), dstFileDirectory + fileNames.get(i));
      }

      logger.debug("EFT Confirmation file processing finished");
      channelSftp.exit();

    } catch ( JSchException | SftpException e ) {
      logger.error(e);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  public void sendEmail(X x, String subject, String content) {
    EmailService emailService = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();

    message.setTo(new String[]{"ops@nanopay.net"});
    message.setSubject(subject);
    message.setBody(content);
    emailService.sendEmail(message);
  }
}

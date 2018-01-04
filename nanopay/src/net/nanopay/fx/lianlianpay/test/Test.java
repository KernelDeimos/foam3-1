package net.nanopay.fx.lianlianpay.test;

import com.jcraft.jsch.ChannelSftp;
import foam.core.ProxyX;
import net.nanopay.fx.lianlianpay.LianLianPayService;
import net.nanopay.fx.lianlianpay.model.*;

public class Test {

  public static void main(String[] args) {
    try {
      String cwd = System.getProperty("user.dir");
      String pubKeyFilename =
          cwd + "/nanopay/src/net/nanopay/fx/lianlianpay/test/TestKey/Test_Public_Key.pem";
      String privKeyFilename =
          cwd + "/nanopay/src/net/nanopay/fx/lianlianpay/test/TestKey/Test_Private_Key.pem";

      LianLianPayService service =
          new LianLianPayService(new ProxyX(), pubKeyFilename, privKeyFilename);

      InstructionCombined ic = new InstructionCombined();
      InstructionCombinedSummary summary = new InstructionCombinedSummary();
      summary.setBatchId("000001");
      summary.setSourceCurrency("USD");
      summary.setTargetCurrency("CNY");
      summary.setTotalTargetAmount(100.00);
      summary.setTotalCount(1);
      summary.setDistributeMode(DistributionMode.FIXED_TARGET_AMOUNT);
      summary.setInstructionType(InstructionType.B2B);
      ic.setSummary(summary);

      InstructionCombinedRequest instruction = new InstructionCombinedRequest();
      instruction.setOrderId("LLPAY0000000001");
      instruction.setFundsType(InstructionType.B2B);
      instruction.setSourceCurrency("USD");
      instruction.setTargetCurrency("CNY");
      instruction.setTargetAmount(100.00);
      instruction.setPayeeCompanyName("CompanyA");
      instruction.setPayeeContactNumber("81234561");
      instruction.setPayeeOrganizationCode("00000001-X");
      instruction.setPayeeEmailAddress("CompanyA@email.com");
      instruction.setPayeeBankName(3);
      instruction.setPayeeBankAccount("VSY8jzS6P1d2RSJ/ONPobQ==");
      instruction.setPayerId("100001");
      instruction.setPayerName("PayerA");
      instruction.setTradeCode("121010");
      instruction.setMemo("Memo Content");

      ic.setRequests(new InstructionCombinedRequest[]{ instruction });
      service.uploadInstructionCombined(ic);
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}
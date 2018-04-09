package net.nanopay.cico.spi.alterna;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.lib.csv.CSVStringParser;
import foam.lib.parse.*;
import org.apache.commons.io.IOUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * This class parse the EFT upload CSV file
 */

public class EFTUploadCSVFileParser extends EFTFileParser
{
  public List<FObject> parse(InputStream is) {

    List<FObject> ret = new ArrayList<>();
    BufferedReader reader = null;

    try {
      ClassInfo classInfo = AlternaFormat.getOwnClassInfo();
      List<Object> propertyInfos = new ArrayList<>();
      propertyInfos.add(classInfo.getAxiomByName("padType"));
      propertyInfos.add(classInfo.getAxiomByName("firstName"));
      propertyInfos.add(classInfo.getAxiomByName("lastName"));
      propertyInfos.add(classInfo.getAxiomByName("transitNumber"));
      propertyInfos.add(classInfo.getAxiomByName("bankNumber"));
      propertyInfos.add(classInfo.getAxiomByName("accountNumber"));
      propertyInfos.add(classInfo.getAxiomByName("amountDollar"));
      propertyInfos.add(classInfo.getAxiomByName("txnType"));
      propertyInfos.add(classInfo.getAxiomByName("txnCode"));
      propertyInfos.add(classInfo.getAxiomByName("processDate"));
      propertyInfos.add(classInfo.getAxiomByName("reference"));

      reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));

      parseFile(ret, reader, classInfo, propertyInfos);

    } catch ( IllegalAccessException | IOException | InstantiationException e ) {
      e.printStackTrace();
    } finally {
      IOUtils.closeQuietly(reader);
    }

    return ret;
  }

  @Override
  public void parseFile(List<FObject> ret, BufferedReader reader, ClassInfo classInfo, List<Object> propertyInfos)
    throws IOException, InstantiationException, IllegalAccessException {

    String line;
    Object[] values;
    while ( (line = reader.readLine()) != null ) {
      StringPStream ps = new StringPStream();

      ps.setString(line);

      FObject obj = (FObject) classInfo.getObjClass().newInstance();
      Parser parser = new Repeat(new CSVStringParser(), new Literal(","));
      PStream ps1 = ps.apply(parser, null);
      if ( ps1 == null ) throw new RuntimeException("format error");

      values = (Object[]) ps1.value();

      if (values.length == propertyInfos.size()) {
        for ( int i = 0; i < propertyInfos.size(); i++ ) {
          ((PropertyInfo)propertyInfos.get(i)).set(obj, ((PropertyInfo)propertyInfos.get(i)).fromString((String) values[i]));
        }
      }

      ret.add(obj);
    }
  }
}
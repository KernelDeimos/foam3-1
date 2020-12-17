/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */
package net.nanopay.partner.sintegra;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.logger.Logger;


public class SintegraServiceMock extends ContextAwareSupport implements Sintegra {

  private Logger logger;

  public SintegraServiceMock(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
  }

  public CNPJResponseData getCNPJData(String cnpj, String token) {
    if ( "06990590000123".equals(cnpj) ) {
      CNPJResponseData response = new CNPJResponseData();
      response.setCode("0");
      response.setStatus("OK");
      response.setSituacao("ATIVA");
      response.setNome("GOOGLE BRASIL INTERNET LTDA.");
      return response;
    } else {
      return new SintegraService(getX()).getCNPJData(cnpj, token);
    }
  }

  public CPFResponseData getCPFData(String cpf, String dateOfBirth, String token) {
    if ( "10786348070".equals(cpf) ) {
      CPFResponseData response = new CPFResponseData();
      response.setCode("0");
      response.setStatus("OK");
      response.setSituacaoCadastral("REGULAR");
      response.setNome("RAUL SILVA");
      return response;
    } else {
      return new SintegraService(getX()).getCPFData(cpf, dateOfBirth, token);
    }
  }
}

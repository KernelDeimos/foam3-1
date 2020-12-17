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
package net.nanopay.country.br.exchange;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.logger.Logger;

public class ExchangeClientMock extends ContextAwareSupport implements Exchange {

  private Logger logger;

  // Stub searchTitular which contains exchange limit in
  // searchTitularResult.titular.LIMITEOP
  private SearchTitularResponse stubSearchTitular = new SearchTitularResponse();
  private SearchTitularCapFinResponse stubSearchTitularCapFin = new SearchTitularCapFinResponse();

  public ExchangeClientMock(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
  }

  @Override
  public InsertBoletoResponse insertBoleto(InsertBoleto request) {
    InsertBoletoResponse response = new InsertBoletoResponse();
    ServiceStatus result = new ServiceStatus();
    result.setCODRETORNO(0);
    response.setInsertBoletoResult(result);
    return response;
  }

  @Override
  public SearchBoletoResponse searchBoleto(SearchBoleto request) {
    SearchBoletoResponse response = new SearchBoletoResponse();
    ResponseBoleto responseBoleto = new ResponseBoleto();
    ServiceStatus status = new ServiceStatus();
    status.setCODRETORNO(0);
    responseBoleto.setServiceStatus(status);
    response.setSearchBoletoResult(responseBoleto);
    return response;
  }

  @Override
  public BoletoStatusResponse getBoletoStatus(GetBoletoStatus request) {
    BoletoStatusResponse response = new BoletoStatusResponse();
    BoletoStatusResult result = new BoletoStatusResult();
    Boleto boleto = new Boleto();
    boleto.setSTATUS("E");
    result.setBoleto(new Boleto[]{boleto});
    return response;
  }

  @Override
  public SearchTitularResponse searchTitular(SearchTitular request) {
    return getStubSearchTitular();
  }

  @Override
  public SearchTitularCapFinResponse searchTitularCapFin(SearchTitularCapFin request) {
    return getStubSearchTitularCapFin();
  }

  @Override
  public InsertTitularResponse insertTitular(InsertTitular request) {
    InsertTitularResponse response = new InsertTitularResponse();
    return response;
  }

  @Override
  public UpdateTitularResponse updateTitular(UpdateTitular request) {
    UpdateTitularResponse response = new UpdateTitularResponse();
    return response;
  }

  @Override
  public SearchNaturezaResponse searchNatureza(SearchNatureza request) {
    SearchNaturezaResponse response = new SearchNaturezaResponse();
    ResponseNatureza res = new ResponseNatureza();
    ServiceStatus status = new ServiceStatus();
    status.setCODRETORNO(0);
    res.setServiceStatus(status);
    response.setSearchNaturezaResult(res);
    return response;
  }

  @Override
  public SearchMoedaResponse searchMoeda(SearchMoeda request)  { return new SearchMoedaResponse(); }

  @Override
  public SearchPaisResponse searchPais(SearchPais request) { return new SearchPaisResponse(); }

  @Override
  public CotacaoTaxaCambioResponse cotacaoTaxaCambio(GetCotacaoTaxaCambio request) { return new CotacaoTaxaCambioResponse(); }

  public SearchTitularResponse getStubSearchTitular() {
    return this.stubSearchTitular;
  }

  public SearchTitularCapFinResponse getStubSearchTitularCapFin() {
    return this.stubSearchTitularCapFin;
  }

}

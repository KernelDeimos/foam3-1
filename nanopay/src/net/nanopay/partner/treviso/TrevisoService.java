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
package net.nanopay.partner.treviso;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.Country;
import foam.nanos.auth.Region;
import foam.nanos.auth.ServiceProvider;
import foam.nanos.auth.User;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import foam.util.SafetyUtil;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.country.br.BrazilBusinessInfoData;
import net.nanopay.country.br.CPF;
import net.nanopay.country.br.exchange.Exchange;
import net.nanopay.country.br.exchange.ExchangeClientValues;
import net.nanopay.country.br.exchange.ExchangeCredential;
import net.nanopay.country.br.exchange.ExchangeCustomer;
import net.nanopay.country.br.exchange.ExchangeService;
import net.nanopay.country.br.exchange.ExchangeServiceProvider;
import net.nanopay.country.br.OpenDataService;
import net.nanopay.country.br.PTaxRate;
import net.nanopay.country.br.PTaxDollarRateResponse;
import net.nanopay.country.br.tx.NatureCodeLineItem;
import net.nanopay.fx.afex.AFEXServiceProvider;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.fx.FXTransaction;
import net.nanopay.meter.clearing.ClearingTimeService;
import net.nanopay.model.Business;
import net.nanopay.partner.sintegra.Sintegra;
import net.nanopay.partner.sintegra.CPFResponseData;
import net.nanopay.partner.sintegra.CNPJResponseData;
import net.nanopay.country.br.exchange.Boleto;
import net.nanopay.partner.treviso.api.BusinessUnit;
import net.nanopay.partner.treviso.api.ClientStatus;
import net.nanopay.partner.treviso.api.CurrentPlatform;
import net.nanopay.partner.treviso.api.Document;
import net.nanopay.partner.treviso.api.Entity;
import net.nanopay.partner.treviso.api.FepWeb;
import net.nanopay.partner.treviso.api.FepWebResponse;
import net.nanopay.country.br.exchange.Boleto;
import net.nanopay.country.br.exchange.BoletoStatusResponse;
import net.nanopay.country.br.exchange.GetBoletoStatus;
import net.nanopay.country.br.exchange.InsertBoleto;
import net.nanopay.country.br.exchange.InsertBoletoResponse;
import net.nanopay.country.br.exchange.InsertTitular;
import net.nanopay.country.br.exchange.InsertTitularResponse;
import net.nanopay.country.br.exchange.Moeda;
import net.nanopay.country.br.exchange.Natureza;
import net.nanopay.partner.treviso.api.ResponsibleArea;
import net.nanopay.country.br.exchange.Pais;
import net.nanopay.partner.treviso.api.SaveEntityRequest;
import net.nanopay.partner.treviso.api.SearchCustomerRequest;
import net.nanopay.partner.treviso.api.SearchCustomerResponse;
import net.nanopay.country.br.exchange.SearchNatureza;
import net.nanopay.country.br.exchange.SearchNaturezaResponse;
import net.nanopay.country.br.exchange.SearchTitular;
import net.nanopay.country.br.exchange.SearchTitularCapFin;
import net.nanopay.country.br.exchange.SearchTitularCapFinResponse;
import net.nanopay.country.br.exchange.SearchTitularResponse;
import net.nanopay.country.br.exchange.ServiceStatus;
import net.nanopay.country.br.exchange.Titular;
import net.nanopay.country.br.exchange.UpdateTitular;
import net.nanopay.country.br.exchange.UpdateTitularResponse;
import net.nanopay.payment.Institution;
import net.nanopay.tx.FeeLineItem;
import net.nanopay.tx.FeeSummaryTransactionLineItem;
import net.nanopay.tx.fee.Rate;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

public class TrevisoService extends ContextAwareSupport implements TrevisoServiceInterface, FXService, ExchangeService {

  private FepWeb fepWebService;
  private ExchangeService exchangeService;
  private final Logger logger_;

  public TrevisoService(X x, final FepWeb fepWebService, final Exchange exchangeClient) {
    this.fepWebService = fepWebService;
    this.exchangeService = new ExchangeServiceProvider(x, exchangeClient);
    setX(x);
    this.logger_ = (Logger) x.get("logger");
  }

  public FepWebClient createEntity(X x, long userId) {
    FepWebClient client = findClient(userId);
    if ( client != null ) return client;

    User user = (User) ((DAO) x.get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    try {
      SaveEntityRequest request = buildSaveEntityRequest(x, user, findCpfCnpj(userId));
      FepWebResponse res = fepWebService.saveEntity(request);
      if ( res == null ) throw new RuntimeException("Unable to get a valid response from FepWeb.");
      if ( res.getCode() != 0 )
        throw new RuntimeException("Error onboarding Treviso client to FepWeb. " + res.getMessage());

      return saveFepWebClient(user.getId(), "Active");
    } catch(Throwable t) {
      throw new RuntimeException(t);
    }
  }

  public void updateEntity(X x, long userId) {
    User user = (User) ((DAO) x.get("bareUserDAO")).find(userId);
    if ( user instanceof Contact ) return;
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    try {
      SaveEntityRequest request = buildSaveEntityRequest(x, user, findCpfCnpj(userId));
      FepWebResponse res = fepWebService.saveEntity(request);
      if ( res == null )
        throw new RuntimeException("Update failed. No response from FepWeb.");
      if ( res != null && res.getCode() != 0 )
        throw new RuntimeException("Error updating Treviso client on FepWeb. " + res.getMessage());

    } catch(Throwable t) {
      throw t;
    }
  }

  public FepWebClient searchCustomer(X x, long userId) {
    User user = (User) ((DAO) x.get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    try {
      SearchCustomerRequest request = new SearchCustomerRequest();
      request.setExtCode(user.getId());
      SearchCustomerResponse res = fepWebService.searchCustomer(request);
      if ( res != null && res.getEntityDTOList() != null && res.getEntityDTOList().length > 0  ) {
        Entity entity = (Entity) res.getEntityDTOList()[0];
        return saveFepWebClient(user.getId(), entity.getStatus());
      }
    } catch(Throwable t) {
      logger_.error("Error searching Treviso client.", t);
      throw new RuntimeException("Error searching Treviso client. " + t.getMessage());
    }
    return null;
  }

  protected SaveEntityRequest buildSaveEntityRequest(X x, User user, String cnpj) {
    Region region = user.getAddress().findRegionId(x);
    SaveEntityRequest request = new SaveEntityRequest();
    request.setExtCode(user.getId());
    request.setPersonType((user instanceof Business) ? "J" : "P");
    request.setSocialName(getName(user));
    request.setFntsyNm(getName(user));
    request.setCnpjCpf(cnpj);
    request.setIe(region.getName());
    request.setIm(user.getAddress().getCity());
    net.nanopay.partner.treviso.api.Address address = new net.nanopay.partner.treviso.api.Address();
    TrevisoCredientials credentials = (TrevisoCredientials) x.get("trevisoCredientials");
    address.setExtCode(credentials.getFepWebCode());
    address.setCityName(user.getAddress().getCity());
    address.setAddrName(user.getAddress().getStreetName());
    address.setAddrNr(user.getAddress().getStreetNumber());
    address.setZip(user.getAddress().getPostalCode());
    address.setBusPhoneNr(user.getPhoneNumber());
    address.setStAbbrvtn(region.getName());
    net.nanopay.partner.treviso.api.Address[] adresses = new net.nanopay.partner.treviso.api.Address[1];
    adresses[0] = address;
    request.setAddresses(adresses);
    ResponsibleArea area = new ResponsibleArea();
    if ( credentials != null ) {
      area.setExtCode(credentials.getFepWebCode());
      area.setRespAreaNm(credentials.getFepWebCodeName());
      CurrentPlatform platform = new CurrentPlatform();
      platform.setExtCode(credentials.getFepWebCode()); // Set from where?
      platform.setPltfrmNm(credentials.getFepWebCodeName()); // TODO should this be hardcoded?
      area.setCurrentPlatform(platform);
    } else {
      throw new RuntimeException("Invalid credentials");
    }
    request.setResponsibleArea(area);
    request.setDocuments(buildCustomerDocuments(user));
    request.setStatus("A");
    request.setFlagDgtlSign(1); // TODO

    return request;
  }

  protected Document[] buildCustomerDocuments(User user) {
    return null;
  }

  public FepWebClient findClient(long user) {
    return (FepWebClient) ((DAO)
      getX().get("fepWebClientDAO")).find(EQ(FepWebClient.USER, user));
  }

  protected FepWebClient saveFepWebClient(long userId, String status) {
    DAO fepWebClientDAO = (DAO) getX().get("fepWebClientDAO");
    FepWebClient client  = findClient(userId);
    if ( client == null ) {
      client = (FepWebClient) fepWebClientDAO.put(new FepWebClient.Builder(getX())
        .setUser(userId)
        .setStatus(status)
        .build());
    }
    return client;
  }

  protected String getName(User user) {
    if ( user instanceof Business ) return ((Business) user).getBusinessName();
    return user.getLegalName();
  }

  protected String findCpfCnpj(long userId) {
    User user = (User) ((DAO) getX().get("bareUserDAO")).find(userId);
    if ( user instanceof Business ) return findCNPJ(userId);

    return findCPF(userId);
  }

  protected String findCNPJ(long userId) {
    UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) getX().get("userCapabilityJunctionDAO")).find(AND(
      EQ(UserCapabilityJunction.TARGET_ID, "688cb7c6-7316-4bbf-8483-fb79f8fdeaaf"),
      EQ(UserCapabilityJunction.SOURCE_ID, userId)
    ));

    if ( ucj != null ) return ucj.getData() != null ? ((BrazilBusinessInfoData)ucj.getData()).getCnpj() : "";

    return "";
  }

  protected String findCPF(long userId) {
    UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) getX().get("userCapabilityJunctionDAO")).find(AND(
      EQ(UserCapabilityJunction.TARGET_ID, "fb7d3ca2-62f2-4caf-a84c-860392e4676b"),
      EQ(UserCapabilityJunction.SOURCE_ID, userId)
    ));

    if ( ucj != null && ucj.getData() != null ) return ((CPF) ucj.getData()).getData();

    return "";
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,  long destinationAmount,
                           String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {
    // Get FX from AFEX
    return ((AFEXServiceProvider) getX().get("afexServiceProvider"))
      .getFXRate(sourceCurrency, targetCurrency, sourceAmount, destinationAmount, fxDirection, valueDate, user, fxProvider);
  }

  public double getFXSpotRate(String sourceCurrency, String targetCurrency, long userId) throws RuntimeException {
    // Get FX SPOT rate from AFEX
    return ((AFEXServiceProvider) getX().get("afexServiceProvider")).getFXSpotRate(sourceCurrency, targetCurrency, userId);
  }

  public boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    // TODO: Decide whether to this is necessary
    return true;
  }

  public ExchangeCustomer createExchangeCustomerDefault(long userId) throws RuntimeException {
    return exchangeService.createExchangeCustomerDefault(userId);
  }

  public ExchangeCustomer createExchangeCustomer(long userId, long amount) throws RuntimeException {
    return exchangeService.createExchangeCustomer(userId, amount);
  }

  public long getTransactionLimit(long userId) throws RuntimeException {
    return exchangeService.getTransactionLimit(userId);
  }

  public void updateTransactionLimit(long userId, long amount) throws RuntimeException {
    exchangeService.updateTransactionLimit(userId, amount);
  }

  public Transaction createTransaction(Transaction transaction) throws RuntimeException {
    return exchangeService.createTransaction(transaction);
  }

  public Transaction updateTransactionStatus(Transaction transaction) throws RuntimeException {
    return exchangeService.updateTransactionStatus(transaction);
  }

  public List searchNatureCode(String natureCode) throws RuntimeException {
    return exchangeService.searchNatureCode(natureCode);
  }

}

var path = require('path');
require(path.resolve(__dirname, "./files.js"));

var classes = [
  //model
  'net.nanopay.flinks.model.FlinksCall',
  'net.nanopay.flinks.model.FlinksRequest',
  'net.nanopay.flinks.model.FlinksAuthRequest',
  'net.nanopay.flinks.model.FlinksTransactionRequest',
  'net.nanopay.flinks.model.FlinksAccountRequest',
  'net.nanopay.flinks.model.FlinksAccountSummaryRequest',
  'net.nanopay.flinks.model.RefreshDeltaModel',
  'net.nanopay.flinks.model.FlinksAccountDetailRequest',
  'net.nanopay.flinks.model.FlinksAccountDetailAsyncRequest',
  'net.nanopay.flinks.model.FlinksMulAuthRequest',
  'net.nanopay.flinks.model.FlinksResponse',
  'net.nanopay.flinks.model.SecurityChallengeModel',
  'net.nanopay.flinks.model.LoginModel',
  'net.nanopay.flinks.model.FlinksInvalidResponse',
  'net.nanopay.flinks.model.FlinksAuthResponse',
  'net.nanopay.flinks.model.FlinksMFAResponse',
  'net.nanopay.flinks.model.BalanceModel',
  'net.nanopay.flinks.model.AccountModel',
  'net.nanopay.flinks.model.AddressModel',
  'net.nanopay.flinks.model.HolderModel',
  'net.nanopay.flinks.model.AccountTransactionModel',
  'net.nanopay.flinks.model.AccountWithDetailModel',
  'net.nanopay.flinks.model.AccountStatementModel',
  'net.nanopay.flinks.model.AccountStatementContainerModel',
  'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
  'net.nanopay.flinks.model.FlinksAccountsSummaryResponse',
  'net.nanopay.flinks.model.FlinksCredentials',
  //flinks frontend request model
  'net.nanopay.flinks.model.FlinksRespMsg',
  'net.nanopay.flinks.model.FlinksAccount',
  //flinks service
  'net.nanopay.flinks.FlinksAuth',
  'net.nanopay.flinks.ClientFlinksAuthService',
  'net.nanopay.flinks.MaskedFlinksAccountDAO',
  'net.nanopay.flinks.RefinedFlinksAccountDAO',
];
var abstractClasses = [];
var skeletons = [
  'net.nanopay.flinks.FlinksAuth'
];
var proxies = [];
var blacklist = [];

module.exports = {
  classes: classes,
  abstractClasses: abstractClasses,
  skeletons: skeletons,
  proxies: proxies,
  blacklist: blacklist
};

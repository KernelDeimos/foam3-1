var foam = require('../foam2/tools/classes.js')
foam.classes = foam.classes.map(function(element) { return [ 'foam2/src/', element ]; })
foam.abstractClasses = foam.abstractClasses.map(function(element) { return ['foam2/src/', element ]; })
foam.skeletons = foam.skeletons.map(function(element) { return ['foam2/src/', element ]; })
foam.proxies = foam.proxies.map(function(element) { return ['foam2/src/', element ]; })

var nanopay = require('../nanopay/tools/classes.js')
nanopay.classes = nanopay.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.abstractClasses = nanopay.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.skeletons = nanopay.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.proxies = nanopay.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var merchant = require('../merchant/tools/classes.js')
merchant.classes = merchant.classes.map(function(element) { return [ 'merchant/src/', element ]; })
merchant.abstractClasses = merchant.abstractClasses.map(function(element) { return [ 'merchant/src/', element ]; })
merchant.skeletons = merchant.skeletons.map(function(element) { return [ 'merchant/src/', element ]; })
merchant.proxies = merchant.proxies.map(function(element) { return [ 'merchant/src/', element ]; })

var interac = require('../interac/tools/classes.js')
interac.classes = interac.classes.map(function(element) { return [ 'interac/src/', element ]; })
interac.abstractClasses = interac.abstractClasses.map(function(element) { return [ 'interac/src/', element ]; })
interac.skeletons = interac.skeletons.map(function(element) { return [ 'interac/src/', element ]; })
interac.proxies = interac.proxies.map(function(element) { return [ 'interac/src/', element ]; })

var iso20022 = require('../nanopay/src/net/nanopay/iso20022/classes.js');
iso20022.classes = iso20022.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
iso20022.abstractClasses = iso20022.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
iso20022.skeletons = iso20022.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
iso20022.proxies = iso20022.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var iso8583 = require('../nanopay/src/net/nanopay/iso8583/classes.js');
iso8583.classes = iso8583.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
iso8583.abstractClasses = iso8583.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
iso8583.skeletons = iso8583.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
iso8583.proxies = iso8583.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var afx = require('../nanopay/src/net/nanopay/fx/ascendantfx/model/classes.js');
afx.classes = afx.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
afx.abstractClasses = afx.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
afx.skeletons = afx.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
afx.proxies = afx.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var kotak = require('../nanopay/src/net/nanopay/kotak/model/classes.js');
kotak.classes = kotak.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
kotak.abstractClasses = kotak.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
kotak.skeletons = kotak.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
kotak.proxies = kotak.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var flinks = require('../nanopay/src/net/nanopay/flinks/utils/classes.js');
flinks.classes = flinks.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
flinks.abstractClasses = flinks.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
flinks.skeletons = flinks.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
flinks.proxies = flinks.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var classes = [];
classes = classes.concat(
  foam.classes, nanopay.classes,
  merchant.classes,
  interac.classes,
  iso20022.classes,
  iso8583.classes,
  afx.classes,
  kotak.classes,
  flinks.classes);

var abstractClasses = [];
abstractClasses = abstractClasses.concat(
  foam.abstractClasses,
  nanopay.abstractClasses,
  merchant.abstractClasses,
  interac.abstractClasses,
  iso20022.abstractClasses,
  iso8583.abstractClasses,
  afx.abstractClasses,
  kotak.abstractClasses,
  flinks.abstractClasses);

var skeletons = [];
skeletons = skeletons.concat(
  foam.skeletons,
  nanopay.skeletons,
  merchant.skeletons,
  interac.skeletons,
  iso20022.skeletons,
  iso8583.skeletons,
  afx.skeletons,
  kotak.skeletons,
  flinks.skeletons);

var proxies = [];
proxies = proxies.concat(
  foam.proxies,
  nanopay.proxies,
  merchant.proxies,
  interac.proxies,
  iso20022.proxies,
  iso8583.proxies,
  afx.proxies,
  kotak.proxies,
  flinks.proxies);

var blacklist = [];
blacklist = blacklist.concat(
  foam.blacklist,
  nanopay.blacklist,
  merchant.blacklist,
  interac.blacklist,
  iso20022.blacklist,
  iso8583.blacklist,
  afx.blacklist,
  kotak.blacklist,
  flinks.blacklist);

module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies,
    blacklist: blacklist
}

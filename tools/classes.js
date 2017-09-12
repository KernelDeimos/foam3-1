var foam = require('../../foam2/tools/classes.js')
foam.classes = foam.classes.map(function(element) { return [ '../foam2/src/', element ]; })
foam.abstractClasses = foam.abstractClasses.map(function(element) { return ['../foam2/src/', element ]; })
foam.skeletons = foam.skeletons.map(function(element) { return ['../foam2/src/', element ]; })
foam.proxies = foam.proxies.map(function(element) { return ['../foam2/src/', element ]; })

var nanopay = require('../nanopay/tools/classes.js')
nanopay.classes = nanopay.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.abstractClasses = nanopay.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.skeletons = nanopay.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.proxies = nanopay.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var b2b = require('../b2b/classes.js')
b2b.classes = b2b.classes.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.abstractClasses = b2b.abstractClasses.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.skeletons = b2b.skeletons.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.proxies = b2b.proxies.map(function(element) { return [ 'b2b/src/', element ]; })

var retail = require('../retail/classes.js')
retail.classes = retail.classes.map(function(element) { return [ 'retail/src/', element ]; })
retail.abstractClasses = retail.abstractClasses.map(function(element) { return [ 'retail/src/', element ]; })
retail.skeletons = retail.skeletons.map(function(element) { return [ 'retail/src/', element ]; })
retail.proxies = retail.proxies.map(function(element) { return [ 'retail/src/', element ]; })

var admin = require('../admin-portal/classes.js')
admin.classes = admin.classes.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.abstractClasses = admin.abstractClasses.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.skeletons = admin.skeletons.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.proxies = admin.proxies.map(function(element) { return [ 'admin-portal/src/', element ]; })

var ingenico = require('../ingenico/classes.js')
ingenico.classes = retail.classes.map(function(element) { return [ 'ingenico/src/', element ]; })
ingenico.abstractClasses = retail.abstractClasses.map(function(element) { return [ 'ingenico/src/', element ]; })
ingenico.skeletons = retail.skeletons.map(function(element) { return [ 'ingenico/src/', element ]; })
ingenico.proxies = retail.proxies.map(function(element) { return [ 'ingenico/src/', element ]; })

var interac = require('../retail/classes.js')
interac.classes = interac.classes.map(function(element) { return [ 'interac/src/', element ]; })
interac.abstractClasses = interac.abstractClasses.map(function(element) { return [ 'interac/src/', element ]; })
interac.skeletons = interac.skeletons.map(function(element) { return [ 'interac/src/', element ]; })
interac.proxies = interac.proxies.map(function(element) { return [ 'interac/src/', element ]; })

var classes = [];
classes = classes.concat(foam.classes, nanopay.classes, b2b.classes, retail.classes, admin.classes, ingenico.classes, interac.classes)

var abstractClasses = [];
abstractClasses = abstractClasses.concat(foam.abstractClasses, nanopay.abstractClasses, b2b.abstractClasses, retail.abstractClasses, admin.abstractClasses, ingenico.abstractClasses, interac.abstractClasses)

var skeletons = [];
skeletons = skeletons.concat(foam.skeletons, nanopay.skeletons, b2b.skeletons, retail.skeletons, admin.skeletons, ingenico.skeletons, interac.skeletons)

var proxies = [];
proxies = proxies.concat(foam.proxies, nanopay.proxies, b2b.proxies, retail.proxies, admin.proxies, ingenico.proxies, interac.proxies)


module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
}
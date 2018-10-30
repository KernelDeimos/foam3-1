require('./files.js');

var classes = [
  'net.nanopay.iso8583.Padder',
  'net.nanopay.iso8583.Prefixer',
  'net.nanopay.iso8583.ISOComponent',
  'net.nanopay.iso8583.AbstractISOComponent',
  'net.nanopay.iso8583.ISOField',
  'net.nanopay.iso8583.ISOBinaryField',
  'net.nanopay.iso8583.ISOBitMapField',
  'net.nanopay.iso8583.ISOFieldPackager',
  'net.nanopay.iso8583.AbstractISOFieldPackager',
  'net.nanopay.iso8583.ISOAmountFieldPackager',
  'net.nanopay.iso8583.ISOBinaryFieldPackager',
  'net.nanopay.iso8583.ISOBitMapFieldPackager',
  'net.nanopay.iso8583.ISOStringFieldPackager',
  'net.nanopay.iso8583.ISOMessage',
  'net.nanopay.iso8583.ISOPackager',
  'net.nanopay.iso8583.AbstractISOPackager',
];

var abstractClasses = [];
var skeletons = [];
var proxies = [];
var blacklist = [];

module.exports = {
  classes: classes,
  abstractClasses: abstractClasses,
  skeletons: skeletons,
  proxies: proxies,
  blacklist: blacklist
};

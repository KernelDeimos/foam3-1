foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'BaseSearchResponseBody',

  documentation: 'Response body within BaseSearchResponse',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.dowJones.Match',
      name: 'matches',
      documentation: 'Array of match records returned from the request'
    }
  ]
});

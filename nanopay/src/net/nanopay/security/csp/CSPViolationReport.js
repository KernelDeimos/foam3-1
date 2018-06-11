foam.CLASS({
  package: 'net.nanopay.security.csp',
  name: 'CSPViolationReport',

  documentation: `DAO to store all of the reported Content Security Policy
    violations.`,

  ids: ['uuid'],

  properties: [
    {
      class: 'String',
      name: 'uuid',
      documentation: `UUID Version 1 (time-based), generated at the time at
        which the report was received.`
    },
    {
      class: 'DateTime',
      name: 'date',
      documentation: `Date and time when the report was logged.`
    },
    {
      class: 'String',
      name: 'ip',
      documentation: 'IP address of the violator.'
    },
    {
      class: 'String',
      name: 'blockedURI',
      documentation: `The URI of the resource that was blocked from loading by
        the Content Security Policy. If the blocked URI is from a different
        origin than the document-uri, then the blocked URI is truncated to
        contain just the scheme, host, and port.`
    },
    {
      class: 'String',
      name: 'disposition',
      documentation: `Either "enforce" or "reporting" depending on whether the
        Content-Security-Policy-Report-Only header or the Content-Security-Policy
        header is used.`
    },
    {
      class: 'String',
      name: 'documentURI',
      documentation: 'The URI of the document in which the violation occurred.'
    },
    {
      class: 'String',
      name: 'effectiveDirective',
      documentation: 'The directive whose enforcement caused the violation.'
    },
    {
      class: 'String',
      name: 'originalPolicy',
      documentation: `The original policy as specified by the
        Content-Security-Policy HTTP header.`
    },
    {
      class: 'String',
      name: 'referrer',
      documentation: `The referrer of the document in which the violation
        occurred.`
    },
    {
      class: 'String',
      name: 'scriptSample',
      documentation: `The first 40 characters of the inline script, event
        handler, or style that caused the violation.`
    },
    {
      class: 'String',
      name: 'statusCode',
      documentation: `The HTTP status code of the resource on which the global
        object was instantiated.`
    },
    {
      class: 'String',
      name: 'violatedDirective',
      documentation: 'The name of the policy section that was violated.'
    }
  ]
});

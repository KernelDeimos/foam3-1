foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'IdentityMindResponse',

  tableColumns: [
    'apiName',
    'statusCode',
    'entityId',
    'frp',
    'res'
   ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'entityType'
    },
    {
      class: 'Object',
      name: 'entityId'
    },
    {
      class: 'Int',
      name: 'statusCode'
    },
    {
      class: 'String',
      name: 'apiName',
      documentation: 'The name of the IdentityMind API that was requested.'
    },
    {
      class: 'String',
      name: 'requestJson',
      view: {
        class: 'io.c9.ace.Editor',
        config: {
          width: 600, height: 200,
          mode: 'JSON',
          isReadOnly: true
        }
      }
    },
    {
      class: 'String',
      name: 'error_message'
    },
    {
      class: 'String',
      name: 'user',
      documentation: 'Current reputation of the user.',
      label: 'User reputation'
    },
    {
      class: 'String',
      name: 'upr',
      documentation: 'Previous reputation of the user.',
      label: 'Previous reputation'
    },
    {
      class: 'String',
      name: 'frn',
      documentation: 'Name of the fraud rule that fired.',
      label: 'Fraud rule name'
    },
    {
      class: 'String',
      name: 'frp',
      documentation: 'Result of fraud evaluation.',
      label: 'Fraud evaluation result'
    },
    {
      class: 'String',
      name: 'frd',
      documentation: 'Description of the fraud rule that fired.',
      label: 'Fraud rule description'
    },
    {
      class: 'String',
      name: 'arpr',
      documentation: 'Result of automated review evaluation.',
      label: 'Automated review'
    },
    {
      class: 'String',
      name: 'arpd',
      documentation: 'Description of the automated review rule that fired.',
      label: 'Automated review rule description'
    },
    {
      class: 'String',
      name: 'arpid',
      documentation: 'Id of the automated review rule that fired.',
      label: 'Automated review rule id'
    },
    {
      class: 'String',
      name: 'tid',
      documentation: 'Current transaction id.',
      label: 'IDM transaction id'
    },
    {
      class: 'String',
      name: 'erd',
      documentation: `Description of the reason for the user's reputation.`,
      label: 'User reputation description'
    },
    {
      class: 'String',
      name: 'res',
      documentation: 'Result of policy evaluation. Combines the result of fraud and automated review evaluations.',
      label: 'Result of policy evaluation'
    },
    {
      class: 'String',
      name: 'rcd',
      documentation: 'The set of result codes from the evaluation of the current transaction.',
      label: 'Result codes'
    },
    {
      class: 'Map',
      name: 'ednaScoreCard',
      label: 'eDNA score card',
      view: {
        class: 'foam.u2.view.AnyView'
      }
    }
  ]
});

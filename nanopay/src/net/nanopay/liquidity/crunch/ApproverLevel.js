foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'ApproverLevel',
  implements: [ 'foam.core.Validatable' ],

  messages: [
    { name: 'approverLevelRangeError', message: 'Approver level must be a value between 1 and 2.' },
  ],

  properties: [
    {
      name: 'approverLevel',
      class: 'Int',
      min: 1, 
      max: 2,
      validateObj: function(approverLevel) {
        if ( approverLevel < this.APPROVER_LEVEL.min || approverLevel > this.APPROVER_LEVEL.max ) {
          return this.approverLevelRangeError;
        }
      }
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( getApproverLevel() < 1 || getApproverLevel() > 2 ) 
          throw new RuntimeException(APPROVER_LEVEL_RANGE_ERROR);
      `,
    }
  ]
});

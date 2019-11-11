/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.ticket',
  name: 'SudoTicketApprovalResponseRule',
  extends: 'foam.nanos.ruler.Rule',

  javaImports: [
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'foam.nanos.ruler.predicate.*'
  ],

  properties: [
    // {
    //   name: 'predicate',
    //   javaFactory: `
    // return OR(
    //   new PropertyChangePredicate.Builder(getX())
    //     .setPropName("approvalStatus").build(),
    //   new PropertyChangePredicate.Builder(getX())
    //     .setPropName("status").build()
    // );
    //   `
    // },
    {
      documentation: 'The group with sufficient priveledges to view the system as the requested user.',
      name: 'assignToGroup',
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      value: 'admin',
      view: function(_, x) {
        return foam.u2.view.ChoiceView.create({
          dao: x.groupDAO,
          placeholder: 'Select... ',
          objToChoice: function(g) {
            return [g.id, g.id];
          }
        }, x);
      },
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        super.validate(x);
        if ( SafetyUtil.isEmpty(getAssignToGroup()) ) {
          throw new IllegalStateException("SudoTicketApprovalResponseRule assignToGroup not set.");
        }
      `
    }
  ]
});

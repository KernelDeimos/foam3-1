/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UCJUpdateApprovable',
  extends: 'foam.nanos.approval.CompositeApprovable',
  implements: ['foam.nanos.approval.CustomViewReferenceApprovable'],

  requires: [
    'foam.u2.crunch.EasyCrunchWizard'
  ],

  javaImports: [
    'foam.u2.crunch.EasyCrunchWizard'
  ],

  properties: [
    {
      name: 'associatedTopLevelUCJ',
      class: 'foam.nanos.crunch.UCJProperty',
      documentation: `
        A top-level UCJ associated with these changes. If a UCJUpdateApprovable
        ever contains a collection of UCJs that do not have a common parent,
        this can refer to an arbitrary UCJ among those with the most specific
        subject association.
      `
    },
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.EasyCrunchWizard',
      factory: function() {
        return this.EasyCrunchWizard.create();
      },
      javaFactory: `
        return new EasyCrunchWizard();
      `
    }
  ],

  methods: [
    async function launchViewReference(x, approvalRequest) {
      var ucj = (await x.userCapabilityJunctionDAO
        .where(this.associatedTopLevelUCJ).select()).array[0];
      x.stack.push({
        class: this.config.view,
        data: ucj,
        config: this.config
      });
    },
    {
      name: 'toSummary',
      code: function() {
        return this.associatedTopLevelUCJ.toSummary();
      }
    }
  ]
});

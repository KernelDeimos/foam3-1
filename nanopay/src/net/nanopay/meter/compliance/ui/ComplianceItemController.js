foam.CLASS({
  package: 'net.nanopay.meter.compliance.ui',
  name: 'ComplianceItemController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with compliance items.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.meter.compliance.ComplianceItem'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'dowJonesResponseDAO',
    'identityMindResponseDAO',
    'securefactLEVDAO',
    'securefactSIDniDAO',
    'stack',
    'user'
  ],

  exports: [
    'dao',
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function(complianceItem) {
        if ( complianceItem.dowJones ) {
          this.dao = this.dowJonesResponseDAO;
          this.stack.push({
            class: 'foam.comics.DAOUpdateControllerView',
            detailView: 'foam.u2.DetailView',
            key: complianceItem.dowJones
          }, this);
        } else if ( complianceItem.identityMind ) {
          this.dao = this.identityMindResponseDAO;
          this.stack.push({
            class: 'foam.comics.DAOUpdateControllerView',
            detailView: 'foam.u2.DetailView',
            key: complianceItem.identityMind
          }, this);
        } else if ( complianceItem.levResponse ) {
          this.dao = this.securefactLEVDAO;
          this.stack.push({
            class: 'foam.comics.DAOUpdateControllerView',
            detailView: 'foam.u2.DetailView',
            key: complianceItem.levResponse
          }, this);
        } else if ( complianceItem.sidniResponse ) {
          this.dao = this.securefactSIDniDAO;
          this.stack.push({
            class: 'foam.comics.DAOUpdateControllerView',
            detailView: 'foam.u2.DetailView',
            key: complianceItem.sidniResponse
          }, this);
        }
      }
    }
  ]
});

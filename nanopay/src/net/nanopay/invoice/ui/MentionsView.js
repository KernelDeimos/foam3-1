
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'MentionsView',
  extends: 'foam.u2.View',

  documentation: 'View displaying alerts & mentions',

  implements: [
    'foam.mlang.Expressions', 
  ],
  
  requires: [
    'net.nanopay.invoice.model.Invoice'
  ],

  imports: [ 
    'invoiceDAO', 
    'formatCurrency' 
  ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.invoiceDAO; }
    },
    {
      class: 'Currency',
      name: 'formattedMentionsAmount',
      expression: function(disputedAmount, pendingAmount) { 
        var a = disputedAmount + pendingAmount;
        return this.formatCurrency(a); 
      }
    },
    {
      class: 'Double',
      name: 'disputedAmount',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      class: 'Currency',
      name: 'formattedDisputedAmount',
      expression: function(disputedAmount) { return this.formatCurrency(disputedAmount); }
    },
    {
      class: 'Double',
      name: 'pendingAmount',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    { 
      class: 'Currency',
      name: 'formattedPendingAmount',
      expression: function(pendingAmount) { return this.formatCurrency(pendingAmount); }
    },
    'pendingCount',
    'draftCount',
    'disputedCount'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          margin-bottom: 20px;
        }
        ^ .net-nanopay-invoice-ui-SummaryCard{
          width: 26.89%;
        }
      */}
    })
  ],

  messages: [
    { name: 'title', message: 'Mentions' },
    { name: 'disputeLabel',       message: 'Disputed' },
    { name: 'pendingLabel', message: 'Pending Approval' },
    { name: 'draftLabel',      message: 'Draft' }
  ],

  methods: [
    function initE() {
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start().addClass('blue-card-title')
          .add(this.title)
          .start().addClass('thin-align').add(this.formattedMentionsAmount$).end()
        .end()
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count: this.disputedCount$, amount: this.formattedDisputedAmount$, status: this.disputeLabel })
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count: this.pendingCount$, amount: this.formattedPendingAmount$, status: this.pendingLabel })
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count: this.draftCount$, amount: null, status: this.draftLabel })
    },
  ],

  listeners:[
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;

        var disputedDAO = this.invoiceDAO.where(this.EQ(this.Invoice.STATUS, "Disputed"));

        disputedDAO.select(this.COUNT()).then(function(count) {
          self.disputedCount = count.value;
        });

        disputedDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.disputedAmount = sum.value.toFixed(2);
        });

        var pendingDAO = this.invoiceDAO.where(this.EQ(this.Invoice.STATUS, "Pending"));

        pendingDAO.select(this.COUNT()).then(function(count) {
          self.pendingCount = count.value;
        });

        pendingDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.pendingAmount = sum.value.toFixed(2);
        });

        var draftDAO = this.invoiceDAO.where(this.EQ(this.Invoice.STATUS, "Draft"));

        draftDAO.select(this.COUNT()).then(function(count) {
          self.draftCount = count.value;
        });
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ExpensesDetailView',
  extends: 'foam.u2.View',

  requires: [ 
    'foam.u2.dialog.Popup' 
  ],

  imports: [ 
    'stack', 
    'hideSaleSummary', 
    'invoiceDAO', 
    'ctrl'
  ],
  
  implements: [
    'foam.mlang.Expressions', 
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ h5{
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          color: #093649;
          padding-top: 70px;
        }
        */
      }
    })
  ],


  methods: [
    function initE() {
      this.SUPER();
      this.hideSaleSummary = true;

      this
        .addClass(this.myClass())
        .start(this.BACK_ACTION).end()
        .tag({ 
          class: 'net.nanopay.invoice.ui.shared.ActionInterfaceButton', 
          invoice: this.data,
          detailActions: { 
            invoice: this.invoice,
            buttonLabel: 'Pay Now', 
            buttonAction: this.payNowPopUp, 
            subMenu1: 'Schedule a Payment', 
            subMenuAction1: this.schedulePopUp, 
            subMenu2: 'Dispute', subMenuAction2: 
            this.disputePopUp 
          }
        })
        .start('h5').add('Invoice from ', this.data.toUserName).end()
        .tag({ class: 'net.nanopay.invoice.ui.shared.SingleItemView', data: this.data })
    }
  ],

  listeners: [
    function payNowPopUp(){
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.PayNowModal'}));
    },

    function disputePopUp(){
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.DisputeModal'}));
    },

    function schedulePopUp(){
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.ScheduleModal'}));
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        console.log('hit')
      }
    }
  ]
});
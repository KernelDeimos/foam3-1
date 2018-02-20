foam.CLASS({
  package: 'net.nanopay.invoice.ui.shared',
  name: 'SingleItemView',
  extends: 'foam.u2.View',

  imports: [
    'addCommas',
    'user',
    'invoiceDAO',
    'stack'
  ],

  requires: [
    'foam.u2.PopupView'
  ],

  properties: [
    'popupMenu_',
    [ 'hidden', true ],
    {
      name: 'type',
      expression: function(data, user){
        return user.id != data.payeeId
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^table-header{
          width: 962px;
          height: 40px;
          background-color: rgba(110, 174, 195, 0.2);
          padding-bottom: 10px;
          margin: 0;
        }
        ^ h3{
          width: 150px;
          display: inline-block;
          font-size: 14px;
          line-height: 1;
          font-weight: 500;
          text-align: center;
          color: #093649;
        }
        ^ h4{
          width: 150px;
          display: inline-block;
          font-size: 14px;
          line-height: 1;
          font-weight: 500;
          text-align: center;
          color: #093649;
        }
        ^table-body{
          width: 962px;
          height: 40px;
          background: white;
          padding: 10px 0 10px 0;
          margin: 0;
        }
        ^ p{
          display: inline-block;
          width: 90px;
        }
        ^table-body h3{
          font-weight: 300;
          font-size: 12px;
        }
        ^table-body h4{
          font-weight: 300;
          font-size: 12px;
        }
        ^ .table-attachment {
          width: 20px;
          height: 20px;
          float: left;
          padding: 10px 0 0 10px;
        }
        ^ .table-attachment img {
          width: 20px;
          height: 20px;
          object-fit: contain;
          cursor: pointer;
          position: sticky;
          z-index: 10;
        }
        ^ .dropdown {
          position: relative;
          display: inline-block;
        }
        ^ .dropdown-content {
          position: absolute;
          background-color: #ffffff;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
        }
        ^ .hidden {
          display: none;
        }
        */
      }
    })
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      this.stack.sub(function(){self.itemUpdate()});

      this
        .addClass(this.myClass())
        .start('div').addClass('invoice-detail')
          .start().addClass(this.myClass('table-header'))
            .callIf(this.data.invoiceFile[0], function(){
              this.start().addClass('table-attachment').end()
            })
            .start('h3').add('Invoice #').end()
            .start('h3').add('PO #').end()
            .call(function(){
              self.type ? this.start('h3').add('Vendor').end() : this.start('h3').add('Customer').end()
            })
            .start('h4').add('Date Due').end()
            .start('h4').add('Amount').end()
            .start('h3').add('Status').end()
          .end()
          .start().addClass(this.myClass('table-body'))
            .callIf(this.data.invoiceFile[0], function(){
              this.start().addClass('table-attachment')
                .start('span', null, self.popupMenu_$)
                  .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-attachment.svg' })
                  .on('click', self.onAttachmentButtonClick)
                .end()
              .end()
            })
            .start('h3').add(this.data.invoiceNumber).end()
            .start('h3').add(this.data.purchaseOrder).end()
            .start('h3').add(this.type ? this.data.payeeName : this.data.payerName).end()
            .start('h4').add(this.data.dueDate ? this.data.dueDate.toISOString().substring(0,10) : '').end()
            .start('h4').add('$', this.addCommas(this.data.amount.toFixed(2))).end()
            .start('h3')
              .add(this.data.status$.map(function(a) {
                return self.E().add(a).addClass('generic-status Invoice-Status-' + a);
              }))
          .end()
        .end()
    }
  ],

  listeners: [
    {
      name: 'itemUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.invoiceDAO.find(this.data.id).then(function(invoice) {
          self.data.status = invoice.status;
          self.data.paymentMethod = invoice.paymentMethod;
        });
      }
    },
    {
      name: 'onAttachmentButtonClick',
      code: function (e) {
        var p = this.PopupView.create({
          minWidth: 175,
          width: 275,
          padding: 0.1,
          x: 0.1,
          y: 20
        });

        p.addClass('dropdown-content')
        .call(function () {
          var files = this.data.invoiceFile;
          for ( var i = 0 ; i < files.length ; i++ ) {
            p.tag({
              class: 'net.nanopay.invoice.ui.InvoiceFileView',
              data: files[i],
              fileNumber: i + 1,
              removeHidden: true
            })
          }
        }.bind(this));

        this.popupMenu_.add(p);
      }
    }
  ]
});
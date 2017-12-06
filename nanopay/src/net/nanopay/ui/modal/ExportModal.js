foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'ExportModal',
  extends: 'foam.u2.View',

  documentation: 'Export Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.util.Iso20022',
    'net.nanopay.iso20022.ISO20022Driver',
    'foam.nanos.export.JSONDriver',
    'foam.nanos.export.XMLDriver',
    'foam.nanos.export.CSVDriver'
  ],

  properties: [
    {
      name: 'iso20022',
      factory: function () {
        return this.Iso20022.create();
      }
    },
    {
      name: 'iso20022Driver',
      factory: function () {
        return this.ISO20022Driver.create();
      }
    },
    {
      name: 'jsonDriver',
      factory: function (){
        return this.JSONDriver.create();
      }
    },
    {
      name: 'xmlDriver',
      factory: function () {
        return this.XMLDriver.create();
      }
    },
    {
      name: 'csvDriver',
      factory: function () {
        return this.CSVDriver.create();
      }
    },
    {
      name: 'dataType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.exportDriverRegistryDAO,
          objToChoice: function(a){
            return [a.id, a.id];
          }
        })
      }
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    'exportData'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        width: 448px;
        margin: auto;
      }
      ^ .foam-u2-tag-Select {
        width: 125px;
        height: 40px;
        border-radius: 0;
        margin-left: 25px;
        padding: 12px 20px;
        border: solid 1px rgba(164, 179, 184, 0.5);
        background-color: white;
        outline: none;
      }
      ^ .foam-u2-tag-Select:hover {
        cursor: pointer;
      }
      ^ .foam-u2-tag-Select:focus {
        border: solid 1px #59A5D5;
      }
      ^ .label{
        margin-top: 10px;
      }
      ^ .note {
        height: 150px;
        width: 398px;
        margin-left: 25px;
      }
    */}
    })
  ],
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
      .tag(this.ModalHeader.create({
        title: 'Export'
      }))
      .addClass(this.myClass())
        .startContext({ data: this})
          .start()
            .start().addClass('label').add("Data Type").end()
            .start(this.DATA_TYPE).end()
            .start().addClass('label').add("Response").end()
            .start(this.NOTE).addClass('input-box note').end()
            .start(this.CONVERT).addClass('blue-button btn').end()
          .end()
        .end()
      .end()
    } 
  ],

  actions: [
    function convert(){
      var self = this;

      if (this.dataType == 'JSON') {
        this.jsonDriver.exportDAO(this.__context__, this.exportData).then(function (result) {
          self.note = result;
        });
      } else if (this.dataType == 'XML') {
        this.xmlDriver.exportDAO(this.__context__, this.exportData).then(function (result) {
          self.note = result;
        });
        //this.note = this.xmlDriver.exportFObject(null, this.exportData);
      } else if (this.dataType == 'CSV') {
        this.csvDriver.exportDAO(this.__context__, this.exportData).then(function (result) {
          self.note = result;
        });
      }
    }
  ]
})
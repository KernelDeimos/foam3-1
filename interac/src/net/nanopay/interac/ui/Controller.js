foam.CLASS({
  package: 'net.nanopay.interac.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',

  implements: [
    'foam.nanos.client.Client',
    'net.nanopay.interac.client.Client',
    'net.nanopay.transactionservice.client.Client',
    'net.nanopay.interac.dao.Storage',
    'net.nanopay.common.dao.Storage',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.common.model.Account',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.interac.Iso20022',
    'net.nanopay.iso20022.ISO20022Driver'
  ],

  exports: [
    'stack',
    'user',
    'country',
    'as ctrl'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        .stack-wrapper{
          min-height: calc(80% - 60px);
          margin-bottom: -10px;
        }
        .stack-wrapper:after{
          content: "";
          display: block;
        }
        .stack-wrapper:after, .net-nanopay-interac-ui-shared-FooterView{
          height: 10px;
        }
        .foam-u2-ActionView-payNow {
          width: 80px;
          height: 30px;
          border: none !important;
          background: #59a5d5 !important;
          font-size: 10px !important;
          color: white !important;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function() { return this.User.create(); }
    },
    {
      name: 'stack',
      factory: function () {
        return this.Stack.create();
      }
    },
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
      class: 'String',
      name: 'country'
    }
  ],

  methods: [
    function init () {
      this.SUPER();
      var self = this;

      net.nanopay.interac.Data.create(undefined, this);

//       var message = this.iso20022.GENERATE_PACS008_MESSAGE(1).then(function (message) {
//         if ( ! message ) return;
//         console.log(message);
//         console.log(self.iso20022Driver.exportFObject(null, message));
//       })
//       .catch(function (err) {
//         console.log('err = ', err);
//       })
      
      // Injecting Sample Partner
      // this.userDAO.limit(1).select().then(function(a) {
      //   self.user.copyFrom(a.array[0]);
      // });
    },

    function initE() {
      var self = this;

      net.nanopay.interac.Data.create(undefined, this);

      if(this.country == 'Canada') {
        this.stack.push({ class: 'net.nanopay.interac.ui.CanadaTransactionsView' });
      } else if(this.country == 'India') {
        this.stack.push({ class: 'net.nanopay.interac.ui.IndiaTransactionsView' });
      }

      this
        .addClass(this.myClass());
        /*.add(this.user$.dot('id').map(function (id) {
          return id ?
            self.E().tag({class: 'net.nanopay.interac.ui.shared.topNavigation.TopNav', data: self.business }) :
            self.E().tag({class: 'net.nanopay.interac.ui.shared.topNavigation.NoMenuTopNav' });
        }))*/
        
        if(this.country == 'Canada') {
          this.add(self.E().tag({class: 'net.nanopay.interac.ui.shared.topNavigation.CanadaTopNav', data: self.business}));
          this.userDAO.limit(1).select(this.EQ(this.User.ID, 1)).then(function(a) {
            self.user.copyFrom(a.array[0]);
          });
          this.stack.push({ class: 'net.nanopay.interac.ui.CanadaTransactionsView' });
        } else if(this.country == 'India') {
          this.add(self.E().tag({class: 'net.nanopay.interac.ui.shared.topNavigation.IndiaTopNav', data: self.business}));
          this.userDAO.limit(1).select(this.EQ(this.User.ID, 2)).then(function(a) {
            self.user.copyFrom(a.array[0]);
          });
          this.stack.push({ class: 'net.nanopay.interac.ui.IndiaTransactionsView' });
        }
        
        this.br()
        .start('div').addClass('stack-wrapper')
          .tag({ class: 'foam.u2.stack.StackView', data: this.stack, showActions: false })
        .end()
        .br()
        .tag({class: 'net.nanopay.interac.ui.shared.FooterView'})
    }
  ]

});

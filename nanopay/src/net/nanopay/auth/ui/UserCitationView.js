foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'UserCitationView',
  extends: 'foam.u2.View',

  imports: [
    'publicBusinessDAO'
  ],

  documentation: 'A single row in a list of users.',

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
    }

    ^:hover {
      background: #f4f4f9;
      cursor: pointer;
    }

    ^company {
      font-size: 12px;
      color: #424242;
    }

    ^name {
      color: #999;
      font-size: 10px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'data',
      documentation: 'Set this to the user you want to display in this row.'
    }
  ],

  methods: [
    async function initE() {
      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass(this.myClass('company'))
            .add(await this.getCompanyName())
          .end()
          .start()
            .addClass(this.myClass('name'))
            .add(this.data.legalName)
          .end()
        .end();
    },
    async function getCompanyName() {
      let obj = this.data;
      if ( ! obj.businessId ) {
        return obj.organization;
      } else {
        var business = await this.publicBusinessDAO.find(obj.businessId);
        return business.label();
      }
    }
  ]
});

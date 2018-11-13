foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'NotificationDashboardView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.invoice.model.Invoice',
  ],

  imports: [
    'invoiceDAO',
    'user'
  ],

  css: `
    ^ {
      margin-bottom: 4px;
      border-radius: 4px;
      padding: 8px 0;
    }
    ^grid {
      display: grid;
      grid-template-columns: 32px 1fr;
      grid-column-gap: 18px;
      min-height: 32px;
    }
    ^left-column {
      display: flex;
      justify-content: center;
      align-items: center;
      grid-column-start: 1;
    }
    ^right-column {
      grid-column-start: 1;
    }
    ^message {
      margin-bottom: 4px;
    }
    ^ .date {
      color: #8e9090;
      margin-top: 8px;
    }
  `,

  properties: [
    'data',
    {
      class: 'String',
      name: 'currencyFormatted',
      value: '...',
      documentation: `Used internally to show the formatted currency value.`
    },
    {
      name: 'bodyMsg',
      class: 'String'
    },
    {
      name: 'date',
      class: 'String'
    },
    {
      name: 'icon',
      value: { class: 'foam.u2.tag.Image', data: 'images/canada.svg' }
    }
  ],

  methods: [
    function initE() {
      // Get body msg
      this.bodyMsg = this.data.notificationType;
      if ( this.bodyMsg.includes('Invoice') ) {
        this.invoiceDAO.find(this.data.invoiceId).then((invoice) => {
          if ( invoice == null ) this.bodyMsg = 'The invoice for this notification can no longer be found.';
          if ( invoice.payeeId === this.user.id ) {
            var name = invoice.payer.businessName ?
              invoice.payer.businessName :
              invoice.payer.label();
            this.bodyMsg = `Received payment from ${name} for ${this.currencyFormatted}`;
          }
          var name = invoice.payee.businessName ? invoice.payee.businessName : invoice.payee.label();
          this.bodyMsg = `Sent payment to ${name} for $${invoice.amount/100}`;
        }).catch((_) => {
          this.bodyMsg = ' ';
        });
      } else this.bodyMsg = this.data.body;

      // Get date
      this.date = this.data.issuedDate ?
          this.spliceDateFormatter(this.data.issuedDate.toISOString().slice(0, 10)) : '';

      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass(this.myClass('right-column'))
            .start()
              .add(this.bodyMsg$)
              .addClass(this.myClass('message'))
            .end()
            .start()
              .addClass('date')
              .add(this.date$)
            .end()
          .end()
        .end();
      },

    function spliceDateFormatter(dateString) {
      let splitDate = dateString.split('-');
      let date = dateString;
      if ( splitDate.length === 3 ) {
        switch ( parseInt(splitDate[1]) ) {
          case 1:
            date = 'January';
            break;
          case 2:
            date = 'February';
            break;
          case 3:
            date = 'March';
            break;
          case 4:
            date = 'April';
            break;
          case 5:
            date = 'May';
            break;
          case 6:
            date = 'June';
            break;
          case 7:
            date = 'July';
            break;
          case 8:
            date = 'August';
            break;
          case 9:
            date = 'September';
            break;
          case 10:
            date = 'October';
            break;
          case 11:
            date = 'November';
            break;
          case 12:
            date = 'December';
            break;
          default:
            return splitDate;
        }
        return `${date} ${splitDate[2]}, ${splitDate[0]}`;
      }
      return date;
    }
  ]
});

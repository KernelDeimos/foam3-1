foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'ContactCard',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.DAOCreateControllerView',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.PopupView',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.ui.BillDetailView',
    'net.nanopay.invoice.ui.InvoiceDetailView',
    'net.nanopay.model.Invitation'
  ],

  imports: [
    'invitationDAO',
    'invoiceDAO',
    'stack',
    'user'
  ],

  css: `
    ^ {
      display: inline-block;
      background-color: #ffffff;
      padding: 20px 20px 20px 20px;
      margin: 0;
      width: 300px;
      height: 181px;
      display: inline-block;
      margin: 10px; 10px; 10px; 10px;
      position: relative;
      vertical-align: top;
      }
    ^ h5 {
      font-family: 'Roboto';
      font-weight: normal;
      letter-spacing: 0.2px;
      padding-bottom: 4px;
      margin: 0;
      color: #093649;
    } 
    ^ .profilePicture {
      width: 50px;
      height: 50px;
      margin-right: 20px;
      display: inline-block;
    }
    ^ .profilePicture .boxless-for-drag-drop {
      width: 50px;
      height: 50px;
      display: inline-block;
      border: 0px;
      padding: 0px;
     }
    ^ .profilePicture .boxless-for-drag-drop .shopperImage {
      width: 50px;
      height: 50px;
      display: inline-block;
    }
    ^ .companyInfoDiv {
      display: inline-block;
      height: 40px;
      vertical-align: top;
    }
    ^ .contactInfoDiv {
      margin-top: 45px;
    }
    ^ .contactName {
      font-size: 14px;
      padding-bottom: 10px;
      margin: 0;
    }
    ^ .companyName {
      width: 200px;
      height: 16px;
      font-size: 12px;
      font-weight: 300;
    }
    ^ .companyAddress {
      width: 200px;
      height: 16px;
      font-size: 12px;
      font-weight: normal;
      margin: 0;
    }
    ^ .connectionIcon {
      width: 80px;
      height: 20px;
      float: right;
      color: white;
      border-radius: 100px;
      background-color: #2cab70;
      text-align: center;
      padding-bottom: 0px;
      padding-top: 5px;
    }
    ^ .optionsIcon {
      background-color: white;
      vertical-align: top;
      float: right;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
    ^ .optionsIcon:hover {
      background-color: rgba(164, 179, 184, 0.3);
    }
    ^ .optionsIcon img {
      width: 24px;
    }
    ^ .optionsDropDown {
      background: white;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .optionsDropDown > div {
      width: 157px;
      font-size: 14px;
      font-weight: 300;
      color: #093649;
      line-height: 30px;
    }
    ^ .optionsDropDown > div:hover {
      background-color: #59aadd;
      color: white;
      cursor: pointer;
    }
    ^ .optionsDropDown::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: white;
      -ms-transform: translate(120px, -76px);
      transform: translate(120px, -76px);
    }
    ^ .optionsDropDown2:after {
      -ms-transform: translate(120px, -46px);
      transform: translate(120px, -46px);
    }
    ^ .optionsDropDown-content {
      text-align: center;
    }
  `,

  properties: [
    'popupMenu_',
    'status',
    {
      name: 'addressLine1',
      expression: function(data) {
        var address = data.businessAddress;
        return ( address.suite ? address.suite + ', ': '' ) +
        ( address.streetNumber ? address.streetNumber + ' ' : '' ) +
        ( address.streetName ? address.streetName + ', ' : '' ) +
        ( address.city ? address.city : '' );
      }
    },
    {
      name: 'addressLine2',
      expression: function(data) {
        var address = data.businessAddress;

        return ( address.regionId ? address.regionId + ', ' : '' ) +
        ( address.countryId ? address.countryId : '' );
      }
    },
    {
      name: 'postalCode',
      expression: function(data) {
        var address = data.businessAddress;
        return address.postalCode ? address.postalCode : '';
      }
    }
  ],

  methods: [
    function initE() {
      var i = this.data;
      var self = this;

      // Check if the user being displayed on the card is a partner of the user
      // logged in
      this.user.partners.junctionDAO
        .select()
        .then(function(res) {
          var isPartner = res.array.some(function(uuJunc) {
            var partnerInfo = self.user.id === uuJunc.partnerOneInfo.id
                ? uuJunc.partnerTwoInfo
                : uuJunc.partnerOneInfo;
            return partnerInfo.id === i.id;
          });
          self.status = isPartner ? 'connected' : self.status;
        })
        .catch(function(err) {
          console.log(`Error: Couldn't select from junctionDAO`);
          console.error(err);
        });

      this.addClass(this.myClass())
        .start({
          class: 'foam.nanos.auth.ProfilePictureView',
          ProfilePictureImage$: i.businessProfilePicture$,
          placeholderImage: 'images/business-placeholder.png',
          uploadHidden: true,
          boxHidden: true
        }).addClass('profilePicture').end()
        .start().addClass('companyInfoDiv')
          .start('h2').addClass('companyName')
            .add(i.businessName ? i.businessName : '')
          .end()
          .start('h2').addClass('companyAddress')
            .add(this.addressLine1)
          .end()
          .start('h2').addClass('companyAddress')
            .add(this.addressLine2)
          .end()
          .start('h2').addClass('companyAddress')
            .add(this.postalCode)
          .end()
        .end()
        .start('span', null, this.popupMenu_$)
          .startContext({ data: this })
            .start(this.ON_CLICK).addClass('optionsIcon').end()
          .endContext()
        .end()
        .start().addClass('contactInfoDiv')
          .start('h2').addClass('contactName')
            .add(i.firstName + ' ' + i.lastName).end()
          .start('h5').addClass('contactInfoDetail').add(i.email).end()
          .start('h5').addClass('contactInfoDetail')
            .add(i.businessPhone.number ?
              i.businessPhone.number : '')
          .end()
        .end()
        .start().addClass(this.myClass('bottom-status'))
          .start('h5')
            .add(this.status$).enableClass('connectionIcon', this.status$)
          .end()
        .end();
    }
  ],

  listeners: [
    function onCreateInvoice() {
      var self = this;
      var invoiceDetailView = this.InvoiceDetailView.create({
        userList: this.data.id
      });

      var view = foam.u2.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: invoiceDetailView,
          back: this.stack.back.bind(this.stack),
          dao: this.invoiceDAO,
          factory: function() {
            return self.Invoice.create({
              payerId: self.data.id,
              payerName: self.data.name,
              payeeId: self.user.id,
              payeeName: self.user.name
            });
          }
        })
      );
      this.stack.push(view);
      this.remove();
    },

    function onCreateBill() {
      var self = this;
      var billDetailView = this.BillDetailView.create({
        userList: this.data.id
      });

      var view = foam.u2.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: billDetailView,
          back: this.stack.back.bind(this.stack),
          dao: this.invoiceDAO,
          factory: function() {
            return self.Invoice.create({
              payeeId: self.data.id,
              payeeName: self.data.name,
              payerId: self.user.id,
              payerName: self.user.name
            });
          }
        })
      );
      this.stack.push(view);
      this.remove();
    },

    // Send out the partnership invitation
    async function onClickConnect() {
      var invite = this.Invitation.create({
        email: this.data.email,
        createdBy: this.user.id
      });
      try {
        await this.invitationDAO.put(invite);
        this.add(this.NotificationMessage.create({
          message: this.InviteSendSuccess,
        }));
      } catch (err) {
        console.error(err);
        this.add(this.NotificationMessage.create({
          message: this.InviteSendError,
          type: 'error',
        }));
      }
    }
  ],

  messages: [
    {
      name: 'InviteSendSuccess',
      message: 'Invitation sent!'
    },
    {
      name: 'InviteSendError',
      message: 'There was a problem sending the invitation.'
    }
  ],

  actions: [
    {
      name: 'onClick',
      icon: 'images/ic-options.png',
      code: function() {
        if ( this.status === 'connected' ) {
          var p = this.PopupView.create({
            height: 60,
            x: - 110,
            y: - 7,
            padding: 0.01,
          });
          p.addClass('optionsDropDown')
          .start('div').addClass('optionsDropDown-content')
            .add('Create New Invoice')
            .on('click', this.onCreateInvoice)
          .end()
          .start('div').addClass('optionsDropDown-content')
            .add('Create New Bill')
            .on('click', this.onCreateBill)
          .end();
        } else {
          var p = this.PopupView.create({
            height: 30,
            x: - 110,
            y: - 7,
            padding: 0.01,
          });
          // optionsDropDown2 is to set the position of the transform arrow for connection dropdown
          p.addClass('optionsDropDown').addClass('optionsDropDown2')
          .start('div').addClass('optionsDropDown-content')
            .add('Connect')
            .on('click', this.onClickConnect)
          .end();
        }
        this.popupMenu_.add(p);
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'UserDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.admin.ui.EditBusinessView',
    'net.nanopay.ui.ExpandContainer'
  ],

  imports: [
    'window',
    'userDAO'
  ],

  exports: [
    'activatePopUp',
    'approvePopUp',
    'as data',
    'editProfilePopUp'
  ],

  css: `
    ^ .actions {
      width: 1240px;
      height: 40px;
      margin: 0 auto;
      padding: 20px 0 20px 0;
    }
    ^ .left-actions {
      display: inline-block;
      float: left;
    }
    ^ .right-actions {
      display: inline-block;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    }
    ^ .net-nanopay-ui-ActionView-print {
      width: 70px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-right: 10px;
    }
    ^ .net-nanopay-ui-ActionView-print img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      margin-right: 9px;
    }
    ^ .net-nanopay-ui-ActionView-print span {
      width: 31px;
      height: 20px;
      font-family: Roboto;
      font-size: 10px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 2;
      letter-spacing: 0.2px;
      text-align: center;
      color: #093649;
    }

    ^ .net-nanopay-ui-ActionView-approveProfile {
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    ^ .net-nanopay-ui-ActionView-disableProfile {
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }

    ^ .net-nanopay-ui-ActionView-approveProfileDropDown {
      width: 30px;
      height: 40px;
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-approveProfileDropDown::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 6px solid transparent;
      border-top-color: white;
      transform: translate(-6.5px, -1px);
    }

    ^ .net-nanopay-ui-ActionView-activateProfile {
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    ^ .net-nanopay-ui-ActionView-activateProfileDropDown {
      width: 30px;
      height: 40px;
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-activateProfileDropDown::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 6px solid transparent;
      border-top-color: white;
      transform: translate(-6.5px, -1px);
    }

    ^ .net-nanopay-ui-ActionView-editProfile {
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    ^ .net-nanopay-ui-ActionView-editProfileDropDown {
      width: 30px;
      height: 40px;
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-editProfileDropDown::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 6px solid transparent;
      border-top-color: white;
      transform: translate(-6.5px, -1px);
    }

    ^ .popUpDropDown {
      padding: 0 !important;
      z-index: 10;
      width: 165px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .popUpDropDown > div {
      width: 165px;
      height: 30px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;
    }
    ^ .popUpDropDown > div:hover {
      background-color: %SECONDARYCOLOR%;
      color: white;
      cursor: pointer;
    }
    ^ .net-nanopay-admin-ui-history-UserHistoryView {
      width: 1240px;
      margin: 0 auto;
    }
    ^ .net-nanopay-ui-ExpandContainer {
      width: 1240px;
    }
    ^ .net-nanopay-admin-ui-ReviewProfileView{
      overflow-y: scroll;
      height: 500px;
      margin-top: 50px;
    }
  `,

  properties: [
    'data',
    'activateProfileMenuBtn_',
    'approveProfileMenuBtn_',
    'editProfileMenuBtn_',
    'approvePopUp',
    'activatePopUp',
    'editProfilePopUp'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var expandContainer = this.ExpandContainer.create({ title: "Registration Profile" });

      this
        .addClass(this.myClass())
        .start().addClass('actions')
          .start().addClass('left-actions')
            .start(this.BACK_ACTION).end()
          .end()
          .start().addClass('right-actions')
            .start(this.PRINT, { icon: 'images/ic-print.svg', showLabel: true }).end()
            .add(this.slot(function (status, compliance) {
              if ( compliance == self.ComplianceStatus.REQUESTED ) {
                switch ( status ) {
                  case self.AccountStatus.PENDING:
                    return this.E('span')
                      .start(self.EDIT_PROFILE_DROP_DOWN, null, self.editProfileMenuBtn_$).end()
                      .start(self.EDIT_PROFILE).end();

                  case self.AccountStatus.SUBMITTED:
                    return this.E('span')
                      .start(self.APPROVE_PROFILE_DROP_DOWN, null, self.approveProfileMenuBtn_$).end()
                      .start(self.APPROVE_PROFILE).end()
                  case self.AccountStatus.DISABLED:
                    return this.E('span').start(self.ACTIVATE_PROFILE).end();
                }
              } else if ( compliance == self.ComplianceStatus.PASSED ) {
                switch ( status ) {
                  case self.AccountStatus.SUBMITTED:
                    return this.E('span')
                      .start(self.ACTIVATE_PROFILE_DROP_DOWN, null, self.activateProfileMenuBtn_$).end()
                      .start(self.ACTIVATE_PROFILE).end()

                  case self.AccountStatus.ACTIVE:
                    return this.E('span').start(self.DISABLE_PROFILE).end();

                  case self.AccountStatus.DISABLED:
                    return this.E('span').start(self.ACTIVATE_PROFILE).end();
                }
              }
            }, this.data.status$, this.data.compliance$))
          .end()
        .end()
        .tag({ class: 'net.nanopay.admin.ui.UserItemView', data$: this.data$ })
        .br()
        .tag({ class: 'net.nanopay.admin.ui.history.UserHistoryView', id: this.data.id })
        .br()
        .br()
        .start(expandContainer)
          .tag({ class: 'net.nanopay.admin.ui.ReviewProfileView', data$: this.data$ })
        .end()
    }

  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function (X) {
        X.stack.back();
      }
    },
    {
      name: 'print',
      label: 'Print',
      code: function (X) {
        X.window.print();
      }
    },
    {
      name: 'approveProfile',
      label: 'Approve Profile',
      code: function (X) {
        var self = this;
        var toApprove = this.data;
        toApprove.compliance = this.ComplianceStatus.PASSED;

        this.userDAO.put(toApprove)
        .then(function (result) {
          if ( ! result ) throw new Error('Unable to approve profile.');
          self.data.copyFrom(result);
          self.add(self.NotificationMessage.create({ message: 'Profile successfully approved.' }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: 'Unable to approve profile.', type: 'error' }));
        });
      }
    },
    {
      name: 'approveProfileDropDown',
      label: '',
      code: function (X) {
        
        this.approvePopUp = foam.u2.PopupView.create({
          width: 165,
          x: -137,
          y: 40
        });

        this.approvePopUp.addClass('popUpDropDown')
          .start('div')
            .add('Disable Profile')
            .on('click', this.disableProfile_)
          .end()

        this.approveProfileMenuBtn_.add(this.approvePopUp);
      }
    },
    {
      name: 'activateProfile',
      label: 'Activate Profile',
      code: function (X) {
        this.add(this.Popup.create().tag({ class: 'net.nanopay.admin.ui.ActivateProfileModal', data: this.data }));
      }
    },
    {
      name: 'activateProfileDropDown',
      label: '',
      code: function (X) {

        this.activatePopUp = foam.u2.PopupView.create({
          width: 165,
          x: -137,
          y: 40
        });

        this.activatePopUp.addClass('popUpDropDown')
          .start('div')
            .add('Disable Profile')
            .on('click', this.disableProfile_)
          .end()

        this.activateProfileMenuBtn_.add(this.activatePopUp);
      }
    },
    {
      name: 'editProfile',
      label: 'Edit Profile',
      code: function (X) {
        X.stack.push(this.EditBusinessView.create({ data: this.data }));
      }
    },
    {
      name: 'editProfileDropDown',
      label: '',
      code: function (X) {
        this.editProfilePopUp = foam.u2.PopupView.create({
          width: 165,
          x: -137,
          y: 40
        });

        this.editProfilePopUp.addClass('popUpDropDown')
          .start('div')
            .add('Revoke Invite')
            .on('click', this.revokeInvite)
          .end()
          .start('div')
            .add('Resend Invite')
            .on('click', this.resendInvite)
          .end()
          .start('div')
            .add('Disable Profile')
            .on('click', this.disableProfile_)
          .end();

        this.editProfileMenuBtn_.add(this.editProfilePopUp);
      }
    },
    {
      name: 'disableProfile',
      label: 'Disable Profile',
      code: function (X) {
        this.disableProfile_();
      }
    }
  ],

  listeners: [
    function revokeInvite() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.admin.ui.RevokeInviteModal', data: this.data }));
    },

    function resendInvite() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.admin.ui.ResendInviteModal', data: this.data }));
    },

    function disableProfile_() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.admin.ui.DisableProfileModal', data: this.data }));
    }
  ]
});
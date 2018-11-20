/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'VerifyEmail',
    extends: 'foam.u2.Controller',
  
    documentation: 'Resend verification email view',
  
    requires: [
      'foam.u2.dialog.NotificationMessage'
    ],
  
    imports: [
      'auth',
      'emailToken',
      'stack',
      'user'
    ],
  
    css: `
    ^{
        margin: auto;
        text-align: center;
        background: #fff;
        height: 100%;
        width: 100%;
      }
  
      ^ .container{
        width: 330px;
        height: 215px;
        border-radius: 2px;
        padding-top: 5px;
        margin: auto;
        color: #525455;
        font-size: 16px;
      }
  
      ^ .header{
        font-family: lato;
        font-size: 30px;
        font-weight: bold;
        line-height: 48px;
        letter-spacing: 0.5px;
        text-align: left;
        color: #093649;
        text-align: center;
        font-weight: 900;
        margin-bottom: 8px;
      }
  
      ^ p{
        display: inline-block;
      }
  
      ^ .link{
        margin-left: 2px;
        cursor: pointer;
        padding: 0px;
        height: auto;
        width: auto;
        background: none;
        color: #604aff;
        font-size: 16px;
        font-family: lato;
      }

      ^ .link:hover {
          background: none !important;
          color: #604aff;
          text-decoration: underline;
      }
  
      ^ .Instructions-Text{
        height: 16px;
        height: 24px;
        font-family: Lato;
        font-size: 16px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.5;
        letter-spacing: normal;
        text-align: center;
        color: #525455;
      }
  
      ^ .Email-Text{
        width: 182px;
        height: 16px;
        font-family: Roboto;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        margin-top: 30px;
        margin-bottom: 8px;
        margin-left: 0px;
        margin-right: 288px;
      }
  
      ^ .input-Box{
        width: 100%;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        margin-bottom: 10px;
        padding-left: 8px;
        padding-right: 8px;
        margin: 0px;
        font-family: Roboto;
        font-size: 14px;
        text-align: left;
        color: #093649;
        font-weight: 300;
        letter-spacing: 0.2px;
        border-radius: 3px;
        box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
        border: solid 1px #8e9090;
        margin-bottom: 32px;
      }
  
      ^ .button{
        width: 168px;
        height: 40px;
        border-radius: 2px;
        background-color: %SECONDARYCOLOR%;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 20px;
        margin-top: 10px;
        text-align: center;
        color: #ffffff;
        font-family: Lato;
        font-size: 16px;
        line-height: 2.86;
        cursor: pointer;
        width: 128px;
        height: 48px;
        border-radius: 4px;
        box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
        border: solid 1px #4a33f4;
        background-color: #604aff;
      }

      ^ .top-bar {
        width: 100%;
        height: 64px;
        border-bottom: solid 1px #e2e2e3
    }

    ^ .top-bar img {
      height: 25px;
      margin-top: 20px;
    }

    ^ .icon {
        width: 64px;
        margin-bottom: 16px;
        margin-top: 160px;
    }
    `,
  
    properties: [
      {
        class: 'String',
        name: 'email'
      }
    ],
  
    messages: [
      { name: 'Title', message: 'Verify your email' },
      { name: 'Instructions1', message: "We've sent a verification link to your email. Click on the link to get started!" },
      { name: 'Instructions3', message: "Don't see the email? " }
    ],
  
    methods: [
      function initE() {
        this.SUPER();
        this
          .addClass(this.myClass())
          .start()
          .start()
                .addClass('top-bar')
                .start('img')
                    .attr('src', 'images/ablii-wordmark.svg')
                .end()
            .end()
            .start('img').addClass('icon').attr('src', 'images/mail-icon.svg').end()
            .start().addClass('header').add(this.Title).end()
            .start().addClass('container')
              .start().add(this.Instructions1).end()
              .br()
              .start('span').add(this.Instructions3).end()
              .start(this.RESEND_EMAIL).addClass('link').end()
            .end()
          .end();
      }
    ],
  
    actions: [
      {
        name: 'resendEmail',
        label: 'Resend Email',
        code: function(X) {
          var self = this;
  
          this.emailToken.generateToken(null, this.user).then(function(result) {
            if ( ! result ) {
              throw new Error('Error generating reset token');
            }
            self.add(self.NotificationMessage.create({ message: 'Verification email sent to ' + self.user.email }));
          }).catch(function(err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        }
      },
      {
        name: 'goBack',
        label: 'Go to sign in page.',
        code: function(X) {
          this.auth.logout().then(function() {
            this.window.location.hash = '';
            this.window.location.reload();
          });
        }
      }
    ]
  });
  
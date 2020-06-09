/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'ToastNotification',
  extends: 'foam.u2.View',

  documentation: `
    A toast notification is a UI element to give a user immediate
    feedback. Toast notifications are only visible for a few seconds.
  `,

  css: `
    ^ {
      display: flex;
      justify-content: center;
      position: fixed;
      top: 5px;
      width: 100vw;
      z-index: 15000;
    }
    ^inner {
      width: 90vw;
      max-width: 1024px;
      margin: auto;
      padding: 8px 24px;
      animation-name: fade;
      animation-duration: 10s;
      font-size: 14px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      background: #f6fff2;
      border: 1px solid #03cf1f;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @keyframes fade {
      0% { opacity: 0; }
      10% { opacity: 1; }
      80% { opacity: 1; }
      100% { opacity: 0; }
    }
    ^status-icon {
      margin-right: 10px;
      vertical-align: middle;
    }
    ^content {
      display: inline-block;
      vertical-align: middle;
    }
    ^error-background {
      background: #fff6f6;
      border: 1px solid #f91c1c;
    }
    ^warning-background {
      background: #f5f4ff;
      border: 1px solid #604aff;
    }
    ^link-icon {
      display: inline-block;
      margin-top: 2px;
      vertical-align: middle;
      margin-right: 0 !important;
      width: 16px;
      height: 16px;
    }
    ^close-icon {
      background-image: url("images/ic-cancel.svg");
      background-size: 16px 16px;
      cursor:pointer;
      height: 16px;
      opacity: 0.5;
      width: 16px;
    }
    ^close-icon:hover {
      opacity: 1;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    'message'
  ],

  methods: [

    function initE() {
      var self = this;

      var img;
      if ( this.type === 'error' ) {
        img = 'images/inline-error-icon.svg';
      } else if ( this.type === 'warning' ) {
        img = 'images/information-small-purple.svg';
      } else {
        img = 'images/checkmark-small-green.svg';
      }
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('inner'))
          .enableClass(this.myClass('error-background'), this.type === 'error')
          .enableClass(this.myClass('warning-background'), this.type === 'warning')
          .start()
            .start('img')
              .addClass(this.myClass('status-icon'))
              .attrs({ src: img })
            .end()
            .start()
              .addClass(this.myClass('content'))
              .callIfElse(foam.String.isInstance(this.message), function() {
                this.add(self.message);
              }, function() {
                this.tag(self.message);
              })
            .end()
          .end()
          .startContext({ data: this })
            .start()
              .addClass(this.myClass('link-icon'))
              .start()
                .addClass(this.myClass('close-icon'))
                .on('click', () => this.remove())
              .end()
            .end()
          .endContext()
        .end();

      setTimeout(() => {
        this.remove();
      }, 9900);
    }
  ]
});

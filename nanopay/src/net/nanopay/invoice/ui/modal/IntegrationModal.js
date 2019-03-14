foam.CLASS({
  package: 'net.invoice.ui.modal',
  name: 'IntegrationModal',
  extends: 'foam.u2.Controller',
  documentation: 'Terms and Conditions Modal',
  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],
  css: `
  ^{
    margin: auto;
    padding: 24px;
  }
  ^ .labelContent {
    font-family: Roboto;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #093649;
    min-height: 15px;
  }
  ^ .headerTitle{
    width: 510px;
    height: 36px;
    font-family: Avenir;
    font-size: 24px;
    font-weight: 900;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #333333;
    text-align: center;
  }
  ^ .integrationImgDiv{
    width: 152px;
    height: 77px;
    border: solid 1px #dce0e7;
    display: inline-block;
    margin: 25px 16px 15px 0px;
    position: relative;
    box-sizing: border-box;
    background-color: #d8d8d8;
    cursor: pointer;
  }
  ^ .integrationImg{
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
  ^ .last-integrationImgDiv{
    margin-right: 0;
  }
  ^ .intergration-Input{
    width: 320px;
    height: 36px;
    border: solid 1px rgba(164, 179, 184, 0.5);
    display: inline-block;
    margin-right: 8px;
  }
  ^ .submit-BTN{
    width: 160px;
    height: 36px;
    border-radius: 4px;
    border: solid 1px #000000;
    background-color: #ffffff;
  }
  ^ .submit-BTN:hover{
    background-color: #a9a9a9;
    color: white;
  }
  ^ .inputLine{
    margin-top: 8px;
  }
  ^ .net-nanopay-ui-modal-ModalHeader .container {
    margin-bottom: 0px;
  }
  ^ .close{
    background: 0;
    width: 24px;
    height: 24px;
    margin-top: 5px;
    cursor: pointer;
    position: relative;
    float: right;
  }
  ^ .integrationText{
    text-align: center;
    margin-top: 12px;
  }
  ^ .integration-item img {
    width: 60px;
  }
  ^ .integration-item {
    border-radius: 4px;
    background-color: #ffffff;
    border: solid 1.5px #ffffff;
    box-shadow: 0 1px 1px 0 #dae1e9;
    border: solid 1px #edf0f5;
    width: 190px;
    padding: 20px;
    display: inline-block;
    text-align: center;
    transition: ease 0.2s;
    margin-bottom: 30px;
  }
  ^ .integration-item:hover {
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
    cursor: pointer;
  }
  ^ .content-wrapper {
    margin-top: 16px;
  }
  ^ .float-right {
    float: right;
  }
  ^ .float-left {
    float: left;
  }
  `,
  methods: [
    function initE() {
      this.SUPER();
      this
      .start()
      .addClass(this.myClass())
          .start().addClass('Container')
            .start()
              .start().addClass('headerTitle').add('Select your accounting software to connect')
              .end()
              .start().addClass('content-wrapper')
                .start().addClass('integration-item').addClass('float-left').on('click', this.signXero)
                  .start('img').attr('src', 'images/xero.png')
                  .end()
                  .start()
                    .add('Xero').addClass('integrationText')
                  .end()
                .end()
                .start().addClass('integration-item').addClass('float-right').on('click', this.signQuickbooks)
                  .start('img').attr('src', 'images/quickbooks.png')
                  .end()
                  .start()
                    .add('QuickBooks Online').addClass('integrationText')
                  .end()
                .end()
              .end()
            .end()
            // TODO: Add this back when we want feedback about other softwares. Not needed for beta
            // .start().addClass('labelContent').add('Can’t find your software? Tell us about it.').end()
            // .start().addClass('inputLine')
            //   .start('input').addClass('intergration-Input').end()
            //   .start(this.SUBMIT_BUTTON).addClass('submit-BTN').end()
            // .end()
          .end()
        .end()
      .end();
    },
    function attachSessionId(url) {
      // attach session id if available
      var sessionId = localStorage['defaultSession'];
      if ( sessionId ) {
        url += '&sessionId=' + sessionId;
      }
      return url;
    }
  ],
  actions: [
    {
      name: 'cancelButton',
      icon: 'images/ic-cancel.svg',
      code: function(X) {
        X.closeDialog();
      }
    }
    // TODO: For adding feedback. Adding this after beta.
    // {
    //   name: 'submitButton',
    //   label: 'Submit',
    //   code: function(X) {
    //   }
    // }
  ],
  listeners: [
    function signXero() {
      var url = window.location.origin + '/service/xeroWebAgent?portRedirect=' + window.location.hash.slice(1);
      window.location = this.attachSessionId(url);
    },
    function signQuickbooks() {
      var url = window.location.origin + '/service/quickbooksWebAgent?portRedirect=' + window.location.hash.slice(1);
      window.location = this.attachSessionId(url);
    },
  ]
});

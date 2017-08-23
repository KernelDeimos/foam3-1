foam.CLASS({
  package: 'net.nanopay.retail.ui.shared.notificationCard',
  name: 'NotificationActionCard',
  extends: 'foam.u2.View',
  abstract: true,

  documentation: `Card that would display an alert that would prompt the user to take an action.
    How to use:

    Subclass this model and set 'title' and 'subtitle'.
    Lastly, set 'actionButton' in actions to set a label and function for the action.
  `,

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 992px;
          box-sizing: border-box;
          background-color: #FFFFFF;
          border: solid 1px rgba(164, 179, 184, 0.5);
          padding: 20px;
        }

        ^ .container {
          display: inline-block;
          margin: auto;
          width: 952px; // 992px - 40px;
        }

        ^ .iconCol {
          display: inline-block;
          float: left;
          position: relative;
          width: 40px;
          height: 40px;
        }

        ^ .imageCenter {
          display: block;
          margin: auto;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        ^ .titleContainer {
          display: inline-block;
          overflow: scroll;
          width: 692px;
          height: 40px;

          margin: 0 20px;
        }

        ^ .titleLabel {
          font-size: 12px;
          font-weight: bold;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #8f8f8f;
          margin: 0;
        }

        ^ .subTitleLabel {
          font-size: 10px;
          line-height: 1.6;
          letter-spacing: 0.3px;
          color: #8f8f8f;
          margin: 0;
          margin-top: 9px;
        }

        ^ .foam-u2-ActionView-actionButton {
          display: inline-block !important;
          vertical-align: top !important;
          box-sizing: border-box !important;

          font-size: 14px !important;
          letter-spacing: 0.2px !important;
          color: #59a5d5 !important;
          font-weight: normal !important;

          width: 180px !important;
          height: 40px !important;
          border-radius: 2px !important;
          background: none !important;
          border: solid 1px #5ba9dc !important;
          outline: none !important;

          padding: 0 !important;
          opacity: 1.0 !important;
        }

        ^ .foam-u2-ActionView-actionButton:hover {
          cursor: pointer !important;
          background: none !important;
          background-color: #59a5d5 !important;
          color: #FFFFFF !important;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'title',
      factory: function() { return 'How to use me.'; }
    },
    {
      class: 'String',
      name: 'subTitle',
      factory: function() { return 'Subclass this model, and set \'title\' and \'subTitle\'. Lastly, override \'actionButton\' in actions.'; }
    },
    {
      class: 'String',
      name: 'actionTitle',
      factory: function() { return ''; }
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('container')
          .start('div').addClass('iconCol')
            .start({class: 'foam.u2.tag.Image', data: 'ui/images/ic-infoctacard.svg'}).addClass('imageCenter').end()
          .end()
          .start('div').addClass('titleContainer')
            .start('p').addClass('titleLabel').add(this.title).end()
            .start('p').addClass('subTitleLabel').add(this.subTitle).end()
          .end()
          .add(this.ACTION_BUTTON)
        .end();
    }
  ],

  actions: [
    {
      name: 'actionButton',
      label: this.actionTitle,
      code: function() {
        console.warn('[NotificationActionCard] : actionButton not implemented in a subclass.');
      }
    }
  ]
});

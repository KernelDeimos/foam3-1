foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEWizardOverview',
  extends: 'foam.u2.View',

  documentation: 'A view that displays the position of the user in the WizardView Stack. Ablii specific.',

  imports: [
    'complete',
    'viewData'
  ],

  css: `
    ^ .guideColumn {
      display: inline-block;
      vertical-align: top;
      margin-right: 10px;
    }

    ^ .titleColumn {
      display: inline-block;
      width: 75%;
      vertical-align: top;
    }

    ^ .positionCircle {
      position: relative;
      width: 16px;
      height: 16px;
      box-sizing: border-box;
      border-radius: 10.5px;
      background-color: #e2e2e3;
      margin: auto;

      overflow: hidden;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^ .positionCircle img {
      position: absolute;
      top: 0;
      left: 0;

      opacity: 0;

      width: 0;
      height: 0;

      z-index: 11;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^ .positionCircle.complete img {
      width: 16px;
      height: 16px;

      opacity: 1;
    }

    ^ .positionCircle:first-child {
      margin-top: 4px;
    }

    ^ .positionCircle.current {
      background-color: #03cf1f;
    }

    ^ .positionCircle.complete {
      background-position: center;
      background-color: white;
    }

    ^ .positionCircle.complete p {
      font-size: 0;
    }

    ^ .positionCircle p.hidden {
      opacity: 0;
    }

    ^ .positionLine {
      width: 4px;
      height: 64px;
      background-color: #e2e2e3;
      margin: auto;
    }

    ^ .progressLine {
      width: 100%;
      height: 0;
      background-color: #03cf1f;

      -webkit-transition: all .25s ease-in-out;
      -moz-transition: all .25s ease-in-out;
      -ms-transition: all .25s ease-in-out;
      -o-transition: all .25s ease-in-out;
      transition: all .25s ease-in-out;
    }

    ^ .progressLine.progressed {
      height: 100%;
    }

    ^ .progressLine.complete {
      background-color: #03cf1f;
      height: 100%;
    }

    ^ .positionTitleContainer {
      position: relative;
      margin-bottom: 60px;
    }

    ^ .positionTitleContainer:last-child {
      margin-bottom: 0;
    }

    ^ .WizardOverview-subtitle {
      position: absolute;
      top: 21px;
      left: 0;
      margin: 0;

      height: 15px;
      line-height: 15px;
      font-size: 10px;
      color: #8e9090;
    }

    ^ .positionTitle {
      margin: 0;
      height: 21px;
      line-height: 21px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: #093649;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^ .positionTitle.inactive {
      color: #a4b3b8;
    }

    ^ .caption {
      margin-bottom: 30px;
    }
  `,

  properties: [
    /*
      titles is a key/value property
      The key/values should be as follows:
        title: String
        subtitle: String
    */
    'titles',
    'position',
    {
      class: 'Boolean',
      name: 'hideNumbers',
      value: true
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start('div').addClass('guideColumn')
          .start().forEach(this.titles, function(title, index) {
            this.start('div')
              .addClass('positionCircle')
              .addClass(self.complete$.map(function(flag) { return flag ? 'complete' : ''; }))
              .addClass(self.position$.map(function(p) { return index == p ? 'current' : index < p ? 'complete' : ''; }))
              .start('p').enableClass('hidden', self.hideNumbers$).add(index + 1).end()
              .start({ class: 'foam.u2.tag.Image', data: 'images/ablii/checkmark-small-green.svg' }).end()
            .end();
            if ( index < self.titles.length - 1 ) {
              this.start('div').addClass('positionLine')
                .start('div')
                .addClass('progressLine')
                .addClass(self.position$.map(function(p) { return index == p - 1 ? 'progressed' : index < p - 1 ? 'complete' : ''; }))
                .end()
              .end();
            }
          }).end()
        .end()
        .start('div').addClass('titleColumn')
          .start().forEach(this.titles, function(title, index) {
            this.start('div').addClass('positionTitleContainer')
              .start('p')
              .addClass('positionTitle')
              .addClass(self.position$.map(function(p) { return index > p && ! self.complete ? 'inactive' : ''; }))
                .add(title.title)
              .end()
              .start('p')
              .addClass('WizardOverview-subtitle')
                .add(title.subtitle)
              .end()
            .end();
          }).end()
        .end();
    }
  ]
});

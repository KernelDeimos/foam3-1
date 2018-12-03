foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalSecurityImage',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner',
    'foam.u2.tag.Image'
  ],

  exports: [
    'as securityImage'
  ],

  imports: [
    'isConnecting',
    'notify',
    'institution',
    'flinksAuth',
    'user'
  ],

  css: `
    ^ {
      width: 504px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^image-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
    }
    ^image-card {
      box-sizing: border-box;
      text-align: center;
      width: 211px;
      height: 133px;
      padding: 0 40px;
      background-color: white;
      cursor: pointer;

      box-shadow: 0 1px 1px 0 #dae1e9;

      -webkit-transition: box-shadow .15s ease-in-out;
      -moz-transition: box-shadow .15s ease-in-out;
      -ms-transition: box-shadow .15s ease-in-out;
      -o-transition: box-shadow .15s ease-in-out;
      transition: box-shadow .15s ease-in-out;
    }
    ^image-card.selected,
    ^image-card:hover {
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
    }
    ^image-card.selected {
      border: 1px solid %SECONDARYCOLOR%;
    }
    ^card-spacer {
      margin: auto;
      margin-bottom: 16px;
    }
    ^image-vertical-helper {
      display: inline-block;
      vertical-align: middle;
      height: 100%;
    }
    ^image {
      display: inline-block;
      vertical-align: middle;
      width: auto;
      max-height: 80%;
    }
    ^shrink {
      height: 50vh;
      overflow: hidden;
    }
    ^instructions {
      font-size: 14px;
    }
  `,

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      class: 'Array',
      name: 'imageSelection'
    },
    {
      class: 'Int',
      name: 'tick',
      value: - 10000000
    },
    {
      class: 'Int',
      name: 'selectedIndex',
      value: -1
    }
  ],

  messages: [
    { name: 'Instructions', message: 'Please select your personal image below: ' },
    { name: 'Connecting', message: 'Connecting... This may take a few minutes. Please do not close this window.'},
    { name: 'InvalidForm', message: 'Please select your personal image to proceed.'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.questions = new Array(1);
      this.viewData.questions[0] =
        this.viewData.securityChallenges[0].Prompt;
      this.imageSelection =
        new Array(this.viewData.securityChallenges[0].Iterables.length)
          .fill(false);
    },

    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start('div').addClass(this.myClass('content'))
          .start('div').addClass('spinner-container').show(this.isConnecting$)
            .start('div').addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.Connecting).addClass('spinner-text').end()
            .end()
          .end()
          .start('div').enableClass(this.myClass('shrink'), this.isConnecting$)
            .start('p').addClass(this.myClass('instructions')).add(this.Instructions).end()
            .start('div').addClass(this.myClass('image-container'))
              .forEach(this.viewData.securityChallenges[0].Iterables,
                function(item, index) {
                  var src = 'data:image/png;base64,' + item; // item should be a base64 image string.
                  this.start('div').addClass(self.myClass('image-card')).addClass(self.myClass('card-spacer'))
                    .enableClass('selected', self.tick$.map(function() {
                      return self.imageSelection[index];
                    }))
                    .start('div').addClass(self.myClass('image-vertical-helper')).end()
                    .start({ class: 'foam.u2.tag.Image', data: src })
                      .addClass(self.myClass('image'))
                    .end()
                    .on('click', function() {
                      // clear old selection
                      if ( self.selectedIndex >= 0) {
                        self.imageSelection[self.selectedIndex] = false;
                      }
                      self.selectedIndex = index;
                      self.imageSelection[self.selectedIndex] = true;
                      self.tick ++;
                    })
                  .end();
              })
            .end()
          .end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Connect',
      code: function(X) {
        var model = X.securityImage;
        if ( model.isConnecting ) return;
        if ( model.selectedIndex < 0 ) {
          X.notify(model.InvalidForm, 'error');
          return;
        }

        X.viewData.answers = new Array(1);
        X.viewData.answers[0] = [];
        for ( var i = 0; i < model.imageSelection.length; i ++ ) {
          if ( model.imageSelection[i] === true ) {
            X.viewData.answers[0]
              .push(X.viewData.securityChallenges[0].Iterables[i]);
          }
        }

        X.viewData.submitChallenge();
      }
    }
  ]
});

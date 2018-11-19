foam.CLASS({
  package: 'net.nanopay.ui.wizard',
  name: 'WizardView',
  extends: 'foam.u2.Controller',
  abstract: true,

  exports: [
    'viewData',
    'errors',
    'exitLabel',
    'saveLabel',
    'backLabel',
    'nextLabel',
    'exit',
    'save',
    'goTo',
    'goBack',
    'goNext',
    'complete',
    'as wizard',
    'hasSaveOption',
    'hasNextOption',
    'hasExitOption',
    'hasBackOption'
  ],

  documentation: 'View that handles multi step procedures.',

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.ui.wizard.WizardOverview'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' },
  ],

  messages: [
    { name: 'ButtonCancel', message: 'Cancel' },
    { name: 'ButtonBack',   message: 'Back' },
    { name: 'ButtonNext',   message: 'Next' },
    { name: 'ButtonSubmit', message: 'Submit' }
  ],

  properties: [
    // Title of the Wizard View
    {
      class: 'String',
      name: 'title',
      value: ''
    },

    // Array of ViewSpecs.
    'views',

    // The stack that is handled by this Wizard View.
    {
      name: 'subStack'
    },

    // Current view the user is viewing in the substack.
    'position',

    // The titles of the views extracted from the ViewSpecs into an array.
    {
      name: 'viewTitles',
      factory: function() {
        return [];
      }
    },

    // The common data shared between each screen.
    {
      name: 'viewData',
      factory: function() {
        return {};
      }
    },

    // The errors thrown from the sub view.
    'errors',

    // If set, will start the wizard at a certain position
    'startAt',

    // If true, displays the Save Action
    {
      class: 'Boolean',
      name: 'hasSaveOption',
      value: false
    },

    // If true, displays the Exit Action
    {
      class: 'Boolean',
      name: 'hasExitOption',
      value: false
    },

    // If true, displays the Next Action
    {
      class: 'Boolean',
      name: 'hasNextOption',
      value: true
    },

    // If true, displays the Back Action
    {
      class: 'Boolean',
      name: 'hasBackOption',
      value: true
    },

    // Label for the back button
    {
      class: 'String',
      name: 'exitLabel',
      value: 'Exit'
    },

    // Label for the save button
    {
      class: 'String',
      name: 'saveLabel',
      value: 'Save'
    },

    // Label for the back button
    {
      class: 'String',
      name: 'backLabel',
      value: 'Back'
    },

    // Label for the next button
    {
      class: 'String',
      name: 'nextLabel',
      value: 'Next'
    },

    // When set to true, all circles in the overview will be filled in
    {
      class: 'Boolean',
      name: 'complete',
      value: false
    },

    // When set to true, the bottomBar will hide
    {
      class: 'Boolean',
      name: 'hideBottomBar',
      value: false
    },

    'pushView'
  ],

  methods: [
    function init() {
      var self = this;

      if ( ! this.title ) console.warn('[WizardView] : No title provided');

      this.subStack = this.Stack.create();

      var viewTitles = [];

      this.viewTitles.forEach(function(title) {
        viewTitles.push(title);
      });

      this.views.filter(function(view) {
        return ! view.hidden;
      }).forEach(function(viewData) {
        if ( viewTitles.length == 0 ) {
          viewData.subtitle ? self.viewTitles.push({ title: viewData.label, subtitle: viewData.subtitle }) : self.viewTitles.push({ title: viewData.label, subtitle: '' });
        }
      });

      this.subStack.pos$.sub(this.posUpdate);

      if ( this.startAt ) { // If startAt position has been specified, push straight to that view
        if ( this.startAt < 0 || this.startAt > this.views.length - 1 ) {
          console.error('[WizardView] : Invalid startAt value');
          this.subStack.push(this.views[0].view);
          return;
        }

        for ( var i = 0; i <= this.startAt; i++ ) {
          this.subStack.push(this.views[i].view);
        }
      } else {
        this.subStack.push(this.views[0].view);
      }

      if ( this.pushView ) {
        this.subStack.push(this.pushView.view);
        this.position = this.pushView.position;
        this.pushView = null;
      }
    },

    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start('div').addClass('wizardBody')
          .start('div')
            .start('p').add(this.title || '').addClass('title').end()
          .end()
          .start('div').addClass('positionColumn')
            .tag(this.WizardOverview.create({ titles: this.viewTitles, position$: this.position$ }))
          .end()
          .start('div').addClass('stackColumn')
            .start('div')
              .start('p').add(this.position$.map(function(p) {
                return self.views[p] ? self.views[p].label : '';
              }) || '').addClass('subTitle').end()
            .end()
            .tag({ class: 'foam.u2.stack.StackView', data: this.subStack, showActions: false })
          .end()
        .end()
        .callIf(! this.hideBottomBar, function() {
          this.start('div').addClass('navigationBar')
            .start('div').addClass('navigationContainer')
              .start('div').addClass('exitContainer')
                .callIf(this.hasExitOption, function() {
                  this.start(self.EXIT, { label$: self.exitLabel$ }).addClass('plainAction').end();
                })
                .callIf(this.hasSaveOption, function() {
                  this.start(self.SAVE, { label$: self.saveLabel$ }).end();
                })
              .end()
              .start('div').addClass('backNextContainer')
                .start(this.GO_BACK, { label$: this.backLabel$ }).addClass('plainAction').end()
                .callIf(this.hasNextOption, function() {
                  this.tag(self.GO_NEXT, { label$: self.nextLabel$ });
                })
              .end()
            .end()
          .end();
        });
    },

    function goTo(index) {
      if ( index < this.position ) {
        while ( this.position > index && this.position > 0 ) {
          this.subStack.back();
        }
      } else if ( index > this.position ) {
        while ( this.position < index && this.position < this.subStack.depth ) {
          this.subStack.back();
        }
      }
    }
  ],

  listeners: [
    {
      name: 'posUpdate',
      code: function() {
        var self = this;
        self.position = this.subStack.pos;
      }
    }
  ],

  actions: [
    /*
      NOTE:
      If you intend on displaying any of the actions outside of the bottom bar,
      make sure to use:

      .startContext({data: this.wizard})
        .tag(<FULL PATH TO YOUR WIZARD.ACTION>, {label$: this.backLabel$})
      .endContext()
    */
    {
      name: 'goBack',
      isAvailable: function(hasBackOption) {
        return hasBackOption;
      },
      code: function(X) {
        if ( this.position <= 0 ) {
          X.stack.back();
          return;
        }
        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      isAvailable: function(position, errors) {
        if ( errors ) return false; // Error present
        return true;
      },
      code: function(X) {
        if ( this.position == this.views.length - 1 ) { // If last page
          X.stack.back();
          return;
        }

        this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
      }
    },
    {
      name: 'exit',
      code: function(X) {
        X.stack.back();
      }
    },
    {
      name: 'save',
      isAvailable: function(hasSaveOption) {
        return hasSaveOption;
      },
      code: function(X) {
        // TODO: Implement a save function or it has be overwritten
        X.stack.back();
      }
    }
  ]
});

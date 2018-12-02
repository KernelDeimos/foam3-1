foam.CLASS({
  package: 'net.nanopay.ui.wizardModal',
  name: 'WizardModal',
  extends: 'foam.u2.View',
  documentation: 'A multi-step modal. Perfect for small flows that require multiple steps to complete. Would recommend WizardView for larger flows.',

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  exports: [
    'as wizard',
    'subStack',
    'pushToId',
    'viewData'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.stack.Stack',
      name: 'subStack',
      factory: function() {
        return this.Stack.create();
      }
    },
    {
      name: 'views',
      postSet: function(_, n) {
        if ( ! this.startAt ) {
          // If no start point has been set, use start point defined in views
          for ( var id in n ) {
            if ( n[id].isStart ) {
              this.startAt = id;
              break;
            }
          }
        }
        this.pushToId(this.startAt);
      }
    },
    {
      name: 'viewData',
      factory: function() {
        return {};
      }
    },
    {
      /**
      * Purpose of `startAt` is to pass in the ID of the view you wish to start your WizardModal at.
      * If you are manipulating data as well, please pass it on into `viewData`, or `data` depending
      * on how you plan on using/developing your WizardModal
      **/
      class: 'String',
      name: 'startAt'
    }
  ],

  methods: [
    function initE() {
      if ( ! this.views ) {
        console.error('No views to render WizardModal');
        return; // No views to render. Quit.
      }
      this.start({ class: 'foam.u2.stack.StackView', data: this.subStack, showActions: false }).style({'width':'auto', 'height':'auto'}).end();
    },
    function pushToId(id) {
      this.subStack.push(this.views[id].view);
    }
  ]
});

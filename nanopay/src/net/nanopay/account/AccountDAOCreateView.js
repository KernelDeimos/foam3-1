/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOCreateView',
  extends: 'foam.u2.View',

  topics: [
    'finished',
    'throwError'
  ],
  
  documentation: `
    A configurable view to create an instance of a specified model
  `,

  css:`
    ^ {
      padding: 32px
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-items: center;
    }

    ^account-name {
      font-size: 36px;
      font-weight: 600;
    }

    ^create-view-container {
      margin: auto;
    }
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
  ],
  imports: [
    'stack'
  ],
  exports: [
    'controllerMode'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.CREATE;
      },
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          choices: [
            ['net.nanopay.account.AggregateAccount', 'Aggregate account'],
            ['net.nanopay.account.DigitalAccount', 'Digital account'],
            ['net.nanopay.account.ShadowAccount', 'Shadow account']
          ]
        };
      }
    }
  ],
  actions: [
    {
      name: 'save',
      code: function() {
        var self = this;
        this.config.dao.put(this.data.clone()).then(function() {
          self.finished.pub();
          self.stack.back();
        }, function() {

          self.throwError.pub();
        });
      }
    },
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(config$viewBorder, config$browseTitle, data) {
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                // we will handle this in the StackView instead
                .startContext({ data: self.stack })
                    .tag(self.stack.BACK, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/back-icon.svg'
                    })
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center' })
                  .start()
                    .add(`Create your ${config$browseTitle}`)
                      .addClass(this.myClass('account-name'))
                  .end()
                  .startContext({data: self}).add(self.SAVE).endContext()
                .end()
              .end()
              .start(config$viewBorder)
                .start().addClass(this.myClass('create-view-container'))
                  .tag(this.viewView, { data: data })
                .end()
              .end()
        }));
    }
  ]
});
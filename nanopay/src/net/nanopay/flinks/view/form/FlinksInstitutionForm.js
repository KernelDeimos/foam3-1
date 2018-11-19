foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksInstitutionForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'form',
    'isConnecting',
    'pushViews',
    'appConfig'
  ],

  exports: [
    'bankInstitutions'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 520px;
        }
        ^ .optionSpacer {
          display: inline-block;
          width: 122px;
          height: 67px;
          margin-right: 10px;
          box-sizing: border-box;
          border: solid 1px white;
        }
        ^ .optionSpacer:last-child {
          margin-right: 0;
        }
        ^ .institution {
          margin-bottom: 10px
        }
        ^ .institution:hover {
          cursor: pointer;
        }
        ^ .optionSpacer.selected {
          border: solid 1px %ACCENTCOLOR%;
        }
        ^ .subContent {
          width: 528px;
          background-color: #edf0f5;
          border: 1px solid #edf0f5;
        }
        ^ .image {
          width: 120px;
          height: 65px;
        }
        ^ .net-nanopay-ui-ActionView-nextButton {
          float: right;
          margin: 0;
          box-sizing: border-box;
          background-color: #59a5d5;
          outline: none;
          border:none;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #FFFFFF;
        }
        ^ .net-nanopay-ui-ActionView-closeButton:hover:enabled {
          cursor: pointer;
        }
        ^ .net-nanopay-ui-ActionView-closeButton {
          float: left;
          margin-left : 2px;
          outline: none;
          min-width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          margin-right: 40px;
        }
        ^ .net-nanopay-ui-ActionView-nextButton:disabled {
          background-color: #7F8C8D;
        }
        ^ .net-nanopay-ui-ActionView-nextButton:hover:enabled {
          cursor: pointer;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'bankInstitutions',
      factory: function() {
        return [
          { name: 'ATB', description: 'ATB Financial', image: 'images/banks/atb.svg' },
          { name: 'BMO', description: 'Bank of Montreal', image: 'images/banks/bmo.svg' },
          { name: 'CIBC', description: 'Canadian Imperial Bank of Commerce', image: 'images/banks/cibc.svg' },
          { name: 'CoastCapital', description: 'Coast Capital Savings Credit Union', image: 'images/banks/coast.svg' },
          { name: 'Desjardins', description: 'Desjardins Quebec', image: 'images/banks/desjardins.svg' },
          { name: 'HSBC', description: 'HSBC Canada', image: 'images/banks/hsbc.svg' },
          { name: 'Meridian', description: 'Meridian Credit Union', image: 'images/banks/meridian.png' },
          { name: 'National', description: 'National Bank of Canada', image: 'images/banks/national.svg' },
          { name: 'Laurentienne', description: 'Banque Laurentienne du Canada', image: 'images/banks/laurentienne.svg' },
          { name: 'Simplii', description: 'Simplii Financial (Former President’s Choice Financial)', image: 'images/banks/simplii@3x.png' },
          { name: 'RBC', description: 'Royal Bank of Canada', image: 'images/banks/rbc.svg' },
          { name: 'Scotia', description: 'The Bank of Nova Scotia', image: 'images/banks/scotia.svg' },
          { name: 'Tangerine', description: 'Tangerine Bank', image: 'images/banks/tangerine.svg' },
          { name: 'TD', description: 'Toronto-Dominion Bank', image: 'images/banks/td.svg' },
          { name: 'Vancity', description: 'Vancouver City Savings Credit Union', image: 'images/banks/vancity.svg' },
          // { name: 'FlinksCapital', image: 'images/banks/flinks.svg' } this will be added when not in Prod.
        ];
      }
    },
    {
      class: 'Object',
      name: 'selectedInstitution',
      value: null,
      postSet: function(oldValue, newValue) {
        this.viewData.selectedInstitution = newValue;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Please choose your institution below.' },
    { name: 'Error', message: 'Invalid Institution' },
    { name: 'NameLabel', message: 'Institution *' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'Next';
      this.selectedInstitution = this.viewData.selectedInstitution ?
        this.viewData.selectedInstitution : null;
    },

    function initE() {
      this.SUPER();
      var self = this;

      // get mode of appConfig, use mode to define if it is in Production, Demo, Test, Development, and Staging.
      // do not show Flinks demo in Production mode
      if ( ! this.isProduction() ) {
        this.bankInstitutions.push({
          name: 'FlinksCapital',
          image: 'images/banks/flinks.svg'
        });
      }

      this
        .addClass(this.myClass())
          .start('div').addClass('subTitleFlinks')
            .add(this.Step)
          .end()
          .start('div').addClass('subContent')
            .forEach(this.bankInstitutions, function(institution, index) {
              this.start('div').addClass('optionSpacer').addClass('institution')
                .enableClass('selected', self.selectedInstitution$.map((t) => t === institution))
                .start({ class: 'foam.u2.tag.Image', data: institution.image }).addClass('image').end()
                .on('click', () => self.selectedInstitution = institution)
                .end();
            })
          .end()
          .start('div').style({ 'margin-top': '15px', 'height': '40px' })
            .tag(this.NEXT_BUTTON)
            .tag(this.CLOSE_BUTTON)
          .end()
          .start('p').style({ 'margin-top': '30px', 'text-decoration': 'underline' }).addClass('link')
            .add('Can\'t find your institution? Click here.')
            .on('click', this.otherBank)
          .end()
          .start('div').style({ 'clear': 'both' }).end();
    },

    function isProduction() {
      return this.appConfig.mode && this.appConfig.mode.label === 'Production';
    }
  ],

  listeners: [
    function otherBank() {
      this.form.stack.push({
        class: 'net.nanopay.cico.ui.bankAccount.AddBankView',
        wizardTitle: 'Add Bank Account',
        startAtValue: 0
      }, this.form);
    }
  ],

  actions: [
    {
      name: 'nextButton',
      label: 'Continue',
      isEnabled: function(isConnecting, selectedInstitution) {
        return ! isConnecting && selectedInstitution;
      },
      code: function(X) {
        this.pushViews('FlinksConnectForm');
      }
    },
    {
      name: 'closeButton',
      label: 'Close',
      code: function(X) {
        X.form.stack.back();
      },
    }
  ]
});

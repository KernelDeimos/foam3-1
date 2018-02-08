foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksMFAForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 492px;
        }
        ^ .subContent {
          height: 240px;
        }
        ^ .header1 {
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
        }
        ^ p {
          margin: 0;
        }
        ^ .input {
          width: 450px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          padding: 10px;
        }
        ^ .question {
          height: 14px;
          font-family: Roboto;
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
        }
        ^ .forgetAnswer {
          width: 450px;
          font-family: Roboto;
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.2px;
          text-align: right;
          color: #59a5d5;
        }
        ^ .net-nanopay-ui-ActionView-closeButton {
          float: right;
          margin: 0;
          box-sizing: border-box;
          background-color: #A93226;
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
        ^ .net-nanopay-ui-ActionView-nextButton {
          float: right;
          margin: 0;
          outline: none;
          border:none;
          min-width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: #148F77;
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #FFFFFF;
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
      class: 'Boolean',
      name: 'isFinish0',
      value: false
    },
    {
      class: 'StringArray',
      name: 'answer',
      postSet: function(oldValue, newValue) {
        console.log(newValue);
        this.viewData.answers[0] = newValue;
      },
      validateObj: function(answer) {
        if ( answer.length == 0 ) return this.isFinish0 = false;
        for ( var o in answer ) {
          if ( o.trim().length == 0 ) return this.isFinish0 = false;
        }
        this.isFinish0 = true;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 4: Please answer below security question'},
    { name: 'header1', message: 'Please answer the security question: '},
    { name: 'answerError', message: 'Invalid answer'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.form.isEnabledButtons(true);
      this.viewData.questions = [
        'What is your mother maiden name','What is your age','cccc'
      ];
      this.nextLabel = 'Submit';
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({class: 'net.nanopay.flinks.view.form.FlinksSubHeader'})
          .start('p').add(this.header1).addClass('header1').style({'margin-left':'20px'}).end()
          .start('p').add(( ! this.viewData.questions[0] ) ? '' : this.viewData.questions[0]).addClass('question').style({'margin-left':'20px', 'margin-top':'20px'}).end()
          .start(this.ANSWER, {onKey: true}).addClass('input').style({'margin-left':'20px', 'margin-top':'10px'}).end()
        .end()
        .start('div').style({'margin-top' : '15px', 'height' : '40px'})
        .tag(this.CLOSE_BUTTON, {label: 'close'})
        .tag(this.NEXT_BUTTON, {label: 'next'})
        .end()
        .start('div').style({'clear' : 'both'}).end()
    }
  ],

  actions: [
    {
      name: 'nextButton',
      label: 'next',
      isEnabled: function(isFinish0) {
        return (isFinish0) ? true : false;
      },
      code: function(X) {
        X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'close',
      code: function(X) {
        X.form.goBack();
      }
    }
  ]
})

foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ExpandContainer',
  extends: 'foam.u2.Element',
  documentation: 'Provide an expandable div which take content to display inside.',

  properties: [
    {
      name: "expandBox",
      value: false
    },
    'title'
  ],

  css:`
    ^ {
      width: 962px;
      min-height: 80px;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 2px;
      background-color: white;
      box-sizing: border-box;
      margin: auto;
    }
    ^ .boxTitle {
      opacity: 0.6;
      font-family: 'Roboto';
      font-size: 20px;
      font-weight: 300;
      line-height: 20px;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      display: inline-block;
      margin-top: 10px;
    }
    ^ .expand-BTN{
      width: 135px;
      height: 40px;
      border-radous: 2px;
      background-color: #59a5d5;
      border-radius: 2px;
      font-family: Roboto;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      cursor: pointer;
      display: inline-block;
      float: right;
    }
    ^ .close-BTN{
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-family: 2px;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #093649;
      cursor: pointer;
      display: inline-block;
      float: right;
    }
    ^ .expand-Container{
      width: 952px;
      height: auto;
      overflow: hidden;
      transition: max-height 1.2s ease;
      max-height: 1725px;
      margin: 0 auto;
      margin-right: 0;
    }
    ^ .expandTrue{
      max-height: 0;
    }
  `,

  methods: [
    function init(){
      var self = this;
      this
      .addClass(this.myClass())
      .start()
        .start().addClass('boxTitle')
          .add(this.title)
        .end()
        .start()
          .addClass('expand-BTN').enableClass('close-BTN', this.expandBox$, true)
          .add(this.expandBox$.map(function(e) { 
            return e ? "Expand" : "Close"; 
          }))
          .enableClass('', self.expandBox = (self.expandBox ? false : true))
          .on('click', function(){ self.expandBox = ( self.expandBox ? false : true ) })
        .end()
       .start().addClass('expand-Container').enableClass("expandTrue", self.expandBox$)
          .start('div', null, this.content$).end()
       .end()
      .end();

    }
  ]
});
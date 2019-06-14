foam.CLASS({
  package: 'net.nanopay.flinks.view.element',
  name: 'CheckBoxes',
  extends: 'foam.u2.view.ChoiceView',

  documentation: 'view for account and balance',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .label {
          height: 13px;
          font-family: Roboto;
          font-size: 13px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.3px;
          text-align: left;
          color: %BLACK%;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      //console.log('CheckBox: ', this.data);
      this.addClass(this.myClass());
      if ( ! this.data && ! this.index ) {
        this.index = 0;
      }
      this.data = [];
      this.choices$.sub(this.onChoicesUpdate);
      this.onChoicesUpdate();
    }
  ],

  listeners: [
    function onChoicesUpdate() {
      var self = this;
      var id;

      this.removeAllChildren();

      this.add(this.choices.map(function(c) {
       // console.log('this.id: ', this.id);
        return this.E('div').
          addClass(this.myClass()).
          start('input').
            attrs({
              type: 'checkbox',
              name: this.id,
              value: c[0]
            }).
            setID(id = self.NEXT_ID()).
            on('change', function(evt) {
              var na = [];
              if ( evt.srcElement.checked === true ) {
                for ( var i = 0 ; i < self.data.length ; i ++ ) {
                  if ( self.data[i] === evt.srcElement.value ) continue;
                  na.push(self.data[i]);
                }
                na.push(evt.srcElement.value);
              } else {
                for ( var i = 0 ; i < self.data.length ; i ++ ) {
                  if ( self.data[i] === evt.srcElement.value ) continue;
                  na.push(self.data[i]);
                }
              }
              self.data = na;
              // console.log('evt check: ', evt.srcElement.checked);
              // console.log('evt: ', evt);
              // console.log('evt.srcElement.value: ', evt.srcElement.value);
            }).
          end().
          start('label').addClass('label').style({'margin-left':'3px'}).
            attrs({
              for: id
            }).
            start('span').
              add(c[0]).
            end()
          .end();
      }.bind(this)));
    }
  ]
})
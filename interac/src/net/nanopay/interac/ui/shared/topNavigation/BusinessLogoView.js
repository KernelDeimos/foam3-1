foam.CLASS({
  package: 'net.nanopay.interac.ui.shared.topNavigation',
  name: 'BusinessLogoView',
  extends: 'foam.u2.View',

  documentation: 'View to display business logo and name.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 25%;
          display: inline-block;
          padding-top: 3px;
          text-align: left;
        }
        ^ img {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-top: 5px;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        ^ span{
          position: relative;
          font-weight: 300;
          font-size: 16px;
          margin-left: 10px;
        }
        ^business-name{
          width: 70%;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          white-space: nowrap;
          top: -16;
          height: 20px;
          display: inline-block;
          margin-left: 10px;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('div').addClass('alignLeft')
          .tag({class: 'foam.u2.tag.Image', data: 'images/cad.svg'})
          .start('div').addClass(this.myClass('business-name'))
            .add('Canada Bank')
          .end()
        .end();
    }
  ]
});
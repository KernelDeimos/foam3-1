foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ActionView',
  extends: 'foam.u2.UnstyledActionView',

  axioms: [
    foam.u2.CSS.create({code: function() {/*
      ^ {
        width: 135px;
        height: 40px;
        border-radius: 2px;
        text-align: center;
        display: inline-block;
        cursor: pointer;
        margin: 0px 5px 0px 0px;
        font-size: 14px;
        padding: 0;
      }

      ^unavailable {
        visibility: hidden;
      }

      ^ img {
        vertical-align: middle;
      }

      ^:disabled { filter: grayscale(80%); }

      ^.material-icons {
        cursor: pointer;
      }
      ^back {
        display: none;
      }
      ^forward {
        display: none;
      }
    */}})
  ]
});

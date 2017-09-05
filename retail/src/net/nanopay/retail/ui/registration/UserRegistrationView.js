foam.CLASS({
  package: 'net.nanopay.retail.ui.registration',
  name: 'UserRegistrationView',
  extends: 'foam.u2.View',

  documentation: 'User Registration View',

  imports: [
    'stack',
    'save', 
    'userDAO',
    'user'
  ],

  exports: [
    'as data'
  ],

  requires: [
    'foam.nanos.auth.User'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 490px;
          margin: auto;
        }
        ^registration-container{
          background: white;
          padding: 25px 25px 25px;
        }
        ^ h2{
          height: 30px;
          font-size: 30px;
          font-weight: bold;
          line-height: 1;
          letter-spacing: 0.5px;
          text-align: left;
          color: #093649;
          margin-top: 20px;
          margin-bottom: 30px;
        }
        ^ h3{
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
        }
        ^ p{
          display: inline-block;
        }
        .link{
          margin-left: 2px;
          color: #59a5d5;
          cursor: pointer;
        }
        ^ input{
          width: 100%;
          height: 40px;
          margin-top: 7px;
        }
        ^ label{
          font-weight: 300;
          font-size: 14px;
          color: #093649;
        }
        .input-container{
          width: 46%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        ^ .input-container-right {
          width: 46%;
          display: inline-block;
          margin-bottom:20px;
          float: right;
        }
        .input-container-full-width{
          width: 100%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        ^check-box{
          display: inline-block;
          border: solid 1px rgba(164, 179, 184, 0.5);
          width: 14px;
          height: 14px;
          border-radius: 2px;
          margin-right: 10px;
          position: relative;
          top: 5;
        }
        ^ img{
          display: none;
        }
        .agreed{
          background: black;
        }
        .show-checkmark img{
          width: 15px;
          position: relative;
          display: block;
        }
        ^ .foam-u2-ActionView-signUp{
          position: relative;
          width: 100%;
          height: 40px;
          background: none;
          background-color: #59a5d5;
          font-size: 14px;
          border: none;
          color: white;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        ^ .foam-u2-ActionView-signUp:hover{
          background: none;
          background-color: #3783b3;
        }
        ^ .property-password {
          -webkit-text-security: disc;
          -moz-text-security: disc;
          text-security: disc;
        }
        .foam-u2-ActionView-cancel {
          visibility: hidden;
        }
        .foam-u2-ActionView-save {
          visibility: hidden;
        }

      */}
    })
  ],

  properties: [
    'agreed',
    'firstName',
    'lastName',
    'email',
    'mobile',
    'password'
  ],

  methods: [
    function initE(){
      this.SUPER();
      this.agreed = false;
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('h2').add('Sign Up').end()
          .start().addClass(this.myClass('registration-container'))
            .start().addClass(this.myClass('business-registration-input'))
              .start().addClass('input-container')
                .start('label').add('First Name').end()
                  .add(this.FIRST_NAME)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Last Name').end()
                  .add(this.LAST_NAME)
              .end()
              .start().addClass('input-container')
                .start('label').add('Email Address').end()
                  .add(this.EMAIL)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Phone Number').end()
                  .add(this.MOBILE)
              .end()
              .start().addClass('input-container-full-width')
                .start('label').add('Password').end()
                  .add(this.PASSWORD)
              .end()
            .end()
            .start().addClass(this.myClass('term-conditions'))
              .start('div').addClass(this.myClass('check-box')).enableClass('agreed', this.agreed$).on('click', function(){ self.agreed = !self.agreed })
                .tag({class:'foam.u2.tag.Image', data: 'ui/images/check-mark.png'}).enableClass('show-checkmark', this.agreed$)
              .end()
              .start('p').add('I agree with the ').end()
              .start('p').addClass('link').add('terms and conditions.').end()
              .start().add(this.SIGN_UP).end()
            .end()
          .end()
          .start('p').add('Already have an account?').end()
          .start('p').addClass('link')
            .add('Sign in.')
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.retail.ui.onboarding.SignInView' }) })
          .end()
        .end()
      .end()
    },
  ],

  actions: [
    function signUp(X, obj) {
      var self = this;

      var user = self.User.create({
        firstName: self.firstName,
        lastName: self.lastName,
        email: self.email,
        mobile: self.mobile,
        password: self.password
      });

      self.userDAO.put(user).then(function(user) {
        X.stack.push({ class: 'net.nanopay.retail.ui.registration.BusinessRegistrationView', user: user });
      })
    }
  ]
})

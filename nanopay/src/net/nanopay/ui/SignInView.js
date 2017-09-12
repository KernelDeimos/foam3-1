foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'SignInView',
  extends: 'foam.u2.View',

  documentation: 'Sign In View',

  implements: [
    'foam.mlang.Expressions', 
    'net.nanopay.ui.style.appStyling'
  ],

  exports: [ 'as data' ],

  imports: [
    'stack'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.comics.DAOCreateControllerView'
  ],

  properties: [
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'Password',
      name: 'password',
      view: 'foam.u2.view.PasswordView'
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        width: 490px;
        margin: auto;
      }
      ^ .sign-in-container{
        padding-top: 20px;
        width: 490px;
        height: 240px;
        border-radius: 2px;
        background-color: #ffffff;
      }
      ^ p{
        display: inline-block;
      } 
    */}
    })
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;
    this
      .addClass(this.myClass())
      .start()
        .start('h1').add("Sign In").end()
        .start().addClass('sign-in-container')
          .start().addClass('label').add("Email Address").end()
          .start(this.EMAIL).addClass('full-width-input').end()
          .start().addClass('label').add("Password").end()
          .start(this.PASSWORD).addClass('full-width-input').end()
          .start().addClass('full-width-button')
            .add("Sign In")
            .on('click', this.signIn)
          .end()
        .end()
        .start('div')
          .start('p').add("Don't have an account?").end()
          .start('p').style({ 'margin-left': '2px' }).addClass('link')
            .add("Sign up.")
            .on('click', this.signUp)
          .end()
          .start('p').style({ 'margin-left': '182px' }).addClass('link')
            .add("Forgot Password?")
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.b2b.ui.forgotPassword.EmailView' })})
          .end()
        .end()
      .end()
    }
  ],

  listeners: [
    function signUp(){
      var self = this;
      var view = foam.u2.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: net.nanopay.b2b.ui.registration.UserRegistrationView,
          back: this.stack.back.bind(this.stack),
          dao: this.userDAO,
          factory: function() {
            return self.User.create();
          },
          showActions: false
        }));
      this.stack.push(view);
    },

    function signIn(){
      var self = this;
  
      if(!this.email || !this.password){
        console.log('Please provide email & password.')
        return;
      }

      this.userDAO.where(this.AND(this.EQ(this.User.EMAIL, this.email), this.EQ(this.User.PASSWORD, this.password))).select().then(function(user){
        if(user.array.length <= 0){
          console.log('Login Failed.')
          return;
        }

        self.user.copyFrom(user.array[0]);
        self.stack.push({ class: 'net.nanopay.b2b.ui.dashboard.DashboardView' })
      })
    }
  ],
});
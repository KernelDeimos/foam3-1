foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'PrincipalOwnersDetailView',
  extends: 'foam.u2.View',

  properties: [
    'user',
    {
      name: "ownerCount",
      value: 0
    }
  ],

  css: `
  ^{
    width: 100%;
    background-color: #edf0f5;
    margin: auto;
  }
  ^ .businessSettingsContainer {
    width: 992px;
    margin: auto;
  }
  ^ .Container {
    width: 992px;
    min-height: 80px;
    margin-top: 30px;
    margin-bottom: 20px;
    padding: 20px;
    border-radius: 2px;
    background-color: white;
    box-sizing: border-box;
  }
  ^ .profileImg {
    width: 80px;
    height: 80px;
  }
  ^ .profileImgDiv {
    margin-bottom: 20px;
    margin-top: 20px;
    line-height: 80px;
    position: relative;
  }
  ^ .companyName {
    font-family: 'Roboto';
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #093649;
    margin-left: 140px;
    display: inline-block;
    line-height: 16px;
    position: absolute;
    top: 40%;
  }
  ^ .labelDiv {
    margin-bottom: 30px;
    margin-right: 20px;
  }
  ^ .inlineDiv {
    display: inline-block;
    margin-right: 40px;
    vertical-align: top;
  }
  ^ .topInlineDiv {
    display: inline-block;
    vertical-align: top;
  }
  ^ .labelTitle {
    font-family: Roboto;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    margin-bottom: 15px;
  }
  ^ .businessHourLabels {
    width: 30px;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    margin-bottom: 15px;
    display: inline-block;
  }
  ^ .labelContent {
    font-family: Roboto;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #093649;
    display: flex;
    width: 185px;
    height: 20px;
  }
  ^ .foam-u2-ActionView-editProfile {
    text-decoration: underline;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.2px;
    color: #59a5d5;
    display: inline-block;
    margin-left: 40px;
    cursor: pointer;
    opacity: 1;
  }
  ^ .net-nanopay-ui-ActionView-editProfile {
    color: #59a5d5;
    background-color: white;
    text-decoration: underline;
    margin-left: 42px;
    height: 15px;
  }
  ^ .net-nanopay-ui-ActionView-editProfile:hover {
    cursor: pointer;
  }
  ^ .net-nanopay-ui-ActionView-editProfile:active {
    color: #2974a3;
  }
  ^ .dayOfWeekDiv {
    margin-top: 20px;
  }
  ^ .shopperImage{
    right: 0 !important;
  }
  ^ .sub-title{
    position: relative;
    top: -25px;
    color: #093649;
    font-size: 14px;
    font-weight: 300;
  }
  `,

  methods: [
    function initE(){
      var self = this;
      this
      .addClass(this.myClass())
      .start().addClass('businessSettingsContainer')
        .forEach(this.user.principalOwners, function(user){
          self.ownerCount++;
          self.start().addClass('Container')
          .start().addClass('sub-title').add('Principal Owner ', self.ownerCount).end()
          .start()
            .start().addClass('inlineDiv')
              .start().addClass('labelDiv')
                .start().add('Legal Name').addClass('labelTitle').end()
                .start().add(user.firstName + " " + user.lastName).addClass('labelContent').end()
              .end()
              .start().addClass('labelDiv')
                .start().add('Phone Number').addClass('labelTitle').end()
                .start().add(user.phone.number).addClass('labelContent').end()
              .end()
            .end()
            .start().addClass('inlineDiv')
              .start().addClass('labelDiv')
                .start().add('Job Title').addClass('labelTitle').end()
                .start().add(user.jobTitle).addClass('labelContent').end()
              .end()
              .start().addClass('labelDiv')
                .start().add('Principle Type').addClass('labelTitle').end()
                .start().add(user.principleType).addClass('labelContent').end()
              .end()
            .end()
            .start().addClass('inlineDiv')
              .start().addClass('labelDiv')
                .start().add('Email Address').addClass('labelTitle').end()
                .start().add(user.email).addClass('labelContent').end()
              .end()
              .start().addClass('labelDiv')
                .start().add('Date of Birth').addClass('labelTitle').end()
                .start().add(user.birthday.toISOString().substring(0,10)).addClass('labelContent').end()
              .end()
            .end()
            .start().addClass('topInlineDiv')
              .start().addClass('labelDiv')
                .start().add('Residential Address').addClass('labelTitle').end()
                .startContext()
                  .start().hide(user.address.structured$)
                    .start().add(user.address.address1).addClass('labelContent').end()
                    .start().add(user.address.address2).addClass('labelContent').end()
                  .end()
                  .start().show(user.address.structured$)
                    .start().add(user.address.streetNumber +" "+user.address.streetName).addClass('labelContent').end()
                    .start().add(user.address.suite).addClass('labelContent').end()
                  .end()
                .endContext()
                .start().add(user.address.city + ", "+user.address.regionId).addClass('labelContent').end()
                .start().add(user.address.countryId).addClass('labelContent').end()
                .start().add(user.address.postalCode).addClass('labelContent').end()
              .end()
            .end()
          .end()
        .end()
      })  
      .end();
    }
  ]
});
foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'EditBusinessProfileView',
  extends: 'foam.u2.View',

  documentation: 'Form to Edit Business Profile information',

  imports: [
    'countryDAO',
    'userDAO',
    'regionDAO',
    'validatePostalCode',
    'validatePhone',
    'validateCity',
    'validateStreetNumber',
    'validateAddress',
    'user',
    'stack',
    'ctrl'
  ],

  exports: [
    'as data'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Region',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Address'
  ],

  css: `
    ^ .foam-u2-TextField,
    ^ .foam-u2-DateView,
    ^ .foam-u2-tag-Select {
      height: 40px;

      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      border-radius: 0;

      padding: 12px 13px;

      box-sizing: border-box;
      outline: none;

      -webkit-appearance: none;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .foam-u2-tag-Select {
      width: 100%;
    }

    ^ .foam-u2-TextField:focus,
    ^ .foam-u2-DateView:focus,
    ^ .foam-u2-tag-Select:focus,
    ^ .net-nanopay-ui-ActionView:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-TextField:disabled,
    ^ .foam-u2-DateView:disabled,
    ^ .foam-u2-tag-Select:disabled,
    ^ .net-nanopay-ui-ActionView:disabled {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      color: #a4b3b8 !important;
    }

    ^ .caret {
      position: relative;
      pointer-events: none;
    }

    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 510px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }

    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }

    ^ .widthWrapper {
      margin: auto;
      width: 540px;
      padding-bottom: 75px;
    }

    ^ .fullWidthField {
      width: 100%; /* based on wrapper */
    }

    ^ .fieldVerticalSpacer {
      padding-top: 20px;
    }

    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;

      margin-top: 30px;
      margin-bottom: 20px;
    }

    ^ .sectionTitle:first-child {
      margin-top: 0;
    }

    ^ .fieldLabel {
      margin: 0;
      margin-bottom: 8px;

      color: #093649;
      font-weight: 300;
    }

    ^ .animationContainer {
      position: relative;
      height: 64px;
      overflow: hidden;
      box-sizing: border-box;
    }

    ^ .displayContainer {
      position: absolute;
      top: 0;
      left: 0;

      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;

      z-index: 10;
    }

    ^ .displayContainer.hidden {
      left: 540px;
      opacity: 0;
    }

    ^ .displayOnly {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
    }

    ^ .inputContainer {
      position: absolute;
      top: 0;
      left: 0;

      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      z-index: 9;
    }

    ^ .inputContainer.hidden {
      pointer-events: none;
      opacity: 0;
    }

    ^ .phoneNumberFieldsCol {
      display: inline-block;
      vertical-align: middle;

      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      margin-right: 20px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .phoneNumberFieldsCol:last-child {
      margin-right: 0;
    }

    ^ .phoneNumberFieldsCol p {
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .phoneNumberFieldsCol.out {
      opacity: 0;
      transform: translateX(-166.66px);
    }

    ^ .phoneCountryCodeCol {
      width: 105px;
      pointer-events: none;
    }

    ^ .phoneNumberCol {
      width: 415px;
    }

    ^ .businessTypeInfoContainer {
      min-height: 60px;
      background-color: #cee6f5;
      border: solid 1px #59a5d5;
      padding: 20px;

      box-sizing: border-box;

      margin-top: 20px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .businessTypeInfoContainer.hidden {
      margin-top: 0;
      opacity: 0;
      height: 0;
      min-height: 0;
      padding: 0 20px;
    }

    ^ .businessTypeInfoContainer.hidden .icon,
    ^ .businessTypeInfoContainer.hidden .businessTypeInfo {
      opacity: 0;
    }

    ^ .icon {
      width: 20px;
      height: 20px;

      display: inline-block;
      vertical-align: middle;
    }

    ^ .businessTypeInfo {
      /* 40px padding | 20px for icon | 10px for margin */
      width: calc(100% - 40px - 20px - 10px);

      margin: 0;
      margin-left: 10px;

      font-size: 12px;

      display: inline-block;
      vertical-align: middle;

      color: #093649;
    }

    ^ .streetFieldCol {
      display: inline-block;
      margin-right: 20px;
    }

    ^ .streetFieldCol:last-child {
      margin-right: 0;
    }

    ^ .streetNumberField {
      width: 125px;
    }

    ^ .streetNameField {
      width: 395px;
    }

    ^ .foam-nanos-auth-ProfilePictureView {
      background-color: white;
    }

    ^ .shopperImage{
      margin-left: 20px;
    }
    ^ .bottomActions{
      position: fixed;
      bottom: 0;
      width: 100%;
      padding: 20px;
      background: white;
      z-index: 1;
    }
    ^ .foam-nanos-auth-ProfilePictureView{
      background: #edf0f5;
    }
    ^ .net-nanopay-ui-ActionView-Save{
      float: right;
      background: #59a5d5;
      color: white;
      margin-right: 100px;
      margin-left: 40px;  
    }
    .bottomActions > .net-nanopay-ui-ActionView-Cancel{
      margin-left: 40px;
    }
    
    ^ .addressHint {
      height: 14px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.17;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-top: 5px;
      margin-bottom: 0px;
    }
  `,

  messages: [
    { name: 'BusinessInformationSubtitle', message: 'Business Information' },
    { name: 'BusinessAddressSubtitle', message: 'Business Information' },
    { name: 'BusinessNameLabel', message: 'Registered Business Name' },
    { name: 'BusinessPhoneLabel', message: 'Business Phone' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' },
    { name: 'WebsiteLabel', message: 'Website (optional)' },
    { name: 'BusinessTypeLabel', message: 'Business Type' },
    { name: 'BusinessRegistrationNumberLabel', message: 'Business Registration Number' },
    { name: 'RegistrationAuthorityLabel', message: 'Registration Authority' },
    { name: 'RegistrationDateLabel', message: 'Registration Date' },
    { name: 'BusinessAddressLabel', message: 'Business Address' },
    { name: 'CountryLabel', message: 'Country' },
    { name: 'StreetNumberLabel', message: 'Street Number' },
    { name: 'StreetNameLabel', message: 'Street Name' },
    { name: 'AddressLabel', message: 'Address 2 (optional)' },
    { name: 'AddressHint', message: 'Apartment, suite, unit, building, floor, etc.' },
    { name: 'ProvinceLabel', message: 'Province' },
    { name: 'CityLabel', message: 'City' },
    { name: 'PostalCodeLabel', message: 'Postal Code' },
    { name: 'BusinessProfilePictureSubtitle', message: 'Business Logo (optional)' },
    { name: 'BusinessTypeDescriptionSole', message: 'A sole proprietorship is an unincorporated business owned by an individual.' },
    { name: 'BusinessTypeDescriptionPart', message: 'A partnership is an unincorporated business owned by two or more persons, carrying on business together, generally for profit.' },
    { name: 'BusinessTypeDescriptionCorp', message: 'A private or public corporation is a legal entity that is separate and distinct from its owners, shareholders of the corporation, directors and officers.' },
    { name: 'BusinessTypeDescriptionNonP', message: 'An not-for-profit (organization) is a provincially or federally incorporated organization that provides products or services without making profit. They are generally dedicated to activities that improve or benefit a community.' },
  ],

  properties: [
    {
      class: 'String',
      name: 'businessNameField',
      factory: function() {
        if ( this.user.businessName ) return this.user.businessName;
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingPhone',
      value: false
    },
    {
      class: 'String',
      name: 'displayedPhoneNumber',
      value: '+1',
      factory: function() {
        return this.user.businessPhone ? '+1 ' + this.user.businessPhone.number : '';
      }
    },
    {
      class: 'String',
      name: 'phoneCountryCodeField',
      value: '+1'
    },
    'phoneNumberFieldElement',
    {
      class: 'String',
      name: 'phoneNumberField',
      factory: function() {
        return this.user.businessPhone ? this.user.businessPhone.number : '';
      },
      postSet: function(oldValue, newValue){
        this.displayPhoneNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'websiteField',
      factory: function() {
        if ( this.user.website ) return this.user.website;
      }
    },
    {
      name: 'businessTypeField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessTypeDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        if ( this.user.businessTypeId || this.user.businessTypeId == 0 ) {
          if ( this.user.businessTypeId == 0 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionSole;
          }

          if ( this.user.businessTypeId == 1 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionPart;
          }

          if ( this.user.businessTypeId == 3 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionCorp;
          }

          if ( this.user.businessTypeId == 5 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionNonP;
          }
          return this.user.businessTypeId;
        } else {
          return 0;
        }
      }
    },
    {
      class: 'String',
      name: 'businessTypeInfo'
    },
    {
      class: 'String',
      name: 'businessRegistrationNumberField',
      factory: function() {
        if ( this.user.businessRegistrationNumber ) return this.user.businessRegistrationNumber;
      }
    },
    {
      class: 'String',
      name: 'registrationAuthorityField',
      factory: function() {
        if ( this.user.businessRegistrationAuthority ) return this.user.businessRegistrationAuthority;
      }
    },
    {
      class: 'Date',
      name: 'registrationDateField',
      factory: function() {
        if ( this.user.businessRegistrationDate ) return this.user.businessRegistrationDate;
      }
    },
    {
      name: 'countryField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        if ( this.user.businessAddress.countryId ) return this.user.businessAddress.countryId;
        return 'CA';
      }
    },
    {
      class: 'String',
      name: 'streetNumberField',
      factory: function() {
        if ( this.user.businessAddress.streetNumber ) return this.user.businessAddress.streetNumber;
      }
    },
    {
      class: 'String',
      name: 'streetNameField',
      factory: function() {
        if ( this.user.businessAddress.streetName ) return this.user.businessAddress.streetName;
      }
    },
    {
      class: 'String',
      name: 'addressField',
      factory: function() {
        if ( this.user.businessAddress.address2 ) return this.user.businessAddress.address2;
      }
    },
    {
      name: 'provinceField',
      view: function(_, X) {
        var choices = X.data.slot(function (countryField) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryField || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      },
      factory: function() {
        if ( this.user.businessAddress.regionId ) return this.user.businessAddress.regionId;
      }
    },
    {
      class: 'String',
      name: 'cityField',
      factory: function() {
        if ( this.user.businessAddress.city ) return this.user.businessAddress.city;
      }
    },
    {
      class: 'String',
      name: 'postalCodeField',
      factory: function() {
        if ( this.user.businessAddress.postalCode ) return this.user.businessAddress.postalCode;
      }
    },
    {
      name: 'businessProfilePicture',
      factory: function() {
        if ( this.user.businessProfilePicture ) return this.user.businessProfilePicture;
      }
    }
  ],

  messages: [
    { name: 'BusinessInformationSubtitle', message: 'Business Information' },
    { name: 'BusinessAddressSubtitle', message: 'Business Information' },
    { name: 'BusinessNameLabel', message: 'Registered Business Name' },
    { name: 'BusinessPhoneLabel', message: 'Business Phone' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' },
    { name: 'WebsiteLabel', message: 'Website (optional)' },
    { name: 'BusinessTypeLabel', message: 'Business Type' },
    { name: 'BusinessRegistrationNumberLabel', message: 'Business Registration Number' },
    { name: 'RegistrationAuthorityLabel', message: 'Registration Authority' },
    { name: 'RegistrationDateLabel', message: 'Registration Date' },
    { name: 'BusinessAddressLabel', message: 'Business Address' },
    { name: 'CountryLabel', message: 'Country' },
    { name: 'StreetNumberLabel', message: 'Street Number' },
    { name: 'StreetNameLabel', message: 'Street Name' },
    { name: 'AddressLabel', message: 'Address' },
    { name: 'ProvinceLabel', message: 'Province' },
    { name: 'CityLabel', message: 'City' },
    { name: 'PostalCodeLabel', message: 'Postal Code' },
    { name: 'BusinessProfilePictureSubtitle', message: 'Business Logo (optional)' },
    { name: 'BusinessTypeDescriptionSole', message: 'A sole proprietorship is an unincorporated business owned by an individual.' },
    { name: 'BusinessTypeDescriptionPart', message: 'A partnership is an unincorporated business owned by two or more persons, carrying on business together, generally for profit.' },
    { name: 'BusinessTypeDescriptionCorp', message: 'A private or public corporation is a legal entity that is separate and distinct from its owners, shareholders of the corporation, directors and officers.' },
    { name: 'BusinessTypeDescriptionNonP', message: 'An not-for-profit (organization) is a provincially or federally incorporated organization that provides products or services without making profit. They are generally dedicated to activities that improve or benefit a community.' },
  ],

  
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var businessTypeInfoSlot = this.businessTypeField$.map(function(value) { return value !== 'Please select' && value !== '' ? true : false; });

      this
        .addClass(this.myClass())
        .start('div').addClass('widthWrapper')
          .start('h1').add('Edit Business Profile').end()
          .start('p').add(this.BusinessInformationSubtitle).addClass('sectionTitle').end()
          .start('p').add(this.BusinessNameLabel).addClass('fieldLabel').end()
          .start(this.BUSINESS_NAME_FIELD).addClass('fullWidthField').end()
          .start('div')
            .style({ 'margin-top': '20px' })
            .addClass('animationContainer')
            .addClass('fullWidthField')
            .start('div')
              .addClass('displayContainer')
              .addClass('fullWidthField')
              .enableClass('hidden', this.isEditingPhone$)
              .start('p').add(this.BusinessPhoneLabel).addClass('fieldLabel').end()
              .start(this.DISPLAYED_PHONE_NUMBER, {data$: this.phoneNumberField$})
                .addClass('fullWidthField')
                .addClass('displayOnly')
                .on('focus', function() {
                  this.blur();
                  self.phoneNumberFieldElement && self.phoneNumberFieldElement.focus();
                  self.isEditingPhone = true;
                })
              .end()
            .end()
            .start('div')
              .addClass('inputContainer')
              .addClass('fullWidthField')
              .enableClass('hidden', this.isEditingPhone$, true)
              .start('div')
                .addClass('phoneNumberFieldsCol')
                .addClass('phoneCountryCodeCol')
                .enableClass('out', this.isEditingPhone$, true)
                .start('div').add(this.CountryCodeLabel).addClass('fieldLabel').end()
                .start(this.PHONE_COUNTRY_CODE_FIELD, { mode: foam.u2.DisplayMode.DISABLED })
                  .addClass('fullWidthField')
                  .on('focus', function() {
                    this.blur();
                    self.phoneNumberFieldElement && self.phoneNumberFieldElement.focus();
                  })
                .end()
              .end()
              .start('div')
                .addClass('phoneNumberFieldsCol')
                .addClass('phoneNumberCol')
                .enableClass('out', this.isEditingPhone$, true)
                .start('p').add(this.PhoneNumberLabel).addClass('fieldLabel').end()
                .start(this.PHONE_NUMBER_FIELD, { placeholder: 'format: 000-000-0000' }, this.phoneNumberFieldElement$)
                  .addClass('fullWidthField')
                  .on('focus', function() {
                    self.isEditingPhone = true;
                  })
                  .on('focusout', function() {
                    self.isEditingPhone = false;
                  })
                .end()
              .end()
            .end()
          .end()

          .start('p').add(this.WebsiteLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.WEBSITE_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.BusinessTypeLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start('div').addClass('fullWidthField')
            .tag(this.BUSINESS_TYPE_FIELD)
            .start('div').addClass('caret').end()
          .end()

          .start('p').add(this.BusinessRegistrationNumberLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.BUSINESS_REGISTRATION_NUMBER_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.RegistrationAuthorityLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.REGISTRATION_AUTHORITY_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.RegistrationDateLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.REGISTRATION_DATE_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.BusinessAddressLabel).addClass('sectionTitle').end()
          .start('p').add(this.CountryLabel).addClass('fieldLabel').end()
          .start('div').addClass('fullWidthField')
            .start(this.COUNTRY_FIELD).end()
            .start('div').addClass('caret').end()
          .end()
          .start('div').addClass('fullWidthField')
            .start('div').addClass('streetFieldCol')
              .start('p').add(this.StreetNumberLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
              .start(this.STREET_NUMBER_FIELD).addClass('streetNumberField').end()
            .end()
            .start('div').addClass('streetFieldCol')
              .start('p').add(this.StreetNameLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
              .start(this.STREET_NAME_FIELD).addClass('streetNameField').end()
            .end()
          .end()
          .start('p').add(this.AddressLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.ADDRESS_FIELD).addClass('fullWidthField').end()
          .start('p').add(this.AddressHint).addClass('addressHint').end()
          .start('p').add(this.ProvinceLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start('div').addClass('dropdownContainer')
            .start(this.PROVINCE_FIELD).end()
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.CityLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.CITY_FIELD).addClass('fullWidthField').end()
          .start('p').add(this.PostalCodeLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.POSTAL_CODE_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.BusinessProfilePictureSubtitle).addClass('sectionTitle').end()
          .start('div')
            .start({
              class: 'foam.nanos.auth.ProfilePictureView',
              data$: self.businessProfilePicture$,
              placeholderImage: 'images/business-placeholder.png'
            }).end()
        .end()
      .end()

      .start().addClass('bottomActions')
        .start(this.CANCEL).end()
        .start(this.SAVE).end()
      .end()
    }
  ],

  actions: [
    {
      name: 'Cancel',
      code: function(){
        this.stack.back();
      }
    },
    {
      name: 'Save',
      code: function(){
        var self = this;
        if( !this.businessNameField ) {
          this.add(this.NotificationMessage.create({ message: 'Business name required.', type: 'error' }));
          return;
        }
        if( !this.validatePhone(this.phoneNumberField) ) {
          this.add(this.NotificationMessage.create({ message: 'Business phone required.', type: 'error' }));
          return;
        }
        if( ! (this.businessTypeField || this.businessTypeField === 0) ) {
          this.add(this.NotificationMessage.create({ message: 'Business type required.', type: 'error' }));
          return;
        }
        if( !this.businessRegistrationNumberField ) {
          this.add(this.NotificationMessage.create({ message: 'Business registration number required.', type: 'error' }));
          return;
        }
        if( !this.registrationAuthorityField ) {
          this.add(this.NotificationMessage.create({ message: 'Business registration authority required.', type: 'error' }));
          return;
        }
        if( !this.registrationDateField ) {
          this.add(this.NotificationMessage.create({ message: 'Business registration date required.', type: 'error' }));
          return;
        }
        if( !this.countryField ) {
          this.add(this.NotificationMessage.create({ message: 'Country required.', type: 'error' }));
          return;
        }        
        if( !this.validateStreetNumber(this.streetNumberField) ) {
          this.add(this.NotificationMessage.create({ message: 'Street number required.', type: 'error' }));
          return;
        }
        if( !this.provinceField ) {
          this.add(this.NotificationMessage.create({ message: 'Province required.', type: 'error' }));
          return;
        }
        if( !this.validateCity(this.cityField) ) {
          this.add(this.NotificationMessage.create({ message: 'City required.', type: 'error' }));
          return;
        }
        if( !this.validatePostalCode(this.postalCodeField) ) {
          this.add(this.NotificationMessage.create({ message: 'Postal Code required.', type: 'error' }));
          return;
        }
        this.user.businessName = this.businessNameField;
        this.user.businessPhone.number = this.phoneNumberField;
        this.user.website = this.websiteField;
        this.user.businessTypeId = this.businessTypeField;
        this.user.businessRegistrationNumber = this.businessRegistrationNumberField;
        this.user.businessRegistrationAuthority = this.registrationAuthorityField;
        this.user.businessRegistrationDate = this.registrationDateField;
        this.user.businessAddress.countryId = this.countryField;
        this.user.businessAddress.streetNumber = this.streetNumberField;
        this.user.businessAddress.streetName = this.streetNameField;
        this.user.businessAddress.address2 = this.addressField;
        this.user.businessAddress.regionId = this.provinceField;
        this.user.businessAddress.city = this.cityField;
        this.user.businessAddress.postalCode = this.postalCodeField;
        this.user.businessProfilePicture = this.businessProfilePicture;
        this.userDAO.put(this.user).then(function(a){
          if(!a){          
            ctrl.add(self.NotificationMessage.create({ message: 'Could not update user.', type: 'error' }));
            return;
          }
          ctrl.add(self.NotificationMessage.create({ message: 'Business profile updated.'}));
          self.stack.back();
        });
      }
    }
  ]
});

/**
 * nanopay CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.test',
  name: 'AbliiOnboardingSupport',
  documentation: `Helper methods for client side onboarding tests`,

  requires: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.session.Session'
  ],

  imports: [
    'sessionID',
    'crunchService'
  ],
  
  exports: [
    'subject'
  ],
  
  properties: [
    {
      documentation: 'Unique identifier for this Test instance',
      name: 'uid',
      class: 'String',
      factory: function() { return foam.uuid.randomGUID().split('-')[0]; },
      transient: true
    },
    {
      name: 'adminSessionId',
      class: 'String',
      factory: function() { return this.getCurrentSessionId(); },
      transient: true
    },
    {
      name: 'savedSessionId',
      class: 'String',
      transient: true
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'adminSubject',
      transient: true
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'subject',
      factory: function() { return this.Subject.create({}); },
      transient: true
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'savedSubject',
      transient: true
    },
  ],

  methods: [
    {
      name: 'setup',
      code: function(x) {
        this.sudoAdmin(x);
      }
    },
    {
      name: 'teardown',
      code: function(x) {
        this.sudoAdmin(x);
      }
    },
    {
      name: 'getCurrentSessionId',
      code: function() {
        return this.sessionID;
      }
    },
    {
      name: 'setCurrentSessionId',
      code: function(id) {
        this.sessionID = id;
      }
    },
    {
      name: 'sudo',
      type: 'Context',
      code: function(x, sessionId, realUser, user) {
        console.info('sudo', 'from', this.getCurrentSessionId(), 'subject', this.subject.toString());
        this.setCurrentSessionId(sessionId);
        this.subject = this.Subject.create({
          realUser: realUser,
          user: user
        }, y);
        var y = x.createSubContext({
          subject: this.subject,
          sessionID: sessionId
        });
        this.x = y;
        console.info('sudo', 'to', this.getCurrentSessionId(), 'subject', this.subject.toString());
        return y;
      }
    },
    {
      // TODO/REVIEW: This should be a spid-admin, not * admin. 
      documentation: `Become spid-admin`,
      name: 'sudoAdmin',
      args: [
        {
          name: 'x',
          type: 'Context',
        }
      ],
      type: 'Context',
      code: function(x) {
        console.info('sudoAdmin', 'from', this.getCurrentSessionId(), 'subject', this.subject.toString());
        this.setCurrentSessionId(this.adminSessionId);
        this.subject = this.adminSubject;
        var y = x.createSubContext({
          subject: this.subject,
          sessionID: this.adminSessionId
        });
        this.x = y;
        console.info('sudoAdmin', 'to', this.getCurrentSessionId(), 'subject', this.subject.toString());
        return y;
      }
    },
    {
      name: 'sudoStore',
      args: [
        {
          name: 'x',
          type: 'Context',
        }
      ],
      type: 'Context',
      code: function(x) {
        this.savedSessionId = this.getCurrentSessionId();
        this.savedSubject = this.subject;
        return x;
      }
    },
    {
      name: 'sudoRestore',
      args: [
        {
          name: 'x',
          type: 'Context',
        }
      ],
      type: 'Context',
      code: function(x) {
        console.info('sudoRestore', 'from', this.getCurrentSessionId(), 'subject', this.subject.toString());
        this.setCurrentSessionId(this.savedSessionId);
        this.subject = this.savedSubject;
        this.x = x;
        console.info('sudoRestore', 'to', this.getCurrentSessionId(), 'subject', this.subject.toString());
        return x;
      }
    },
    {
      name: 'client',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String',
        },
        {
          name: 'of',
          type: 'String',
        }
      ],
      type: 'foam.dao.DAO',
      code: function(x, serviceName, of) {
        return x[serviceName];

        /* - used before ApplicationController/SessionIDProperty fixed. Left for reference
        let sessionId = getCurrentSessionId();
        var box = foam.box.HTTPBox.create({
          url: 'service/'+serviceName,
          authorizationType: foam.box.HTTPAuthorizationType.BEARER,
          sessionID: sessionId
        }, x);
        box = foam.box.TimeoutBox.create({ delegate: box }, x);
        box = foam.box.SessionClientBox.create({ sessionID: sessionId, delegate: box }, x);
        let dao = foam.dao.EasyDAO.create({
          daoType: 'CLIENT',
          of: of,
          serverBox: box
        }, x);
        return dao;
        */
      }
    },
    {
      name: 'createSession',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'realUserId',
          type: 'String',
        },
        {
          name: 'userId',
          type: 'String',
        }
      ],
      type: 'foam.nanos.session.Session',
      code: async function(x, realUserId, userId) {
        const E = foam.mlang.ExpressionsSingleton.create();
        this.sudoStore(x);
        try {
          var y = this.sudoAdmin(x);
          var s = await this.client(y, 'sessionDAO', foam.nanos.session.Session).find(E.EQ(foam.nanos.session.Session.USER_ID, userId));
          if ( ! s ) {
            s = await this.client(y, 'sessionDAO', foam.nanos.session.Session).put_(y, foam.nanos.session.Session.create({
              userId: userId,
              agentId: realUserId,
              ttl: 28800000
            }, y));
          }
          if ( ! s ||
               ! s.id ) {
            throw 'Failed to create session';
          }
          console.info('createSession', 'realUser', realUserId, 'user', userId, 'session', s.id);
          this.sudoRestore(x);
          return s;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      name: 'getUcj',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'targetId',
          type: 'String'
        },
      ],
      type: 'foam.nanos.crunch.UserCapabilityJunction',
      code: async function(x, targetId) {
        console.info('getUcj', 'targetId', targetId);
        return await this.crunchService.getJunction(x, targetId);
      }
    },
    {
      name: 'createUser',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userName',
          type: 'String',
        },
        {
          name: 'password',
          type: 'String',
        },
        {
          name: 'group',
          type: 'String',
        }
      ],
      type: 'foam.nanos.auth.User',
      code: async function(x, userName, password, group) {
        const E = foam.mlang.ExpressionsSingleton.create();
        let email = userName+'@nanopay.net';
        var u = await this.client(x, 'userDAO', foam.nanos.auth.User).find(E.OR(
          E.EQ(foam.nanos.auth.User.USER_NAME, userName),
          E.EQ(foam.nanos.auth.User.EMAIL, email)
        ));
        if ( ! u ) {
          u = await this.client(x, 'userDAO', foam.nanos.auth.User).put_(x, foam.nanos.auth.User.create({
            email: email,
            userName: userName,
            firstName: userName,
            lastName: userName,
            desiredPassword: password,
            group: group || 'sme',
            emailVerified: true,
            phoneNumber: '9055551212',
            birthday: new Date(0),
            address: {
              class: 'foam.nanos.auth.Address',
              structured: false,
              countryId: 'CA',
              regionId: 'ON',
              city: 'Toronto',
              address1: '20 King St. W',
              postalCode: 'M9B 5X6'
            }
          }, x));
          if ( ! u ||
               ! u.id ) {
            throw 'User not created ('+userName+')';
          }
        }
        return u;
      }
    },
    {
      name: 'createBusiness',
      type: 'net.nanopay.model.Business',
      code: async function(x, user) {
        const E = foam.mlang.ExpressionsSingleton.create();
        let businessName = 'b-'+user.userName;
        var b = await this.client(x, 'businessDAO', net.nanopay.model.Business).find(
          E.EQ(net.nanopay.model.Business.BUSINESS_NAME, businessName)
        );
        if ( ! b ) {
          b = await this.client(x, 'businessDAO', net.nanopay.model.Business).put_(x, net.nanopay.model.Business.create({
            businessName: businessName,
            organization: businessName,
            phoneNumber: user.phoneNumber,
            address: user.address
          }));
        }
        return b;
      }
    },
    {
      name: 'updateUserComplianceStatus',
      type: 'foam.nanos.auth.User',
      code: async function(x, user) {
        this.sudoStore(x);
        try {
          var y = this.sudoAdmin(x);
          var u = user.clone();
          u.compliance = 2;
          u.status = 2;
          u = await this.client(y, 'userDAO', foam.nanos.auth.User).put_(y, u);
          this.sudoRestore(x);
          return u;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      name: 'abliiUserOnboardingCapability',
      code: async function(x, user) {
        this.sudoStore(x);
        try {
          var y = this.sudoAdmin(x);
          var cap = await this.client(y, 'capabilityPayloadDAO', foam.nanos.crunch.connection.CapabilityPayload).put_(y, foam.nanos.crunch.connection.CapabilityPayload.create({
            'id': '1F0B39AD-934E-462E-A608-D590D1081298',
            'capabilityDataObjects': {
              'Personal Onboarding Type': {
                'class': 'net.nanopay.crunch.registration.PersonalOnboardingTypeData',
                'user': user.id,
                'requestedOnboardingType': 1,
                'overrideFlinksLoginType': true
              },
            }
          }, y));

          this.sudoRestore(x);
          return cap;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      name: 'updateBusinessComplianceStatus',
      type: 'foam.nanos.model.Business',
      code: async function(x, business) {
        this.sudoStore(x);
        try {
          var y = this.sudoAdmin(x);
          var b = business.clone();
          b.compliance = 2;
          b.status = 2;
          b = await this.client(y, 'userDAO', foam.nanos.auth.User).put_(y, b);
          this.sudoRestore(x);
          return b;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      name: 'businessInitialData',
      type: 'foam.nanos.crunch.UserCapabilityJunction',
      code: async function(x, user) {
        
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-76';
        var cap = net.nanopay.crunch.onboardingModels.InitialBusinessData.create({
          businessName: 'b-'+user.userName,
          companyPhone: user.phoneNumber,
          address: user.address,
          mailingAddress: user.address
        });
        return this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        // call createBusiness from script
        // return this.createBusiness(x, user);
      }
    },
    {
      name: 'businessDetailExpandedData',
      code: async function(x, business) {
        var id = '9C6D8CFE-50B8-4507-A595-78DD9E08EA2D';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.BusinessDetailExpandedData.create({
            targetCustomers: 'Everyone'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessTypeData',
      code: async function(x, business) {
        var id = 'A679CA67-93C2-4597-B92E-4BBA00797E96';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.BusinessTypeData.create({
            businessTypeId: 1
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessExtraBusinessTypeDataNotRequired',
      code: async function(x, business) {
        var id = 'ED16359E-628E-4104-83B0-C77BB8544B78';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.IsSelectedData.create({
            selected: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessExtraBusinessTypeDataRequired',
      code: async function(x, business) {
        var id = '840FC3EB-F826-4AB3-AD92-131CD1C7C8D1';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.IsSelectedData.create({
            selected: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessOwners',
      code: async function(x, business) {
        var id = '6DD8D005-7514-432D-BC32-9C5D569A0462';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.BusinessOwnersList.create({
            businessOwners: []
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessRegistrationDate',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-16';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessRegistrationDateData.create({
            businessRegistrationDate: new Date(0)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessLastRegistrationDate',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-19';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessLastRegistrationDateData.create({
            businessLastRegistrationDate: new Date(0)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessIncorporationDate',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-17';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessIncorporationDateData.create({
            businessRegistrationDate: new Date(0)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessTaxIdNumber',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-18';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.TaxIdNumberData.create({
            taxIdentificationNumber: '123456789'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
     }
    },
    {
      name: 'businessOfficeConsumptionDocument',
      code: async function(x, business) {
        var id = 'b5f2b020-db0f-11ea-87d0-0242ac130003';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.Document.create({
            isRequired: false,
            reviewed: true,
            expiry: new Date(now.getFullYear() + 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessArticleOfIncorporation',
      code: async function(x, business) {
        var id = '26d32e86-db11-11ea-87d0-0242ac130003';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.Document.create({
            isRequired: false,
            reviewed: true,
            expiry: new Date(now.getFullYear() + 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessTypeAndSector',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eebsdf3225y-4';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessTypeAndSector.create({
            businessTypeId: 1,
            businessSectorId: 1,
            businessDetailsSection: 'Purchase of goods produced'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'createCABankAccount',
      type: 'net.nanopay.bank.BankAccount',
      code: async function(x, user, forContact) {
        const E = foam.mlang.ExpressionsSingleton.create();
        var b = await this.client(x, 'accountDAO', net.nanopay.account.Account).find(
          E.AND(
            E.EQ(net.nanopay.account.Account.OWNER, user.id),
            E.INSTANCE_OF(net.nanopay.bank.CABankAccount)
          )
        );
        if ( ! b ) {
          b = await this.client(x, 'accountDAO', net.nanopay.account.Account).put_(x, net.nanopay.bank.CABankAccount.create({
            owner: user.id,
            name: 'Contact Account',
            branchId: '12345',
            institutionNumber: '122',
            accountNumber: '12321123',
            forContact: forContact,
            bankAddress: {
              class: 'foam.nanos.auth.Address',
              structured: true,
              countryId: 'CA',
              regionId: 'CA-ON',
              city: 'Toronto',
              postalCode: 'X1X 1X1',
              streetNumber: '1',
              streetName: 'Street'
            }
          }, x));

          this.sudoStore(x);
          try {
            var y = this.sudoAdmin(x);
            b = b.clone();
            b.status = 1;
            b.verifiedBy = 'API';
            b = await this.client(y, 'accountDAO', net.nanopay.account.Account).put_(y, b);
            this.sudoRestore(x);
          } catch (e) {
            this.sudoRestore(x);
            throw e;
          }
          return b;
        }
      }
    },
    {
      documentation: 'Use US Bank Account to avoid issues with PadCapture and subject in context.',
      name: 'createUSBankAccount',
      type: 'net.nanopay.bank.BankAccount',
      code: async function(x, user, forContact) {
        const E = foam.mlang.ExpressionsSingleton.create();
        var b = await this.client(x, 'accountDAO', net.nanopay.account.Account).find(
          E.AND(
            E.EQ(net.nanopay.account.Account.OWNER, user.id),
            E.INSTANCE_OF(net.nanopay.bank.USBankAccount)
          )
        );
        if ( ! b ) {
          b = await this.client(x, 'accountDAO', net.nanopay.account.Account).put_(x, net.nanopay.bank.USBankAccount.create({
              owner: user.id,
              name: 'savings',
              accountNumber: '123456',
              branchId: '123456789',
              forContact: forContact,
              bankAddress: {
                class: 'foam.nanos.auth.Address',
                countryId: 'US',
                regionId: 'US-NY',
                streetNumber: '1',
                streetName: 'Main St',
                city: 'New York',
                postalCode: '12122'
              }
            }, x));

          this.sudoStore(x);
          try {
            var y = this.sudoAdmin(x);
            b = b.clone();
            b.status = 1;
            b.verifiedBy = 'API';
            b = await this.client(y, 'accountDAO', net.nanopay.account.Account).put_(y, b);
            this.sudoRestore(x);
          } catch (e) {
            this.sudoRestore(x);
            throw e;
          }
          return b;
        }
      }
    },
    {
      name: 'createCAContact',
      type: 'net.nanopay.contacts.Contact',
      code: async function(x, business) {
        var c = net.nanopay.contacts.Contact.create({
          owner: business.id,
          firstName: 'CAContact-'+business.id,
          lastName: business.id,
          organization: 'CAContact-'+business.organization,
          email: 'ca.contact@nanopay.net',
          group: 'sme',
          confirm: true,
          businessAddress: {
            class: 'foam.nanos.auth.Address',
            structured: true,
            countryId: 'CA',
            regionId: 'CA-ON',
            city: 'Toronto',
            postalCode: 'X1X 1X1',
            streetNumber: '1',
            streetName: 'Street'
          }
        }, x);
        return await business.contacts.put_(x, c);
      }
    },
    {
      name: 'createUSContact',
      type: 'net.nanopay.contacts.Contact',
      code: async function(x, business) {
        var c = net.nanopay.contacts.Contact.create({
          owner: business.id,
          firstName: 'USContact-'+business.id,
          lastName: business.id,
          organization: 'USContact-'+business.organization,
          email: 'us.contact@nanopay.net',
          group: 'sme',
          confirm: true,
          businessAddress: {
            class: 'foam.nanos.auth.Address',
            structured: true,
            countryId: 'US',
            regionId: 'US-CA',
            city: 'Palto Alto',
            postalCode: '12345',
            streetNumber: '1',
            streetName: 'Street'
          }
        }, x);
        return await business.contacts.put_(x, c);
      }
    },
    {
      name: 'updateContact',
      type: 'net.nanopay.contacts.Contact',
      code: async function(x, contact) {
        return await this.client(x, 'contactDAO', net.nanopay.contacts.Contact).put_(x, contact);
      }
    },
    {
      name: 'approveRequest',
      type: 'foam.nanos.approval.ApprovalRequest',
      code: async function(x, groupId, daoKey, objId) {
        let y = this.sudoStore(x);
        let z = this.sudoAdmin(x);
        const E = foam.mlang.ExpressionsSingleton.create();
        // find a user in the group
        var u = await this.client(z, 'userDAO', foam.nanos.auth.User).find(E.EQ(foam.nanos.auth.User.GROUP, groupId));
        if ( u ) {
          console.info('approveRequest', 'approver', u.id);
          var r = await this.findApprovalRequest(z, u, daoKey, objId);
          if ( r ) {
            console.info('approveRequest', 'approval', r.id, r.status);
            r = r.clone();
            r.status = foam.nanos.approval.ApprovalStatus.APPROVED;
            r.isFulfilled = true;
            r = await this.client(z, 'approvalRequestDAO', foam.nanos.approval.ApprovalRequest).put_(z, r);
            console.info('approveRequest', 'approved', r & r.id, r & r.status);
            this.sudoRestore(y);
            return r;
          }
          this.sudoRestore(y);
          throw 'ApprovalRequest not found for objId '+objId;
        }
        this.sudoRestore(y);
        throw 'ApprovalRequest user not found in group '+groupId;
      }
    },
    {
      name: 'findApprovalRequest',
      type: 'foam.nanos.approval.ApprovalRequest',
      code: async function(x, approver, daoKey, objId) {
        const E = foam.mlang.ExpressionsSingleton.create();
        return await this.client(x, 'approvalRequestDAO', foam.nanos.approval.ApprovalRequest).find(
          E.AND(
            E.EQ(foam.nanos.approval.ApprovalRequest.APPROVER, approver.id),
            E.EQ(foam.nanos.approval.ApprovalRequest.DAO_KEY, daoKey),
            E.EQ(foam.nanos.approval.ApprovalRequest.OBJ_ID, objId),
            E.EQ(foam.nanos.approval.ApprovalRequest.IS_FULFILLED, false)
          )
        );
      }
    },
    {
      name: 'putApprovalRequest',
      type: 'foam.nanos.approval.ApprovalRequest',
      code: async function(x, approval) {
        return await this.client(x, 'approvalRequestDAO', foam.nanos.approval.ApprovalRequest).put_(x, approval);
      }
    },
    {
      name: 'userRegistrationData',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-19';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.UserRegistrationData.create({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    // {
    //   name: 'userGeneralAdmission',
    //   code: async function(x, user) {
    //     var id = '242B00F8-C775-4899-AEBA-F287EC54E901';
    //     var ucj = await this.crunchService.getJunction(x, id);
    //     if ( ! ucj ||
    //          ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
    //       ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
    //     }
    //     return ucj;
    //   }
    // },
    {
      name: 'abliiPrivacyPolicy',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-8';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy.create({
            user: user.id,
            agreement: true,
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'abliiTermsAndConditions',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-7';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions.create({
            user: user.id,
            agreement: true,
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'generalAdmission',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-18';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'userDetails',
      code: async function(x, user) {
        var id = '0ED5DD86-AA1A-452B-BA7D-E7A2D0542135';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.UserDetailData.create({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            address: user.address
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'userDetailExpandedData',
      code: async function(x, user) {
        var id = 'FB1C8CF2-34B9-40FE-A4AA-58CFA2FDBA15';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.UserDetailExpandedData.create({
            'birthday': user.birthday,
            'jobTitle': 'Treasurer',
            'PEPHIORelated': false,
            'thirdParty': false
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'userDateOfBirth',
      code: async function(x, user) {
        // Date of birth
        var id = '8bffdedc-5176-4843-97df-1b75ff6054fb';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.UserBirthDateData.create({
            birthday: user.birthday
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'signingOfficerQuestion',
      code: async function(x, user) {
        var id;
        var ucj;

        // SigningOfficerPrivilegesRequested
        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-0';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap =  net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.create({
            isSigningOfficer: true,
            signgingOfficerEmail: 's-'+user.email,
            userEmail: user.email
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'signingOfficerPersonalData',
      code: async function(x, user, business) {
        var id;
        var ucj;

        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-1a5';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap =  net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.create({
            address: user.address,
            jobTitle: 'Treasurer',
            phoneNumber: user.phoneNumber,
            PEPHIORelated: false,
            thirdParty: false,
            businessId: business.id
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'transactionDetailsData',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-6';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.TransactionDetailsData.create({
            targetCustomers: 'targetCustomers',
            suggestedUserTransactionInfo: {
              class: 'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
              baseCurrency: 'USD',
              annualRevenue: '$0 to $10,000',
              transactionPurpose: 'Payables for products and/or services',
              annualTransactionAmount: '',
              annualTransactionFrequency: '1 to 99',
              annualVolume: '',
              annualDomesticTransactionAmount: 'N/A',
              annualDomesticVolume: '$0 to $10,000'
            }
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessDirectorsData',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-6-5';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessDirectorsData.create({
            //needDirector: false,
            businessTypeId: 3,
            businessDirectors: []
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'certifyDirectorsListed',
      code: async function(x, business) {
        var id;
        var ucj;
        id = '554af38a-8225-87c8-dfdf-eeb15f71215e-17';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyDirectorsListed.create({
            agreement: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessOwnershipData',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-7';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessOwnershipData.create({
            ownersSelectionsValidated: true,
            amountOfOwners: 0
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'certifyOwnersPercent',
      code: async function(x, business) {
        var id;
        var ucj;
        id = '554af38a-8225-87c8-dfdf-eeb15f71215e-12';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
         var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyOwnersPercent.create({
            agreement: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'certifyReviewed',
      code: async function(x, user) {
        var id;
        var ucj;
        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-14';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.CertifyDataReviewed.create({
            reviewed: true,
            signingOfficer: user.id
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'internationalPaymentsAgreement',
      code: async function(x) {
        var id;
        var ucj;
        id = '554af38a-8225-87c8-dfdf-eeb15f71215e-10';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.USDAFEXTerms.create({
            agreement: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    }
  ]
});

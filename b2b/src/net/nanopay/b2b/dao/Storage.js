foam.CLASS({
  package: 'net.nanopay.b2b.dao',
  name: 'Storage',

  documentation: 'Creates all B2B DAO\'s.',

  requires: [
    'foam.dao.ContextualizingDAO',
    'foam.dao.DecoratedDAO',
    'foam.dao.ClientDAO',
    'foam.dao.EasyDAO',
    'foam.dao.history.HistoryRecord',
    'net.nanopay.b2b.model.Business',
    'net.nanopay.b2b.model.Invoice',
    'foam.box.HTTPBox',
  ],

  exports: [
    'businessDAO',
    'invoiceDAO',
    'historyDAO',
    'addressDAO',
    'businessBusinessJunctionDAO',		
    'businessSectorDAO',
    'businessTypeDAO',
    'invoiceResolutionDAO',
    'countryDAO'
  ],

//   classes: [
//       {
//         name: 'InvoiceDecorator',
//         extends: 'foam.dao.AbstractDAODecorator',
//
//         imports: [ 'businessDAO' ],
//
//         methods: [
//           function write(X, dao, obj, existing) {
//             var self = this;
// //            console.log('.');
//             return new Promise(function(resolve, reject) {
//               self.businessDAO.find(obj.toBusinessId)
//               .then(function (b) {
//                 obj.toBusinessName = b.name;
//               })
//               .then(function() {
//                 self.businessDAO.find(obj.fromBusinessId).then(function (b) {
//                   obj.fromBusinessName = b.name;
//                   resolve(obj);
//               })})});
//           }
//           /*
//           function read(X, dao, obj) {
//             var self = this;
//             console.log('.');
//             return new Promise(function(resolve, reject) {
//               self.businessDAO.find(obj.toBusinessId)
//               .then(function (b) {
//                 obj.toBusinessName = b.name;
//               })
//               .then(function() {
//                 self.businessDAO.find(obj.fromBusinessId).then(function (b) {
//                   obj.fromBusinessName = b.name;
//                   resolve(obj);
//               })})});
//           }
//           */
//         ]
//       }
//   ],
//
  properties: [
    {
      name: 'businessDAO',
      factory: function() {
        return this.createDAO({
          of: this.Business,
          seqNo: true,
          testData: [
            'AAA CAD Business',
            'ABC Engineering',
            'Ali Designs',
            'Betasoloin',
            'Betatech',
            'Bioholding',
            'Bioplex',
            'Blackzim',
            'Cancity',
            'Codehow',
            'Condax',
            'Conecom',
            'Dalttechnology',
            'dambase',
            'Domzoom',
            'Doncon',
            'Donquadtech',
            'Dontechi',
            'Donware',
            'Fasehatice',
            'Faxquote',
            'Finhigh',
            'Finjob',
            'Funholding',
            'Ganjaflex',
            'Gogozoom',
            'Golddex',
            'Goodsilron',
            'Green-Plus',
            'Groovestreet',
            'Hatfan',
            'Hottechi',
            'Inity',
            'Isdom',
            'Iselectrics',
            'J-Texon',
            'Kan-code',
            'Kinnamplus',
            'Konex',
            'Konmatfix',
            'Labdrill',
            'Lexiqvolax',
            'Mathtouch',
            'Nam-zim',
            'Newex',
            'Ontomedia',
            'Openlane',
            'Opentech',
            'Plexzap',
            'Plusstrip',
            'Plussunin',
            'Rangreen',
            'Rantouch',
            'Ron-tech',
            'Rundofase',
            'Scotfind',
            'Scottech',
            'Silis',
            'Singletechno',
            'Sonron',
            'Stanredtax',
            'Statholdings',
            'Streethex',
            'Sumace',
            'Sunnamplex',
            'Toughzap',
            'Treequote',
            'Warephase',
            'Xx-holding',
            'Xx-zobam',
            'Y-corporation',
            'year-job',
            'Yearin',
            'Zathunicon',
            'Zencorporation',
            'Zoomit',
            'Zotware',
            'Zumgoity'
          ].map(function (name, i) {
            var lastNames = [
              'Martin',
              'Jacobs',
              'Yang',
              'Smith',
              'Johnson',
              'Williams',
              'Jones',
              'Brown',
              'Davis',
              'Miller',
              'Wilson',
              'Moore',
              'Taylor',
              'Anderson',
              'Thomas',
              'Jackson',
              'White',
              'Harris',
              'Martin',
              'Thompson',
              'Garcia',
              'Martinez',
              'Robinson',
              'Clark',
              'Rodrigues',
              'Lewis',
              'Lee',
              'Walker',
              'Hall',
              'Allen',
              'Young',
              'Hernandez',
              'King',
              'Wright',
              'Lopez',
              'Hill',
              'Scott',
              'Green',
              'Adams',
              'Baker',
              'Gonzalez',
              'Nelson',
              'Carter',
              'Mitchell',
              'Perez',
              'Roberts',
              'Turner',
              'Phillips',
              'Campbell',
              'Parker',
              'Evans',
              'Edwards',
              'Collins',
              'Stewart',
              'Sanchez',
              'Morris',
              'Rogers',
              'Reed',
              'Cook',
              'Morgan',
              'Bell',
              'Murphy',
              'Bailey',
              'Rivera',
              'Cooper',
              'Richardson',
              'Cox',
              'Howard',
              'Ward',
              'Torres',
              'Peterson',
              'Gray',
              'Ramirez',
              'James',
              'Watson',
              'Brooks',
              'Kelly',
              'Sanders',
              'Price',
              'Bennett',
              'Wood'
            ];
            var firstNames = [
              'Ricky',
              'Sophia',
              'Jian',
              'Jackson',
              'Emma',
              'Aiden',
              'Olivia',
              'Lucas',
              'Ava',
              'Liam',
              'Mia',
              'Noah',
              'Isabella',
              'Ethan',
              'Riley',
              'Mason',
              'Aria',
              'Caden',
              'Zoe',
              'Oliver',
              'Charlotte',
              'Elijah',
              'Lily',
              'Grayson',
              'Layla',
              'Jacob',
              'Amelia',
              'Michael',
              'Emily',
              'Benjamin',
              'Madelyn',
              'Carter',
              'Aubrey',
              'James',
              'Adalyn',
              'Jayden',
              'Madison',
              'Alexander',
              'Harper',
              'Caleb',
              'Abigail',
              'Ryan',
              'Aaliyah',
              'Luke',
              'Avery',
              'Daniel',
              'Evelyn',
              'Jack',
              'Kaylee',
              'William',
              'Ella',
              'Owen',
              'Ellie',
              'Gabriel',
              'Scarlett',
              'Matthew',
              'Arianna',
              'Connor',
              'Hailey',
              'Jayce',
              'Nora',
              'Isaac',
              'Addison',
              'Sebastian',
              'Brooklyn',
              'Henry',
              'Hannah',
              'Muhammad',
              'Mila',
              'Cameron',
              'Leah',
              'Wyatt',
              'Elizabeth',
              'Dylan',
              'Sarah',
              'Nathan',
              'Eliana',
              'Nicholas'
            ];
            // var user = foam.nanos.auth.User.create({id: 100+i, firstName: firstNames[i], lastName: lastNames[i]});
            return { id: 100+i, name: name, defaultContact: firstNames[i] + " " + lastNames[i], profileImageURL: 'images/business-placeholder.png' }
          })
        });
      }
    },
    {
      name: 'addressDAO',
      factory: function() {
        return this.createDAO({
          of: 'foam.nanos.auth.Address',
          seqNo: true
        })
      }
    },
    {
      name: 'businessBusinessJunctionDAO',		
      factory: function() {		
        return this.createDAO({		
          of: 'net.nanopay.b2b.model.BusinessBusinessJunction'		
        })		
      }		
    },
    {
      name: 'businessSectorDAO',
      factory: function() {
        return this.createDAO({
          of: 'net.nanopay.b2b.model.BusinessSector',
          seqNo: true,
          testData: [
          {
            'name'    : 'Art dealing'
          },
          {
            'name'    : 'Audio & Video'
          },
          {
            'name'    : 'Automotive'
          },
          {
            'name'    : 'Charity & not-for-profit'
          },
          {
            'name'    : 'Consulting services'
          },
          {
            'name'    : 'Design'
          },
          {
            'name'    : 'Education & learning'
          },
          {
            'name'    : 'Entertainment - Adult'
          },
          {
            'name'    : 'Events & entertainment'
          },
          {
            'name'    : 'Financial Services'
          },
          {
            'name'    : 'Gambling, betting & online gaming'
          },
          {
            'name'    : 'Health & beauty'
          },
          {
            'name'    : 'IT services'
          },
          {
            'name'    : 'Jewellery, precious metals & stones'
          },
          {
            'name'    : 'Legal services'
          },
          {
            'name'    : 'Manufacturing'
          },
          {
            'name'    : 'Media & communication'
          },
          {
            'name'    : 'Military & semi-military goods & services'
          },
          {
            'name'    : 'Pharmaceuticals, medical & dietary supplements'
          },
          {
            'name'    : 'Public services'
          },
          {
            'name'    : 'Real estate & construction'
          },
          {
            'name'    : 'Restaurants & catering'
          },
          {
            'name'    : 'Retail & trade'
          },
          {
            'name'    : 'Sports'
          },
          {
            'name'    : 'Tobacco & alcohol'
          },
          {
            'name'    : 'Transport services'
          },
          {
            'name'    : 'Travel'
          }
          ]
        })
      }
    },
    {
      name: 'regionDAO',
      factory: function() {
        return this.createDAO({
          of: 'foam.nanos.auth.Region',
          seqNo: true,
          testData: [
            {
              countryId:  1,
              code: 'ON',
              name: 'Ontario'
            },
            {
              countryId:  1,
              code: 'AB',
              name: 'Alberta'
            },
            {
              countryId:  1,
              code: 'BC',
              name: 'British Columbia'
            },
            {
              countryId:  1,
              code: 'MB',
              name: 'Manitoba'
            },
            {
              countryId:  1,
              code: 'NB',
              name: 'New Brunswick'
            },
            {
              countryId:  1,
              code: 'NL',
              name: 'Newfoundland'
            },
            {
              countryId:  1,
              code: 'NS',
              name: 'Nova Scotia'
            },
            {
              countryId:  1,
              code: 'NT',
              name: 'Northwest Territories'
            },
            {
              countryId:  1,
              code: 'NU',
              name: 'Nunavut'
            },
            {
              countryId:  1,
              code: 'PE',
              name: 'Prince Edward Island'
            },
            {
              countryId:  1,
              code: 'QC',
              name: 'Quebec'
            },
            {
              countryId:  1,
              code: 'SK',
              name: 'Saskatchewan'
            },
            {
              countryId:  1,
              code: 'YT',
              name: 'Yukon'
            }
          ]
        })
      }
    },
    {
      name: 'invoiceResolutionDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: net.nanopay.b2b.model.InvoiceResolution,
          serviceName: 'invoiceResolutionDAO'
        });
      }
    },
    {
      name: 'countryDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: foam.nanos.auth.Country,
          serviceName: 'countryDAO',
          testData: [
            {
              name: 'Canada',
              code: 'CAN'
            }
          ]
        })
      }
    },
    {
      name: 'businessTypeDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: net.nanopay.b2b.model.BusinessType,
          serviceName: 'businessTypeDAO',
          testData: [
            {
              name: 'Sole Proprietorship'
            },
            {
              name: 'General Partnership'
            },
            {
              name: 'Limited Partnership'
            },
            {
              name: 'Corporation'
            },
            {
              name: 'Joint Venture'
            }
          ]
        })
      }
    },
    {
      name: 'invoiceDAO',
      factory: function() {
        /*this.DecoratedDAO.create({
          decorator: this.InvoiceDecorator.create(),
          delegate: */
        return this.createDAO({
            of: this.Invoice,
            seqNo: true
          })
          .addPropertyIndex(this.Invoice.STATUS)
          .addPropertyIndex(this.Invoice.TO_BUSINESS_NAME)
          .addPropertyIndex(this.Invoice.FROM_BUSINESS_NAME)
          .addPropertyIndex(this.Invoice.TO_BUSINESS_ID)
          .addPropertyIndex(this.Invoice.FROM_BUSINESS_ID);
      }
    },
    {
      name: 'historyDAO',
      factory: function() {
        return this.createDAO({
          of: 'foam.dao.history.HistoryRecord',
          seqNo: true,
          testData: [
            { 
              seqNo:  123, 
              objectId: 1, 
              user: 'Smith, John (894735)', 
              timestamp: '20:08:01 April 22, 2017',
              updates: [
                {
                  name: 'Invoice Status',
                  newValue: 'Received'
                },
                {
                  name: 'From',
                  newValue: '360 Design Inc.'
                }
              ]
            },
            { 
              seqNo:  124, 
              objectId: 2, 
              user: 'Ales, Jingyi (98374)', 
              timestamp: '20:08:01 April 22, 2017',
              updates: [
                {
                  name: 'Invoice Status',
                  oldValue: 'Received',
                  newValue: 'Pending Approval'
                }
              ]
            },
            { 
              seqNo:  125, 
              objectId: 3, 
              user: 'Smith, Aleks (325432)', 
              timestamp: '09:08:01 April 24, 2017',
              updates: [
                {
                  name: 'Invoice Status',
                  oldValue: 'Pending Approval',
                  newValue: 'Disputed'
                },
                {
                  name: 'Message',
                  oldValue: '',
                  newValue: 'Hi, I think the amount is wrong. It should be $3000.22 instead of $3100.22. Please check again. Thank you very much.'
                }
              ]
            },
            { 
              seqNo:  126, 
              objectId: 4, 
              user: 'Ales, Jingyi (98374)', 
              timestamp: '16:08:01 April 25, 2017',
              updates: [
                {
                  name: 'Invoice Status',
                  oldValue: 'Disputed',
                  newValue: 'Scheduled'
                },
                {
                  name: 'Scheduled Date',
                  newValue: '2017-06-02'
                }
              ]
            },
            { 
              seqNo:  127, 
              objectId: 5, 
              user: 'Smith, John (894735)', 
              timestamp: '13:08:01 April 26, 2017',
              updates: [
                {
                  name: 'Invoice Status',
                  oldValue: 'Scheduled',
                  newValue: 'Paid'
                }
              ]
            }
          ]
        })
      }
    }
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});

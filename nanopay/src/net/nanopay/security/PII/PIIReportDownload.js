foam.CLASS({
  package: 'net.nanopay.security.pii',
  name: 'PIIReportDownload',
  extends: 'foam.u2.View',

  documentation: 'View for downloading Personal Information Report',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'ctrl',
    'notificationDAO',
    'user',
    'viewPIIRequestsDAO',
    'window'
  ],


  requires: [
    'foam.dao.ArraySink',
    'net.nanopay.security.pii.PIIDisplayStatus',
    'net.nanopay.security.pii.ViewPIIRequests'
  ],

  exports: [
    'as data'
  ],

  css: `
  ^ {
    width: 992px;
    margin: 0 auto;
  }
  ^ .net-nanopay-ui-ActionView-downloadJSON {
    width: 135px;
    height: 50px;
    border-radius: 2px;
    background: %SECONDARYCOLOR%;
    color: white;
    margin: 0;
    padding: 0;
    border: 0;
    outline: none;
    cursor: pointer;
    line-height: 50px;
    font-size: 14px;
    font-weight: normal;
    box-shadow: none;
  }
  ^ .net-nanopay-ui-ActionView-downloadJSON:hover {
    opacity: 0.9;
  }
  `,

  properties: [
    {
      class: 'Enum',
      name: 'requestsStatus',
      of: 'net.nanopay.security.pii.PIIDisplayStatus',
    },
    {
      class: 'Int',
      name: 'tick',
      value: -1,
      documentation: `used to compensate for lack of $sub support for enums`
    }
  ],


  methods: [
    // queries the viewPIIRequestsDAO and sets requestsStatus to NONE, APPROVED, or PENDING.
    function checkPermissionStatus(instance, userID) {
      vprDAO = this.viewPIIRequestsDAO;
      instance.viewPIIRequestsDAO.where(
        this.EQ(this.ViewPIIRequests.CREATED_BY, userID)
        ).select().then(
          function(result) {
            arr = (Array(result))[0].instance_;
            // returns if DAO is empty
            if ( Object.keys(arr).length === 0 && arr.constructor === Object ) {
                instance.requestsStatus = instance.PIIDisplayStatus.NONE;
                instance.tick++;
                return;
            }
            for ( i = 0; i < arr.array.length; i++ ) {
              // Looks for pending requests in DAO
              // is there a more explicit way to do this?
              if ( ! arr.array[i].instance_.viewRequestStatus ) {
                instance.requestsStatus = instance.PIIDisplayStatus.PENDING;
                instance.tick++;
                return;
              }
              // Looks for approved request that are also not expired
              if ( arr.array[i].instance_.viewRequestStatus.instance_.label == 'Approved' ) {
                if ( arr.array[i].instance_.requestExpiresAt > new Date() ) {
                  instance.requestsStatus = instance.PIIDisplayStatus.APPROVED;
                  instance.tick++;
                  return;
                }
              }
            }
              // Triggered if the DAO contained only expired requests
              instance.requestsStatus = instance.PIIDisplayStatus.NONE;
              instance.tick++;
            }
            );
    },

    function initE() {
      this.SUPER();
      var self = this;
      currentUserID = this.user.id;
      this.checkPermissionStatus(self, currentUserID);

      // set up listener on tick to update when requestStatus changes
      this.tick$.sub(function() {
        if ( self.requestsStatus == self.PIIDisplayStatus.APPROVED ) {
          self.addClass(self.myClass())
          .start()
            .start().addClass('light-roboto-h2').add('PII Report Download').end()
            .start().add(self.DOWNLOAD_JSON).end()
          .end();
        }
        if ( self.requestsStatus == self.PIIDisplayStatus.NONE ) {
          self.addClass(self.myClass())
          .start()
            .start('div')
            .start(self.VIEW_REQUEST).addClass('update-BTN').end()
            .end()
          .end();
        }
        if ( self.requestsStatus == self.PIIDisplayStatus.PENDING ) {
          self.addClass(self.myClass())
          .start()
            .start('div')
            .start('H1').add('You have already submitted a request to view your personal information.').end()
            .start('p').add('It will be reviewed shortly and you will receive an email when your information is ready to view.').end()
            .end()
          .end();
        }
      });
    }
  ],

  actions: [
    {
      name: 'viewRequest',
      label: 'Request Personal Identifiable Information Report',
      code: function(X) {
        var self = this;
        vpr = X.window.net.nanopay.security.pii.ViewPIIRequests.create();
        X.viewPIIRequestsDAO.put(vpr).then( function() {
          alert('Your request has been submitted');
          self.window.location.assign(self.window.location.origin);
          }
        );
      }
    },
    {
      name: 'downloadJSON',
      label: 'Download PII',
      documentation: 'Calls PIIWebAgent that triggers a download of a PII Report',
      code: function(X) {
        var sessionId = localStorage['defaultSession'];
        var url = self.window.location.origin + '/service/PIIWebAgent';
        if ( sessionId ) {
          url += '?sessionId=' + sessionId;
        }
        X.window.location.assign(url);
      }
    }
  ]

});

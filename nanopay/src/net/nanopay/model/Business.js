foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Business',
  extends: 'foam.nanos.auth.User',

  imports: [
    'ctrl',
    'invoiceDAO'
  ],

  requires: [
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  documentation: `
  Business extends user class. A business is an entity on behalf of which 
  multiple users can act.  A business is associated with the company name provided by the user 
  who first creates it.

  The business allows business information to be updated and retrieved.  The body parameters 
  refer to the business as the 'organization'.
  `,

  tableColumns: [
    'id',
    'businessName',
    'email',
    'viewAccounts'
  ],

  messages: [
    { name: 'COMPLIANCE_REPORT_WARNING', message: ' has not completed the business profile, and cannot generate compliance documents.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'businessPermissionId',
      documentation: `
      A generated name used in permission strings related to the business.
      The name does not contain any special characters.
      `,
      expression: function(businessName, id) {
        return businessName.replace(/\W/g, '').toLowerCase() + id;
      },
      type: 'String',
      javaGetter: `
        return getBusinessName().replaceAll("\\\\W", "").toLowerCase() + getId();
      `
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether a user is able to login.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'residenceOperated',
      documentation: 'Verifies whether a business is operated at the residence of the owner.'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'beneficialOwnerDocuments',
      documentation: 'Documents that verify a person as a beneficial owner.',
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.data.beneficialOwnerDocuments$
        };
      }
    }
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable'
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        if ( SafetyUtil.isEmpty(this.getBusinessName()) ) {
          throw new IllegalStateException("Business name cannot be empty.");
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        // Prevent privilege escalation by only allowing a user's group to be
        // set to one that the user doing the put has permission to update.
        boolean hasGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());

        if ( ! hasGroupUpdatePermission ) {
          throw new AuthorizationException("You do not have permission to set that business's group to '" + this.getGroup() + "'.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        // Don't authorize reads for now.
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");
        boolean isUpdatingSelf = SafetyUtil.equals(this.getId(), user.getId());
        
        // to allow update authorization for users with permissions
        boolean hasUserEditPermission = auth.check(x, "business.update." + this.getId());

        // In other words: if the user EITHER is updating themselves, has edit authorization or is changing the system (will be handled below)
        // then they can PROCEED
        if (
          ! isUpdatingSelf &&
          ! hasUserEditPermission
        ) {
          throw new AuthorizationException();
        }

        Business oldBusiness = (Business) oldObj;

        // Prevent privilege escalation by only allowing a user's group to be
        // changed under appropriate conditions.
        if ( ! SafetyUtil.equals(oldBusiness.getGroup(), this.getGroup()) ) {
          boolean hasOldGroupUpdatePermission = auth.check(x, "group.update." + oldBusiness.getGroup());
          boolean hasNewGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());
          if ( isUpdatingSelf ) {
            throw new AuthorizationException("You cannot change your own group.");
          } else if ( ! hasUserEditPermission ) {
            throw new AuthorizationException("You do not have permission to change that business's group.");
          } else if ( ! (hasOldGroupUpdatePermission && hasNewGroupUpdatePermission) ) {
            throw new AuthorizationException("You do not have permission to change that business's group to '" + this.getGroup() + "'.");
          }
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = (User) x.get("user");
        Group group = (Group) x.get("group");
        if ( ! SafetyUtil.equals(group.getId(), "admin") ) {
          throw new AuthorizationException("Businesses cannot be deleted.");
        }
      `
    }
  ],

  actions: [
    {
      name: 'exportComplianceDocuments',
      code: function() {
        if ( this.compliance === this.ComplianceStatus.NOTREQUESTED
          || ! this.onboarded ) {
          this.ctrl.notify(this.organization + this.COMPLIANCE_REPORT_WARNING);
          return;
        }
        var url = window.location.origin
          + '/service/ascendantFXReports?userId=' + this.id;
        window.location.assign(url);
      }
    },
    {
      name: 'exportSettlementDocuments',
      code: function() {
        // Let us assume that we want to search for invoices with a field 3 days before and 3 days after today.
        var sDate = new Date(Date.now() - (1000*60*60*24*3));
        var dDate = new Date(Date.now() + (1000*60*60*24*3));
        var url = window.location.origin
          + '/service/settlementReports?userId='+ this.id
          + '&startDate='+ sDate
          + '&endDate='+ dDate;

        // var url = window.location.origin + "/service/settlementReports?userId=" + this.id + "&startDate=&endDate=";
        window.location.assign(url);
      }
    }
  ]
});

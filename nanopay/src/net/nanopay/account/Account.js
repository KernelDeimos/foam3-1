/**
 * NANOPAY CONFIDENTIAL
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
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'The base model for creating and managing all accounts.',

  // relationships: owner (User)

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'net.nanopay.liquidity.approvalRequest.AccountApprovableAware',
  ],

  imports: [
    'exchangeRateService?',
    'user?',
    'balanceService?',
    'currencyDAO?'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.core.Currency',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.LocalSetting',
    'foam.nanos.session.Session',
    'net.nanopay.fx.ExchangeRateService',
    'static foam.mlang.MLang.EQ'
  ],

  searchColumns: [
    'id',
    'name',
    'denomination',
    'type',
    'isDefault'
  ],

  tableColumns: [
    'id',
    'type',
    'summary',
    'balance'
  ],

  axioms: [
    {
      class: 'foam.comics.v2.namedViews.NamedViewCollection',
      name: 'Table',
      view: { class: 'net.nanopay.account.AccountDAOBrowserView' },
      icon: 'images/list-view.svg',
    },
    {
      class: 'foam.comics.v2.namedViews.NamedViewCollection',
      name: 'Tree',
      view: { class: 'net.nanopay.account.ui.AccountTreeView' },
      icon: 'images/tree-view.svg',
    }
  ],

  messages: [
    { name: 'DEFAULT_MSG', message: 'Default' }
  ],

  sections: [
    {
      name: 'accountType',
      permissionRequired: true,
      isAvailable: function(id) { return !! id; },
      order: 1
    },
    {
      name: 'accountInformation',
      order: 2
    },
    {
      // liquid
      name: 'parentSection',
      permissionRequired: true,
      order: 3
    },
    {
      name: 'balanceDetails',
      permissionRequired: true,
      order: 4
    },
    {
      name: 'complianceInformation',
      title: 'Compliance',
      order: 5
    },
    {
      name: 'operationsInformation',
      title: 'Operations',
      permissionRequired: true,
      order: 6
    },
    {
      name: 'ownerInformation',
      title: 'Owner',
      permissionRequired: true,
      order: 7
    },
    {
      name: 'transactionInformation',
      title: 'Transaction',
      permissionRequired: true,
      order: 8
    },
    {
      name: 'systemInformation',
      permissionRequired: true,
      order: 9
    },
    {
      name: 'deprecated',
      permissionRequired: true,
      order: 10
    }
  ],

  properties: [
    // TODO: access/scope: public, private
    {
      class: 'String',
      name: 'type',
      includeInDigest: false,
      documentation: 'The type of the account.',
      transient: true,
      getter: function() {
        return this.model_.label === 'Digital Account' ? 'Virtual Account' : this.model_.label;
      },
      javaGetter: `
        return getClass().getSimpleName();
      `,
      tableWidth: 150,
      section: 'accountInformation',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'id',
      includeInDigest: true,
      documentation: 'The ID for the account.',
      section: 'accountInformation',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableWidth: 150
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Determines whether the account is deleted.',
      value: false,
      includeInDigest: false,
      section: 'deprecated',
      writePermissionRequired: true,
      visibility: 'RO',
      tableWidth: 85
    },
    {
      class: 'String',
      name: 'name',
      label: 'Account Name',
      includeInDigest: false,
      documentation: `The given name of the account,
        provided by the individual person, or real user.`,
      validateObj: function(name) {
        if ( /^\s+$/.test(name) ) {
          return 'Account name may not consist of only whitespace.';
        }
      },
      section: 'accountInformation',
      order: 1,
      tableWidth: 200
    },
    {
      class: 'String',
      name: 'desc',
      includeInDigest: false,
      documentation: `The given description of the account, provided by
        the individual person, or real user.`,
      label: 'Memo',
      section: 'accountInformation',
      order: 2
    },
    {
      class: 'Boolean',
      name: 'transferIn',
      documentation: 'Determines whether an account can receive transfers.',
      value: true,
      includeInDigest: false,
      section: 'systemInformation'
    },
    {
      class: 'Boolean',
      name: 'transferOut',
      documentation: 'Determines whether an account can make transfers out.',
      value: true,
      includeInDigest: false,
      section: 'systemInformation'
    },
    {
      class: 'Reference',
      of: 'foam.core.Unit',
      name: 'denomination',
      includeInDigest: true,
      label: 'Currency',
      targetDAOKey: 'currencyDAO',
      documentation: `The unit of measure of the payment type. The payment system can handle
        denominations of any type, from mobile minutes to stocks.
      `,
      tableWidth: 127,
      writePermissionRequired: true,
      section: 'accountInformation',
      order: 3,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              dao: X.currencyDAO,
              heading: 'Currencies'
            }
          ]
        };
      }
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      documentation: `Determines whether an account is the first preferred option of the User for a particular denomination.`,
      tableWidth: 87,
      label: 'Set As Default',
      value: false,
      includeInDigest: false,
      section: 'operationsInformation',
      tableHeaderFormatter: function(axiom) {
        this.add('Default');
      },
      tableHeader: function(axiom) {
        return this.sourceCls_.DEFAULT_MSG;
      },
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .callIf(value, function() {
              this.style({ color: '#32bf5e' });
            })
            .add(value ? 'Y' : '-')
          .end();
      },
    },
    {
      class: 'UnitValue',
      unitPropName: 'denomination',
      name: 'balance',
      label: 'Balance (local)',
      documentation: 'A numeric value representing the available funds in the account.',
      section: 'balanceDetails',
      storageTransient: true,
      createVisibility: 'HIDDEN', // No point in showing as read-only during create since it'll always be 0
      updateVisibility: 'RO',
      readVisibility: 'RO',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        long balance  = (Long) ((Account)obj).findBalance(x);
        Currency curr = (Currency) currencyDAO.find(((Account)obj).getDenomination());

        // Output formatted balance or zero
        outputter.outputValue(curr.format(balance));
      `,
      tableWidth: 175,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.add(obj.slot(function(denomination) {
          return self.E().add(foam.core.PromiseSlot.create({
            promise: this.currencyDAO.find(denomination).then((result) => {
              return self.E().add(result.format(value));
            })
          }));
        }))
      }

  },
    {
      class: 'String',
      name: 'homeBalance',
      label: 'Balance (home)',
      documentation: `
        A numeric value representing the available funds in the
        account converted to the home denomination.
      `,
      section: 'balanceDetails',
      storageTransient: true,
      visibility: 'RO',
      javaGetter: `
        Session session = foam.core.XLocator.get().get(Session.class);
        if ( session == null ) {
          return "";
        }
        foam.dao.DAO localLocalSettingDAO = (foam.dao.DAO)session.getContext().get("localLocalSettingDAO");

        String homeDenomination = "USD";

        if (localLocalSettingDAO != null) {
          LocalSetting ls = (LocalSetting)localLocalSettingDAO.find(EQ(LocalSetting.ID, "homeDenomination"));
          if ( ls != null && ! ls.getValue().isEmpty() )
            homeDenomination = ls.getValue();
        }

        String denomination = getDenomination();
        ExchangeRateService ert = (ExchangeRateService)session.getContext().get("exchangeRateService");
        if ( ert != null ) {
          String exchangeFormat = null;
          //catching "Rate Not Found" RuntimeException
          try {
            exchangeFormat = ert.exchangeFormat(denomination, homeDenomination, getBalance());
          } catch(Throwable t) { }
          if ( exchangeFormat == null )
            return "";
          return exchangeFormat + " " + homeDenomination;
        }
        return "";
      `,
      tableWidth: 175,
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value);
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      includeInDigest: true,
      documentation: 'The date and time of when the account was created in the system.',
      section: 'accountInformation',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      includeInDigest: true,
      documentation: 'The ID of the User who created the account.',
      section: 'accountInformation',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      includeInDigest: true,
      documentation: 'The ID of the Agent who created the account.',
      section: 'accountInformation',
      // visibility: 'RO',
      visibility: 'HIDDEN'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      includeInDigest: true,
      documentation: 'The date and time of when the account was last changed in the system.',
      section: 'accountInformation',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      includeInDigest: true,
      documentation: `The unique identifier of the individual person, or real user,
        who last modified this account.`,
      section: 'accountInformation',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then((user) => this.add(user.toSummary()))
          .catch((error) => {
            this.add(value);
          });
      },
    },
    {
      class: 'String',
      name: 'summary',
      section: 'accountInformation',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table views`,
      expression: function() {
        return this.toSummary() + ` - ${this.type}`;
      },
      tableCellFormatter: function(_, obj) {
        this.add(obj.slot(function(
          name,
          desc
        ) {
          let output = '';
          if ( name ) {
            output += name;
            if ( desc ) {
              output += ' - ';
            }
          }
          if ( desc ) {
            output += desc;
          }
          return output;
        }));
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      includeInDigest: true,
      section: 'systemInformation',
      value: foam.nanos.auth.LifecycleState.PENDING,
      writePermissionRequired: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'checkerPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      documentation: `
        When using a reference to the accountDAO, the labels associated with it will show
        a chosen property rather than the first alphabetical string property. In this
        case, we are using the account name.
      `,
      code: function() {
        var output = '(' + this.id + ') ';
        if ( this.name ) {
          output += this.name;
        } else if ( this.desc ) {
          output += this.desc;
        }
        return output;
      },
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append("(");
        sb.append(getDenomination());
        sb.append(") ");
        if ( getName().length() == 0 ) {
          sb.append(getDesc());
        } else {
          sb.append(getName());
        }
        return sb.toString();
      `
    },
    {
      name: 'findBalance',
      type: 'Long',
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      code: function(x) {
        return x.balanceService.findBalance(x, this.id);
      },
      javaCode: `
        long balance = 0;
        //catching "Rate Not Found" RuntimeException
        try {
          balance = ((BalanceService) x.get("balanceService")).findBalance_(x, this);
        } catch(Throwable t) {
          Logger logger = (Logger) getX().get("logger");
          logger.error(t);
        }
        return balance;
      `
    },
    {
      name: 'validateAmount',
      documentation: `Allows a specific value to be used to perform a balance operation.
        For example: Trust accounts can be negative.`,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
        long bal = balance == null ? 0L : balance.getBalance();

        if ( amount < 0 &&
             -amount > bal ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", bal);
          throw new InsufficientBalanceException(this.getId());
        }
      `
    },
    {
      name: 'getOutgoingAccountCreate',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ],
      javaCode: `
        return getParent();
      `
    },
    {
      name: 'getOutgoingAccountRead',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ],
      javaCode: `
        return getId();
      `
    },
    {
      name: 'getOutgoingAccountUpdate',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ],
      javaCode: `
        return getId();
      `
    },
    {
      name: 'getOutgoingAccountDelete',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ],
      javaCode: `
        return getId();
      `
    }
  ]
});

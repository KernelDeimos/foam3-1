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
  package: 'net.nanopay.contacts.ui',
  name: 'ContactWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  documentation: 'Lets the user create a contact from scratch.',

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Invitation',
    'foam.layout.Section'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'ctrl',
    'contactService',
    'invitationDAO',
    'user'
  ],

  css: `
    ^step-indicator {
      display: flex;
      justify-content: flex-end;
    }
    .property-rbiLink {
      margin-top: -33px;
      top: 50px;
      position: relative;
      float: right;
    }
    .wizard {
      width: 650px;
    }
  `,

  messages: [
    { name: 'EDIT_STEP_ONE_TITLE', message: 'Edit contact' },
    { name: 'EDIT_STEP_TWO_TITLE', message: 'Edit banking information' },
    { name: 'EDIT_STEP_THREE_TITLE', message: 'Edit business address' },
    { name: 'CONTACT_ADDED', message: 'Contact added successfully' },
    { name: 'CONTACT_EDITED', message: 'Contact edited' },
    { name: 'INVITE_SUCCESS', message: 'Sent a request to connect' },
    { name: 'CONTACT_ADDED_INVITE_SUCCESS', message: 'Contact added successfully. An email invitation was sent.' },
    { name: 'CONTACT_ADDED_INVITE_FAILURE', message: 'Contact added successfully. An email invitation could not be sent.' },
    { name: 'ACCOUNT_CREATION_ERROR', message: 'Failed to add an account' },
    {
      name: 'EXISTING_BUSINESS',
      message: `This email has already been registered on Ablii.
                You can set up a connection with this user and their business by using their payment code or
                finding them in the search business menu when adding a contact.
               `
    },
    { name: 'GENERIC_PUT_FAILED', message: 'Failed to add an account.' },
    { name: 'SECTION_ONE_TITLE', message: 'Add Contact' },
    { name: 'SECTION_TWO_TITLE', message: 'Add Bank Account' },
    { name: 'SECTION_TWO_SUBTITLE', message: 'Payments made to this contact will be deposited to the account you provide.' },
    { name: 'SECTION_THREE_TITLE', message: 'Add Business Address' },
    { name: 'SECTION_THREE_SUBTITLE', message: 'Enter the contact’s business address. PO boxes are not accepted.' },
    { name: 'STEP', message: 'Step' },
    { name: 'OF_MGS', message: 'of' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      documentation: 'True while waiting for a DAO method call to complete.',
      value: false
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'contact',
      documentation: 'The contact returned after put to contactDAO.'
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `Set to true when editing a contact from
      contact controller.`,
      value: false
    }
  ],

  methods: [
    async function init() {
      var sectionOne = this.Section.create({
        title: this.SECTION_ONE_TITLE,
        properties: [ 
          net.nanopay.contacts.Contact.ORGANIZATION,
          net.nanopay.contacts.Contact.EMAIL,
          net.nanopay.contacts.Contact.FIRST_NAME,
          net.nanopay.contacts.Contact.LAST_NAME,
          net.nanopay.contacts.Contact.CONFIRM,
          net.nanopay.contacts.Contact.AVAILABLE_COUNTRIES
        ],
        fromClass: 'net.nanopay.contacts.Contact'
      });
      var sectionTwo = this.Section.create({
        title: this.SECTION_TWO_TITLE,
        subTitle: this.SECTION_TWO_SUBTITLE,
        properties: [
          net.nanopay.contacts.Contact.CREATE_BANK_ACCOUNT,
          net.nanopay.contacts.Contact.NO_CORRIDORS_AVAILABLE,
          net.nanopay.contacts.Contact.SHOULD_INVITE
        ],
        fromClass: 'net.nanopay.contacts.Contact'
      });
      var sectionThree = this.Section.create({
        title: this.SECTION_THREE_TITLE,
        subTitle: this.SECTION_THREE_SUBTITLE,
        properties: [
          net.nanopay.contacts.Contact.BUSINESS_ADDRESS
        ],
        fromClass: 'net.nanopay.contacts.Contact'
      });

      // custom sections for contact wizard
      this.sections = [ sectionOne, sectionTwo, sectionThree ];
      this.data.copyFrom({
        type: 'Contact',
        group: 'sme'
      });
      if ( this.isEdit ) {
        this.data.isEdit = true;
        this.data.shouldInvite = false;
        this.sections[0].title = this.EDIT_STEP_ONE_TITLE;
        this.sections[0].subTitle = '';
        this.sections[1].title = this.EDIT_STEP_TWO_TITLE;
        this.sections[1].subTitle = '';
        this.sections[2].title = this.EDIT_STEP_THREE_TITLE;
        this.sections[2].subTitle = '';
        if ( this.data.bankAccount > 0 ) {
          this.data.createBankAccount = await this.bankAccountDAO.find(this.data.bankAccount);
        }
      }
    },
    function initE() {
      var self = this;
      this.addClass('wizard');
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E().addClass('section-container')
              .start().addClass(self.myClass('step-indicator'))
                .add(this.slot(function(currentIndex) {
                  return `${self.STEP} ${currentIndex + 1} ${self.OF_MGS} 3`;
                }))
              .end()
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass('button-container')
              .tag(this.BACK, { buttonStyle: 'TERTIARY' })
              .start().addClass(this.myClass('button-sub-container'))
                .tag(this.OPTION, { buttonStyle: 'SECONDARY' })
                .start(this.NEXT).end()
              .end()
              .start(this.SAVE).end()
            .end()
          .endContext()
        .end();
    },
    /** Add the contact to the user's contacts. */
    async function addContact() {
      this.isConnecting = true;
      try {
        let canInvite = this.data.createBankAccount.country != 'IN';

        if ( this.data.shouldInvite && canInvite ) {
          // check if it is already joined
          var isExisting = await this.contactService.checkExistingContact(this.__subContext__, this.data.email, false);

          if ( ! isExisting ) {
            try {
              this.contact = await this.user.contacts.put(this.data);

              if ( await this.sendInvite(false) ) {
                this.ctrl.notify(this.CONTACT_ADDED_INVITE_SUCCESS, '', this.LogLevel.INFO, true);
              }
            } catch (err) {
              var msg = err.message || this.GENERIC_PUT_FAILED;
              this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
            }
          } else {
            this.ctrl.notify(this.EXISTING_BUSINESS, '', this.LogLevel.WARN, true);
            return false;
          }
        } else {
          this.contact = await this.user.contacts.put(this.data);
          this.ctrl.notify(this.isEdit ? this.CONTACT_EDITED : this.CONTACT_ADDED, '', this.LogLevel.INFO, true);
        }
      } catch (e) {
        var msg = e.message || this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
        this.isConnecting = false;
        return false;
      }
      this.isConnecting = false;
      return true;
    },
    /** Send the Contact an email inviting them to join Ablii. */
    async function sendInvite(showToastMsg) {
      var invite = this.Invitation.create({
        email: this.data.email,
        createdBy: this.user.id,
        inviteeId: this.data.id,
        businessName: this.data.organization,
        message: ''
      });
      try {
        await this.invitationDAO.put(invite);
        if ( showToastMsg ) {
          this.ctrl.notify(this.INVITE_SUCCESS, '', this.LogLevel.INFO, true);
        }
        // Force the view to update.
        this.user.contacts.cmd(foam.dao.AbstractDAO.RESET_CMD);
      } catch (e) {
        this.ctrl.notify(this.CONTACT_ADDED_INVITE_FAILURE, '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },
    /** Add the bank account to the Contact. */
    async function addBankAccount() {
      this.isConnecting = true;
      var contact = this.contact;
      var bankAccount = this.data.createBankAccount;
      bankAccount.owner = contact.id;
      try {
        var result = await this.bankAccountDAO.put(bankAccount);
        await this.updateContactBankInfo(contact, result.id);
      } catch (err) {
        var msg = err.message || this.ACCOUNT_CREATION_ERROR;
        this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
        return false;
      }
      this.isConnecting = false;
      return true;
    },
    /** Sets the reference from the Contact to the Bank Account.  */
    async function updateContactBankInfo(contact, bankAccountId) {
      try {
        contact.bankAccount = bankAccountId;
        await this.user.contacts.put(contact);
      } catch (err) {
        var msg = err.message || this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
      }
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        this.isConnecting = false;
        if ( this.isEdit && this.currentIndex === 0 ) {
          this.data.isEdit = false;
          X.closeDialog();
        }
        else if ( this.currentIndex > 0 ) {
          this.currentIndex = this.prevIndex;
        } else {
          X.closeDialog();
        }
      }
    },
    {
      name: 'next',
      label: 'Next',
      isEnabled: function(data$errors_, data$createBankAccount, data$createBankAccount$errors_, currentIndex) {
        if ( currentIndex === 1 ) return data$createBankAccount && ! data$createBankAccount$errors_;
        return ! data$errors_;
      },
      isAvailable: function(nextIndex) {
        return nextIndex !== -1;
      },
      code: function() {
        this.currentIndex = this.nextIndex;
      }
    },
    {
      name: 'option',
      label: 'Save and close',
      isAvailable: function(currentIndex, data$bankAccount) {
        return currentIndex === 1 && data$bankAccount === 0;
      },
      code: async function(X) {
        this.data.createBankAccount = net.nanopay.bank.BankAccount.create({ isDefault: true }, X);
        if ( ! await this.addContact() ) return;
        X.closeDialog();
      }
    },
    {
      name: 'save',
      label: 'Submit',
      isEnabled: function(data$businessAddress$errors_, isConnecting) {
        return ! data$businessAddress$errors_ && ! isConnecting;
      },
      isAvailable: function(nextIndex) {
        return nextIndex === -1;
      },
      code: async function(X) {
        if ( ! await this.addContact() ) return;
        if ( ! await this.addBankAccount() ) return;
        X.closeDialog();
      }
    }
  ]
});

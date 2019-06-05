foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'AbliiTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Transaction to be created specifically for ablii users, enforces source/destination to always be bank accounts`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.lang.StringBuilder',
    'java.text.NumberFormat',
    'net.nanopay.account.Account',
    'net.nanopay.invoice.model.Invoice',
  ],

  methods: [
    {
      name: 'sendCompletedNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        if ( getStatus() != TransactionStatus.COMPLETED || getInvoiceId() == 0 ) return;

        DAO localUserDAO = (DAO) x.get("localUserDAO");
        DAO notificationDAO = (DAO) x.get("notificationDAO");
        Invoice invoice = this.findInvoiceId(x);

        User sender = findSourceAccount(x).findOwner(x);
        User receiver = (User) localUserDAO.find(findDestinationAccount(x).getOwner());

        NumberFormat formatter = NumberFormat.getCurrencyInstance();
        StringBuilder sb = new StringBuilder(sender.label())
          .append(" just initiated a payment to ")
          .append(receiver.label())
          .append(" for ")
          .append(formatter.format(getAmount()/100.00));
        if ( invoice.getInvoiceNumber() != null && ! SafetyUtil.isEmpty(invoice.getInvoiceNumber()) ) {
          sb.append(" on Invoice#: ")
            .append(invoice.getInvoiceNumber());
        }
        if(invoice.getPurchaseOrder().length() > 0) {
          sb.append(" and P.O: ");
          sb.append(invoice.getPurchaseOrder());
        } 
        sb.append(".");
        String notificationMsg = sb.toString();

        // notification to sender
        Notification senderNotification = new Notification();
        senderNotification.setUserId(sender.getId());
        senderNotification.setBody(notificationMsg);
        senderNotification.setNotificationType("Transaction Initiated");
        senderNotification.setIssuedDate(invoice.getIssueDate());
        notificationDAO.put_(x, senderNotification);

        // notification to receiver
        if(receiver.getId() != sender.getId()) {
          Notification receiverNotification = new Notification();
          receiverNotification.setUserId(receiver.getId()); 
          receiverNotification.setBody(notificationMsg);
          receiverNotification.setNotificationType("Transaction Initiated");
          receiverNotification.setIssuedDate(invoice.getIssueDate());
          notificationDAO.put_(x, receiverNotification);
        }
      `
    },
    {
      documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return false;
      `
    },
    {
      name: 'executeBeforePut',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      Transaction tx = super.executeBeforePut(x, oldTxn);

      // An invoice is required to create an ablii transaction
      if( tx.findInvoiceId(x) == null ) {
        throw new RuntimeException("An invoice for this transaction was not provided.");
      }

      return tx;
    `
    }
  ]
});

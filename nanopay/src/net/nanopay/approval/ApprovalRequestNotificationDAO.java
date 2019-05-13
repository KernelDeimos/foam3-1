package net.nanopay.approval;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.notification.Notification;

public class ApprovalRequestNotificationDAO
extends ProxyDAO {
  public ApprovalRequestNotificationDAO(X x,DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    FObject old = ((DAO)x.get("approvalRequestDAO")).find_(x, obj);
    ApprovalRequest ret = (ApprovalRequest) getDelegate().put_(x, obj);
    if ( old != null ) return ret;
    Notification notification = new Notification();
    notification.setUserId(ret.getApprover());
    notification.setNotificationType("New approval request");
    notification.setEmailIsEnabled(true);
    notification.setBody("New approval was requested");
    //notification.setEmailName("future email template name"); !!! PROPER WAY TO SET EMAIL TEMPLATE (when it is done) !!!
    //notification.setEmailArgs(MAP_GOES_HERE); !!! PROPER WAY TO SET EMAIL ARGS FOR TEMPLATE !!!
    ((DAO)x.get("notificationDAO")).put(notification);
    return ret;
  }
}

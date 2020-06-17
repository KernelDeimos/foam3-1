package net.nanopay.approval;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalRequestNotification;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import foam.util.StringUtil;
import net.nanopay.meter.compliance.ComplianceApprovalRequest;

import java.util.HashMap;

import static foam.mlang.MLang.*;

public class ApprovalRequestNotificationDAO
  extends ProxyDAO {

  public ApprovalRequestNotificationDAO(X x,DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    ApprovalRequest old = (ApprovalRequest) getDelegate().find(obj);
    ApprovalRequest ret = (ApprovalRequest) getDelegate().put_(x, obj);
    String notificationType = ret.getClass().getSimpleName()+"."+ret.getStatus().getLabel()+"."+ret.getOperation().getLabel();
    String notificationBody = "";
    DAO userDAO = (DAO) x.get("localUserDAO");
    User notifyUser = null;

    // REVIEW: none of the following text creation works with locale.

    String classification = ret.getClassification();
    if ( SafetyUtil.isEmpty(classification) ) {
      classification = "reference";
    }

    var emailArgs = new HashMap<String, Object>();
    var notificationEmail = "";

    if ( ret instanceof ComplianceApprovalRequest ) {
      ComplianceApprovalRequest complianceApprovalRequest = (ComplianceApprovalRequest) ret;
      notificationBody = new StringBuilder()
        .append("Approval request for new ")
        .append(classification)
        .append(" with id: ")
        .append(ret.getObjId())
        .append(", reason: ")
        .append(complianceApprovalRequest.getCauseDaoKey())
        .toString();
      notifyUser = (User) userDAO.find(ret.getApprover());
    } else if ( old != null &&
                ret.getStatus() != old.getStatus() &&
                ( ret.getStatus() == ApprovalStatus.APPROVED ||
                  ret.getStatus() == ApprovalStatus.REJECTED ) &&
                ret.getLastModifiedBy() != ret.getApprover() ) {
      notifyUser = (User) userDAO.find(ret.getApprover());
      User approvedBy = (User) userDAO.find(ret.getLastModifiedBy());

      if ( ret.getStatus() == ApprovalStatus.REJECTED) {
        notificationBody = String.format("Your %s approval request has been rejected by %s.", classification, approvedBy.getLegalName());
        notificationEmail = "rejectApprovalRequestNotification";

        emailArgs.put("classification", classification);
        emailArgs.put("rejectedBy", approvedBy.toSummary());
        if ( ! SafetyUtil.isEmpty(ret.getMemo()) ) {
          emailArgs.put("memo", String.format("They have provided the following memo along with their rejection: %s.", ret.getMemo()));
        }

      } else {
        notificationBody = new StringBuilder()
          .append(approvedBy != null ? approvedBy.toSummary() : ret.getLastModifiedBy())
          .append(" has approved")
          .append(" request for ")
          .append(classification)
          .append(" with id:")
          .append(ret.getObjId())
          .toString();
      }
    } else if ( old == null ) {
      notificationBody = new StringBuilder()
        .append("Approval request for new ")
        .append(classification)
        .append(" with id: ")
        .append(ret.getObjId())
        .toString();
      notifyUser = (User) userDAO.find(ret.getApprover());
    } else {
      return ret;
    }

    if ( notifyUser != null ) {
      ApprovalRequestNotification notification = (ApprovalRequestNotification) x.get(ApprovalRequestNotification.class.getSimpleName());

      if ( ! SafetyUtil.isEmpty(notificationEmail) ) {
        notification.setEmailName(notificationEmail);
        notification.setEmailArgs(emailArgs);
      }

      notification.setApprovalRequest(ret.getId());
      notification.setNotificationType(notificationType);
      notification.setBody(notificationBody);

      notifyUser.doNotify(x, notification);
    }

    return ret;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    ApprovalRequest ret = (ApprovalRequest) getDelegate().remove_(x, obj);
    ApprovalRequest fulfilled = (ApprovalRequest) getDelegate()
      .find(AND(
                OR(
                   EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED),
                   EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED)
                   ),
                EQ(ApprovalRequest.CREATED_BY, ret.getCreatedBy()),
                EQ(ApprovalRequest.OBJ_ID, ret.getObjId())
                ));
    if ( fulfilled == null ) return ret;

    String notificationType = fulfilled.getClass().getSimpleName()+"."+fulfilled.getStatus().getLabel()+"."+fulfilled.getOperation().getLabel();
    String classification = fulfilled.getClassification();
    if ( SafetyUtil.isEmpty(classification) ) {
      classification = "reference";
    }

    DAO userDAO = (DAO) x.get("localUserDAO");
    User requester = (User) userDAO.find(fulfilled.getCreatedBy());
    User approvedBy = (User) userDAO.find(fulfilled.getLastModifiedBy());
    User approver = (User) userDAO.find(ret.getApprover());

    String notificationBody = new StringBuilder()
      .append(approvedBy != null ? approvedBy.toSummary() : ret.getLastModifiedBy())
      .append(" has approved")
      .append(" request for ")
      .append(classification)
      .append(" with id:")
      .append(ret.getObjId())
      .append(" from ")
      .append(requester != null ? requester.toSummary() : fulfilled.getCreatedBy())
      .toString();

    if ( approver != null ) {
      ApprovalRequestNotification notification = (ApprovalRequestNotification) x.get(ApprovalRequestNotification.class.getSimpleName());
      notification.setApprovalRequest(fulfilled.getId());
      notification.setNotificationType(notificationType);
      notification.setBody(notificationBody);

      approver.doNotify(x, notification);
    }

    return ret;
  }
}

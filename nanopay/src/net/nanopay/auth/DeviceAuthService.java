package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.NanoService;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.ProxyAuthService;
import foam.nanos.auth.User;
import foam.nanos.session.Session;
import foam.util.Password;
import foam.util.SafetyUtil;
import net.nanopay.retail.model.Device;
import net.nanopay.retail.model.DeviceStatus;

import javax.naming.AuthenticationException;
import java.util.List;

public class DeviceAuthService
  extends ProxyAuthService
  implements NanoService
{
  protected DAO userDAO_;
  protected DAO deviceDAO_;
  protected DAO sessionDAO_;

  public DeviceAuthService(X x, AuthService delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public void start() {
    userDAO_ = (DAO) getX().get("localUserDAO");
    deviceDAO_ = (DAO) getX().get("deviceDAO");
    sessionDAO_ = (DAO) getX().get("sessionDAO");
  }

  @Override
  public User loginByEmail(X x, String email, String password) throws AuthenticationException {
    if ( ! email.startsWith("device-") ) {
      return super.loginByEmail(x, email, password);
    }

    String serialNumber = email.split("device-")[1];
    if (  SafetyUtil.isEmpty(serialNumber) ) {
      throw new RuntimeException("Invalid serial number");
    }

    Sink sink = new ListSink();
    sink = deviceDAO_.where(MLang.AND(
        MLang.EQ(Device.SERIAL_NUMBER, serialNumber),
        MLang.EQ(Device.PASSWORD, password)
    )).limit(1).select(sink);

    List data = ((ListSink) sink).getData();
    if ( data == null || data.size() != 1 ) {
      throw new AuthenticationException("Device not found");
    }

    Device device = (Device) data.get(0);
    if ( device == null || device.getOwner() == null ) {
      throw new AuthenticationException("Device not found");
    }

    User user = (User) userDAO_.find(device.getOwner());
    if ( user == null ) {
      throw new AuthenticationException("Owner not found");
    }

    device.setStatus(DeviceStatus.ACTIVE);
    deviceDAO_.put(device);

    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("user", user));
    sessionDAO_.put(session);
    return (User) Password.sanitize(user);
  }
}
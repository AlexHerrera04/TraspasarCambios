import React from 'react';
import { Outlet } from 'react-router-dom';
import { isTokenExpired, useAuth } from '../auth/provider/authProvider';
import withRouter from '../core/router/withRouter';
import {
  getUserIDFromJWT,
  useUser,
} from '../core/feature-user/provider/userProvider';

const ProtectedRoute = (props: any) => {
  const { token, logout } = useAuth();
  const { userID, setUserID, userAccountInfo } = useUser();

  const location = props?.router?.location;

  React.useEffect(() => {
    if (token) {
      const newUserID = getUserIDFromJWT(token);
      if (newUserID !== userID) {
        setUserID(newUserID);
      }
    }
  }, [token, userID, setUserID]);

  React.useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        setUserID(null);
        location?.pathname !== '/login' && props?.router?.navigate('/login');
        return;
      }

      if (location?.pathname === '/') {
        props?.router?.navigate('/home');
        return;
      }
    } else {
      logout();
      setUserID(null);
      props.router.navigate('/login');
      return;
    }

    const path = props?.router?.location?.pathname || '';

    if (
      userAccountInfo?.type === 'expert' &&
      !path.includes('/content') &&
      !path.includes('/profile') &&
      !path.includes('/notificaciones') &&
      !path.includes('/onboarding') &&
      !path.includes('/explorer/')
    ) {
      props.router.navigate('/content');
    }
  }, [location, token, logout, props, setUserID, userAccountInfo]);

  return <Outlet />;
};

export default withRouter(ProtectedRoute);

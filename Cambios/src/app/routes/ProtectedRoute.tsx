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
  }, [token, userID]);

  React.useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        setUserID(null);
        location?.pathname !== '/login' && props?.router?.navigate('/login');
      } else {
        location?.pathname === '/' && props?.router?.navigate('/home');
      }
    } else {
      logout();
      setUserID(null);
      props.router.navigate('/login');
    }

    const path = props?.router?.location?.pathname;
    //console.log('path', path);

    if (
      userAccountInfo?.type === 'expert' &&
      !path.includes('/content') &&
      !path.includes('/explorer/')
    ) {
      props.router.navigate('/content');
    }
  }, [location, token]);

  // If Authenticated, render the child routes
  return <Outlet />;
};

export default withRouter(ProtectedRoute);

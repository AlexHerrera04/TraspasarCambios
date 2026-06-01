import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// This function is to verify if the token is valid
export function isTokenExpired(token: any) {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp < Date.now() / 1000;
  } catch (err) {
    return false;
  }
}

const AuthContext = createContext(
  {} as {
    token: string | null;
    setToken: (newToken: string | null) => void;
    logout: () => void;
  }
);

const AuthProvider = ({ children }: any) => {
  const [token, _setToken] = useState<null | string>(
    localStorage.getItem('token')
  );

  const setToken = (newToken: string | null) => {
    _setToken(newToken);
  };

  const logout = () => {
    _setToken(null);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);

      // Configure interceptors to verify expired tokens
    }
  }, [token]);

  // Memoized value of auth context

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      logout,
    }),
    [token]
  );

  // Provide auth context to the children component

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;

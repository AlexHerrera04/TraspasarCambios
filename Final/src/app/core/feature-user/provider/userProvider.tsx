import { createContext, useContext, useMemo, useState } from 'react';

export function getUserIDFromJWT(token: any) {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.user_id;
  } catch (err) {
    return null;
  }
}

export type UserType = 'expert' | 'company';

export type UserInfo = {
  id: number | null;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  group_id?: string;
  organization?: string;
} | null;

export type UserAccountInfo = {
  id?: number | null;
  capacity: Array<string>;
  function: Array<string>;
  industry: Array<string>;
  level: Array<string>;
  profile: Array<string>;
  type: 'expert' | 'company';
  phone_number?: string | null;
  contact_email?: string | null;
  portfolio_link?: string | null;
  profile_picture?: string | null;
  wiki_avatar?: string | null;
  public_name: string | null;
  liked_contents?: Array<number> | null;
  account: number | null;
  total_score: number | null;
  is_account_admin: boolean | null;
  is_manager: boolean | null;
} | null;

const UserContext = createContext(
  {} as {
    userID: number | null;
    setUserID: (newUserID: number | null) => void;
    userAccountInfo: UserAccountInfo;
    setUserAccountInfo: (newUser: UserAccountInfo) => void;
    userInfo: UserInfo;
    setUserInfo: (newUserInfo: UserInfo) => void;
  }
);

const UserProvider = ({ children }: any) => {
  const [userID, _setUserID] = useState<null | number>(null);
  const [userAccountInfo, _setUserAccountInfo] =
    useState<UserAccountInfo>(null);
  const [userInfo, _setUserInfo] = useState<UserInfo>(null);

  const setUserID = (newUserID: number | null) => {
    _setUserID(newUserID);
  };

  const setUserAccountInfo = (newUser: UserAccountInfo) => {
    _setUserAccountInfo(newUser);
  };

  const setUserInfo = (newUserInfo: UserInfo) => {
    _setUserInfo(newUserInfo);
  };

  // Memoized value of user context

  const contextValue = useMemo(
    () => ({
      userID,
      setUserID,
      userAccountInfo,
      setUserAccountInfo,
      userInfo,
      setUserInfo,
    }),
    [
      userID,
      userAccountInfo,
      setUserID,
      setUserAccountInfo,
      userInfo,
      setUserInfo,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

export default UserProvider;

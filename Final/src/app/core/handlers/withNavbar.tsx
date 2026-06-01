import { FunctionComponent, useEffect } from 'react';
import ComplexNavbar from '../../ui/NavBar';
import { useUser } from '../feature-user/provider/userProvider';

interface WithNavbarProps {
  children: any;
}

const withNavbar: FunctionComponent<WithNavbarProps> = ({ children }) => {
  return (
    <>
      <ComplexNavbar />
      {children}
    </>
  );
};

export default withNavbar;

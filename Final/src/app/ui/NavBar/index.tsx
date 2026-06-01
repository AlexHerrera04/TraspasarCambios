import React from 'react';
import {
  Navbar,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  IconButton,
  Collapse,
} from '@material-tailwind/react';
import {
  ChevronDownIcon,
  PowerIcon,
  Bars2Icon,
  UserIcon,
  ClockIcon,
  BellIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/provider/authProvider';
import { useQuery } from '@tanstack/react-query';
import wikiProfilePic from '../../../assets/images/wiki-profile-pic.webp';
import { useUser } from '../../core/feature-user/provider/userProvider';
import { isEmpty } from 'lodash';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WikiLogo from '/src/assets/images/wiki-logo2.svg';
import api from 'src/app/core/api/apiProvider';
import { getNoLeidas } from '../../feature-notifications/utils/notificaciones';

const ROUTES = [
  {
    path: '/home',
    name: 'Inicio',
    access: ['company'],
  },
  {
    path: '/explorer',
    name: 'Explorador',
    access: ['company'],
  },
  {
    path: '/diagnosticador',
    name: 'Diagnosticador',
    access: ['company'],
  },
  {
    path: '/content',
    name: 'Colaborador',
    access: ['company', 'expert'],
  },
  {
    path: '/contributor',
    name: 'Contribuidor',
    access: ['company'],
  },
  {
    path: '/admin',
    name: 'Administrador',
    access: ['company'],
    requiresAdmin: true,
  },
];

function ProfileMenu({ data }: any) {
  const { logout } = useAuth();
  const { setUserInfo, setUserAccountInfo } = useUser();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const navigate = useNavigate();

  const handleLogout = React.useCallback(() => {
    closeMenu();
    setUserInfo(null);
    setUserAccountInfo(null);
    logout();
  }, [logout, setUserAccountInfo, setUserInfo]);

  const goToProfile = React.useCallback(() => {
    navigate('/profile');
    closeMenu();
  }, [navigate]);

  const goToHistory = React.useCallback(() => {
    navigate('/history');
    closeMenu();
  }, [navigate]);

  if (!data) return null;

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0 pr-2 pl-0.5 lg:ml-auto dark:bg-dark-600"
        >
          <div className="flex items-center gap-4 inset-0 group-hover:opacity-50">
            <Avatar
              variant="circular"
              alt="Profile"
              className="border h-10 w-10"
              src={wikiProfilePic}
            />
          </div>

          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </MenuHandler>

      <MenuList className="p-1 dark:bg-dark-600">
        <MenuItem
          key="profile"
          onClick={goToProfile}
          className="flex items-center gap-2 rounded"
        >
          <UserIcon className="h-4 w-4" strokeWidth={2} />
          <Typography as="span" variant="small" className="font-normal">
            Perfil
          </Typography>
        </MenuItem>

        <MenuItem
          key="history"
          onClick={goToHistory}
          className="flex items-center gap-2 rounded"
        >
          <ClockIcon className="h-4 w-4" strokeWidth={2} />
          <Typography as="span" variant="small" className="font-normal">
            Historial
          </Typography>
        </MenuItem>

        <MenuItem
          key="signout"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
        >
          <PowerIcon className="h-4 w-4 text-red-500" strokeWidth={2} />
          <Typography
            as="span"
            variant="small"
            className="font-normal"
            color="red"
          >
            Cerrar sesión
          </Typography>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

async function queryUserInfo(token: string | null) {
  if (!token) return null;

  const { data } = await api.get(
    `${import.meta.env.VITE_API_URL}/accounts/userinfo`
  );

  return data;
}

async function queryUserAccountInfo(userID: string | null) {
  if (!userID) return null;

  const { data } = await api.get(
    `${import.meta.env.VITE_API_URL}/accounts/accountinfo/${userID}`
  );

  return data;
}

function HomeActionButtons() {
  const location = useLocation();
  const unreadNotifications = getNoLeidas();

  const isCoachPage = location.pathname.startsWith('/coach');
  const isNotificationsPage = location.pathname.startsWith('/notificaciones');

  const getButtonClass = (isActive: boolean) =>
    `relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition ${
      isActive
        ? 'border-white/30 bg-white/15'
        : 'border-white/10 bg-white/5 hover:bg-white/10'
    }`;

  return (
    <>
      <Link to="/coach">
        <div className={getButtonClass(isCoachPage)}>
          <SparklesIcon className="h-5 w-5 text-white" />
          <span className="absolute -right-1 -top-1 rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            IA
          </span>
        </div>
      </Link>

      <Link to="/notificaciones">
        <div className={getButtonClass(isNotificationsPage)}>
          <BellIcon className="h-5 w-5 text-white" />
          {unreadNotifications > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
        </div>
      </Link>
    </>
  );
}

export default function ComplexNavbar({ children }: any) {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);
  const { token } = useAuth();
  const { setUserInfo, setUserAccountInfo, userInfo, userAccountInfo } =
    useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: localUserInfo } = useQuery({
    queryKey: ['userInfo', token],
    enabled: !!token,
    queryFn: () => queryUserInfo(token),
  });

  const userID = localUserInfo?.id;

  const { data: localUserAccountInfo } = useQuery({
    queryKey: ['userAccountInfo', userID, userAccountInfo],
    enabled: !!userID && isEmpty(userAccountInfo),
    queryFn: () => queryUserAccountInfo(userID),
  });

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 960) setIsNavOpen(false);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  React.useEffect(() => {
    if (localUserInfo) {
      setUserInfo(localUserInfo);
    }
  }, [localUserInfo, setUserInfo]);

  React.useEffect(() => {
    if (localUserAccountInfo) {
      setUserAccountInfo(localUserAccountInfo);

      if (
        localUserAccountInfo.type === 'expert' &&
        !location.pathname.includes('/content')
      ) {
        navigate('/content');
      }
    }
  }, [localUserAccountInfo, location.pathname, navigate, setUserAccountInfo]);

  const isCurrentPage = (href: string) => location.pathname.includes(href);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-6 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center">
      {ROUTES.map((item: any, i) => {
        return item.access.includes(userAccountInfo?.type) &&
          (!item.requiresAdmin ||
            userAccountInfo?.is_account_admin ||
            userAccountInfo?.is_manager) ? (
          <Typography
            key={i}
            as="li"
            variant="small"
            className={
              isCurrentPage(item.path)
                ? 'font-bold text-lg'
                : 'font-normal text-lg opacity-60'
            }
          >
            <Link to={item.path} className="flex items-center">
              {item.name}
            </Link>
          </Typography>
        ) : (
          ''
        );
      })}
    </ul>
  );

  return (
    <>
      <Navbar
        shadow={false}
        className="sticky inset-0 z-10 h-17 max-w-full rounded-none border-b-white/10 border-t-0 border-r-0 border-l-0 bg-wiki px-4 py-2 lg:px-8 lg:py-6"
      >
        <div className="relative mx-auto flex items-center text-secondary-500">
          <Link to="/home">
            <img src={WikiLogo} width={100} alt="" />
          </Link>

          <div className="ml-10 hidden lg:block">{navList}</div>

          <div className="ml-auto flex items-center">
            <div className="mr-5 flex items-center gap-4">
              <HomeActionButtons />
            </div>
            {userInfo && <ProfileMenu data={userInfo} />}
          </div>

          <IconButton
            size="lg"
            variant="text"
            onClick={toggleIsNavOpen}
            className="ml-auto mr-2 lg:hidden dark:text-gray-50"
          >
            <Bars2Icon className="h-6 w-6 dark:text-gray-50" />
          </IconButton>
        </div>

        <Collapse open={isNavOpen}>
          <div className="container mx-auto">{navList}</div>
        </Collapse>
      </Navbar>

      {children}
    </>
  );
}
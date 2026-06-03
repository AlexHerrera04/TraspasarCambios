import React, { useState } from 'react';
import withNavbar from '../../core/handlers/withNavbar';

import UserTable from '../components/User';
import Goals from '../components/Goals';
import LearningRoutes from '../components/LearningRoutes';
import { useNavigate } from 'react-router-dom';
import {
  useOrganizations,
  useDeleteOrganization,
} from '../services/organizationService';
import Organization from '../components/Organization';
import { OrganizationType } from '../types/organization';

import organizationIcon from '../../../assets/icons/organization-admin.svg';
import userIcon from '../../../assets/icons/user-admin.svg';
import metricIcon from '../../../assets/icons/metric.svg';
import goalsIcon from '../../../assets/icons/goals-admin.svg';
import botIcon from '../../../assets/icons/bot-icon.svg';

import { useUser } from '../../core/feature-user/provider/userProvider';
import { useGroupUsers } from '../services/userService';
import { Spinner } from '@material-tailwind/react';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

import ReportTable from '../components/Reports';

const APP_LANGUAGE_KEY = 'appLanguage';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const lastTab = localStorage.getItem('lastTab');
    localStorage.removeItem('lastTab');
    return lastTab || 'Usuarios';
  });
  const [searchTerm, setSearchTerm] = useState('');

  const language =
    localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

  const copy =
    language === 'en'
      ? {
          tabs: {
            Usuarios: 'Users',
            Metas: 'Goals',
            Rutas: 'Routes',
            Organización: 'Organization',
            Informes: 'Reports',
            'Coach Adm': 'Coach Adm',
          },
          coachTitle: 'Admin Coach',
          coachDescription:
            'Open the coach with organizational scope to analyze a specific person.',
          goToCoach: 'Go to Admin Coach',
          search: {
            Usuarios: 'Search Users...',
            Metas: 'Search Goals...',
            Rutas: 'Search Routes...',
            Organización: 'Search Organizations...',
            Informes: 'Search Reports...',
            'Coach Adm': 'Search Admin Coach...',
          },
          toastUnavailable: 'Feature not available',
          toastInProgress: 'Feature in development',
          add: {
            CoachAdm: 'Open Admin Coach',
            Rutas: 'Add Learning Route',
            Organización: 'Add Organization',
            Usuarios: 'Add User',
            Metas: 'Add Goal',
            Informes: 'Add Report',
          },
        }
      : {
          tabs: {
            Usuarios: 'Usuarios',
            Metas: 'Metas',
            Rutas: 'Rutas',
            Organización: 'Organización',
            Informes: 'Informes',
            'Coach Adm': 'Coach Adm',
          },
          coachTitle: 'Coach Adm',
          coachDescription:
            'Abre el coach con alcance organizacional para analizar a una persona concreta.',
          goToCoach: 'Ir a Coach Adm',
          search: {
            Usuarios: 'Buscar Usuarios...',
            Metas: 'Buscar Metas...',
            Rutas: 'Buscar Rutas...',
            Organización: 'Buscar Organizaciones...',
            Informes: 'Buscar Informes...',
            'Coach Adm': 'Buscar Coach Adm...',
          },
          toastUnavailable: 'Funcionalidad no disponible',
          toastInProgress: 'Funcionalidad en desarrollo',
          add: {
            CoachAdm: 'Abrir Coach Adm',
            Rutas: 'Agregar Ruta de Aprendizaje',
            Organización: 'Agregar Organización',
            Usuarios: 'Agregar Usuario',
            Metas: 'Agregar Metas',
            Informes: 'Agregar Informes',
          },
        };

  const { userInfo } = useUser();
  const { organizations, isLoading: orgsLoading } = useOrganizations();

  const userGroupId = userInfo?.group_id || '';
  const userRole = 'ADMIN';

  const { data: users = [], refetch: refetchUsers } = useGroupUsers();

  const deleteOrganizationMutation = useDeleteOrganization();

  const data = [
    {
      label: copy.tabs.Usuarios,
      value: 'Usuarios',
      icon: userIcon,
    },
    {
      label: copy.tabs.Metas,
      value: 'Metas',
      icon: goalsIcon,
    },
    {
      label: copy.tabs.Rutas,
      value: 'Rutas',
      IconComponent: AcademicCapIcon,
    },
    {
      label: copy.tabs.Organización,
      value: 'Organización',
      icon: organizationIcon,
    },
    {
      label: copy.tabs.Informes,
      value: 'Informes',
      icon: metricIcon,
    },
    {
      label: copy.tabs['Coach Adm'],
      value: 'Coach Adm',
      icon: botIcon,
      isCoach: true,
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      await deleteOrganizationMutation.mutateAsync(id);
      refetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (org: OrganizationType) => {
    navigate('/admin/organization', {
      state: { editMode: true, orgToEdit: org },
    });
  };

  const renderList = (value: string) => {
    switch (value) {
      case 'Organización':
        return (
          <Organization
            searchTerm={searchTerm}
            organizations={organizations || []}
            users={users}
            userRole={userRole}
            userGroupId={userGroupId}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        );
      case 'Usuarios':
        return <UserTable searchTerm={searchTerm.toLowerCase()} />;
      case 'Informes':
        return <ReportTable searchTerm={searchTerm} />;
      case 'Metas':
        return <Goals searchTerm={searchTerm} />;
      case 'Rutas':
        return <LearningRoutes searchTerm={searchTerm} />;
      case 'Coach Adm':
        return (
          <div className="rounded-2xl border border-white/10 bg-[#1e2633] p-8 text-white">
            <div className="flex items-center gap-4">
              <img src={botIcon} alt={copy.coachTitle} className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-semibold">{copy.coachTitle}</h2>
                <p className="mt-1 text-sm text-gray-300">
                  {copy.coachDescription}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-[#0f172a] p-6">
              <button
                type="button"
                onClick={() => navigate('/coach?admin=1')}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500"
              >
                {copy.goToCoach}
              </button>
            </div>
          </div>
        );
      default:
        return <UserTable searchTerm={searchTerm.toLowerCase()} />;
    }
  };

  const getSearchPlaceholder = () => {
    return copy.search[activeTab as keyof typeof copy.search] || copy.search.Usuarios;
  };

  const getAddButtonLabel = () => {
    if (activeTab === 'Coach Adm') return copy.add.CoachAdm;
    if (activeTab === 'Rutas') return copy.add.Rutas;
    if (activeTab === 'Organización') return copy.add.Organización;
    if (activeTab === 'Usuarios') return copy.add.Usuarios;
    if (activeTab === 'Metas') return copy.add.Metas;
    if (activeTab === 'Informes') return copy.add.Informes;
    return copy.add.Usuarios;
  };

  const content = (
    <div className="mx-auto w-full">
      <div className="flex flex-col">
        <div className="sticky top-0 mt-6 flex items-center justify-center bg-[#0f172a] p-4">
          <div className="flex items-start justify-center gap-6">
            {data.map(({ label, value, icon, IconComponent, isCoach }) => (
              <button
                key={value}
                onClick={() => {
                  if (value === 'Coach Adm') {
                    navigate('/coach?admin=1');
                    return;
                  }

                  setActiveTab(value);
                  setSearchTerm('');
                }}
                className={`relative flex w-[110px] flex-col items-center rounded-lg p-2 text-center transition-colors ${
                  activeTab === value
                    ? 'text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {isCoach ? (
                  <span className="absolute right-3 top-2 rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    IA
                  </span>
                ) : null}

                <div className="flex h-10 w-10 items-center justify-center">
                  {IconComponent ? (
                    <IconComponent className="h-9 w-9" />
                  ) : (
                    <img
                      src={icon}
                      className="h-9 w-9 object-contain"
                      alt={label}
                    />
                  )}
                </div>

                <span className="mt-2 min-h-[48px] text-base leading-5">
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="ml-14 flex items-center gap-11">
            <div className="relative w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                className="w-full rounded-lg border border-gray-600 bg-[#1e2633] px-4 py-2 pl-10 text-white focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                if (activeTab === 'Usuarios') {
                  toast(copy.toastUnavailable);
                } else if (activeTab === 'Organización') {
                  navigate('/admin/organization');
                } else if (activeTab === 'Metas') {
                  navigate('/admin/goals');
                } else if (activeTab === 'Rutas') {
                  navigate('/admin/learning-routes');
                } else if (activeTab === 'Informes') {
                  toast(copy.toastInProgress);
                } else if (activeTab === 'Coach Adm') {
                  navigate('/coach?admin=1');
                }
              }}
              className="flex w-[360px] items-center justify-center gap-2 rounded-lg bg-primary-900 px-6 py-2 text-white transition-colors hover:bg-primary-800"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="whitespace-nowrap text-sm">
                {getAddButtonLabel()}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 px-4">{renderList(activeTab)}</div>
      </div>

      {orgsLoading && (
        <div className="p-4 text-center">
          <Spinner />
        </div>
      )}
    </div>
  );

  return withNavbar({ children: content });
};

export default Admin;
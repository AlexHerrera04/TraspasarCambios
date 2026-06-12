import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  Button,
  Spinner,
} from '@material-tailwind/react';
import {
  EyeIcon,
  PencilIcon,
  TagIcon,
  CpuChipIcon,
  XMarkIcon,
  AcademicCapIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import {
  GroupUser,
  useGroupUsers,
  useLayerZeroOptions,
  useUpdateUserCapacities,
} from '../services/userService';
import { SelectLine } from 'src/app/feature-content/components/ContentForm';
import { useFormik } from 'formik';
import { ViewUserModal } from './modals/ViewUserModal';
import { User } from '../types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../core/api/apiProvider';
import {
  deleteUserInvitation,
  downloadInvitationsCsv,
  findUserInvitation,
  markUserInvitationEnrolled,
  readUserInvitations,
  StoredUserInvitation,
  updateUserInvitation,
} from '../utils/userInvitations';

interface UserTableProps {
  searchTerm: string;
}

interface Capacity {
  id: number;
  name: string;
}

type UserStatus = 'active' | 'pending' | 'invited';
type UserStatusFilter = 'total' | UserStatus;

const statusLabels: Record<UserStatusFilter, string> = {
  total: 'Usuarios Totales',
  active: 'Usuario Enrolado',
  pending: 'Creado',
  invited: 'Invitado (No Onboarded)',
};

const ADMIN_USER_INVITATION_ENDPOINT =
  '/accounts/TODO_SEND_USER_INVITATION_ENDPOINT/';

const getUserDisplayName = (user: User) => {
  if (user.public_name) return user.public_name;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

  if (fullName) return fullName;

  return user.username || user.email || 'Usuario';
};

const getUserEmail = (user: User) => {
  return user.email || (user as any).contact_email || '';
};

const getBackendEnrollmentDate = (user: User) => {
  return (
    (user as any).enrolled_at ||
    (user as any).enrollment_date ||
    (user as any).first_enrollment_date ||
    (user as any).onboarding_completed_at ||
    ''
  );
};

const formatEnrollmentDate = (date: string) => {
  if (!date) return '';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString();
};

const UserTable: React.FC<UserTableProps> = ({ searchTerm }) => {
  const { data: users = [], isLoading } = useGroupUsers();
  const { data: layerZeroOptions } = useLayerZeroOptions();
  const [selectedUser, setSelectedUser] = useState<GroupUser | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [showCapacitiesModal, setShowCapacitiesModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('total');
  const [storedInvitations, setStoredInvitations] = useState<
    StoredUserInvitation[]
  >(() => readUserInvitations());
  const [editingInvitation, setEditingInvitation] =
  useState<StoredUserInvitation | null>(null);
  const [invitationToSend, setInvitationToSend] = useState<User | null>(null);
  const [editingOriginalEmail, setEditingOriginalEmail] = useState('');
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    key: '',
    organization: '',
  });

  const navigate = useNavigate();
  const updateCapacities = useUpdateUserCapacities();
  const queryClient = useQueryClient();

  const capacities =
    (layerZeroOptions?.capacities as unknown as Capacity[])?.map(
      (capacity) => ({
        value: capacity.id.toString(),
        label: capacity.name,
      })
    ) || [];

  const formik = useFormik({
    initialValues: {
      capacities:
        selectedUser?.capacities?.map((id: any) => ({
          value: id.toString(),
          label:
            (layerZeroOptions?.capacities as unknown as Capacity[])?.find(
              (capacity) => capacity.id === Number(id)
            )?.name || id,
        })) || [],
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const capacityNames = values.capacities.map(
          (capacity: any) => capacity.label
        );

        await updateCapacities.mutateAsync({
          userId: selectedUser?.id || 0,
          capacities: capacityNames,
        });

        queryClient.invalidateQueries(['userCapacities', selectedUser?.id]);

        setShowCapacitiesModal(false);
      } catch (error) {
        console.error('Error updating capacities:', error);
      }
    },
  });

  const refreshStoredInvitations = () => {
    setStoredInvitations(readUserInvitations());
  };

  const getInvitationForUser = (user: User) => {
    const email = getUserEmail(user);

    return storedInvitations.find(
      (invitation) => invitation.email.toLowerCase() === email.toLowerCase()
    );
  };

  const getUserEnrollmentDate = (user: User) => {
    const invitation = getInvitationForUser(user);
    const backendEnrollmentDate = getBackendEnrollmentDate(user);

    return backendEnrollmentDate || invitation?.enrolledAt || '';
  };

  const getUserOrganization = (user: User) => {
    const invitation = getInvitationForUser(user);

    return (
      invitation?.organization ||
      user.organization ||
      (user as any).organization_name ||
      ''
    );
  };

  const getUserStatus = (user: User): UserStatus => {
    const invitation = getInvitationForUser(user);
    const enrollmentDate = getUserEnrollmentDate(user);

    if (!invitation) return 'active';

    if (enrollmentDate) return 'active';

    if (invitation.status === 'invited') return 'invited';

    return 'pending';
  };

  useEffect(() => {
    let hasUpdates = false;

    users.forEach((user: User) => {
      const invitation = getInvitationForUser(user);
      const backendEnrollmentDate = getBackendEnrollmentDate(user);

      if (
        invitation &&
        backendEnrollmentDate &&
        invitation.enrolledAt !== backendEnrollmentDate
      ) {
        markUserInvitationEnrolled(getUserEmail(user), backendEnrollmentDate);
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      refreshStoredInvitations();
    }
  }, [users, storedInvitations]);

  const backendUserEmails = useMemo(() => {
    return new Set(
      users.map((user: User) => getUserEmail(user).toLowerCase()).filter(Boolean)
    );
  }, [users]);

  const invitationOnlyUsers = useMemo(() => {
    return storedInvitations
      .filter(
        (invitation) =>
          !backendUserEmails.has(invitation.email.toLowerCase()) &&
          !invitation.enrolledAt
      )
      .map((invitation) => {
        return {
          id: `invitation-${invitation.email}`,
          username: invitation.username,
          email: invitation.email,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          public_name:
            `${invitation.first_name} ${invitation.last_name}`.trim() ||
            invitation.email,
          organization: invitation.organization || '',
          is_account_admin: false,
          is_manager: false,
          __invitationOnly: true,
        } as any as User;
      });
  }, [storedInvitations, backendUserEmails]);

  const tableUsers = useMemo(() => {
    return [...users, ...invitationOnlyUsers];
  }, [users, invitationOnlyUsers]);

  const statusCounts = useMemo(() => {
  return tableUsers.reduce(
    (acc: Record<UserStatusFilter, number>, user: User) => {
      const status = getUserStatus(user);
      acc.total += 1;
      acc[status] += 1;
      return acc;
    },
    {
      total: 0,
      active: 0,
      pending: 0,
      invited: 0,
    }
  );
}, [tableUsers, storedInvitations]);

  const filteredUsers = tableUsers.filter((user: User) => {
    const matchesSearch =
      !searchTerm ||
      [
        user.username,
        getUserEmail(user),
        user.public_name,
        getUserOrganization(user),
        user.id?.toString(),
      ].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
    statusFilter === 'total' || getUserStatus(user) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const { data: userCapacities, isLoading: isLoadingCapacities } = useQuery({
    queryKey: ['userCapacities', selectedUser?.id],
    queryFn: () =>
      api
        .get(
          `${import.meta.env.VITE_API_URL}/accounts/accountinfo/${
            selectedUser?.id
          }/`
        )
        .then((res) => res.data),
    enabled: !!selectedUser?.id,
  });

  useEffect(() => {
    if (userCapacities?.capacity) {
      const formattedCapacities = userCapacities.capacity.map(
        (capacity: string) => ({
          value: capacity,
          label: capacity,
        })
      );
      formik.setFieldValue('capacities', formattedCapacities);
    }

    return () => {
      formik.setFieldValue('capacities', []);
    };
  }, [userCapacities]);

  const handleAssignGoal = (userId: number) => {
    navigate(`/admin/goals/assign?userId=${userId}`);
  };

  const handleAssignLearningRoute = (userId: number) => {
    localStorage.setItem('lastTab', 'Rutas');
    navigate(`/admin/learning-routes?userId=${userId}`);
  };

  const handleViewCapacities = (user: GroupUser) => {
    setSelectedUser(user);
    setShowCapacitiesModal(true);
  };

  const handleDownloadInvitation = (user: User) => {
    const invitation =
      getInvitationForUser(user) || findUserInvitation(getUserEmail(user));

    if (!invitation) return;

    downloadInvitationsCsv([invitation], `usuario-${invitation.email}.csv`);
  };

  const sendUserInvitation = async (invitation: StoredUserInvitation) => {
    const payload = {
      email: invitation.email,
      username: invitation.username,
      key: invitation.key,
      first_name: invitation.first_name,
      last_name: invitation.last_name,
      organization: invitation.organization,
      organization_id: invitation.organization_id,
    };

    const response = await api.post(
      `${import.meta.env.VITE_API_URL}${ADMIN_USER_INVITATION_ENDPOINT}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  };

  const handleSendInvitation = async (user: User) => {
    const invitation =
      getInvitationForUser(user) || findUserInvitation(getUserEmail(user));

    if (!invitation) return;

    try {
      await sendUserInvitation(invitation);
      updateUserInvitation(invitation.email, { status: 'invited' });
      refreshStoredInvitations();

      toast.success(
        invitation.status === 'invited'
          ? 'Mail reenviado correctamente'
          : 'Mail enviado correctamente'
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Error al enviar el mail'
      );
    }
  };

  const handleOpenEditInvitation = (user: User) => {

  const handleRequestSendInvitation = (user: User) => {
  setInvitationToSend(user);
};

const handleConfirmSendInvitation = async () => {
  if (!invitationToSend) return;

  const user = invitationToSend;

  setInvitationToSend(null);
  await handleSendInvitation(user);
};
    const invitation =
      getInvitationForUser(user) || findUserInvitation(getUserEmail(user));

    if (!invitation) return;

    setEditingInvitation(invitation);
    setEditingOriginalEmail(invitation.email);
    setEditForm({
      first_name: invitation.first_name || '',
      last_name: invitation.last_name || '',
      username: invitation.username || '',
      email: invitation.email || '',
      key: invitation.key || '',
      organization: invitation.organization || '',
    });
  };

  const handleSaveInvitation = () => {
    if (!editingInvitation) return;

    if (!editForm.first_name.trim()) {
      toast.error('Falta nombre');
      return;
    }

    if (!editForm.last_name.trim()) {
      toast.error('Falta apellido');
      return;
    }

    if (!editForm.email.trim()) {
      toast.error('Falta mail');
      return;
    }

    if (!editForm.username.trim()) {
      toast.error('Falta nombre de usuario');
      return;
    }

    if (!editForm.key.trim()) {
      toast.error('Falta key');
      return;
    }

    updateUserInvitation(editingOriginalEmail, {
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      username: editForm.username.trim(),
      email: editForm.email.trim(),
      key: editForm.key.trim(),
      organization: editForm.organization.trim(),
    });

    refreshStoredInvitations();
    setEditingInvitation(null);
    setEditingOriginalEmail('');

    toast.success('Usuario pendiente actualizado');
  };

  const handleDeleteInvitation = async (user: User) => {
    const invitation =
      getInvitationForUser(user) || findUserInvitation(getUserEmail(user));

    if (!invitation) return;

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a ${invitation.email}?`
    );

    if (!confirmed) return;

    try {
      const isInvitationOnly = Boolean((user as any).__invitationOnly);

      if (!isInvitationOnly && user.id) {
        await api.delete(
          `${import.meta.env.VITE_API_URL}/accounts/users/${user.id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        queryClient.invalidateQueries(['groupUsers']);
      }

      deleteUserInvitation(invitation.email);
      refreshStoredInvitations();

      toast.success('Usuario eliminado');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Error al eliminar usuario'
      );
    }
  };

  const invitationToConfirm = invitationToSend
  ? getInvitationForUser(invitationToSend) ||
    findUserInvitation(getUserEmail(invitationToSend))
  : null;
    return (
      <Card className="h-full w-full bg-gray-800">
        <CardBody className="flex justify-center p-10">
          <Spinner className="h-8 w-8" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full bg-gray-800">
      <CardBody className="overflow-y-auto px-0">
        <div className="mx-4 mb-6 rounded-lg bg-gray-900 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            {(['total', 'active', 'pending', 'invited'] as UserStatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    statusFilter === status
                      ? 'border-primary-500 bg-primary-900/30 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {statusLabels[status]}
                  </span>
                  <span className="mt-1 block text-2xl font-bold">
                    {statusCounts[status]}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {[
                'Nombre',
                'Email',
                'Usuario',
                'Estado',
                'Organización',
                'Rol',
                'Acciones',
              ].map((head) => (
                <th
                  key={head}
                  className="border-b border-blue-gray-100 bg-gray-900 p-4"
                >
                  <Typography
                    variant="small"
                    color="white"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user: User) => {
              const status = getUserStatus(user);
              const invitation = getInvitationForUser(user);
              const enrollmentDate = getUserEnrollmentDate(user);
              const isInvitationOnly = Boolean((user as any).__invitationOnly);

              return (
                <tr
                  key={
                    isInvitationOnly
                      ? `invitation-${getUserEmail(user)}`
                      : user.id
                  }
                >
                  <td className="border-b border-blue-gray-50 p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {getUserDisplayName(user)}
                    </Typography>
                  </td>

                  <td className="border-b border-blue-gray-50 p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {getUserEmail(user)}
                    </Typography>
                  </td>

                  <td className="border-b border-blue-gray-50 p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {user.username || '-'}
                    </Typography>
                  </td>

                  <td className="border-b border-blue-gray-50 p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        status === 'active'
                          ? 'bg-green-500/20 text-green-300'
                          : status === 'invited'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {status === 'active'
                        ? enrollmentDate
                        ? `Usuario Enrolado desde ${formatEnrollmentDate(
                              enrollmentDate
                                 )}`
                        : 'Usuario Enrolado'
                        : status === 'invited'
                         ? 'Invitado (No Onboarded)'
                        : 'Creado'}
                    </span>
                  </td>

                  <td className="border-b border-blue-gray-50 p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {getUserOrganization(user) || '-'}
                    </Typography>
                  </td>

                  <td className="border-b border-blue-gray-50 p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {status !== 'active'
                        ? 'Usuario'
                        : user.is_account_admin
                          ? 'Administrador'
                          : user.is_manager
                            ? 'Manager'
                            : 'Usuario'}
                    </Typography>
                  </td>

                  <td className="border-b border-blue-gray-50 p-4">
                    <div className="flex justify-center gap-2">
                      {status === 'active' && !isInvitationOnly && (
                        <>
                          <Tooltip content="Ver detalles">
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() => {
                                setSelectedUser({
                                  ...user,
                                  contact_email: getUserEmail(user),
                                  organization_level: [
                                    getUserOrganization(user)?.toString() || '',
                                  ],
                                } as GroupUser);
                                setViewModalOpen(true);
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Editar">
                            <IconButton variant="text" color="white">
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Asignar Metas">
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() => handleAssignGoal(user.id)}
                            >
                              <TagIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Asignar Ruta de Aprendizaje">
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() => handleAssignLearningRoute(user.id)}
                            >
                              <AcademicCapIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Gestionar Competencias">
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() =>
                                handleViewCapacities(user as GroupUser)
                              }
                            >
                              <CpuChipIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {status !== 'active' && invitation && (
                        <>
                          <Tooltip content="Editar datos">
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() => handleOpenEditInvitation(user)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Descargar datos">
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() => handleDownloadInvitation(user)}
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            content={
                              status === 'invited'
                                ? 'Reenviar mail'
                                : 'Invitar usuario'
                            }
                          >
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() => handleRequestSendInvitation(user)}
                            >
                              <PaperAirplaneIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Eliminar usuario">
                            <IconButton
                              variant="text"
                              color="red"
                              onClick={() => handleDeleteInvitation(user)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!filteredUsers.length && (
          <div className="p-8 text-center text-sm text-gray-400">
            No hay usuarios para este filtro.
          </div>
        )}
      </CardBody>

      {selectedUser && (
        <ViewUserModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          user={selectedUser}
        />
      )}

      <Dialog
        open={Boolean(editingInvitation)}
        handler={() => setEditingInvitation(null)}
        className="max-w-xl bg-gray-800"
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Typography variant="h5" className="text-white">
                Editar usuario pendiente
              </Typography>
              <Typography variant="small" className="text-gray-400">
                Modifica los datos antes de enviar o reenviar la invitación.
              </Typography>
            </div>

            <IconButton
              variant="text"
              color="white"
              onClick={() => setEditingInvitation(null)}
            >
              <XMarkIcon className="h-6 w-6" />
            </IconButton>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-300">
              Nombre
              <input
                type="text"
                value={editForm.first_name}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    first_name: event.target.value,
                  }))
                }
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-primary-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-300">
              Apellido
              <input
                type="text"
                value={editForm.last_name}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    last_name: event.target.value,
                  }))
                }
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-primary-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-300">
              Usuario
              <input
                type="text"
                value={editForm.username}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-primary-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-300">
              Mail
              <input
                type="email"
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-primary-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-300">
              Key
              <input
                type="text"
                value={editForm.key}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    key: event.target.value,
                  }))
                }
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-primary-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-300">
              Área especializada
              <input
                type="text"
                value={editForm.organization}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    organization: event.target.value,
                  }))
                }
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-primary-500"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => setEditingInvitation(null)}
              type="button"
              variant="outlined"
            >
              Cancelar
            </Button>

            <Button type="button" variant="filled" onClick={handleSaveInvitation}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </Dialog>
      
      <Dialog
  open={Boolean(invitationToSend)}
  handler={() => setInvitationToSend(null)}
  className="max-w-md bg-gray-800"
>
  <div className="p-6">
    <Typography variant="h5" className="text-white">
      Confirmar envío de mail
    </Typography>

    <p className="mt-3 text-sm leading-6 text-gray-300">
      {`¿Seguro que quieres enviar el mail de invitación${
        invitationToConfirm?.email ? ` a ${invitationToConfirm.email}` : ''
      }?`}
    </p>

    <div className="mt-6 flex justify-end gap-3">
      <Button
        onClick={() => setInvitationToSend(null)}
        type="button"
        variant="outlined"
      >
        Cancelar
      </Button>

      <Button
        type="button"
        variant="filled"
        onClick={handleConfirmSendInvitation}
      >
        Confirmar y enviar
      </Button>
    </div>
  </div>
</Dialog>

<Dialog
  open={showCapacitiesModal}
      
        handler={() => setShowCapacitiesModal(false)}
        className="max-w-md bg-gray-800"
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Typography variant="h5" className="text-white">
                Competencias del Usuario
              </Typography>

              <Typography variant="small" className="text-gray-400">
                Usuario:{' '}
                {
                  filteredUsers.find((user: any) => user.id === selectedUser?.id)
                    ?.email
                }
              </Typography>
            </div>
            <IconButton
              variant="text"
              color="white"
              onClick={() => setShowCapacitiesModal(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </IconButton>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div>
              <SelectLine
                label="Agregar / Eliminar competencias claves"
                name="capacities"
                isMulti
                value={formik.values.capacities}
                options={capacities}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
                setFieldValue={formik.setFieldValue}
                errors={formik.errors}
                touched={formik.touched}
                isFetching={isLoadingCapacities}
              />
              <Typography variant="small" className="text-gray-400">
                Para eliminar, haz clic en la "X" de la competencia. Para
                agregar, tipea directamente el nombre o selecciona desde el
                listado.
              </Typography>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setShowCapacitiesModal(false)}
                type="button"
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="filled"
                disabled={formik.isSubmitting}
              >
                <div className="flex items-center">
                  {formik.isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                  Guardar Cambios
                </div>
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </Card>
  );
};

export default UserTable;
export type { UserTableProps };
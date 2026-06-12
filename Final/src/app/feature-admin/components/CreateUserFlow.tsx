import React, { useMemo, useState } from 'react';
import { Spinner, Typography } from '@material-tailwind/react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';
import Button from 'src/app/ui/Button';
import withNavbar from '../../core/handlers/withNavbar';
import { useOrganizations } from '../services/organizationService';
import {
  downloadInvitationsCsv,
  StoredUserInvitation,
  upsertUserInvitations,
} from '../utils/userInvitations';

type AddMode = 'select' | 'individual' | 'bulk';
type BulkKeyMode = 'same' | 'random';
type FlowStep =
  | 'select'
  | 'individual-form'
  | 'bulk-upload'
  | 'bulk-keys'
  | 'actions';

type UserDraft = {
  root_organization_level: string;
  email: string;
  first_name: string;
  last_name: string;
  company_username: string;
  key: string;
};

type CreatedUser = Pick<
  StoredUserInvitation,
  | 'email'
  | 'username'
  | 'key'
  | 'first_name'
  | 'last_name'
  | 'organization'
  | 'organization_id'
>;

const randomCharacters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const ADMIN_USER_INVITATION_ENDPOINT =
  '/accounts/TODO_SEND_USER_INVITATION_ENDPOINT/';

function generateRandomKey(length = 15) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    return Array.from(values)
      .map((value) => randomCharacters[value % randomCharacters.length])
      .join('');
  }

  return Array.from({ length })
    .map(() =>
      randomCharacters.charAt(
        Math.floor(Math.random() * randomCharacters.length)
      )
    )
    .join('');
}

const emptyUserDraft = (): UserDraft => ({
  root_organization_level: '',
  email: '',
  first_name: '',
  last_name: '',
  company_username: '',
  key: generateRandomKey(),
});

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase();
}

function parseUsersCsv(csvText: string): UserDraft[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] || '';
      return acc;
    }, {});

    return {
      root_organization_level: '',
      email: row.email || row.mail || '',
      first_name: row.first_name || row.nombre || row.name || '',
      last_name: row.last_name || row.apellido || row.surname || '',
      company_username:
        row.company_username ||
        row.username ||
        row.nombre_usuario ||
        row.nombre_usuario_empresa ||
        '',
      key: '',
    };
  });
}

function buildUsername(user: UserDraft) {
  if (user.company_username.trim()) {
    return user.company_username.trim();
  }

  const emailPrefix = user.email.split('@')[0] || 'usuario';
  const suffix = generateRandomKey(4).toLowerCase();

  return `${emailPrefix}_${suffix}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function validateIndividualUser(user: UserDraft) {
  if (!user.root_organization_level) return 'Falta área especializada';
  if (!user.first_name.trim()) return 'Falta nombre';
  if (!user.last_name.trim()) return 'Falta apellido';
  if (!user.email.trim()) return 'Falta mail';
  if (!user.key.trim()) return 'Falta key';
  if (user.key.length !== 15) return 'La key debe tener 15 caracteres';

  return '';
}

function validateBulkUser(user: UserDraft) {
  if (!user.first_name.trim()) return 'Falta nombre';
  if (!user.last_name.trim()) return 'Falta apellido';
  if (!user.email.trim()) return 'Falta mail';

  return '';
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-gray-300">
    {label}
    {children}
  </label>
);

const inputClassName =
  'w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-900/40';

const cardClassName =
  'group rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e2633] to-[#121a27] p-8 text-left shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-primary-500/40 hover:shadow-primary-900/10';

const CreateUserFlow: React.FC = () => {
  const navigate = useNavigate();
  const { organizations, isLoading: isLoadingOrganizations } =
    useOrganizations();

  const [mode, setMode] = useState<AddMode>('select');
  const [step, setStep] = useState<FlowStep>('select');
  const [userDraft, setUserDraft] = useState<UserDraft>(emptyUserDraft);
  const [bulkUsers, setBulkUsers] = useState<UserDraft[]>([]);
  const [bulkKeyMode, setBulkKeyMode] = useState<BulkKeyMode>('random');
  const [sharedKey, setSharedKey] = useState(generateRandomKey());
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);

  const [editingCreatedUserIndex, setEditingCreatedUserIndex] = useState<
    number | null
  >(null);

  const [editingCreatedUser, setEditingCreatedUser] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    key: '',
    organization: '',
  });

  const organizationOptions = useMemo(
    () =>
      (organizations || []).map((organization) => ({
        value: organization.id.toString(),
        label: `${organization.name}${
          organization.level_name ? ` (${organization.level_name})` : ''
        }`,
      })),
    [organizations]
  );

  const createdInvitations = useMemo(
    () =>
      createdUsers.map((user) => ({
        ...user,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    [createdUsers]
  );

  const isBulkResult = createdUsers.length > 1;

  const getOrganizationLabel = (organizationId: string) => {
    return (
      organizationOptions.find(
        (organization) => organization.value === organizationId
      )?.label || ''
    );
  };

  const updateUserDraft = (field: keyof UserDraft, value: string) => {
    setUserDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const goToMode = (nextMode: AddMode) => {
    setMode(nextMode);

    if (nextMode === 'individual') {
      setStep('individual-form');
      return;
    }

    if (nextMode === 'bulk') {
      setStep('bulk-upload');
      return;
    }

    setStep('select');
  };

  const handleCsvUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const text = await file.text();
    const parsedUsers = parseUsersCsv(text);

    if (!parsedUsers.length) {
      toast.error('El CSV no contiene usuarios válidos');
      return;
    }

    const invalidUser = parsedUsers.find((user) => validateBulkUser(user));

    if (invalidUser) {
      toast.error(
        `${validateBulkUser(invalidUser)}: ${
          invalidUser.email || 'usuario sin mail'
        }`
      );
      return;
    }

    setBulkUsers(parsedUsers);
  };

  const createUser = async (user: UserDraft): Promise<CreatedUser> => {
    const username = buildUsername(user);

    const payload = {
      username,
      email: user.email.trim(),
      password: user.key,
      first_name: user.first_name.trim(),
      last_name: user.last_name.trim(),
    };

    await api.post(`${import.meta.env.VITE_API_URL}/accounts/create/`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      username,
      email: user.email.trim(),
      key: user.key,
      first_name: user.first_name.trim(),
      last_name: user.last_name.trim(),
      organization_id: user.root_organization_level,
      organization: getOrganizationLabel(user.root_organization_level),
    };
  };

  const handleIndividualNext = async () => {
    const validationError = validateIndividualUser(userDraft);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const createdUser = await createUser(userDraft);
      setCreatedUsers([createdUser]);
      upsertUserInvitations([createdUser], 'pending');
      setStep('actions');

      toast.success('Usuario creado correctamente');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Error al crear usuario'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUploadNext = () => {
    if (!bulkUsers.length) {
      toast.error('Importa un CSV antes de continuar');
      return;
    }

    setStep('bulk-keys');
  };

  const handleBulkCreateNext = async () => {
    if (!bulkUsers.length) {
      toast.error('Importa un CSV antes de continuar');
      return;
    }

    const keyToUse = sharedKey.trim();

    if (bulkKeyMode === 'same' && keyToUse.length !== 15) {
      toast.error('La key compartida debe tener 15 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);

      const usersWithKeys = bulkUsers.map((user) => ({
        ...user,
        key: bulkKeyMode === 'same' ? keyToUse : generateRandomKey(),
      }));

      const createdBulkUsers: CreatedUser[] = [];

      for (const user of usersWithKeys) {
        const createdUser = await createUser(user);
        createdBulkUsers.push(createdUser);
      }

      setCreatedUsers(createdBulkUsers);
      upsertUserInvitations(createdBulkUsers, 'pending');
      setStep('actions');

      toast.success(`${createdBulkUsers.length} usuarios creados correctamente`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Error al crear usuarios'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadData = () => {
    downloadInvitationsCsv(createdUsers);
    toast.success('Datos descargados correctamente');
  };

  const sendUserInvitation = async (invitation: CreatedUser) => {
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

  const handleSendInvitations = async () => {
    if (!createdUsers.length) return;

    try {
      setIsSubmitting(true);

      for (const invitation of createdUsers) {
        await sendUserInvitation(invitation);
      }

      upsertUserInvitations(createdUsers, 'invited');

      toast.success(
        createdUsers.length === 1
          ? 'Mail enviado correctamente'
          : 'Mails enviados correctamente'
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Error al enviar los mails'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSendInvitations = () => {
  if (!createdUsers.length) return;

  setShowSendConfirmation(true);
};

const handleConfirmSendInvitations = async () => {
  setShowSendConfirmation(false);
  await handleSendInvitations();
};

  const handleInviteLater = () => {
    upsertUserInvitations(createdUsers, 'pending');
    toast.success('Usuarios guardados como pendientes');
    navigate('/admin');
  };

  const openCreatedUserEditor = (index: number) => {
    const user = createdUsers[index];

    if (!user) return;

    setEditingCreatedUserIndex(index);
    setEditingCreatedUser({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
      key: user.key || '',
      organization: user.organization || '',
    });
  };

  const saveCreatedUserEdition = () => {
    if (editingCreatedUserIndex === null) return;

    if (!editingCreatedUser.first_name.trim()) {
      toast.error('Falta nombre');
      return;
    }

    if (!editingCreatedUser.last_name.trim()) {
      toast.error('Falta apellido');
      return;
    }

    if (!editingCreatedUser.email.trim()) {
      toast.error('Falta mail');
      return;
    }

    if (!editingCreatedUser.username.trim()) {
      toast.error('Falta usuario');
      return;
    }

    if (!editingCreatedUser.key.trim()) {
      toast.error('Falta key');
      return;
    }

    const nextCreatedUsers = createdUsers.map((user, index) =>
      index === editingCreatedUserIndex
        ? {
            ...user,
            first_name: editingCreatedUser.first_name.trim(),
            last_name: editingCreatedUser.last_name.trim(),
            username: editingCreatedUser.username.trim(),
            email: editingCreatedUser.email.trim(),
            key: editingCreatedUser.key.trim(),
            organization: editingCreatedUser.organization.trim(),
          }
        : user
    );

    setCreatedUsers(nextCreatedUsers);
    upsertUserInvitations(nextCreatedUsers, 'pending');

    setEditingCreatedUserIndex(null);

    toast.success('Datos actualizados');
  };

  const downloadCsvTemplate = () => {
    const content = [
      'nombre,apellido,mail',
      'Nombre,Apellido,persona@empresa.com',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'plantilla_usuarios.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const renderActionButtons = () => (
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="flex flex-col gap-3">
        <Button type="button" primary onClick={handleDownloadData}>
          Descargar datos
        </Button>

        <Button
          type="button"
          primary
          onClick={handleRequestSendInvitations}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Enviar mail
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="button" outline onClick={handleInviteLater}>
          Invitar más tarde
        </Button>
      </div>
    </div>
  );

  const renderIndividualSummary = () => {
    const user = createdUsers[0];

    if (!user) return null;

    return (
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-300">
                Usuario creado
              </p>
              <Typography variant="h3" color="white" className="mt-2">
                {user.first_name} {user.last_name}
              </Typography>
              <p className="mt-2 text-sm text-white/60">
                Revisa los datos antes de descargarlos, enviarlos por mail o
                dejar la invitación para más tarde.
              </p>
            </div>

            <div className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
              Creado
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Nombre
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {user.first_name}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Apellido
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {user.last_name}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Usuario
              </p>
              <p className="mt-1 break-all text-lg font-semibold text-white">
                {user.username}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Mail
              </p>
              <p className="mt-1 break-all text-lg font-semibold text-white">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Key
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-primary-200">
                {user.key}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Área especializada
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {user.organization || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[320px] flex-col rounded-3xl border border-primary-500/20 bg-primary-900/10 p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Typography variant="h5" color="white">
                Entrega de credenciales
              </Typography>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Puedes descargar los datos, enviar el mail o dejar al usuario en
                pendientes para invitarlo más tarde.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openCreatedUserEditor(0)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
              title="Editar datos"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1">{renderActionButtons()}</div>
        </div>
      </div>
    );
  };

  const renderBulkSummary = () => (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-300">
            Vista previa del CSV
          </p>
          <Typography variant="h3" color="white" className="mt-2">
            {createdUsers.length} usuarios creados
          </Typography>
          <p className="mt-2 text-sm text-white/60">
            Revisa los usuarios antes de descargar datos, enviar mails o
            dejarlos como pendientes.
          </p>
        </div>

        <div className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
          Pendientes
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-primary-500/20 bg-primary-900/10 p-5">
        <Typography variant="h5" color="white">
          Entrega de credenciales
        </Typography>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Puedes descargar todos los datos, abrir mails pre-rellenados para los
          usuarios o guardarlos como pendientes para invitarlos más tarde.
        </p>

        <div className="mt-5">{renderActionButtons()}</div>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-[#0f172a]">
            <tr className="border-b border-white/10 text-white/60">
              <th className="p-3">Nombre</th>
              <th className="p-3">Apellido</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Mail</th>
              <th className="p-3">Key</th>
              <th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {createdUsers.map((user, index) => (
              <tr key={user.email} className="border-b border-white/5">
                <td className="p-3 text-white">{user.first_name}</td>
                <td className="p-3 text-white">{user.last_name}</td>
                <td className="p-3 text-white">{user.username}</td>
                <td className="p-3 text-white">{user.email}</td>
                <td className="p-3 font-mono text-primary-200">{user.key}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => openCreatedUserEditor(index)}
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
                    title="Editar datos"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActionsStep = () => (
    <div className="rounded-3xl border border-white/10 bg-[#1e2633] p-8 shadow-xl shadow-black/10">
      <div className="mb-8">
      </div>

      {isBulkResult ? renderBulkSummary() : renderIndividualSummary()}
    </div>
  );

  const content = (
    <div className="min-h-screen bg-[#0f172a] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-white/10 bg-[#1e2633]/70 p-8 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Agregar usuario</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                Gestiona altas individuales o masivas y decide si
                descargar las credenciales o enviarlas por mail.
              </p>
            </div>

            <Button type="button" outline onClick={() => navigate('/admin')}>
              Volver al administrador
            </Button>
          </div>
        </div>

        {step === 'select' && (
          <div className="grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => goToMode('individual')}
              className={cardClassName}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-900/40 text-2xl">
                1
              </div>
              <Typography variant="h4" color="white">
                Usuario individual
              </Typography>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Agrega una persona manualmente y genera su key de acceso.
              </p>
              <div className="mt-8 text-sm font-semibold text-primary-300 transition group-hover:text-primary-200">
                Seleccionar modo
              </div>
            </button>

            <button
              type="button"
              onClick={() => goToMode('bulk')}
              className={cardClassName}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-900/40 text-2xl">
                CSV
              </div>
              <Typography variant="h4" color="white">
                Carga masiva
              </Typography>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Importa un CSV con nombre, apellido y mail.
              </p>
              <div className="mt-8 text-sm font-semibold text-primary-300 transition group-hover:text-primary-200">
                Seleccionar modo
              </div>
            </button>
          </div>
        )}

        {step === 'individual-form' && mode === 'individual' && (
          <div className="rounded-3xl border border-white/10 bg-[#1e2633] p-8 shadow-xl shadow-black/10">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Typography variant="h4" color="white">
                  Usuario individual
                </Typography>
                <p className="mt-2 text-sm text-white/60">
                  Completa los datos básicos para crear la cuenta.
                </p>
              </div>

              <Button type="button" outline onClick={() => goToMode('select')}>
                Cambiar modo
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Área especializada">
                {isLoadingOrganizations ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Spinner className="h-4 w-4" />
                    Cargando áreas...
                  </div>
                ) : (
                  <select
                    value={userDraft.root_organization_level}
                    onChange={(event) =>
                      updateUserDraft(
                        'root_organization_level',
                        event.target.value
                      )
                    }
                    className={inputClassName}
                  >
                    <option value="">Selecciona un área especializada</option>
                    {organizationOptions.map((organization) => (
                      <option key={organization.value} value={organization.value}>
                        {organization.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field label="Nombre">
                <input
                  type="text"
                  value={userDraft.first_name}
                  onChange={(event) =>
                    updateUserDraft('first_name', event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Apellido">
                <input
                  type="text"
                  value={userDraft.last_name}
                  onChange={(event) =>
                    updateUserDraft('last_name', event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Nombre usuario opcional">
                <input
                  type="text"
                  value={userDraft.company_username}
                  onChange={(event) =>
                    updateUserDraft('company_username', event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Mail">
                <input
                  type="email"
                  value={userDraft.email}
                  onChange={(event) =>
                    updateUserDraft('email', event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Key">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userDraft.key}
                    onChange={(event) =>
                      updateUserDraft('key', event.target.value)
                    }
                    className={inputClassName}
                    maxLength={15}
                  />
                  <button
                    type="button"
                    onClick={() => updateUserDraft('key', generateRandomKey())}
                    className="rounded-xl bg-primary-900 px-4 text-sm font-semibold text-white transition hover:bg-primary-800"
                  >
                    Random
                  </button>
                </div>
              </Field>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button type="button" outline onClick={() => navigate('/admin')}>
                Cancelar
              </Button>

              <Button
                type="button"
                primary
                onClick={handleIndividualNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 'bulk-upload' && mode === 'bulk' && (
          <div className="rounded-3xl border border-white/10 bg-[#1e2633] p-8 shadow-xl shadow-black/10">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Typography variant="h4" color="white">
                  Carga masiva
                </Typography>
                <p className="mt-2 text-sm text-white/60">
                  Importa un CSV con nombre, apellido y mail.
                </p>
              </div>

              <Button type="button" outline onClick={() => goToMode('select')}>
                Cambiar modo
              </Button>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Typography variant="h6" color="white">
                  Formato CSV requerido
                </Typography>
                <p className="mt-2 text-sm text-white/65">
                  Cabeceras: nombre, apellido, mail.
                </p>

                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="mt-4 rounded-xl border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  Descargar plantilla CSV
                </button>
              </div>

              <Field label="Importar CSV">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvUpload}
                  className={inputClassName}
                />
              </Field>

              {bulkUsers.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <Typography variant="h6" color="white">
                    Usuarios detectados: {bulkUsers.length}
                  </Typography>

                  <div className="mt-4 max-h-80 overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-white/60">
                          <th className="p-2">Nombre</th>
                          <th className="p-2">Apellido</th>
                          <th className="p-2">Mail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkUsers.map((user, index) => (
                          <tr key={`${user.email}-${index}`}>
                            <td className="p-2">{user.first_name}</td>
                            <td className="p-2">{user.last_name}</td>
                            <td className="p-2">{user.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button type="button" outline onClick={() => navigate('/admin')}>
                Cancelar
              </Button>

              <Button type="button" primary onClick={handleBulkUploadNext}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 'bulk-keys' && mode === 'bulk' && (
          <div className="rounded-3xl border border-white/10 bg-[#1e2633] p-8 shadow-xl shadow-black/10">
            <div className="mb-8">
              <Typography variant="h4" color="white">
                Configurar keys
              </Typography>
              <p className="mt-2 text-sm text-white/60">
                Decide si todos tendrán la misma key o una key random por
                usuario.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setBulkKeyMode('same')}
                className={`rounded-2xl border p-6 text-left transition ${
                  bulkKeyMode === 'same'
                    ? 'border-primary-500 bg-primary-900/30'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Typography variant="h5" color="white">
                  Todos la misma key
                </Typography>
                <p className="mt-2 text-sm text-white/60">
                  Una única key temporal para todos los usuarios del CSV.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBulkKeyMode('random')}
                className={`rounded-2xl border p-6 text-left transition ${
                  bulkKeyMode === 'random'
                    ? 'border-primary-500 bg-primary-900/30'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Typography variant="h5" color="white">
                  Una key random por usuario
                </Typography>
                <p className="mt-2 text-sm text-white/60">
                  Cada usuario recibirá una key temporal diferente.
                </p>
              </button>
            </div>

            {bulkKeyMode === 'same' && (
              <div className="mt-6 max-w-xl">
                <Field label="Key compartida">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sharedKey}
                      onChange={(event) => setSharedKey(event.target.value)}
                      className={inputClassName}
                      maxLength={15}
                    />
                    <button
                      type="button"
                      onClick={() => setSharedKey(generateRandomKey())}
                      className="rounded-xl bg-primary-900 px-4 text-sm font-semibold text-white transition hover:bg-primary-800"
                    >
                      Random
                    </button>
                  </div>
                </Field>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="button"
                outline
                onClick={() => setStep('bulk-upload')}
              >
                Atrás
              </Button>

              <Button
                type="button"
                primary
                onClick={handleBulkCreateNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 'actions' && renderActionsStep()}

        {showSendConfirmation && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1e2633] p-6 shadow-2xl">
      <Typography variant="h4" color="white">
        Confirmar envío de mail
      </Typography>

      <p className="mt-3 text-sm leading-6 text-white/65">
        {`¿Seguro que quieres enviar el mail de invitación${
          createdUsers.length === 1
            ? ` a ${createdUsers[0].email}`
            : ` a ${createdUsers.length} usuarios`
        }?`}
      </p>

      <div className="mt-8 flex justify-end gap-3">
        <Button
          type="button"
          outline
          onClick={() => setShowSendConfirmation(false)}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          primary
          onClick={handleConfirmSendInvitations}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Confirmar y enviar
        </Button>
      </div>
    </div>
  </div>
)}

        {editingCreatedUserIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#1e2633] p-6 shadow-2xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <Typography variant="h4" color="white">
                    Editar datos
                  </Typography>
                  <p className="mt-2 text-sm text-white/60">
                    Estos cambios afectarán a los datos descargados, el mail y
                    el usuario pendiente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingCreatedUserIndex(null)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-white transition hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre">
                  <input
                    type="text"
                    value={editingCreatedUser.first_name}
                    onChange={(event) =>
                      setEditingCreatedUser((current) => ({
                        ...current,
                        first_name: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Apellido">
                  <input
                    type="text"
                    value={editingCreatedUser.last_name}
                    onChange={(event) =>
                      setEditingCreatedUser((current) => ({
                        ...current,
                        last_name: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Usuario">
                  <input
                    type="text"
                    value={editingCreatedUser.username}
                    onChange={(event) =>
                      setEditingCreatedUser((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Mail">
                  <input
                    type="email"
                    value={editingCreatedUser.email}
                    onChange={(event) =>
                      setEditingCreatedUser((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Key">
                  <input
                    type="text"
                    value={editingCreatedUser.key}
                    onChange={(event) =>
                      setEditingCreatedUser((current) => ({
                        ...current,
                        key: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Área especializada">
                  <input
                    type="text"
                    value={editingCreatedUser.organization}
                    onChange={(event) =>
                      setEditingCreatedUser((current) => ({
                        ...current,
                        organization: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button
                  type="button"
                  outline
                  onClick={() => setEditingCreatedUserIndex(null)}
                >
                  Cancelar
                </Button>

                <Button type="button" primary onClick={saveCreatedUserEdition}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return withNavbar({ children: content });
};

export default CreateUserFlow;
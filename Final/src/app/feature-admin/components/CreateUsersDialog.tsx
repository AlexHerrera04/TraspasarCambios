import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogFooter,
  Spinner,
  Typography,
} from '@material-tailwind/react';
import { toast } from 'react-toastify';
import api from 'src/app/core/api/apiProvider';
import Button from 'src/app/ui/Button';
import { OrganizationType } from '../types/organization';

type CreateMode = 'select' | 'individual' | 'bulk';

type UserDraft = {
  root_organization_level: string;
  email: string;
  first_name: string;
  last_name: string;
  company_username: string;
  key: string;
  expiration_date: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  organizations: OrganizationType[];
  onCreated: () => void;
};

const randomCharacters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

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
  expiration_date: '',
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
      root_organization_level:
        row.root_organization_level ||
        row.organization ||
        row.empresa_padre ||
        '',
      email: row.email || row.mail || '',
      first_name: row.first_name || row.nombre || '',
      last_name: row.last_name || row.apellido || '',
      company_username:
        row.company_username ||
        row.username ||
        row.nombre_usuario_empresa ||
        '',
      key: row.key || generateRandomKey(),
      expiration_date:
        row.expiration_date || row.fecha_vencimiento || row.vencimiento || '',
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

function validateUser(user: UserDraft) {
  if (!user.root_organization_level) return 'Falta root organization level';
  if (!user.email) return 'Falta mail';
  if (!user.first_name) return 'Falta nombre';
  if (!user.last_name) return 'Falta apellido';
  if (!user.key) return 'Falta key';
  if (user.key.length !== 15) return 'La key debe tener 15 caracteres';
  if (!user.expiration_date) return 'Falta fecha de vencimiento';

  return '';
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-2 text-sm text-gray-300">
    {label}
    {children}
  </label>
);

const inputClassName =
  'w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-primary-500';

const CreateUsersDialog: React.FC<Props> = ({
  open,
  onClose,
  organizations,
  onCreated,
}) => {
  const [mode, setMode] = useState<CreateMode>('select');
  const [userDraft, setUserDraft] = useState<UserDraft>(emptyUserDraft);
  const [bulkUsers, setBulkUsers] = useState<UserDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const organizationOptions = useMemo(
    () =>
      organizations.map((organization) => ({
        value: organization.id.toString(),
        label: `${organization.name}${
          organization.level_name ? ` (${organization.level_name})` : ''
        }`,
      })),
    [organizations]
  );

  const resetAndClose = () => {
    setMode('select');
    setUserDraft(emptyUserDraft());
    setBulkUsers([]);
    onClose();
  };

  const updateUserDraft = (field: keyof UserDraft, value: string) => {
    setUserDraft((current) => ({
      ...current,
      [field]: value,
    }));
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

    setBulkUsers(parsedUsers);
  };

  const createUser = async (user: UserDraft) => {
    const validationError = validateUser(user);

    if (validationError) {
      throw new Error(`${validationError}: ${user.email || 'usuario sin mail'}`);
    }

    const payload = {
      username: buildUsername(user),
      email: user.email.trim(),
      password: user.key,
      first_name: user.first_name.trim(),
      last_name: user.last_name.trim(),
      organization: user.root_organization_level,
      expiration_date: user.expiration_date,
      must_change_password: true,
      force_password_change: true,
      temporary_password: true,
    };

    const response = await api.post(
      `${import.meta.env.VITE_API_URL}/accounts/create/`,
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (mode === 'individual') {
        await createUser(userDraft);
        toast.success('Usuario creado correctamente');
      }

      if (mode === 'bulk') {
        if (!bulkUsers.length) {
          toast.error('Importa un CSV antes de continuar');
          return;
        }

        for (const user of bulkUsers) {
          await createUser(user);
        }

        toast.success(`${bulkUsers.length} usuarios creados correctamente`);
      }

      onCreated();
      resetAndClose();
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

  const downloadCsvTemplate = () => {
    const content = [
      'root_organization_level,email,first_name,last_name,company_username,key,expiration_date',
      '1,persona@empresa.com,Nombre,Apellido,usuario.empresa,ABC123DEF456GHI,2026-12-31',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'plantilla_usuarios.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} handler={resetAndClose} size="xl">
      <DialogHeader className="bg-gray-900 text-white">
        Agregar usuario
      </DialogHeader>

      <DialogBody className="max-h-[75vh] overflow-y-auto bg-gray-900 text-white">
        {mode === 'select' && (
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('individual')}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:bg-white/10"
            >
              <Typography variant="h5" color="white">
                Usuario individual
              </Typography>
              <p className="mt-2 text-sm text-white/65">
                Crear un usuario rellenando manualmente los 7 campos requeridos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('bulk')}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:bg-white/10"
            >
              <Typography variant="h5" color="white">
                Carga masiva
              </Typography>
              <p className="mt-2 text-sm text-white/65">
                Importar un CSV con todos los usuarios que quieras crear.
              </p>
            </button>
          </div>
        )}

        {mode === 'individual' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Root organization level (empresa padre)">
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
                <option value="">Selecciona una empresa padre</option>
                {organizationOptions.map((organization) => (
                  <option key={organization.value} value={organization.value}>
                    {organization.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Mail">
              <input
                type="email"
                value={userDraft.email}
                onChange={(event) => updateUserDraft('email', event.target.value)}
                className={inputClassName}
              />
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

            <Field label="Nombre de usuario de empresa (opcional)">
              <input
                type="text"
                value={userDraft.company_username}
                onChange={(event) =>
                  updateUserDraft('company_username', event.target.value)
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Key">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userDraft.key}
                  onChange={(event) => updateUserDraft('key', event.target.value)}
                  className={inputClassName}
                  maxLength={15}
                />
                <button
                  type="button"
                  onClick={() => updateUserDraft('key', generateRandomKey())}
                  className="rounded-lg bg-primary-900 px-4 text-sm text-white hover:bg-primary-800"
                >
                  Random
                </button>
              </div>
            </Field>

            <Field label="Fecha de vencimiento">
              <input
                type="date"
                value={userDraft.expiration_date}
                onChange={(event) =>
                  updateUserDraft('expiration_date', event.target.value)
                }
                className={inputClassName}
              />
            </Field>
          </div>
        )}

        {mode === 'bulk' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Typography variant="h6" color="white">
                Formato CSV requerido
              </Typography>
              <p className="mt-2 text-sm text-white/65">
                Cabeceras: root_organization_level, email, first_name,
                last_name, company_username, key, expiration_date.
              </p>
              <p className="mt-1 text-sm text-white/65">
                Si no incluyes key, se generará automáticamente una key de 15
                caracteres.
              </p>

              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
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
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Typography variant="h6" color="white">
                  Usuarios detectados: {bulkUsers.length}
                </Typography>

                <div className="mt-4 max-h-64 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/60">
                        <th className="p-2">Mail</th>
                        <th className="p-2">Nombre</th>
                        <th className="p-2">Apellido</th>
                        <th className="p-2">Key</th>
                        <th className="p-2">Vencimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkUsers.map((user, index) => (
                        <tr key={`${user.email}-${index}`}>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.first_name}</td>
                          <td className="p-2">{user.last_name}</td>
                          <td className="p-2">{user.key}</td>
                          <td className="p-2">{user.expiration_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogBody>

      <DialogFooter className="gap-3 bg-gray-900">
        {mode !== 'select' && (
          <Button type="button" outline onClick={() => setMode('select')}>
            Atrás
          </Button>
        )}

        <Button type="button" outline onClick={resetAndClose}>
          Cancelar
        </Button>

        {mode !== 'select' && (
          <Button
            type="button"
            primary
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Crear usuario
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default CreateUsersDialog;
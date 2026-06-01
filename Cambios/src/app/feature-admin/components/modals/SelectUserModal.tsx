import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography, IconButton } from '@material-tailwind/react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import type { User } from '../../types/user';
import { getOrganizationUsers } from '../../services/userService';

interface SelectUserModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (users: User[]) => void;
  multiple?: boolean;
  selectedUsers?: User[];
}

const normalizeText = (value?: string) => {
  if (!value) return '';

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const normalizeEmail = (value?: string) => normalizeText(value);

const getFullName = (user: User) => {
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return fullName || user.public_name || user.username || 'Sin nombre';
};

const getDisplayName = (user: User) =>
  getFullName(user) || user.public_name || user.username || '-';

const getRoleKey = (user: User) => {
  if (user.is_superuser) return 'superadmin';
  if (user.is_account_admin || user.is_admin) return 'admin';
  if (user.is_manager) return 'manager';
  if (user.type === 'expert') return 'expert';
  if (user.type === 'layer_zero') return 'layer_zero';
  return user.type || 'user';
};

const getRoleLabel = (user: User) => {
  const roleKey = getRoleKey(user);

  if (roleKey === 'superadmin') return 'Superadmin';
  if (roleKey === 'admin') return 'Administrador';
  if (roleKey === 'manager') return 'Manager';
  if (roleKey === 'expert') return 'Experto';
  if (roleKey === 'layer_zero') return 'Layer Zero';
  if (roleKey === 'company') return 'Empresa';

  return 'Usuario';
};

const parseEmails = (raw: string) => {
  return Array.from(
    new Set(
      raw
        .split(/[\n,;]+/g)
        .map((item) => item.replace(/"/g, '').trim())
        .filter(Boolean)
        .map(normalizeEmail)
    )
  );
};

const mergeUsers = (currentUsers: User[], incomingUsers: User[]) => {
  const map = new Map<number, User>();

  currentUsers.forEach((user) => map.set(user.id, user));
  incomingUsers.forEach((user) => map.set(user.id, user));

  return Array.from(map.values());
};

export const SelectUserModal: React.FC<SelectUserModalProps> = ({
  open,
  onClose,
  onSelect,
  multiple = false,
  selectedUsers = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [localSelectedUsers, setLocalSelectedUsers] = useState<User[]>([]);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedRole('all');
      setImportText('');
      return;
    }

    setLocalSelectedUsers(selectedUsers);
  }, [open, selectedUsers]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const { data: users = [], isLoading, error } = useQuery(
    ['organization-users-selector'],
    () => getOrganizationUsers(),
    {
      enabled: open,
      staleTime: 30000,
      retry: 2,
    }
  );

  const roleOptions = useMemo(() => {
    const roles = new Map<string, string>();

    users.forEach((user) => {
      roles.set(getRoleKey(user), getRoleLabel(user));
    });

    return Array.from(roles.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole =
        selectedRole === 'all' || getRoleKey(user) === selectedRole;

      const searchValue = normalizeText(searchTerm);
      const matchesSearch =
        !searchValue ||
        [
          user.first_name,
          user.last_name,
          user.email,
          user.username,
          user.public_name,
          getRoleLabel(user),
          getFullName(user),
        ].some((field) => normalizeText(field).includes(searchValue));

      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, selectedRole]);

  const selectedIds = useMemo(
    () => new Set(localSelectedUsers.map((user) => user.id)),
    [localSelectedUsers]
  );

  const filteredSelectedCount = filteredUsers.filter((user) =>
    selectedIds.has(user.id)
  ).length;

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredSelectedCount === filteredUsers.length;

  const toggleUser = (user: User) => {
    if (!multiple) {
      onSelect([user]);
      onClose();
      return;
    }

    setLocalSelectedUsers((current) => {
      const exists = current.some((item) => item.id === user.id);

      if (exists) {
        return current.filter((item) => item.id !== user.id);
      }

      return [...current, user];
    });
  };

  const selectFilteredUsers = () => {
    if (!filteredUsers.length) return;
    setLocalSelectedUsers((current) => mergeUsers(current, filteredUsers));
  };

  const clearFilteredUsers = () => {
    if (!filteredUsers.length) return;

    const filteredIds = new Set(filteredUsers.map((user) => user.id));
    setLocalSelectedUsers((current) =>
      current.filter((user) => !filteredIds.has(user.id))
    );
  };

  const clearSelection = () => {
    setLocalSelectedUsers([]);
  };

  const applyImportedEmails = (emails: string[]) => {
    if (!emails.length) {
      toast.error('No se ha encontrado ningún email válido para importar.');
      return;
    }

    const usersByEmail = new Map<string, User>();
    users.forEach((user) => {
      const emailKey = normalizeEmail(user.email);
      if (emailKey) {
        usersByEmail.set(emailKey, user);
      }
    });

    const matchedUsers: User[] = [];
    const missingEmails: string[] = [];

    emails.forEach((email) => {
      const matchedUser = usersByEmail.get(email);
      if (matchedUser) {
        matchedUsers.push(matchedUser);
      } else {
        missingEmails.push(email);
      }
    });

    if (!matchedUsers.length) {
      toast.error(
        'Ningún email del CSV coincide con usuarios de la organización.'
      );
      return;
    }

    setLocalSelectedUsers((current) => mergeUsers(current, matchedUsers));

    if (missingEmails.length > 0) {
      toast.warning(
        `Se han seleccionado ${matchedUsers.length} usuarios. ${missingEmails.length} emails no coinciden.`
      );
      return;
    }

    toast.success(`Se han seleccionado ${matchedUsers.length} usuarios.`);
  };

  const handleImportText = () => {
    applyImportedEmails(parseEmails(importText));
  };

  const handleFileImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      setImportText(raw);
      applyImportedEmails(parseEmails(raw));
    };

    reader.onerror = () => {
      toast.error('No se ha podido leer el archivo.');
    };

    reader.readAsText(file);
  };

  const handleConfirm = () => {
    onSelect(localSelectedUsers);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f172a] text-white">
      <div className="flex h-screen flex-col overflow-hidden">
        <div className="container mx-auto flex h-full min-h-0 max-w-7xl flex-col px-3 pb-6 pt-6 lg:px-0">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Typography variant="h3" className="text-white">
                Seleccionar usuarios
              </Typography>
              <Typography className="mt-2 text-sm text-white/60">
                Filtra por rol, busca por nombre o email y selecciona varios a la vez.
              </Typography>
            </div>

            <IconButton
              variant="text"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <XMarkIcon className="h-6 w-6" />
            </IconButton>
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_240px_auto_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/75">
                Buscar usuario
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nombre o email"
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-white/35 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/75">
                Rol
              </label>
              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-primary-500"
              >
                <option value="all" className="bg-[#111827] text-white">
                  Todos
                </option>
                {roleOptions.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                    className="bg-[#111827] text-white"
                  >
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={selectFilteredUsers}
              disabled={!filteredUsers.length || allFilteredSelected}
              className="self-end rounded-2xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-sm font-medium text-primary-100 transition hover:bg-primary-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Seleccionar filtrados
            </button>

            <button
              type="button"
              onClick={clearFilteredUsers}
              disabled={!filteredSelectedCount}
              className="self-end rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar filtrados
            </button>
          </div>

          <div className="mb-4 grid gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4 lg:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/75">
                Importar emails
              </label>
              <textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                rows={3}
                placeholder="Pega emails separados por comas, punto y coma o saltos de línea."
                className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-primary-500"
              />
              <p className="mt-2 text-xs text-white/45">
                También puedes subir un CSV o TXT con una lista de emails. Los usuarios que coincidan quedarán seleccionados automáticamente.
              </p>
            </div>

            <div className="flex flex-col justify-start gap-3 pt-7">
              <button
                type="button"
                onClick={handleImportText}
                className="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-500"
              >
                Importar emails
              </button>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                <ArrowUpTrayIcon className="h-5 w-5" />
                Subir CSV
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-white/10 bg-[#111827]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-10">
                <Typography className="text-white/60">Cargando usuarios...</Typography>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center p-10">
                <Typography className="text-white/60">
                  Error al cargar usuarios.
                </Typography>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex h-full items-center justify-center p-10">
                <Typography className="text-white/60">
                  No se encontraron usuarios con esos filtros.
                </Typography>
              </div>
            ) : (
              <table className="w-full min-w-[820px] table-auto text-left">
                <thead className="sticky top-0 z-10 bg-[#0b1220]">
                  <tr className="border-b border-white/10">
                    <th className="w-16 px-4 py-3 text-sm font-medium text-white/70">
                      Sel.
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-white/70">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-white/70">
                      Email
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-white/70">
                      Rol
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const isSelected = selectedIds.has(user.id);

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3">
                          {multiple ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUser(user)}
                              className="h-4 w-4 rounded border-white/20 bg-transparent accent-primary-500"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleUser(user)}
                              className="rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-500"
                            >
                              Seleccionar
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {getDisplayName(user)}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/80">
                          {user.email || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/80">
                          {getRoleLabel(user)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {multiple && (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div className="text-sm text-white/60">
                {localSelectedUsers.length} usuarios seleccionados
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={!localSelectedUsers.length}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Limpiar selección
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!localSelectedUsers.length}
                  className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirmar selección
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectUserModal;
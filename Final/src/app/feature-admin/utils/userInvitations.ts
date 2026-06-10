export type InvitationStatus = 'pending' | 'invited';

export type StoredUserInvitation = {
  email: string;
  username: string;
  key: string;
  first_name: string;
  last_name: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  enrolledAt?: string;
  organization?: string;
  organization_id?: string;
};

const STORAGE_KEY = 'admin-user-invitations';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const readUserInvitations = (): StoredUserInvitation[] => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (error) {
    console.error('Error reading user invitations:', error);
    return [];
  }
};

export const writeUserInvitations = (invitations: StoredUserInvitation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invitations));
};

export const upsertUserInvitations = (
  users: Array<
    Pick<
      StoredUserInvitation,
      'email' | 'username' | 'key' | 'first_name' | 'last_name'
    > &
      Partial<
        Pick<StoredUserInvitation, 'organization' | 'organization_id'>
      >
  >,
  status: InvitationStatus = 'pending'
) => {
  const currentInvitations = readUserInvitations();
  const now = new Date().toISOString();

  const nextInvitations = [...currentInvitations];

  users.forEach((user) => {
    const existingIndex = nextInvitations.findIndex(
      (invitation) =>
        normalizeEmail(invitation.email) === normalizeEmail(user.email)
    );

    const existingInvitation =
      existingIndex >= 0 ? nextInvitations[existingIndex] : null;

    const nextInvitation: StoredUserInvitation = {
      email: user.email,
      username: user.username,
      key: user.key,
      first_name: user.first_name,
      last_name: user.last_name,
      organization: user.organization || existingInvitation?.organization || '',
      organization_id:
        user.organization_id || existingInvitation?.organization_id || '',
      status,
      createdAt: existingInvitation?.createdAt || now,
      updatedAt: now,
      enrolledAt: existingInvitation?.enrolledAt || '',
    };

    if (existingIndex >= 0) {
      nextInvitations[existingIndex] = nextInvitation;
    } else {
      nextInvitations.push(nextInvitation);
    }
  });

  writeUserInvitations(nextInvitations);

  return nextInvitations;
};

export const updateUserInvitation = (
  email: string,
  updates: Partial<StoredUserInvitation>
) => {
  const currentInvitations = readUserInvitations();
  const normalizedEmail = normalizeEmail(email);
  const now = new Date().toISOString();

  const nextInvitations = currentInvitations.map((invitation) =>
    normalizeEmail(invitation.email) === normalizedEmail
      ? {
          ...invitation,
          ...updates,
          updatedAt: now,
        }
      : invitation
  );

  writeUserInvitations(nextInvitations);

  return nextInvitations;
};

export const deleteUserInvitation = (email: string) => {
  const normalizedEmail = normalizeEmail(email);

  const nextInvitations = readUserInvitations().filter(
    (invitation) => normalizeEmail(invitation.email) !== normalizedEmail
  );

  writeUserInvitations(nextInvitations);

  return nextInvitations;
};

export const markUserInvitationStatus = (
  email: string,
  status: InvitationStatus
) => {
  return updateUserInvitation(email, { status });
};

export const markUserInvitationEnrolled = (
  email: string,
  enrolledAt: string
) => {
  return updateUserInvitation(email, { enrolledAt });
};

export const findUserInvitation = (email: string) => {
  const normalizedEmail = normalizeEmail(email);

  return readUserInvitations().find(
    (invitation) => normalizeEmail(invitation.email) === normalizedEmail
  );
};

export const buildInvitationMailto = (invitation: StoredUserInvitation) => {
  const subject = encodeURIComponent('Invitación a OpenKX');
  const body = encodeURIComponent(
    [
      `Hola ${invitation.first_name},`,
      '',
      'Te hemos creado una cuenta en OpenKX.',
      '',
      `Email: ${invitation.email}`,
      `Usuario: ${invitation.username}`,
      `Key temporal: ${invitation.key}`,
      invitation.organization
        ? `Área especializada: ${invitation.organization}`
        : '',
      '',
      'Entra en la plataforma con estos datos. En el primer acceso se te pedirá cambiar la contraseña.',
      '',
      'Gracias.',
    ]
      .filter(Boolean)
      .join('\n')
  );

  return `mailto:${invitation.email}?subject=${subject}&body=${body}`;
};

export const sendInvitationEmail = (invitation: StoredUserInvitation) => {
  window.location.href = buildInvitationMailto(invitation);
  markUserInvitationStatus(invitation.email, 'invited');
};

export const downloadInvitationsCsv = (
  invitations: Array<
    Pick<
      StoredUserInvitation,
      'email' | 'username' | 'key' | 'first_name' | 'last_name'
    > &
      Partial<Pick<StoredUserInvitation, 'organization'>>
  >,
  fileName = 'usuarios-creados.csv'
) => {
  const headers = [
    'nombre',
    'apellido',
    'usuario',
    'mail',
    'key',
    'area_especializada',
  ];

  const rows = invitations.map((invitation) => [
    invitation.first_name,
    invitation.last_name,
    invitation.username,
    invitation.email,
    invitation.key,
    invitation.organization || '',
  ]);

  const escapeCsvValue = (value: string) => {
    const safeValue = value || '';

    if (
      safeValue.includes(',') ||
      safeValue.includes('"') ||
      safeValue.includes('\n')
    ) {
      return `"${safeValue.replace(/"/g, '""')}"`;
    }

    return safeValue;
  };

  const content = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};
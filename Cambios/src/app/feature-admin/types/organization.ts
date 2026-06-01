// Constantes
export const ORGANIZATION_LEVELS = {
  HUB: 0,
  GRUPO: 1,
  SUBGRUPO: 2,
  AREA: 3,
  SUBAREA: 4,
  EQUIPO: 5,
  SUBEQUIPO: 6,
  USUARIO: 7,
} as const;

export type OrganizationLevel = keyof typeof ORGANIZATION_LEVELS;

// Interfaces base
export interface OrganizationBase {
  id: number;
  name: string;
  level: number;
  parent?: number;
  root_org: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationType {
  id: number;
  name: string;
  level_type: number;
  level_name: string;
  superior_name?: string;
  associated_users?: number;
  parent_id: string | null;
  parent_name: string | null;
  description?: string;
  definition?: string;
  capacity?: string[];
  function?: string[];
  level?: string[];
  usuariosAsociados?: number;
}

// DTOs
export interface CreateOrganizationLevelDTO {
  name: string;
  parent_id: number;
  root_org_id: number;
}

export interface OrganizationResponse {
  id: number;
  name: string;
  definition: string | null;
  industry: number | null;
}

// Interface de Usuario
export interface User {
  id: number;
  organization_level_id: number;
  capacity: string[];
  function: string[];
  industry: string[];
  level: string[];
  profile: string[];
  theme: string[];
  user_allowed_themes: string[];
  tool: string[];
  business_driver: string[];
  total_score: string;
  organization_level: string[];
  root_organization_level: string[];
  type: 'expert';
  phone_number: string;
  contact_email: string;
  portfolio_link: string;
  profile_picture: string;
  wiki_avatar: string;
  public_name: string;
  liked_contents: string[];
  is_onboarded: boolean;
  is_manager: boolean;
  is_account_admin: boolean;
  account: number;
}

// Funciones de validación de jerarquía
export const isValidHierarchy = (
  parentLevel: OrganizationLevel,
  childLevel: OrganizationLevel
): boolean => {
  return ORGANIZATION_LEVELS[parentLevel] < ORGANIZATION_LEVELS[childLevel];
};

export const getOrganizationLevel = (
  organizations: OrganizationType[],
  orgId: string
) => {
  const org = organizations.find((o) => o.id.toString() === orgId);
  return org?.level_type;
};

// Funciones de permisos y validación
// export const canAssignUserToOrganization = (
//   organizations: OrganizationType[],
//   orgId: string
// ): boolean => {
//   const orgLevel = getOrganizationLevel(organizations, orgId);
//   return (
//     orgLevel !== null &&
//     ORGANIZATION_LEVELS[orgLevel] <= ORGANIZATION_LEVELS.SUBEQUIPO
//   );
// };

// Funciones de cálculo de usuarios
export const calculateUsuariosAsociados = (
  organizationId: string,
  users: User[],
  organizations: OrganizationType[]
): number => {
  const directUsers = users.filter(
    (user) => user.organization_level_id.toString() === organizationId
  ).length;

  const childOrgs = organizations.filter(
    (org) => org.parent_id === organizationId
  );

  const childUsers = childOrgs.reduce((total, childOrg) => {
    return (
      total +
      calculateUsuariosAsociados(childOrg.id.toString(), users, organizations)
    );
  }, 0);

  return directUsers + childUsers;
};

export const getOrganizationWithUserCount = (
  organization: OrganizationType,
  users: User[],
  organizations: OrganizationType[]
) => {
  const count = calculateUsuariosAsociados(
    organization.id.toString(),
    users,
    organizations
  );

  return {
    ...organization,
    usuariosAsociados: count,
  };
};

// Funciones de relaciones jerárquicas
export const isDescendantOf = (
  childOrgId: string,
  parentOrgId: string,
  organizations: OrganizationType[]
): boolean => {
  const child = organizations.find((org) => org.id.toString() === childOrgId);
  if (!child) return false;

  if (child.parent_id === parentOrgId) return true;

  if (child.parent_id) {
    return isDescendantOf(child.parent_id, parentOrgId, organizations);
  }

  return false;
};

// Funciones de permisos de visualización y edición
export const canViewOrganization = (
  organization: OrganizationType,
  userRole: string,
  userGroupId: string,
  organizations: OrganizationType[]
): boolean => {
  if (
    organization.level_name === 'HUB' ||
    organization.level_name === 'GRUPO'
  ) {
    return false;
  }

  return isDescendantOf(organization.id.toString(), userGroupId, organizations);
};

export const canEditOrganization = (
  organization: OrganizationType,
  userRole: string
): boolean => {
  return !(
    organization.level_name === 'HUB' || organization.level_name === 'GRUPO'
  );
};

export interface OrganizationLevelDetail {
  id: number;
  name: string;
  level_type: string;
  level_name: string;
  parent_name: string;
  parent: number;
}

// Actualizar la interfaz según la respuesta de la API
export interface OrganizationLevelResponse {
  id: number;
  name: string;
  level_type: number;
  level_name: string | null;
  parent_name: string | null;
  parent: number | null;
  organization: string;
  created_at: string;
  updated_at: string;
}

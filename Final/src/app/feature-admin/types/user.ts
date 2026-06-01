import { OrganizationType, OrganizationBase } from './organization';

// Interfaces base
interface BaseUser {
  id: number;
  email: string;
  username: string;
  public_name: string;
  organization: string;
  type: string;
}

// Interface de Usuario
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  public_name?: string;
  organization: string;
  type: string;
  is_admin?: boolean;
  is_superuser?: boolean;
  is_manager?: boolean;
  is_account_admin?: boolean;
  is_onboarded?: boolean; // Indica si completó el onboarding
  has_account_info?: boolean; // Indica si tiene información de cuenta
  account_info?: {
    type?: string;
    function?: string[];
    capacity?: string[];
    level?: string[];
    profile?: string[];
    business_driver?: string[];
    tools?: string[];
    idiom?: string[];
    industry?: string[];
  };
  organization_level: OrganizationBase;
}

export interface GroupUser extends User {
  contact_email: string;
}

// Funciones de cálculo de usuarios
export const calculateUsuariosAsociados = (
  organizationId: string,
  users: GroupUser[],
  organizations: OrganizationType[]
): number => {
  const directUsers = users.filter(
    (user) => user.organization === organizationId
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

export interface CreateAccountFormData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  isLayerZero?: boolean;
  organization?: string;
  confirmPassword?: string;
}

// Para la creación de cuenta (paso 1)
export interface CreateAccountRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization: string;
}

export interface CreateAccountResponse {
  id: number;
  username: string;
  email: string;
  type: string;
  contact_email: string;
  is_active: boolean;
  is_staff: boolean;
}

// Para la creación de información de cuenta (paso 2)
export interface CreateAccountInfoRequest {
  account: number;
  type: 'expert' | 'company';
  public_name: string;
  organization_level_id: number;
  function: string[];
  level: string[];
  capacity: string[];
  profile: string[];
  business_driver: string[];
  idiom: string[];
  industry: string[];
  tool: string[];
  theme: string[];
  user_allowed_themes: string[];
  is_manager: boolean;
}

interface BackendOption {
  id: number;
  name: string;
}

export interface UserOptions {
  industry: BackendOption[];
  function: BackendOption[];
  level: BackendOption[];
  capacity: BackendOption[];
  profile: BackendOption[];
  business_driver: BackendOption[];
  idiom: BackendOption[];
  tool: BackendOption[];
  theme: BackendOption[];
}

interface Option {
  value: string;
  label: string;
}

// Para las opciones de Layer Zero
export interface LayerZeroOption {
  id: number;
  name: string;
}

export interface SelectOption {
  id?: string;
  name?: string;
  value?: string;
  label?: string;
}

export interface LayerZeroOptions {
  profiles: SelectOption[];
  capacities: SelectOption[];
  functions: SelectOption[];
  industries: SelectOption[];
  levels: SelectOption[];
}

// Agregar interfaz para los datos iniciales
export interface AccountInfoInitialData {
  first_name?: string;
  last_name?: string;
  public_name?: string;
  is_manager?: boolean;
  // ... otros campos opcionales
}

// Añadir interfaz específica para Layer Zero
export interface CreateLayerZeroUserRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  type: 'layer_zero';
}

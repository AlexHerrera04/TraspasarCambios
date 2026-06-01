import api from 'src/app/core/api/apiProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { OrganizationType } from '../types/organization';
import type {
  User,
  SelectOption,
  CreateAccountRequest,
  CreateAccountInfoRequest,
  CreateAccountResponse,
  CreateAccountFormData,
  UserOptions,
  LayerZeroOptions,
  LayerZeroOption,
} from '../types/user';

const ENDPOINTS = {
  ACCOUNTS: {
    CREATE: '/accounts/create/',
    INFO: '/accounts/create/accountinfo/',
    CHECK_USERNAME: '/accounts/check-username/',
    CHECK_PUBLIC_NAME: '/accounts/check-public-name-availability/',
    USERS: '/accounts/organization/users/',
    OPTIONS: '/accounts/layer-zero/options/',
    LAYER_ZERO_CREATE: '/accounts/layer-zero/create/',
  },
  LAYER_ZERO: {
    PROFILES: '/layerzero/profiles',
    CAPACITIES: '/layerzero/capacities',
    FUNCTIONS: '/layerzero/functions',
    INDUSTRIES: '/layerzero/industries',
    LEVELS: '/layerzero/levels',
  },
} as const;

// API Helper Functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token available');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleApiError = (error: any, defaultMessage: string) => {
  if (error.response?.status === 403) {
    toast.error('No tienes permisos para realizar esta acción');
    return;
  }

  const errorMessage =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    defaultMessage;

  toast.error(errorMessage);
  throw new Error(errorMessage);
};

// API Functions
const userAPI = {
  getUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.ACCOUNTS.USERS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createAccount(userData: CreateAccountRequest) {
    try {
      const headers = getAuthHeaders();

      const requestData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        organization: userData.organization,
      };

      const response = await api.post(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.ACCOUNTS.CREATE}`,
        requestData,
        { headers }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 500) {
        toast.error('Error interno del servidor');
      } else {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Error al crear la cuenta';
        toast.error(errorMessage);
      }

      throw error;
    }
  },

  async createAccountInfo(data: CreateAccountInfoRequest) {
    try {
      const headers = getAuthHeaders();

      // Asegurarnos de que todos los campos requeridos estén presentes
      const requestData = {
        account: data.account,
        type: data.type || 'company',
        public_name: data.public_name,
        organization_level_id: data.organization_level_id,
        function: data.function || [],
        level: data.level || [],
        capacity: data.capacity || [],
        profile: data.profile || [],
        business_driver: data.business_driver || [],
        idiom: data.idiom || [],
        industry: data.industry || [],
        tool: data.tool || [],
        theme: ['default_theme'],
        user_allowed_themes: ['default_theme'],
      };

      const response = await api.post(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.ACCOUNTS.INFO}`,
        requestData,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 500) {
        toast.error('Error interno del servidor');
      } else {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Error al crear la información de cuenta';
        toast.error(errorMessage);
      }
      throw error;
    }
  },

  async getUserOptions(): Promise<UserOptions> {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.ACCOUNTS.OPTIONS}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getLayerZeroOptions(): Promise<LayerZeroOptions> {
    try {
      const headers = getAuthHeaders();

      // Hacer las peticiones individuales para mejor manejo de errores
      const profilesReq = api.get(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.LAYER_ZERO.PROFILES}`,
        { headers }
      );
      const capacitiesReq = api.get(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.LAYER_ZERO.CAPACITIES}`,
        { headers }
      );
      const functionsReq = api.get(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.LAYER_ZERO.FUNCTIONS}`,
        { headers }
      );
      const industriesReq = api.get(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.LAYER_ZERO.INDUSTRIES}`,
        { headers }
      );
      const levelsReq = api.get(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.LAYER_ZERO.LEVELS}`,
        { headers }
      );

      const [profiles, capacities, functions, industries, levels] =
        await Promise.all([
          profilesReq,
          capacitiesReq,
          functionsReq,
          industriesReq,
          levelsReq,
        ]);

      return {
        profiles: profiles.data,
        capacities: capacities.data,
        functions: functions.data,
        industries: industries.data,
        levels: levels.data,
      };
    } catch (error: any) {
      throw error;
    }
  },

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_URL}${
          ENDPOINTS.ACCOUNTS.CHECK_USERNAME
        }${username}/`,
        { headers: getAuthHeaders() }
      );
      return response.data.available;
    } catch (error: any) {
      if (error.response?.status === 404) return true;
      return false;
    }
  },

  async checkPublicNameAvailability(publicName: string): Promise<boolean> {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_URL}${
          ENDPOINTS.ACCOUNTS.CHECK_PUBLIC_NAME
        }${publicName}`,
        { headers: getAuthHeaders() }
      );
      return response.data.available;
    } catch (error: any) {
      if (error.response?.status === 404) return true;
      return false;
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(
        `${import.meta.env.VITE_API_URL}/accounts/users/${id}/`,
        { headers: getAuthHeaders() }
      );
    } catch (error) {
      return handleApiError(error, 'Error al eliminar usuario');
    }
  },

  async createUser(userData: CreateUserRequest): Promise<any> {
    try {
      const response = await api.post(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.ACCOUNTS.CREATE}`,
        userData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error al crear el usuario');
    }
  },

  async createLayerZeroUser(
    userData: CreateLayerZeroUserRequest
  ): Promise<any> {
    try {
      const response = await api.post(
        `${import.meta.env.VITE_API_URL}${
          ENDPOINTS.ACCOUNTS.LAYER_ZERO_CREATE
        }`,
        userData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error al crear el usuario de Layer Zero');
    }
  },
};

// React Query Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['organizationUsers'],
    queryFn: getOrganizationUsers,
    staleTime: 30000,
    retry: 1,
    onError: (error) => {
      toast.error('Error al obtener usuarios de la organización');
    },
  });
};

export const useGroupUsers = () => useQuery(['groupUsers'], userAPI.getUsers);
export const useUserOptions = () =>
  useQuery(['userOptions'], userAPI.getUserOptions);
export const useLayerZeroOptions = () =>
  useQuery(['layerZeroOptions'], userAPI.getLayerZeroOptions);
export const useCreateAccount = () => useMutation(userAPI.createAccount);
export const useCreateAccountInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(
        `${import.meta.env.VITE_API_URL}/accounts/info/`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error: any) => {
      throw error;
    },
  });
};

export const useAvailableOrganizations = () => {
  return useQuery({
    queryKey: ['availableOrganizations'],
    queryFn: async () => {
      const response = await api.get<OrganizationType[]>(
        `${import.meta.env.VITE_API_URL}/accounts/organization/levels/`,
        {
          params: {
            min_level: 2,
            max_level: 6,
          },
        }
      );
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation(userAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Usuario eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar el usuario');
    },
  });
};

// Export API functions
export const {
  checkUsernameAvailability,
  checkPublicNameAvailability,
  createAccount,
  createAccountInfo,
  getUsers,
  getUserOptions,
  getLayerZeroOptions,
  createUser,
  createLayerZeroUser,
} = userAPI;

interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface CreateLayerZeroUserRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  // Campos adicionales para Layer Zero si son necesarios
}

// React Query hooks
export const useCreateUser = () => {
  return useMutation(userAPI.createUser, {
    onSuccess: () => {
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: any) => {
      handleApiError(error, 'Error al crear el usuario');
    },
  });
};

export const useCreateLayerZeroUser = () => {
  return useMutation(userAPI.createLayerZeroUser, {
    onSuccess: () => {
      toast.success('Usuario de Layer Zero creado exitosamente');
    },
    onError: (error: any) => {
      handleApiError(error, 'Error al crear el usuario de Layer Zero');
    },
  });
};

// Actualizar la función para obtener usuarios de la organización
export const getOrganizationUsers = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token available');

    const response = await api.get(
      `${import.meta.env.VITE_API_URL}${ENDPOINTS.ACCOUNTS.USERS}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

// Mantener el getUsers existente y añadir esta nueva función
export const getUsersInfo = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token available');

    const response = await api.get(
      `${import.meta.env.VITE_API_URL}/accounts/userinfo`, // Volvemos al endpoint original
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Como este endpoint devuelve un solo usuario, lo convertimos en array
    return [response.data];
  } catch (error) {
    return [];
  }
};

// Modificar la función useUser para usar el endpoint correcto
export const useUser = (userId: any) => {
  return useQuery(
    ['user', userId],
    async () => {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `${import.meta.env.VITE_API_URL}${ENDPOINTS.ACCOUNTS.USERS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const users = response.data;
      const user = users.find((u: any) => u.id === userId);
      return user;
    },
    {
      enabled: !!userId,
    }
  );
};

export interface GroupUser {
  id: number;
  username: string;
  email: string;
  public_name: string;
  first_name: string;
  last_name: string;
  organization: string;
  organization_level?: string[];
  type?: string;
  contact_email: string;
  capacities: string[];
}

// Actualizar la interfaz para que coincida con la respuesta del endpoint
interface UserCapacityResponse {
  id: number;
  capacity: string[];
  function: string[];
  industry: string[];
  level: string[];
  profile: string[];
  // ... otros campos según necesites
}

// Actualizar la función para obtener capacidades
export const getUserCapacities = async (
  userId: number
): Promise<UserCapacityResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token available');

    const response = await api.get(
      `${import.meta.env.VITE_API_URL}/accounts/accountinfo/${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Respuesta del endpoint de capacidades:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo capacidades:', error);
    throw error;
  }
};

// Hook para obtener las capacidades
export const useUserCapacities = (userId: number) => {
  return useQuery(['userCapacities', userId], () => getUserCapacities(userId), {
    enabled: !!userId,
    onSuccess: (data) => {
      console.log('Capacidades obtenidas exitosamente:', data);
    },
    onError: (error) => {
      console.error('Error al obtener capacidades:', error);
      toast.error('Error al obtener las capacidades del usuario');
    },
  });
};

// Actualizar la función para modificar capacidades
export const useUpdateUserCapacities = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      capacities,
    }: {
      userId: number;
      capacities: string[];
    }) => {
      const requestBody = JSON.stringify({
        user: userId,
        capacity: capacities,
      });

      console.log('Request body:', requestBody); // Debug

      return api.patch(
        `${import.meta.env.VITE_API_URL}/accounts/manager/accountinfo/`,
        requestBody,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );
    },
  });
};

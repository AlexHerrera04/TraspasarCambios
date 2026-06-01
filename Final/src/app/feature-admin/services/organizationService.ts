import api from 'src/app/core/api/apiProvider';
import {
  OrganizationLevelDetail,
  OrganizationType,
  OrganizationLevelResponse,
} from '../types/organization';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useUser } from '../../core/feature-user/provider/userProvider';
import { User } from '../types/user';

// Constantes para los niveles organizacionales
const ORGANIZATION_LEVELS = {
  HUB: 0,
  GRUPO: 1,
  SUBGRUPO: 2,
  AREA: 3,
  SUBAREA: 4,
  EQUIPO: 5,
  SUBEQUIPO: 6,
};

// Obtener niveles organizacionales del GRUPO actual
export const getOrganizationLevels = async (): Promise<
  OrganizationLevelDetail[]
> => {
  try {
    const { data } = await api.get<OrganizationLevelDetail[]>(
      `${import.meta.env.VITE_API_URL}/accounts/organization/levels/`
    );
    return data;
  } catch (error) {
    console.error('Error fetching organization levels:', error);
    return [];
  }
};

// Obtener organizaciones padre potenciales basadas en el tipo de nivel y el grupo del usuario
export const getPotentialParents = async (
  levelType: number
): Promise<OrganizationType[]> => {
  try {
    // Validar que no se puedan crear niveles inferiores a SUBGRUPO
    if (levelType < 2) {
      console.warn('No se pueden crear niveles inferiores a SUBGRUPO');
      return [];
    }

    const { data } = await api.get<OrganizationType[]>(
      `${
        import.meta.env.VITE_API_URL
      }/accounts/organization/potential-parents/`,
      {
        params: {
          level_type: levelType,
          token: true,
        },
      }
    );

    // Filtrar para asegurar la jerarquía correcta
    const validParents = data.filter((org) => {
      // Para SUBGRUPO (2), solo mostrar GRUPO (1)
      if (levelType === 2) {
        return Number(org.level_type) === 1; // Solo GRUPO
      }
      return true; // Para otros niveles, confiar en la API
    });

    console.log('Potential parents:', {
      requestedLevel: levelType,
      validParents,
    });

    return validParents;
  } catch (error) {
    console.error('Error fetching potential parents:', error);
    return [];
  }
};

// Crear nuevo nivel organizacional
export const createOrganizationLevel = async (orgData: {
  name: string;
  level_type: number;
  parent: number;
}): Promise<OrganizationLevelDetail> => {
  try {
    const { data } = await api.post<OrganizationLevelDetail>(
      `${import.meta.env.VITE_API_URL}/accounts/organization/create/`,
      orgData
    );
    console.log('Organization level created:', data);
    return data;
  } catch (error) {
    console.error('Error creating organization level:', error);
    throw error;
  }
};

// Obtener todas las organizaciones
export const getOrganizations = async (): Promise<OrganizationType[]> => {
  try {
    const { data } = await api.get<OrganizationType[]>(
      `${import.meta.env.VITE_API_URL}/accounts/organization/levels/`
    );
    return data;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
};

// Función auxiliar para obtener el número de nivel
const getLevelTypeNumber = (levelType: string): number => {
  return (
    ORGANIZATION_LEVELS[levelType as keyof typeof ORGANIZATION_LEVELS] ?? -1
  );
};

// Función auxiliar para obtener el tipo de nivel desde número
const getLevelTypeFromNumber = (level: number): string => {
  return (
    Object.entries(ORGANIZATION_LEVELS).find(
      ([_, value]) => value === level
    )?.[0] || ''
  );
};

export const createOrganizationAPI = async (orgData: {
  name: string;
  level_type: number;
  parent: number;
}): Promise<OrganizationType> => {
  try {
    const { data } = await api.post<OrganizationType>(
      `${import.meta.env.VITE_API_URL}/accounts/organization/create/`,
      orgData
    );
    return data;
  } catch (error) {
    console.error('Error al crear organización:', error);
    throw error;
  }
};

export const updateOrganizationAPI = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<OrganizationType>;
}): Promise<OrganizationType> => {
  try {
    const response = await api.put<OrganizationType>(
      `${import.meta.env.VITE_API_URL}/accounts/organization/${id}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar organización:', error);
    throw error;
  }
};

// React Query Hooks
export const useOrganizations = () => {
  const query = useQuery<OrganizationType[]>({
    queryKey: ['organizations'],
    queryFn: getOrganizations,
    staleTime: 30000,
    retry: 1,
    onError: (error) => {
      console.error('Error fetching organizations:', error);
      toast.error('Error al cargar las organizaciones');
    },
  });

  return {
    organizations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganizationAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganizationAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useOrganizationLevels = () => {
  return useQuery<OrganizationLevelDetail[]>({
    queryKey: ['organizationLevels'],
    queryFn: getOrganizationLevels,
  });
};

export const usePotentialParents = (level_type: number) => {
  return useQuery(['potentialParents', level_type], {
    queryFn: () => getPotentialParents(level_type),
    enabled: !!level_type && level_type > 1, // Solo habilitar para niveles superiores a GRUPO
    retry: false,
    staleTime: 30000,
  });
};

export const useCreateOrganizationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganizationLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationLevels'] });
      queryClient.invalidateQueries({ queryKey: ['potentialParents'] });
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(
        `${import.meta.env.VITE_API_URL}/accounts/organization/${id}/`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Función para obtener organizaciones filtradas
export const getAvailableOrganizations = async (): Promise<
  OrganizationType[]
> => {
  try {
    const token = localStorage.getItem('token');
    const userGroupId = localStorage.getItem('groupId');

    if (!token || !userGroupId) {
      console.warn('No token or groupId available');
      return [];
    }

    const response = await api.get<OrganizationType[]>(
      `${import.meta.env.VITE_API_URL}/accounts/organization/levels/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Encontrar el subgrupo del usuario actual
    const userSubgroup = response.data.find(
      (org) => org.id.toString() === userGroupId
    );

    if (!userSubgroup) return [];

    // Filtrar solo las organizaciones que son hijas del subgrupo del usuario
    const filteredOrgs = response.data.filter((org) => {
      // Incluir el subgrupo del usuario
      if (org.id === userSubgroup.id) return true;

      // Verificar si es una organización hija (área, subárea, equipo, etc.)
      let currentOrg = org;
      while (currentOrg.parent_id) {
        const parent = response.data.find((o) => o.id === Number(currentOrg.parent_id));
        if (!parent) break;
        if (parent.id === userSubgroup.id) return true;
        currentOrg = parent;
      }
      return false;
    });

    // Ordenar por nivel y nombre
    return filteredOrgs.sort((a, b) => {
      if (a.level_type === b.level_type) {
        return a.name.localeCompare(b.name);
      }
      return Number(a.level_type) - Number(b.level_type);
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
};

// Función para obtener el conteo de usuarios por organización
export const getOrganizationUserCount = async (orgId: number): Promise<number> => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get<User[]>(
      `${import.meta.env.VITE_API_URL}/accounts/organization/users/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    
    // Filtrar usuarios que pertenecen a esta organización
    const usersInOrg = response.data.filter(user => 
      user.organization_level.id === orgId
    );
    
    return usersInOrg.length;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
};

// Hook personalizado para el conteo de usuarios
export const useOrganizationUserCount = (orgId: number) => {
  const queryClient = useQueryClient();
  
  return useQuery(
    ['organizationUserCount', orgId],
    () => getOrganizationUserCount(orgId),
    {
      staleTime: 30000,
      onSuccess: (data) => {
        queryClient.setQueryData(['organizationUserCount', orgId], data);
      }
    }
  );
};

// Hook para obtener y contar usuarios por organización
export const useOrganizationUsers = (orgId: number) => {
  return useQuery(
    ['users'],
    async () => {
      const token = localStorage.getItem('token');
      const response = await api.get<User[]>(
        `${import.meta.env.VITE_API_URL}/accounts/organization/users/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      // Filtrar usuarios que pertenecen a esta organización
      return response.data.filter(user => 
        user.organization_level.id === orgId
      );
    },
    {
      staleTime: 30000,
    }
  );
};

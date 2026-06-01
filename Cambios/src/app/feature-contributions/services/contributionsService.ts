import axios from 'axios';
import { IContribution } from '../types/';

interface ApiResponse<T> {
  data: T;
}

interface EvaluatorInvite {
  email: string;
  name: string;
  lastname: string;
  position: string;
  area: string;
  contributionId: string;
}

// Obtener la URL base del archivo .env o usar un fallback
const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar tokens de autorización
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const contributionsService = {
  // Obtener todas las contribuciones
  getAll: async (): Promise<IContribution[]> => {
    try {
      const { data } = await api.get<IContribution[]>('/contributor/contributions');
      if (data) {
        return data;
      }
      throw new Error('Error al obtener las contribuciones');
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener una contribución por ID
  getById: async (id: string): Promise<IContribution> => {
    try {
      const response = await api.get<ApiResponse<IContribution>>(`/api/contributions/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Contribución no encontrada');
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear una nueva contribución
  create: async (data: Partial<IContribution>): Promise<IContribution> => {
    try {
      const response = await api.post<ApiResponse<IContribution>>('/contributor/contributions/create/', data);
      if (response.status == 201) {
        return response.data.id;
      }
      throw new Error('Error al crear la contribución');
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar una contribución
  update: async (id: string, data: Partial<IContribution>): Promise<IContribution> => {
    try {
      const response = await api.put<ApiResponse<IContribution>>(`/api/contributions/${id}`, data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Error al actualizar la contribución');
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar una contribución
  delete: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/contributions/${id}`);
      if (!response.data.success) {
        throw new Error('Error al eliminar la contribución');
      }
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

inviteEvaluator: async (idContribution: int) => {
  try {
    const response = await api.get(`contributor/contributions/${idContribution}/send-for-feedback/`);

    if (response.status != 200) {
      throw new Error(response.data.message || 'Error al invitar al evaluador');
    }
  } catch (error: any) {
    console.error('Error en inviteEvaluator:', error);
    if (error.response?.status === 404) {
      throw new Error('El servicio de invitación no está disponible en este momento');
    } else if (error.response?.status === 401) {
      throw new Error('No tienes permisos para realizar esta acción');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Error al procesar la invitación del evaluador');
    }
  }
}
};

export { contributionsService };

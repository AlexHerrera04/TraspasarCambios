import axios from 'axios';
import { ContributionSummary, Evaluation } from '../types';




// Eliminar esto porque es de mi backend simulado, solamente cambiar en contribucionesService.ts el link 
// de la url de la api a http://localhost:3000/api, y en apiProvider.ts el link de la url de la api a http://localhost:3000/api




// URLs para diferentes backends
const REAL_API_URL = import.meta.env.VITE_API_URL; // Para login y datos de usuario
const LOCAL_API_URL = 'http://localhost:3000/api'; // Para operaciones simuladas

// Configuración del interceptor para incluir el token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (userData: any) => {
    const response = await axios.post(
      `${REAL_API_URL}/accounts/register`,
      userData
    );
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await axios.post(`${REAL_API_URL}/accounts/login`, {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  changePassword: async (passwordData: any) => {
    const response = await axios.post(
      `${REAL_API_URL}/accounts/change-password`,
      passwordData
    );
    return response.data;
  },

  getUserInfo: async (userId: string) => {
    const response = await axios.get(
      `${REAL_API_URL}/accounts/accountinfo/${userId}`
    );
    return response.data;
  },

  inviteEvaluator: async (evaluatorData: any) => {
    const response = await axios.post(
      `${REAL_API_URL}/accounts/invite-evaluator`,
      evaluatorData
    );
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export const contributionService = {
  getAll: async (): Promise<ContributionSummary[]> => {
    const response = await axios.get(`${LOCAL_API_URL}/contributions`);
    return response.data;
  },

  getById: async (id: string): Promise<ContributionSummary> => {
    const response = await axios.get(`${LOCAL_API_URL}/contributions/${id}`);
    return response.data;
  },

  create: async (data: ContributionSummary) => {
    const response = await axios.post(`${LOCAL_API_URL}/contributions`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<ContributionSummary>) => {
    const response = await axios.put(
      `${LOCAL_API_URL}/contributions/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${LOCAL_API_URL}/contributions/${id}`);
    return response.data;
  },
};

export const evaluationService = {
  getEvaluations: async (contributionId: string) => {
    const response = await axios.get(
      `${LOCAL_API_URL}/evaluations/contribution/${contributionId}`
    );
    return response.data;
  },

  create: async (data: Evaluation) => {
    const response = await axios.post(`${LOCAL_API_URL}/evaluations`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Evaluation>) => {
    const response = await axios.put(
      `${LOCAL_API_URL}/evaluations/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${LOCAL_API_URL}/evaluations/${id}`);
    return response.data;
  },
};

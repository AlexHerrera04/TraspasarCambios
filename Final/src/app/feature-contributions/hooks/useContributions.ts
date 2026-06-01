import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { contributionService } from '../services/api.service';
import {
  ContributionResponse,
  ContributionSummary,
  Contribution,
} from '../types';
import {
  getContribution,
  getContributions,
} from '../services/contributionsService';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../core/api/apiProvider';

// Datos simulados para desarrollo
const mockContributions: ContributionSummary[] = [
  {
    id: '1',
    title: 'Sistema de Inventarios en Tiempo Real',
    description:
      'Desarrollo e implementación de un sistema automatizado para control de inventarios en tiempo real',
    category: 'Innovación Tecnológica',
    start_date: '2024-01-15',
    end_date: '2024-03-30',
    project_leader: {
      name: 'Ana Martínez',
      area: 'Tecnología',
      email: 'ana.martinez@empresa.com',
    },
    team_members: 'Carlos López, Diana Ruiz, Fernando Torres',
    impacted_areas: 'Logística, Almacén, Compras',
    status: 'EN PROGRESO',
    business_problem: 'Control manual de inventarios propenso a errores',
    technical_approach: 'Desarrollo de sistema web con React y Node.js',
    business_benefit: 'Reducción de errores en inventario',
    kpi_metric: 'Precisión de inventario',
    kpi_unit: '%',
    kpi_value: '98',
    skills: ['React', 'Node.js', 'SQL'],
    highlighted_content: ['Documentación técnica', 'Manual de usuario'],
    contribution_percentage: 40,
    evaluations: [],
  },
  {
    id: '2',
    title: 'Optimización de Procesos de Ventas',
    description: 'Implementación de mejoras en el proceso de ventas',
    category: 'Mejora de Procesos',
    start_date: '2024-02-01',
    end_date: '2024-04-15',
    project_leader: {
      name: 'Roberto Gómez',
      area: 'Ventas',
      email: 'roberto.gomez@empresa.com',
    },
    team_members: 'María Sánchez, Juan Pérez',
    impacted_areas: 'Ventas, Marketing',
    status: 'COMPLETADO',
    business_problem: 'Proceso de ventas ineficiente',
    technical_approach: 'Implementación de CRM y automatización',
    business_benefit: 'Aumento en ventas',
    kpi_metric: 'Incremento en ventas',
    kpi_unit: '%',
    kpi_value: '25',
    skills: ['CRM', 'Automatización', 'Análisis de datos'],
    highlighted_content: ['Reporte de resultados', 'Guía de implementación'],
    contribution_percentage: 60,
    evaluations: [
      {
        evaluator_name: 'Carlos Rodríguez',
        feedback: 'Excelente implementación y resultados',
      },
    ],
  },
];

export const useContributions = () => {
  const [data, setData] = useState<ContributionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulamos una llamada a la API con un pequeño retraso
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulamos el tiempo de respuesta de una API real
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(mockContributions);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

export const useContribution = () => {
  const { id } = useParams();
  return useQuery<Contribution>({
    queryKey: ['contribution', id],
    queryFn: async () => {
      const { data } = await api.get(`${import.meta.env.VITE_API_URL}/contributor/contributions/${id}`)
      return data
    },
    enabled: !!id,
  });
};

// queryFn: async () => {
//   const { data } = await api.get(`${import.meta.env.VITE_API_URL}/reports`)
//   return data
// }

export const useCreateContribution = () => {
  const queryClient = useQueryClient();

  return useMutation<ContributionResponse, Error, ContributionSummary>({
    mutationFn: contributionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      toast.success('Contribución creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al crear la contribución'
      );
    },
  });
};

export const useUpdateContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contribution: Contribution) => {
      const response = await axiosInstance.put(
        `/contributions/${contribution.id}`,
        contribution
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
    },
  });
};

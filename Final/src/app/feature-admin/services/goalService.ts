import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Quiz,
  Content,
  QuizResult,
  QuizSubmission,
  GoalStatus,
  GoalPriority,
} from '../types/goals';

// Removemos la interfaz Goal duplicada y usamos la de types/goals
import type { Goal } from '../types/goals';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';

// Servicios para Goals
export const getGoals = async (): Promise<Goal[]> => {
  const response = await api.get(`${import.meta.env.VITE_API_URL}/goals/`);
  return response.data;
};

// Primero definimos la interfaz exactamente como la API espera
export interface CreateGoalRequest {
  user: number;
  name: string;
  expiration_date: string;
  content: number;
  priority: GoalPriority;
  status?: GoalStatus;
  quiz_id?: string;
}

interface AssignGoalRequest {
  goal_id: number;
  user_id: number;
  expiration_date: string;
}

const goalAPI = {
  createGoal: async (data: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token available');

    try {
      // Crear una meta para cada usuario
      const results = await Promise.all(
        data.users.map(async (userId: number) => {
          const goalData = {
            user: userId,
            name: data.name,
            expiration_date: data.expiration_date,
            content: data.content,
            priority: data.priority,
          };

          const response = await api.post(
            `${import.meta.env.VITE_API_URL}/goals/create/`,
            goalData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          return response.data;
        })
      );

      return results;
    } catch (error: any) {
      console.error('Error creating goals:', error);
      throw error;
    }
  },

  async assignGoal(data: AssignGoalRequest) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `${import.meta.env.VITE_API_URL}/goals/assign/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Error al asignar la meta';
      toast.error(message);
      throw error;
    }
  },
};

export const createGoalAPI = async (goalData: Partial<Goal>): Promise<Goal> => {
  try {
    const { data } = await api.post<Goal>(
      `${import.meta.env.VITE_API_URL}/goals/create/`,
      goalData
    );
    return data;
  } catch (error) {
    console.error('Error in createGoalAPI:', error);
    throw error;
  }
};

export const updateGoalAPI = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Goal>;
}): Promise<Goal> => {
  const { data: responseData } = await api.put<Goal>(
    `${import.meta.env.VITE_API_URL}/goals/${id}`,
    data
  );
  return responseData;
};

export const deleteGoalAPI = async (id: string): Promise<void> => {
  await api.delete(`${import.meta.env.VITE_API_URL}/goals/${id}`);
};

// Servicios para Contents
export const getContents = async () => {
  try {
    const { data } = await api.get<Content[]>(
      `${import.meta.env.VITE_API_URL}/contents/`
    );
    return data;
  } catch (error) {
    console.error('Error fetching contents:', error);
    return [];
  }
};

// Servicios para Quizzes
export const getQuizzes = async (contentId: string | null): Promise<Quiz[]> => {
  if (!contentId) return [];
  try {
    const { data } = await api.get<Quiz>(
      `${import.meta.env.VITE_API_URL}/goals/quiz/${contentId}/`
    );
    return [data];
  } catch (error) {
    if ((error as any)?.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

// Obtener todos los quizzes (para assessment)
export const getAllQuizzes = async (): Promise<Quiz[]> => {
  try {
    const { data } = await api.get<Quiz[]>(
      `${import.meta.env.VITE_API_URL}/goals/quizzes/`
    );
    return data;
  } catch (error) {
    console.error('Error fetching all quizzes:', error);
    return [];
  }
};

// React Query Hooks
export const useGoals = () => {
  return useQuery({
    queryKey: ['goalsManager'],
    queryFn: async () => {
      const response = await api.get(
        `${import.meta.env.VITE_API_URL}/goals/manager`
      );
      return response.data.map((goal: Goal) => ({
        ...goal,
        hasQuiz: !!goal.quiz_id,
        quiz_completed: !!goal.quiz_completed,
        type: goal.content_type == 'quiz' ? 'assessment' : 'content',
      }));
    },
    staleTime: 30000,
  });
};

export const useContents = () => {
  return useQuery<Content[], Error>({
    queryKey: ['contents'],
    queryFn: getContents,
  });
};

export const useQuizzes = (contentId: string | null) => {
  return useQuery<Quiz[], Error>({
    queryKey: ['quizzes', contentId],
    queryFn: () => getQuizzes(contentId),
    enabled: !!contentId,
  });
};

export const useAllQuizzes = () => {
  return useQuery<Quiz[]>(['allQuizzes'], getAllQuizzes);
};

export const createGoal = async (data: CreateGoalRequest) => {
  try {
    const response = await api.post(`${import.meta.env.VITE_API_URL}/goals/`, {
      ...data,
      hasQuiz: !!data.quiz_id, // Asegurarnos de que hasQuiz se guarde correctamente
    });
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGoalRequest) => {
      try {
        const response = await api.post(
          `${import.meta.env.VITE_API_URL}/goals/create/`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error detallado:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalsManager'] });
    },
    onError: (error: any) => {
      console.error('Error creating goal:', error);
      toast.error('Error al crear la meta');
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGoalAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalsManager'] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoalAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalsManager'] });
    },
  });
};

export const useQuiz = (contentId: string) => {
  return useQuery<Quiz>(
    ['quiz', contentId],
    async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/goals/quiz/${contentId}/`
      );
      return data;
    },
    {
      enabled: !!contentId,
    }
  );
};

export const submitQuizAPI = async (
  quizId: string,
  answers: QuizSubmission
) => {
  try {
    const { data } = await api.post<QuizResult>(
      `${import.meta.env.VITE_API_URL}/goals/quiz/submit/${quizId}/`,
      { answers }
    );
    return data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

export const useSubmitQuiz = () => {
  return useMutation({
    mutationFn: ({
      quizId,
      answers,
    }: {
      quizId: string;
      answers: QuizSubmission;
    }) => submitQuizAPI(quizId, answers),
    onError: (error) => {
      console.error('Error in useSubmitQuiz:', error);
    },
  });
};

export const useUpdateGoalStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, status }: { goalId: string; status: GoalStatus }) =>
      updateGoalStatus(goalId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalsManager'] });
    },
  });
};

export const updateGoalStatus = async (
  goalId: string,
  status: GoalStatus
): Promise<Goal> => {
  const { data } = await api.patch<Goal>(
    `${import.meta.env.VITE_API_URL}/goals/update/${goalId}/`,
    { status }
  );
  return data;
};

export const useAssignGoal = () => {
  return useMutation(goalAPI.assignGoal, {
    onSuccess: () => {
      toast.success('Meta asignada exitosamente');
    },
  });
};

export const getGoalDetails = async (id: number): Promise<Goal> => {
  const response = await api.get(
    `${import.meta.env.VITE_API_URL}/goals/${id}/`
  );
  return response.data;
};

export const useGoalDetails = (id: number) => {
  return useQuery(['goal', id], () => getGoalDetails(id));
};

export const updateGoal = async (
  id: number,
  data: Partial<CreateGoalRequest>
): Promise<Goal> => {
  const response = await api.patch(
    `${import.meta.env.VITE_API_URL}/goals/${id}/`,
    data
  );
  return response.data;
};

export const deleteGoal = async (id: number): Promise<void> => {
  await api.delete(`${import.meta.env.VITE_API_URL}/goals/${id}/`);
};

export const assignGoal = async (data: {
  goal_id: number;
  user_id: number;
  expiration_date: string;
}): Promise<Goal> => {
  const response = await api.post(
    `${import.meta.env.VITE_API_URL}/goals/assign/`,
    data
  );
  return response.data;
};

export const updateGoalQuizStatus = async (
  goalId: number,
  completed: boolean
) => {
  try {
    const response = await api.patch(
      `${import.meta.env.VITE_API_URL}/goals/${goalId}/quiz-status/`,
      {
        quiz_completed: completed,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating quiz status:', error);
    throw error;
  }
};

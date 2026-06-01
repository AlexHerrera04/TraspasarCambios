import api from 'src/app/core/api/apiProvider';
import { useQuery } from '@tanstack/react-query';

// Función base para verificar quiz
export const checkContentQuiz = async (contentId: number) => {
  try {
    const { data } = await api.get(
      `${import.meta.env.VITE_API_URL}/goals/quiz/${contentId}/`
    );

    // La respuesta debería tener quiz_id y content_id
    return {
      hasQuiz: data && data.quiz_id !== 0, // Verificamos si hay un quiz_id válido
      quizData: {
        quiz_id: data?.quiz_id || 0,
        content_id: contentId,
        questions: data?.questions || []
      }
    };
  } catch (error) {
    console.error('Error checking content quiz:', error);
    return {
      hasQuiz: false,
      quizData: {
        quiz_id: 0,
        content_id: contentId,
        questions: []
      }
    };
  }
};

// Hook de React Query para verificar quiz
export const useContentQuiz = (contentId: number) => {
  return useQuery({
    queryKey: ['contentQuiz', contentId],
    queryFn: () => checkContentQuiz(contentId),
    enabled: !!contentId,
    staleTime: 30000,
    retry: 1,
    onError: (error) => {
      console.error('Error fetching quiz:', error);
    },
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { evaluationService } from '../services/api.service';
import { getEvaluations } from '../services/evaluationsService';
import { Evaluation } from '../types';
import api from 'src/app/core/api/apiProvider';

export const useEvaluations = (contributionId: string) => {
  return useQuery({
    queryKey: ['evaluations', contributionId],
    queryFn: () => evaluationService.getEvaluations(contributionId),
    enabled: !!contributionId,
  });
};

export const useCreateEvaluation = (feedbackToken: string) => {
  return useMutation({
    mutationFn: async (data: {
      contributionId: string;
      benefits: any[];
      evidences: any[];
      generalFeedback: string;
    }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token available');
      }

      const transformedBenefits = data.benefits.map(benefit => {
        const { id, ...rest } = benefit;
        return {
          ...rest,
          business_benefit: id,
        };
      });

      const transformedEvidence = data.evidences.map(evidence => {
        const { id, ...rest } = evidence;
        return {
          ...rest,
          evidence: id,
        };
      });
      const apiData = {
        contribution_id: data.contributionId,
        business_benefit_feedbacks: transformedBenefits,
        evidence_feedbacks: transformedEvidence,
        general_feedback: data.generalFeedback,
        general_contribution_percentage: 0
      };
      const response = await api.post(
        `${import.meta.env.VITE_API_URL}/contributor/feedback/${feedbackToken}/`,
        apiData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Error al crear la evaluación';
      toast.error(message);
      throw error;
    },
  });
};

export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      evaluationService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['evaluations', variables.data.contributionId],
      });
      toast.success('Evaluación actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al actualizar la evaluación'
      );
    },
  });
};

import { axiosInstance } from '@/app/core/services/axios.service';

export const getEvaluations = async (contributionId: string) => {
  const response = await axiosInstance.get(
    `/contributions/${contributionId}/evaluations`
  );
  return response.data;
};

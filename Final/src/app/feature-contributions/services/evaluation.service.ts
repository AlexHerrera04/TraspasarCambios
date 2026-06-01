import { Evaluation } from '../types';

export const createEvaluation = async (
  data: Omit<Evaluation, 'id'>
): Promise<Evaluation> => {
  // TODO: Implement the actual API call
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
  return {
    id: Math.random().toString(36).substr(2, 9),
    ...data,
  };
};

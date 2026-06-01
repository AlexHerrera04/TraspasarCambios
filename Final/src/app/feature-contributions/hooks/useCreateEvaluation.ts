import { useState } from 'react';
import { Evaluation } from '../types';
import { createEvaluation } from '../services/evaluation.service';

export const useCreateEvaluation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: Omit<Evaluation, 'id'>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await createEvaluation(data);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to create evaluation')
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    create,
    isLoading,
    error,
  };
};

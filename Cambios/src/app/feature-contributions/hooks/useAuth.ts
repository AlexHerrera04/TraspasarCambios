import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { authService } from '../services/api.service';

interface LoginCredentials {
  email: string;
  password: string;
}

interface EvaluatorData {
  name: string;
  lastname: string;
  position: string;
  area: string;
  email: string;
  contributionId: string;
  password: string;
}

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    },
  });
};

export const useInviteEvaluator = () => {
  return useMutation({
    mutationFn: (evaluator: EvaluatorData) =>
      authService.inviteEvaluator(evaluator),
    onSuccess: () => {
      toast.success('Evaluador invitado exitosamente');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al invitar evaluador'
      );
    },
  });
};

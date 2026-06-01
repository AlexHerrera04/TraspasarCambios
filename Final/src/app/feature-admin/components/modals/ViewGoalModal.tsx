import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  IconButton,
  Chip,
} from '@material-tailwind/react';
import {
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Goal } from '../../types/goals';
import { useUser } from '../../services/userService';
import { checkContentQuiz } from '../../services/quizService';

interface ViewGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: Goal;
}

export const ViewGoalModal: React.FC<ViewGoalModalProps> = ({
  open,
  onClose,
  goal,
}) => {
  const { data: userData } = useUser(goal.user);
  const [hasQuiz, setHasQuiz] = useState(false);

  useEffect(() => {
    const checkQuiz = async () => {
      if (goal.content) {
        try {
          const { hasQuiz } = await checkContentQuiz(goal.content);
          setHasQuiz(hasQuiz);
        } catch (error) {
          console.error('Error checking quiz:', error);
          setHasQuiz(false);
        }
      }
    };
    
    checkQuiz();
  }, [goal.content]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const getStatusColor = (status: string, expirationDate: string) => {
    const isExpired = new Date(expirationDate) < new Date() && status === 'pending';
    
    if (isExpired) {
      return 'bg-danger-600 text-white';
    }

    switch (status.toLowerCase()) {
      case 'done':
        return 'bg-success-500 text-white';
      case 'pending':
        return 'bg-warning-600 text-black';
      case 'expired':
        return 'bg-danger-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getUserDisplay = () => {
    if (!goal.user) return 'Sin asignar';
    if (!userData) return 'Cargando...';
    return userData.first_name && userData.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData.username || `Usuario #${goal.user}`;
  };

  const getStatusText = (status: string, expirationDate: string) => {
    const isExpired = new Date(expirationDate) < new Date() && status === 'pending';
    
    if (isExpired) {
      return 'Expirado';
    }

    switch (status) {
      case 'done':
        return 'Completada / Accedida';
      case 'ongoing':
        return 'En curso';
      case 'pending':
        return 'Pendiente';
      case 'expired':
        return 'Expirado';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const getContentType = (type: string) => {
    return type === 'quiz' ? 'Assessment' : 'Contenido';
  };

  return (
    <Dialog
      open={open}
      className="bg-gray-900 text-white max-w-[600px] rounded-xl"
      handler={onClose}
    >
      <DialogHeader className="flex justify-between items-start border-b border-gray-700 px-6 py-4">
        <div>
          <Typography variant="small" className="text-gray-400 mb-1">
            Nombre de la Meta
          </Typography>
          <Typography className="text-2xl font-bold text-white">
            {goal.name}
          </Typography>
        </div>
        <IconButton
          variant="text"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-gray-800/50 p-4 rounded-lg flex items-center gap-3">
            <UserCircleIcon className="h-12 w-12 text-blue-500" />
            <div>
              <Typography variant="small" className="text-gray-400">
                Usuario Asignado
              </Typography>
              <Typography className="text-lg font-medium text-white">
                {getUserDisplay()}
              </Typography>
              {userData && userData.email && (
                <Typography variant="small" className="text-gray-400">
                  {userData.email}
                </Typography>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <Typography variant="small" className="text-gray-400">
                Fecha de Creación
              </Typography>
              <Typography className="text-white">
                {formatDate(goal.create_date)}
              </Typography>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <Typography variant="small" className="text-gray-400">
                Fecha de Expiración
              </Typography>
              <Typography className="text-white">
                {formatDate(goal.expiration_date)}
              </Typography>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-2">
              Estado
            </Typography>
            <Chip
              size="lg"
              value={getStatusText(goal.status, goal.expiration_date)}
              className={getStatusColor(goal.status, goal.expiration_date)}
            />
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-2">
              Estado del Quiz
            </Typography>
            <Chip
              size="lg"
              value={hasQuiz ? (goal.quiz_completed ? 'Completado' : 'Pendiente') : 'No Aplica Quiz'}
              className={
                !hasQuiz
                  ? 'bg-gray-500 text-white'
                  : goal.quiz_completed
                  ? 'bg-success-500 text-white'
                  : 'bg-warning-600 text-black'
              }
            />
          </div>

          <div className="col-span-2 bg-gray-800/50 p-4 rounded-lg flex items-center gap-3">
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            <div>
              <Typography variant="small" className="text-gray-400">
                Tipo
              </Typography>
              <Typography className="text-lg font-medium text-white">
                {getContentType(goal.type)}
              </Typography>
            </div>
          </div>

          <div className="col-span-2 bg-gray-800/50 p-4 rounded-lg flex items-center gap-3">
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            <div>
              <Typography variant="small" className="text-gray-400">
                Contenido Asignado
              </Typography>
              <Typography className="text-lg font-medium text-white">
                {goal.content_name || `Contenido #${goal.content}`}
              </Typography>
            </div>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
};

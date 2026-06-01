import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@material-tailwind/react';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Goal, GoalStatus } from '../types/goals';
import { useGoals } from '../services/goalService';
import { useNavigate } from 'react-router-dom';
import { ViewGoalModal } from './modals/ViewGoalModal';
import { useUsers } from '../services/userService';
import { User } from 'src/app/feature-admin/types/user'


interface GoalsProps {
  searchTerm: string;
  onDelete?: (id: string) => void;
  onEdit?: (goal: Goal) => void;
}

const TABLE_HEAD = [
  'ID',
  'Nombre Meta',
  'Usuario',
  'Estado',
  'Prioridad',
  'Fecha Creación',
  'Fecha Limite',
  'Quiz Completado',
  'Acciones',
];

const getPriorityStyle = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-transparent text-white';
    case 'medium':
      return 'bg-transparent text-white';
    case 'low':
      return 'bg-transparent text-white';
    default:
      return 'bg-transparent text-white';
  }
};

const getStatusColor = (status: string, expirationDate: string) => {
  // Verificar si está expirada
  const isExpired =
    new Date(expirationDate) < new Date() && status === 'pending';

  if (isExpired) {
    return 'bg-danger-600 text-white text-shadow-lg'; // Rojo para expirado
  }

  switch (status) {
    case 'done':
      return 'bg-success-500 text-white text-shadow-lg'; // Verde para completado
    case 'pending':
      return 'bg-warning-600 text-black'; // Amarillo para pendiente
    case 'expired':
      return 'bg-danger-600 text-white text-shadow-lg'; // Rojo para expirado
    default:
      return 'bg-gray-500 text-white text-shadow-lg';
  }
};

const getQuizStatusStyle = (hasQuiz: boolean, completed: boolean, type: string) => {
  // Si es tipo assessment, siempre debe mostrar que tiene quiz
  if (type === 'assessment') {
    return completed 
      ? 'bg-success-500 text-white'  // Quiz completado
      : 'bg-warning-600 text-black'; // Quiz pendiente
  }

  // Para contenido normal
  if (!hasQuiz) {
    return 'bg-gray-500 text-white'; // No aplica quiz
  }
  return completed 
    ? 'bg-success-500 text-white'  // Quiz completado
    : 'bg-warning-600 text-black'; // Quiz pendiente
};

const getQuizStatusText = (hasQuiz: boolean, completed: boolean, type: string) => {
  // Si es tipo assessment, siempre debe mostrar estado del quiz
  if (type === 'assessment') {
    return completed ? 'COMPLETADO' : 'PENDIENTE';
  }

  // Para contenido normal
  if (!hasQuiz) {
    return 'NO APLICA QUIZ';
  }
  return completed ? 'COMPLETADO' : 'PENDIENTE';
};

const getStatusText = (status: string, expirationDate: string) => {
  // Verificar si está expirada
  const isExpired =
    new Date(expirationDate) < new Date() && status === 'pending';

  if (isExpired) {
    return 'Vencida';
  }

  switch (status) {
    case 'done':
      return 'Completada';
    case 'ongoing':
      return 'En curso';
    case 'pending':
      return 'Pendiente';
    case 'expired':
      return 'Vencida';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
};

const StatusBadge = ({ status }: { status: GoalStatus }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'done':
        return 'bg-green-500/20 text-green-500 text-shadow-lg';
      case 'pending':
        return 'bg-warning-600 text-amber-600 text-shadow-lg';
      case 'expired':
        return 'bg-red-500/20 text-red-500 text-shadow-lg';
      default:
        return 'bg-gray-500/20 text-gray-500 text-shadow-lg';
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

// Opción 1: Función auxiliar
const formatPriorityText = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Media';
    case 'low':
      return 'Baja';
    default:
      return priority;
  }
};

export const GoalsTable: React.FC<GoalsProps> = ({ searchTerm }) => {
  const navigate = useNavigate();
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

   // Función para obtener el email del usuario
   const getUserEmail = (user: any) => {
    const user_found = users.find(u => u.id === user);
    return user_found?.email || 'No disponible';
  };

  const handleAssignUsers = (goalId: number) => {
    navigate(`/admin/goals/assign?goalId=${goalId}`);
  };

  // Filtrar las metas según el término de búsqueda
  const filteredGoals = useMemo(() => {
    return goals.filter((goal: Goal) =>
      goal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [goals, searchTerm]);

  const handleViewGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setViewModalOpen(true);
  };

  if (goalsLoading || usersLoading) {
    return (
      <div className="text-center p-4">
        Cargando metas
      </div>
    );
  }

  return (
    <div className="mx-8 my-4">
      <Card className="h-full w-full  bg-gray-800">
        <CardBody className="overflow-x-auto px-0">
          <table className="w-full min-w-max table-auto text-center">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b  border-blue-gray-100 bg-gray-700 p-4"
                  >
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal leading-none opacity-70 text-center"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredGoals.map((goal: Goal) => (
                <tr key={goal.id} className="border-b border-blue-gray-50">
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal text-center"
                    >
                      {goal.id}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal text-center"
                    >
                      {goal.name}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal text-center"
                    >
                      {getUserEmail(goal.user)}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Chip
                      size="sm"
                      variant="filled"
                      className={getStatusColor(
                        goal.status,
                        goal.expiration_date
                      )}
                      value={getStatusText(goal.status, goal.expiration_date)}
                    />
                  </td>
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal text-center"
                    >
                      {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal text-center"
                    >
                      {new Date(goal.create_date).toLocaleDateString()}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal text-center"
                    >
                      {new Date(goal.expiration_date).toLocaleDateString()}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Chip
                      size="sm"
                      variant="filled"
                      className={getQuizStatusStyle(
                        !!goal.quiz_id, 
                        goal.quiz_completed, 
                        goal.type || 'content'
                      )}
                      value={getQuizStatusText(
                        !!goal.quiz_id, 
                        goal.quiz_completed, 
                        goal.type || 'content'
                      )}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Tooltip content="Ver detalles">
                        <IconButton
                          variant="text"
                          color="white"
                          onClick={() => handleViewGoal(goal)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {selectedGoal && (
        <ViewGoalModal
          open={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedGoal(null);
          }}
          goal={selectedGoal}
        />
      )}
    </div>
  );
};

export default GoalsTable;

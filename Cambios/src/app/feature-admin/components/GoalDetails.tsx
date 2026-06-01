import React from 'react';
import { Card, Typography } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useGoalDetails } from '../services/goalService';
import { Goal } from '../types/goals';

export const GoalDetails: React.FC<{ id: number; onClose?: () => void }> = ({
  id,
  onClose,
}) => {
  const { data: goal, isError, isLoading } = useGoalDetails(id);

  console.log('Goal details:', goal); // Para debug

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      // Convertir la fecha a timestamp (asumiendo formato ISO)
      const timestamp = Date.parse(dateString);
      if (isNaN(timestamp)) return 'Fecha no válida';
      
      const date = new Date(timestamp);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no válida';
    }
  };

  const getUserDisplay = () => {
    if (!goal?.user) return 'Sin asignar';
    if (typeof goal.user === 'object' && goal.user.username) {
      return goal.user.username;
    }
    if (typeof goal.user === 'number') {
      return `Usuario #${goal.user}`;
    }
    return 'Sin asignar';
  };

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar los detalles</div>;
  if (!goal) return null;

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <Typography variant="h5" className="text-white">
              Detalles de la Meta
            </Typography>
          </div>
          <Typography variant="small" className="text-gray-400">
            ID: {id}
          </Typography>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <Typography variant="small" className="text-gray-400 mb-2">
            Nombre de la Meta
          </Typography>
          <div className="flex items-center justify-between">
            <Typography className="text-white text-lg">{goal.name}</Typography>
            <span
              className={`px-3 py-1 rounded text-white text-sm ${
                goal.priority === 'low'
                  ? 'bg-green-600'
                  : goal.priority === 'medium'
                  ? 'bg-yellow-600'
                  : 'bg-red-900'
              }`}
            >
              {goal.priority?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-2">
              Fecha de Creación
            </Typography>
            <Typography className="text-white">
              {formatDate(goal.create_date)}
            </Typography>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-2">
              Fecha de Expiración
            </Typography>
            <Typography className="text-white">
              {formatDate(goal.expiration_date)}
            </Typography>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-2">
              Usuario Asignado
            </Typography>
            <Typography className="text-white">
              {getUserDisplay()}
            </Typography>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-2">
              Estado
            </Typography>
            <div className="bg-gray-700 px-3 py-1 rounded text-white inline-block">
              {goal.status?.toUpperCase() || 'PENDIENTE'}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <Typography variant="small" className="text-gray-400 mb-2">
            Estado del Quiz
          </Typography>
          <div
            className={`px-3 py-1 rounded text-white inline-block ${
              goal.quiz_completed ? 'bg-green-600' : 'bg-red-900'
            }`}
          >
            {goal.quiz_completed ? 'QUIZ COMPLETADO' : 'QUIZ PENDIENTE'}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <Typography variant="small" className="text-gray-400 mb-2">
            Contenido Asignado
          </Typography>
          <Typography className="text-white">
            {goal.content_name || `Contenido #${goal.content}`}
          </Typography>
        </div>
      </div>
    </div>
  );
};

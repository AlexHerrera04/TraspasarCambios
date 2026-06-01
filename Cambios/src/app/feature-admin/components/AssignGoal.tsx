import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAssignGoal, useGoals } from '../services/goalService';
import { useGroupUsers } from '../services/userService';
import { SelectLine } from '../../ui/FormFields';
import { Button, Spinner } from '@material-tailwind/react';
import { toast } from 'react-toastify';
import { SelectGoalsForUser } from './SelectGoalsForUser';
import { User } from 'src/app/feature-admin/types/user';

const AssignGoal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const goalId = searchParams.get('goalId');
  
  const { data: goals = [] } = useGoals();
  const { data: users = [], isLoading } = useGroupUsers();
  const assignGoalMutation = useAssignGoal();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    expiration_date: ''
  });

  // Si viene userId, mostrar selector de metas
  // Si viene goalId, mostrar selector de usuarios
  const isUserContext = !!userId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId || !formData.userId || !formData.expiration_date) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      setLoading(true);
      await assignGoalMutation.mutateAsync({
        goal_id: Number(goalId),
        user_id: Number(formData.userId),
        expiration_date: formData.expiration_date
      });
      
      toast.success('Meta asignada exitosamente');
      navigate('/admin/goals');
    } catch (error) {
      console.error('Error al asignar meta:', error);
    } finally {
      setLoading(false);
    }
  };

  const userOptions = users.map((user: User) => ({
    value: user.id.toString(),
    label: user.public_name || user.username
  }));

  if (isLoading) return <div>Cargando usuarios...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl mb-6">
        {isUserContext ? 'Asignar Metas al Usuario' : 'Asignar Meta a Usuarios'}
      </h2>
      
      {isUserContext ? (
        <SelectGoalsForUser userId={Number(userId)} goals={goals} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Usuario</label>
            <SelectLine
              label=""
              name="userId"
              value={formData.userId}
              options={userOptions}
              handleChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
              handleBlur={() => {}}
              setFieldValue={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
              errors={{}}
              touched={{}}
            />
          </div>

          <div>
            <label className="block mb-2">Fecha de Expiración</label>
            <input
              type="date"
              value={formData.expiration_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              onClick={() => navigate('/admin/goals')} 
              type="button" 
              variant="text"
              color="red"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary-600"
            >
              {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Asignar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssignGoal;

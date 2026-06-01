import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from '@material-tailwind/react';
import { SelectLine } from '../../ui/FormFields';
import { Goal } from '../types/goals';
import { useAssignGoal } from '../services/goalService';
import { toast } from 'react-toastify';

interface SelectGoalsForUserProps {
  userId: number;
  goals: Goal[];
}

export const SelectGoalsForUser: React.FC<SelectGoalsForUserProps> = ({ userId, goals }) => {
  const navigate = useNavigate();
  const assignGoalMutation = useAssignGoal();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goalId: '',
    expiration_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goalId || !formData.expiration_date) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      setLoading(true);
      await assignGoalMutation.mutateAsync({
        goal_id: Number(formData.goalId),
        user_id: userId,
        expiration_date: formData.expiration_date
      });
      
      navigate('/admin/goals');
    } catch (error) {
      console.error('Error al asignar meta:', error);
    } finally {
      setLoading(false);
    }
  };

  const goalOptions = goals.map(goal => ({
    value: goal.id.toString(),
    label: goal.name
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2">Meta</label>
        <SelectLine
          label=""
          name="goalId"
          value={formData.goalId}
          options={goalOptions}
          handleChange={(value) => setFormData(prev => ({ ...prev, goalId: value }))}
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
  );
}; 
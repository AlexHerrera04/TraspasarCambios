import React from 'react';
import { Dialog } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import { Evaluator } from '../../types';

interface AddEvaluatorDialogProps {
  open: boolean;
  onClose: () => void;
  currentEvaluator: Evaluator;
  onEvaluatorChange: (field: keyof Evaluator, value: string) => void;
  onConfirm: () => void;
}

export const AddEvaluatorDialog: React.FC<AddEvaluatorDialogProps> = ({
  open,
  onClose,
  currentEvaluator,
  onEvaluatorChange,
  onConfirm,
}) => (
  <Dialog open={open} handler={onClose} className="bg-gray-800 max-w-md">
    <div className="p-6">
      <h3 className="text-xl text-white mb-4">Agregar Evaluador</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm text-gray-300">Nombre</label>
            <input
              type="text"
              maxLength={50}
              value={currentEvaluator.name}
              onChange={(e) => onEvaluatorChange('name', e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-300">Apellido</label>
            <input
              type="text"
              maxLength={50}
              value={currentEvaluator.lastname}
              onChange={(e) => onEvaluatorChange('lastname', e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">
            Cargo o rol
          </label>
          <input
            type="text"
            maxLength={50}
            value={currentEvaluator.position}
            onChange={(e) => onEvaluatorChange('position', e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">
            Área u organización
          </label>
          <input
            type="text"
            maxLength={100}
            value={currentEvaluator.area}
            onChange={(e) => onEvaluatorChange('area', e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">
            Correo electrónico
          </label>
          <input
            type="email"
            value={currentEvaluator.email}
            onChange={(e) => onEvaluatorChange('email', e.target.value)}
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            required
            title="Por favor ingrese un correo electrónico válido (ejemplo: nombre@dominio.com)"
            className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button onClick={onClose} type="button" outline>
            Cancelar
          </Button>
          <Button onClick={onConfirm} type="button" primary>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  </Dialog>
);

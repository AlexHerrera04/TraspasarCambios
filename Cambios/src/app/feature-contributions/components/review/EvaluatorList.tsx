import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import Button from 'src/app/ui/Button';

interface Evaluator {
  name: string;
  lastname: string;
  position: string;
  area: string;
  email: string;
}

interface EvaluatorListProps {
  evaluators: Evaluator[];
  onAddEvaluator: () => void;
  onDeleteEvaluator: (index: number) => void;
}

export const EvaluatorList: React.FC<EvaluatorListProps> = ({
  evaluators,
  onAddEvaluator,
  onDeleteEvaluator,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-gray-300 self-end">
            Evaluadores del proyecto
          </label>
          <Button onClick={onAddEvaluator} type="button" primary>
            Agregar Evaluador
          </Button>
        </div>

        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-white">
            <thead className="bg-gray-600">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Cargo</th>
                <th className="p-3 text-left">Área</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {evaluators.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 p-3">
                    No hay evaluadores
                  </td>
                </tr>
              ) : (
                evaluators.map((evaluator, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-600 text-base"
                  >
                    <td className="p-3">{`${evaluator.name} ${evaluator.lastname}`}</td>
                    <td className="p-3">{evaluator.position}</td>
                    <td className="p-3">{evaluator.area}</td>
                    <td className="p-3">{evaluator.email}</td>
                    <td className="p-3 pl-7 m-4 w-5">
                      <TrashIcon
                        className="w-6 h-6 cursor-pointer hover:text-red-500"
                        onClick={() => onDeleteEvaluator(index)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 
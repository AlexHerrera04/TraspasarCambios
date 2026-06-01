import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Evaluator } from '../../types';

interface EvaluatorsTableProps {
  evaluators: Evaluator[];
  onDelete: (index: number) => void;
}

export const EvaluatorsTable: React.FC<EvaluatorsTableProps> = ({
  evaluators,
  onDelete,
}) => (
  <div className="bg-[#1E293B] rounded-lg overflow-hidden">
    <table className="w-full text-white">
      <thead>
        <tr className="bg-gray-700">
          <th className="text-left p-4 text-base font-medium">Nombre</th>
          <th className="text-left p-4 text-base font-medium">Cargo</th>
          <th className="text-left p-4 text-base font-medium">Área</th>
          <th className="text-left p-4 text-base font-medium">Email</th>
          <th className="text-left p-4 text-base font-medium">Acción</th>
        </tr>
      </thead>
      <tbody>
        {evaluators.length === 0 ? (
          <tr className="bg-gray-600">
            <td colSpan={5} className="text-center py-4 text-gray-400">
              No hay evaluadores
            </td>
          </tr>
        ) : (
          evaluators.map((evaluator, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="p-4">{`${evaluator.name} ${evaluator.lastname}`}</td>
              <td className="p-4">{evaluator.position}</td>
              <td className="p-4">{evaluator.area}</td>
              <td className="p-4">{evaluator.email}</td>
              <td className="p-4">
                <button
                  onClick={() => onDelete(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

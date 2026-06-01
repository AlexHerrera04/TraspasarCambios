import React from 'react';
import { ContributionSummary } from '../types';

interface ReviewSummaryProps {
  contributionData: ContributionSummary | null;
}

type CategoryType = 'innovation' | 'training' | 'process_improvement' | 'other';

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ contributionData }) => {
  // Función para obtener el símbolo de la unidad
  const getUnitSymbol = (unit: string) => {
    switch (unit) {
      case 'percentage':
        return '%';
      case 'quantity':
        return '#';
      case 'amount':
        return '$';
      default:
        return unit;
    }
  };

  const categoryOptions: Record<CategoryType, string> = {
    innovation: 'Innovación',
    training: 'Formación', 
    process_improvement: 'Mejora de Procesos',
    other: 'Otro'
  };

  return (
    <div className="space-y-6 text-white">
      <h3 className="text-2xl font-bold">Información General</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">Título</p>
          <p>{contributionData?.general.title}</p>
        </div>
        <div>
          <p className="text-gray-400">Categoría</p>
          <p>{categoryOptions[contributionData.general.category as CategoryType]}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">Descripción</p>
          <p>{contributionData?.general.description}</p>
        </div>
        <div>
          <p className="text-gray-400">Fecha Inicio</p>
          <p>{contributionData?.general.start_date}</p>
        </div>
        <div>
          <p className="text-gray-400">Fecha Fin</p>
          <p>{contributionData?.general.end_date}</p>
        </div>
      </div>

      <h3 className="text-2xl font-bold mt-8">Impacto y Beneficios</h3>
      <div className="space-y-4">
        <div>
          <p className="text-gray-400">Problema de Negocio</p>
          <p>{contributionData?.impact.business_problem}</p>
        </div>
        <div>
          <p className="text-gray-400">Solución Técnica</p>
          <p>{contributionData?.impact.technical_approach}</p>
        </div>
        
        {/* Tabla de Beneficios */}
        <div className="mt-4">
          <p className="text-gray-400 mb-2">Beneficios e Impacto</p>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-white">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left">Beneficio</th>
                  <th className="p-3 text-left">Métrica KPI</th>
                  <th className="p-3 text-center">Impacto</th>                  
                </tr>
              </thead>
              <tbody>
                {contributionData?.impact.benefits?.map((benefit, index) => (
                  <tr key={index} className="border-t border-gray-600">
                    <td className="p-3">{benefit.benefit}</td>
                    <td className="p-3">{benefit.metric}</td>
                    <td className="p-3 text-center text-blue-400 font-bold">
                      {
                        benefit.unit !== 'percentage' ? 
                        `${getUnitSymbol(benefit.unit)}${benefit.impact_value}` : 
                        `${benefit.impact_value}${getUnitSymbol(benefit.unit)}`
                      }
                    </td>                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <br/>
      <br/>
      <h3 className="text-2xl font-bold mt-8">Competencias y Evidencias</h3>
      <div className="space-y-4">
    
        {/* Tabla de Evidencias */}
        <div className="mt-4">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-white">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left">Competencia</th>
                  <th className="p-3 text-center">% Contribución</th>
                  <th className="p-3 text-left">Capacidades</th>
                </tr>
              </thead>
              <tbody>
                {contributionData?.evidence?.evidences?.map((evidence, index) => (
                  <tr key={index} className="border-t border-gray-600">
                    <td className="p-3">{evidence.competency}</td>
                    <td className="p-3 text-center text-blue-400 font-bold">
                      {evidence.contribution_percentage}%
                    </td>
                    <td className="p-3">{evidence.capabilities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    </div>
  );
}; 
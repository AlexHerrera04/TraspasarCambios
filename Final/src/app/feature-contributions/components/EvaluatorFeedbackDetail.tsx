import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Interfaces
interface Benefit {
  name: string;
  impact: string | number;
  agreement: number;
  feedback: string;
}

interface Competency {
  name: string;
  contribution: string | number;
  agreement: number;
  feedback: string;
}

interface Evaluator {
  id: string;
  name: string;
  position: string;
  area: string;
  date: string;
  benefits: Benefit[];
  competencies: Competency[];
}

const EvaluatorFeedbackDetail: React.FC = () => {
  const { contributionId, evaluatorId } = useParams<{
    contributionId: string;
    evaluatorId: string;
  }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contribution, setContribution] = useState<any>(null);
  const [evaluator, setEvaluator] = useState<Evaluator | null>(null);

  useEffect(() => {
    // Aquí se cargarían los datos reales desde la API cuando esté disponible
    // Por ahora usamos datos de ejemplo
    setTimeout(() => {
      const mockContribution = {
        id: contributionId,
        title: 'Implementación Sistema Inteligente de Inventarios',
        description:
          'Sistema para optimizar el control y gestión de inventarios en tiempo real usando IA.',
        project_leader: {
          name: 'Carlos Rodríguez',
          area: 'Tecnología',
        },
      };

      const mockEvaluators: Evaluator[] = [
        {
          id: '1',
          name: 'Ana López',
          position: 'Gerente de Operaciones',
          area: 'Operaciones',
          date: '2024-05-10',
          benefits: [
            {
              name: 'Reducción de pérdidas por errores',
              impact: 85,
              agreement: 90,
              feedback:
                'Estoy de acuerdo con el impacto. Los resultados son evidentes en la reducción de errores de inventario.',
            },
            {
              name: 'Optimización de tiempo',
              impact: 120,
              agreement: 85,
              feedback:
                'El ahorro de tiempo es significativo, pero creo que podría optimizarse aún más con algunos ajustes en el proceso.',
            },
            {
              name: 'Incremento en eficiencia',
              impact: 40,
              agreement: 95,
              feedback:
                'Totalmente de acuerdo. La eficiencia del equipo ha mejorado notablemente desde la implementación.',
            },
          ],
          competencies: [
            {
              name: 'Desarrollo de Software',
              contribution: 80,
              agreement: 85,
              feedback:
                'Buen trabajo en el desarrollo. La arquitectura es sólida y el código está bien estructurado.',
            },
            {
              name: 'Análisis de Datos',
              contribution: 65,
              agreement: 70,
              feedback:
                'Los modelos de análisis son buenos, pero recomendaría mejorar la visualización de datos para facilitar la toma de decisiones.',
            },
          ],
        },
        {
          id: '2',
          name: 'Jorge Martínez',
          position: 'Director de Tecnología',
          area: 'IT',
          date: '2024-05-12',
          benefits: [
            {
              name: 'Reducción de pérdidas por errores',
              impact: 85,
              agreement: 80,
              feedback:
                'El impacto es positivo, aunque los datos iniciales parecen algo optimistas.',
            },
            {
              name: 'Optimización de tiempo',
              impact: 120,
              agreement: 100,
              feedback:
                'Completamente de acuerdo. El ahorro de tiempo es incluso mayor de lo estimado inicialmente.',
            },
            {
              name: 'Incremento en eficiencia',
              impact: 40,
              agreement: 50,
              feedback:
                'Parcialmente de acuerdo. La eficiencia ha mejorado, pero no al nivel proyectado.',
            },
          ],
          competencies: [
            {
              name: 'Desarrollo de Software',
              contribution: 80,
              agreement: 90,
              feedback:
                'Excelente trabajo en el desarrollo. La solución es robusta y escalable.',
            },
            {
              name: 'Análisis de Datos',
              contribution: 65,
              agreement: 85,
              feedback:
                'Buen trabajo en el análisis de datos. Los algoritmos de predicción son precisos.',
            },
          ],
        },
      ];

      setContribution(mockContribution);
      const currentEvaluator = mockEvaluators.find((e) => e.id === evaluatorId);
      setEvaluator(currentEvaluator || null);
      setLoading(false);
    }, 1000); // Simular carga de 1 segundo
  }, [contributionId, evaluatorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] p-8 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!contribution || !evaluator) {
    return (
      <div className="min-h-screen bg-[#111827] p-8 flex items-center justify-center">
        <div className="text-white text-xl">
          No se encontró la información solicitada.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/contributor/feedback/${contributionId}`)}
            className="flex items-center text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a la lista de evaluadores
          </button>
          <h1 className="text-3xl font-bold text-white">
            Feedback del Evaluador
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <p className="text-gray-400 text-sm">Contribución</p>
              <p className="text-white font-medium">{contribution.title}</p>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <p className="text-gray-400 text-sm">Evaluador</p>
              <p className="text-white font-medium">{evaluator.name}</p>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <p className="text-gray-400 text-sm">Cargo</p>
              <p className="text-white font-medium">{evaluator.position}</p>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <p className="text-gray-400 text-sm">Área</p>
              <p className="text-white font-medium">{evaluator.area}</p>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <p className="text-gray-400 text-sm">Fecha de evaluación</p>
              <p className="text-white font-medium">{evaluator.date}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Beneficios */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Beneficios del Proyecto
          </h2>
          <div className="rounded-lg overflow-hidden">
            <table className="w-full text-white">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[40%]" />
              </colgroup>
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4 text-left">Beneficio</th>
                  <th className="p-4 text-center">Impacto</th>
                  <th className="p-4 text-center bg-blue-900 border-l-2 border-blue-400">
                    Estoy de acuerdo
                  </th>
                  <th className="p-4 text-left bg-blue-900">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {evaluator.benefits.map((item, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="p-4 bg-gray-800">{item.name}</td>
                    <td className="p-4 text-center bg-gray-800">
                      {item.impact}%
                    </td>
                    <td className="p-4 bg-gray-900 border-l-2 border-blue-400 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: `${item.agreement}%` }}
                          ></div>
                        </div>
                        <span className="text-blue-400">{item.agreement}%</span>
                      </div>
                    </td>
                    <td className="p-4 bg-gray-900">
                      <div className="bg-gray-800 p-3 rounded-lg text-white text-sm">
                        {item.feedback || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Competencias */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Valoración de Competencias
          </h2>
          <div className="rounded-lg overflow-hidden">
            <table className="w-full text-white">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[40%]" />
              </colgroup>
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4 text-left">Competencia utilizada</th>
                  <th className="p-4 text-center">% Contribución</th>
                  <th className="p-4 text-center bg-blue-900 border-l-2 border-blue-400">
                    Estoy de acuerdo
                  </th>
                  <th className="p-4 text-left bg-blue-900">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {evaluator.competencies.map((item, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="p-4 bg-gray-800">{item.name}</td>
                    <td className="p-4 text-center bg-gray-800">
                      {item.contribution}%
                    </td>
                    <td className="p-4 bg-gray-900 border-l-2 border-blue-400 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: `${item.agreement}%` }}
                          ></div>
                        </div>
                        <span className="text-blue-400">{item.agreement}%</span>
                      </div>
                    </td>
                    <td className="p-4 bg-gray-900">
                      <div className="bg-gray-800 p-3 rounded-lg text-white text-sm">
                        {item.feedback || '-'}
                      </div>
                    </td>
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

export default EvaluatorFeedbackDetail;
 
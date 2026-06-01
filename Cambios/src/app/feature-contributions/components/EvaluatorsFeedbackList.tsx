import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Typography } from '@material-tailwind/react';

interface Evaluator {
  id: string;
  name: string;
  position: string;
  area: string;
  date: string;
  averageAgreement: number;
}

interface EvaluatorsFeedbackListProps {
  evaluations: any[];
  showAll: boolean;
}

export default function EvaluatorsFeedbackList({
  evaluations,
  showAll,
}: EvaluatorsFeedbackListProps) {
  const { contributionId } = useParams<{ contributionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contribution, setContribution] = useState<any>(null);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);

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
          averageAgreement: 85,
        },
        {
          id: '2',
          name: 'Jorge Martínez',
          position: 'Director de Tecnología',
          area: 'IT',
          date: '2024-05-12',
          averageAgreement: 77,
        },
        {
          id: '3',
          name: 'Sofía Ramírez',
          position: 'Gerente de Producto',
          area: 'Producto',
          date: '2024-05-15',
          averageAgreement: 92,
        },
      ];

      setContribution(mockContribution);
      setEvaluators(mockEvaluators);
      setLoading(false);
    }, 1000); // Simular carga de 1 segundo
  }, [contributionId]);

  const displayedEvaluations = showAll ? evaluations : evaluations.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] p-8 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="min-h-screen bg-[#111827] p-8 flex items-center justify-center">
        <div className="text-white text-xl">
          No se encontró la contribución solicitada.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/contributor')}
            className="flex items-center text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a mis contribuciones
          </button>
          <h1 className="text-3xl font-bold text-white mb-4">
            Feedback de Evaluadores
          </h1>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl text-white">{contribution.title}</h2>
            <p className="text-gray-400 mt-2">{contribution.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="bg-gray-700 px-3 py-1 rounded-lg text-white text-sm">
                Líder: {contribution.project_leader.name}
              </div>
              <div className="bg-gray-700 px-3 py-1 rounded-lg text-white text-sm">
                Área: {contribution.project_leader.area}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de evaluadores */}
        <div className="space-y-4">
          {displayedEvaluations.map((evaluation, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="mb-4">
                <Typography variant="h6" className="text-white">
                  {evaluation.evaluator.name}
                </Typography>
                <Typography variant="small" className="text-gray-400">
                  {evaluation.evaluator.position} - {evaluation.evaluator.area}
                </Typography>
              </div>

              <div className="space-y-6">
                {/* Beneficios */}
                <div>
                  <Typography variant="h6" className="text-white mb-2">
                    Beneficios
                  </Typography>
                  <div className="space-y-3">
                    {evaluation.benefits.map((benefit: any, idx: number) => (
                      <div key={idx} className="bg-gray-800 p-3 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <Typography variant="small" className="text-white">
                            {benefit.name}
                          </Typography>
                          <Typography
                            variant="small"
                            className={`${
                              benefit.agreement >= 80
                                ? 'text-green-500'
                                : benefit.agreement >= 60
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}
                          >
                            {benefit.agreement}% de acuerdo
                          </Typography>
                        </div>
                        {benefit.feedback && (
                          <Typography variant="small" className="text-gray-400">
                            {benefit.feedback}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competencias */}
                <div>
                  <Typography variant="h6" className="text-white mb-2">
                    Competencias
                  </Typography>
                  <div className="space-y-3">
                    {evaluation.competencies.map(
                      (competency: any, idx: number) => (
                        <div key={idx} className="bg-gray-800 p-3 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <Typography variant="small" className="text-white">
                              {competency.name}
                            </Typography>
                            <Typography
                              variant="small"
                              className={`${
                                competency.agreement >= 80
                                  ? 'text-green-500'
                                  : competency.agreement >= 60
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {competency.agreement}% de acuerdo
                            </Typography>
                          </div>
                          {competency.feedback && (
                            <Typography
                              variant="small"
                              className="text-gray-400"
                            >
                              {competency.feedback}
                            </Typography>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Feedback General */}
                {evaluation.generalFeedback && (
                  <div>
                    <Typography variant="h6" className="text-white mb-2">
                      Feedback General
                    </Typography>
                    <div className="bg-gray-800 p-3 rounded">
                      <Typography variant="small" className="text-gray-400">
                        {evaluation.generalFeedback}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

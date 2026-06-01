import React from 'react';
import { Typography } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Define types for the contribution data structure
interface Evaluator {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  area: string;
  email: string;
}

interface BusinessBenefitFeedback {
  id: number;
  business_benefit: number;
  business_benefit_metric: string;
  business_driver_name: string;
  agreement_percentage: number;
  feedback_text: string;
}

interface EvidenceFeedback {
  id: number;
  evidence: number;
  evidence_name: string;
  agreement_percentage: number;
  feedback_text: string;
}

interface Feedback {
  id: number;
  evaluator: number;
  evaluator_name: string;
  general_contribution_percentage: number;
  general_feedback: string;
  submitted_at: string;
  business_benefit_feedbacks: BusinessBenefitFeedback[];
  evidence_feedbacks: EvidenceFeedback[];
}

interface BusinessBenefit {
  id: number;
  business_driver: number;
  business_driver_name: string;
  metric: string;
  unit: string;
  impact_value: string;
  contribution: number;
}

interface Evidence {
  id: number;
  capacity: number;
  capacity_name: string;
  content: number;
  contribution_percentage: number;
}

interface Contribution {
  id: number;
  user: number;
  project_name: string;
  description: string;
  category: string;
  start_date: string;
  estimated_end_date: string;
  project_leader_name: string;
  project_leader_last_name: string | null;
  project_leader_area: string;
  project_leader_email: string;
  team_members: string;
  project_status: string;
  business_need: string;
  technical_approach: string;
  status: string;
  status_display: string;
  created_at: string;
  updated_at: string;
  business_benefits: BusinessBenefit[];
  evidences: Evidence[];
  evaluators: Evaluator[];
  feedbacks: Feedback[];
  impacted_areas?: string;
}

export const ContributionDetails: React.FC<{
  contribution: Contribution;
  onClose?: () => void;
}> = ({ contribution, onClose }) => {
  // Format evaluators as a string
  const evaluatorsString = contribution.evaluators
    .map(e => `${e.first_name} ${e.last_name}`)
    .join(', ');

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
  // Get all business benefit feedbacks and evidence feedbacks
  const allBusinessBenefitFeedbacks = contribution.feedbacks.flatMap(
    feedback => feedback.business_benefit_feedbacks.map(bbf => ({
      ...bbf,
      evaluator_name: feedback.evaluator_name
    }))
  );

  const allEvidenceFeedbacks = contribution.feedbacks.flatMap(
    feedback => feedback.evidence_feedbacks.map(ef => ({
      ...ef,
      evaluator_name: feedback.evaluator_name
    }))
  );

  // Group business benefit feedbacks by business_benefit ID
  const benefitFeedbacksByBenefitId = contribution.business_benefits.map(benefit => {
    const feedbacks = allBusinessBenefitFeedbacks.filter(
      feedback => feedback.business_benefit === benefit.id
    );
    return {
      ...benefit,
      feedbacks
    };
  });

  // Group evidence feedbacks by evidence ID
  const evidenceFeedbacksByEvidenceId = contribution.evidences.map(evidence => {
    const feedbacks = allEvidenceFeedbacks.filter(
      feedback => feedback.evidence === evidence.id
    );
    return {
      ...evidence,
      feedbacks
    };
  });

  // Calculate averages
  const calculateAverage = (percentages: number[]): number => {
    return percentages.length > 0
      ? Math.round(percentages.reduce((sum, val) => sum + val, 0) / percentages.length)
      : 0;
  };

  const promedioBeneficios = calculateAverage(
    allBusinessBenefitFeedbacks.map(feedback => feedback.agreement_percentage)
  );
  
  const promedioEvidencias = calculateAverage(
    allEvidenceFeedbacks.map(feedback => feedback.agreement_percentage)
  );

  // Get general feedback if available
  const feedbackGeneral = contribution.feedbacks.length > 0
    ? contribution.feedbacks[0].general_feedback
    : 'No hay feedback general disponible.';

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h5" className="text-white">
                Detalles de la Contribución
              </Typography>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <Typography variant="h6" className="text-white mb-4">
                Información General
              </Typography>
              <div className="space-y-2">
                <Typography className="text-white">
                  <b>Nombre del Proyecto:</b> {contribution.project_name}
                </Typography>
                <Typography className="text-white">
                  <b>Descripción:</b> {contribution.description}
                </Typography>
                <Typography className="text-white">
                  <b>Fecha ( Inicio - Fin ):</b> {contribution.start_date} -{' '}
                  {contribution.estimated_end_date}
                </Typography>
                <Typography className="text-white">
                  <b>Líder del Proyecto:</b> {contribution.project_leader_name}{' '}
                  {contribution.project_leader_last_name}
                </Typography>
                <Typography className="text-white">
                  <b>Estado Actual:</b> {contribution.status_display}
                </Typography>
                <Typography className="text-white">
                  <b>Áreas Impactadas:</b> {contribution.impacted_areas || contribution.project_leader_area}
                </Typography>
                <Typography className="text-white">
                  <b>Evaluadores:</b> {evaluatorsString}
                </Typography>
                <Typography className="text-white">
                  <b>Problema / Necesidad:</b> {contribution.business_need}
                </Typography>
                <Typography className="text-white">
                  <b>Enfoque Técnico:</b> {contribution.technical_approach}
                </Typography>
              </div>
            </div>

            {/* Tabla de Beneficios */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <Typography variant="h6" className="text-white mb-2">
                Beneficios
              </Typography>
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full text-white">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-left">Beneficio</th>
                      <th className="p-3 text-left">Evaluador</th>
                      <th className="p-3 text-center">% Estoy de Acuerdo</th>
                      <th className="p-3 text-left">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benefitFeedbacksByBenefitId.map((benefit) =>
                      benefit.feedbacks.length > 0 ? (
                        benefit.feedbacks.map((feedback, j) => (
                          <tr
                            key={`benefit-${benefit.id}-${j}`}
                            className="border-t border-gray-600"
                          >
                            {j === 0 && (
                              <td
                                className="p-3 bg-gray-800 font-semibold"
                                rowSpan={benefit.feedbacks.length}
                              >
                                {benefit.business_driver_name} ({benefit.metric} {benefit.impact_value} {getUnitSymbol(benefit.unit)})
                              </td>
                            )}
                            <td className="p-3">{feedback.evaluator_name}</td>
                            <td className="p-3 text-center text-blue-400 font-bold">
                              {feedback.agreement_percentage}%
                            </td>
                            <td className="p-3">{feedback.feedback_text}</td>
                          </tr>
                        ))
                      ) : (
                        <tr key={`benefit-${benefit.id}-empty`} className="border-t border-gray-600">
                          <td className="p-3 bg-gray-800 font-semibold">
                            {benefit.business_driver_name} ({benefit.metric} {benefit.impact_value} {getUnitSymbol(benefit.unit)})
                          </td>
                          <td colSpan={3} className="p-3 text-gray-400 italic text-center">
                            No hay evaluaciones disponibles
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla de Evidencias */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <Typography variant="h6" className="text-white mb-2">
                Evidencias / Competencias
              </Typography>
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full text-white">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-left">Evidencia / Competencia</th>
                      <th className="p-3 text-left">Evaluador</th>
                      <th className="p-3 text-center">% Estoy de Acuerdo</th>
                      <th className="p-3 text-left">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceFeedbacksByEvidenceId.map((evidence) =>
                      evidence.feedbacks.length > 0 ? (
                        evidence.feedbacks.map((feedback, j) => (
                          <tr
                            key={`evidence-${evidence.id}-${j}`}
                            className="border-t border-gray-600"
                          >
                            {j === 0 && (
                              <td
                                className="p-3 bg-gray-800 font-semibold"
                                rowSpan={evidence.feedbacks.length}
                              >
                                {evidence.capacity_name} ({evidence.contribution_percentage}%)
                              </td>
                            )}
                            <td className="p-3">{feedback.evaluator_name}</td>
                            <td className="p-3 text-center text-blue-400 font-bold">
                              {feedback.agreement_percentage}%
                            </td>
                            <td className="p-3">{feedback.feedback_text}</td>
                          </tr>
                        ))
                      ) : (
                        <tr key={`evidence-${evidence.id}-empty`} className="border-t border-gray-600">
                          <td className="p-3 bg-gray-800 font-semibold">
                            {evidence.capacity_name} ({evidence.contribution_percentage}%)
                          </td>
                          <td colSpan={3} className="p-3 text-gray-400 italic text-center">
                            No hay evaluaciones disponibles
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Promedios y feedback general */}
            <div className="grid grid-cols-2 gap-4 mt-8 mb-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <Typography variant="small" className="text-gray-300">
                  Promedio Beneficios (Evaluador/es)
                </Typography>
                <Typography className="text-3xl font-bold text-blue-400">
                  {promedioBeneficios}%
                </Typography>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <Typography variant="small" className="text-gray-300">
                  Promedio Evidencias (Evaluador/es)
                </Typography>
                <Typography className="text-3xl font-bold text-blue-400">
                  {promedioEvidencias}%
                </Typography>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 mt-2">
              <Typography variant="small" className="text-gray-300 mb-2">
                Feedback general del evaluador
              </Typography>
              <Typography className="text-white italic">
                {feedbackGeneral}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

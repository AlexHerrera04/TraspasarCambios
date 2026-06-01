import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { Benefit, Evidence } from '../types';
import { useMutation } from '@tanstack/react-query';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api, { evaluatorApi } from 'src/app/core/api/apiProvider';
import {
  Dialog,
  Spinner
} from '@material-tailwind/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import Button from 'src/app/ui/Button';



// Extended interfaces for evaluation
interface BenefitWithEvaluation extends Benefit {
  agreement_percentage: number;
  feedback_text: string;
  business_driver_name?: string;
  impact_value?: string | number;
  metric?: string;
  unit?: string;
}

interface EvidenceWithEvaluation extends Evidence {
  agreement_percentage: number;
  feedback_text: string;
  unit?: string;
}

interface FormValues {
  benefits: BenefitWithEvaluation[];
  evidences: EvidenceWithEvaluation[];
}

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

// Components
const InitialModal: React.FC<{ onClose: () => void; userEmail: string }> = ({
  onClose,
  userEmail
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg max-w-[750px] w-full mx-4">
      <h3 className="text-xl font-bold text-white mb-4">
        Bienvenido a la Evaluación
      </h3>
      <div className="space-y-4 text-gray-300">
        <p className="mb-2">
          <span className="font-semibold text-blue-400">{userEmail}</span> te ha
          indicado como su evaluador y ya ha ingresado su información para tu
          revisión.
        </p>

        <div>
          <br />
          <p className="font-semibold text-lg text-white mb-2">
            Acción requerida:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Revisa las secciones de{' '}
              <span className="font-semibold text-blue-400">Beneficio</span> y{' '}
              <span className="font-semibold text-blue-400">Valoración</span>
            </li>
            <li>
              Indica tu nivel de acuerdo (0–100%) y agrega un breve comentario
              (opcional)
            </li>
            <li>
              Completa un Feedback General sobre su desempeño y oportunidades de
              mejora
            </li>
          </ul>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors mt-6"
      >
        Entendido
      </button>
    </div>
  </div>
);

const EvaluationTable: React.FC<{
  title: string;
  data: Array<BenefitWithEvaluation | EvidenceWithEvaluation>;
  type: 'benefit' | 'competency';
  onUpdate: (index: number, field: string, value: any) => void;
}> = ({ title, data, type, onUpdate }) => (
  <div className="rounded-lg overflow-hidden">
    <table className="w-full text-white">
      <colgroup>
        {type === 'benefit' ? (
          <>
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[20%]" />
            <col className="w-[40%]" />
          </>
        ) : (
          <>
            <col className="w-[25%]" />
            <col className="w-[15%]" />
            <col className="w-[20%]" />
            <col className="w-[40%]" />
          </>
        )}
      </colgroup>
      <thead className="bg-gray-700">
        <tr>
          <th className="p-4 text-left" colSpan={type === 'benefit' ? 3 : 2}>
            Datos ingresados por el Contribuidor
          </th>
          <th
            className="p-4 text-left bg-blue-900 border-l-2 border-blue-400"
            colSpan={2}
          >
            Campos a completar por el Evaluador
          </th>
        </tr>
        <tr className="border-t border-gray-600">
          <th className="p-4 text-left">
            {type === 'benefit' ? 'Beneficio' : 'Competencia utilizada'}
          </th>
          {type === 'benefit' && (
            <th className="p-4 text-left">Métrica</th>
          )}
          <th className="p-4 text-center">
            {type === 'benefit' ? 'Impacto' : '% Contribución'}
          </th>
          <th className="p-4 text-left bg-blue-900 border-l-2 border-blue-400">
            Estoy de acuerdo
          </th>
          <th className="p-4 text-left bg-blue-900">Feedback</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="border-t border-gray-700">
            <td className="p-4 bg-gray-800">
              {type === 'benefit'
                ? (item as BenefitWithEvaluation).business_driver_name || (item as Benefit).benefit
                : (item as EvidenceWithEvaluation).capacity_name}
            </td>
            {type === 'benefit' && (
              <td className="p-4 bg-gray-800">
                {(item as BenefitWithEvaluation).metric || (item as Benefit).metric}
              </td>
            )}
            <td className="p-4 text-center bg-gray-800">
              {type === 'benefit'
                ? (item as BenefitWithEvaluation).impact_value || (item as Benefit).impact
                : (item as EvidenceWithEvaluation).contribution_percentage}
              {' '}{type === 'benefit' ? getUnitSymbol((item as Benefit).unit) : getUnitSymbol((item as EvidenceWithEvaluation).unit || '')}
            </td>
            <td className="p-4 bg-gray-900 border-l-2 border-blue-400">
              <div className="flex flex-col items-start">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={item.agreement_percentage}
                  onChange={(e) =>
                    onUpdate(index, 'agreement_percentage', Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-sm mt-1 text-blue-400">
                  {item.agreement_percentage}%
                </span>
              </div>
            </td>
            <td className="p-4 bg-gray-900">
              <textarea
                value={item.feedback_text}
                onChange={(e) => onUpdate(index, 'feedback_text', e.target.value)}
                className="w-full bg-gray-800 text-white rounded p-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none hover:border-gray-500 transition-colors"
                placeholder="Agregar feedback (opcional)..."
                rows={2}
                maxLength={200}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Custom hook for evaluator contribution data that uses service account authentication
const useEvaluatorContribution = (contributionId: string | undefined) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!contributionId) return;

    const fetchContribution = async () => {
      try {
        setIsLoading(true);
        const response = await evaluatorApi.get(
          `${import.meta.env.VITE_API_URL}/contributor/contributions/${contributionId}`
        );
        setData(response.data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching contribution:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContribution();
  }, [contributionId]);

  return { data, isLoading, error };
};

// Custom hook for creating evaluation that uses service account authentication
const useEvaluatorCreateEvaluation = (feedbackToken: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutateAsync = async (data: {
    contributionId: string;
    benefits: any[];
    evidences: any[];
    generalFeedback: string;
  }) => {
    try {
      setIsLoading(true);

      const transformedBenefits = data.benefits.map(benefit => {
        const { id, ...rest } = benefit;
        return {
          ...rest,
          business_benefit: id,
        };
      });

      const transformedEvidence = data.evidences.map(evidence => {
        const { id, ...rest } = evidence;
        return {
          ...rest,
          evidence: id,
        };
      });

      const apiData = {
        contribution_id: data.contributionId,
        business_benefit_feedbacks: transformedBenefits,
        evidence_feedbacks: transformedEvidence,
        general_feedback: data.generalFeedback,
        general_contribution_percentage: 0
      };

      const response = await evaluatorApi.post(
        `${import.meta.env.VITE_API_URL}/contributor/feedback/${feedbackToken}/`,
        apiData
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear la evaluación';
      // toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading };
};

// Main Component
const EvaluationView: React.FC = () => {
  const { id: contributionId } = useParams<{ id: string }>();
  const [showInitialModal, setShowInitialModal] = useState(true);
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [searchParams] = useSearchParams();
  const feedbackToken = searchParams.get('feedback_token');
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: contributionData, isLoading } = useEvaluatorContribution(contributionId);
  const createEvaluation = useEvaluatorCreateEvaluation(feedbackToken || '');

  const getUsersInfoWithId = async (id: string): Promise<any> => {
    try {
      // Use evaluatorApi which automatically handles service account authentication
      const { data } = await evaluatorApi.get(
        `${import.meta.env.VITE_API_URL}/accounts/userinfo/${id}`
      );  
      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return {};
    }
  };

  // Call getUsersInfoWithId on mount
  useEffect(() => {
    if (contributionData?.user) {
      const fetchUserInfo = async () => {
        setIsLoadingUserInfo(true);
        try {
          const userData = await getUsersInfoWithId(contributionData.user);
          setUserInfo(userData);
        } catch (error) {
          console.error('Error fetching user info:', error);
        } finally {
          setIsLoadingUserInfo(false);
        }
      };
      fetchUserInfo();
    }
  }, [contributionData]);

  const formik = useFormik<FormValues>({
    initialValues: {
      benefits: [],
      evidences: [],
    },
    onSubmit: async (values) => {
      if (!contributionId) return;
      try {
        setIsSubmitting(true)
        await createEvaluation.mutateAsync({
          contributionId,
          benefits: values.benefits,
          evidences: values.evidences,
          generalFeedback,
        });
        setIsSubmitting(false)
        setShowSuccessModal(true)
      } catch (error) {
        setIsSubmitting(false)
        toast.error('Error al guardar la evaluación');
      }
    },
  });

  useEffect(() => {
    if (contributionData) {
      formik.setValues({
        benefits: contributionData.business_benefits.map((benefit: any) => ({
          ...benefit,
          agreement_percentage: 0,
          feedback_text: '',
        })),
        evidences: contributionData.evidences.map((evidence: any) => ({
          ...evidence,
          agreement_percentage: 0,
          feedback_text: '',
        })),
      });
    }
  }, [contributionData]);

  if (isLoading || !contributionData || isLoadingUserInfo) {
    return (
      <div className="min-h-screen bg-[#111827] p-8 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] p-8">
      {showInitialModal && userInfo && userInfo.email && (
        <InitialModal
          onClose={() => setShowInitialModal(false)}
          userEmail={userInfo.email}
        />
      )}
      <div className="max-w-7xl mx-auto">
        {/* Información General */}
        <h1 className="text-3xl font-bold text-white mb-4 ml-6">
          Evalua la Contribucion{userInfo && userInfo.first_name ? ` de ${userInfo.first_name} ${userInfo.last_name}` : ''}
        </h1>
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {contributionData.project_name}
          </h1>
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <p className="text-gray-400">Líder del Proyecto:</p>
              <p>{contributionData.project_leader_name}</p>
            </div>
            <div>
              <p className="text-gray-400">Área:</p>
              <p>{contributionData.project_leader_area}</p>
            </div>
            <div>
              <p className="text-gray-400">Categoría:</p>
              <p>{contributionData.category}</p>
            </div>
            <div>
              <p className="text-gray-400">Estado:</p>
              <p>{contributionData.status_display}</p>
            </div>
            <div>
              <p className="text-gray-400">Fecha Inicio:</p>
              <p>
                {new Date(contributionData.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Fecha Fin:</p>
              <p>{new Date(contributionData.estimated_end_date).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Rol:</p>
              <p>{contributionData.team_members}</p>
            </div>
          </div>
        </div>

        {/* Problema y Solución */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Problema y Solución
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <p className="text-gray-400">Problema de Negocio:</p>
              <p>{contributionData.business_need}</p>
            </div>
            <div>
              <p className="text-gray-400">Enfoque Técnico:</p>
              <p>{contributionData.technical_approach}</p>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Beneficios del Proyecto
          </h2>
          <EvaluationTable
            title="Beneficios"
            data={formik.values.benefits}
            type="benefit"
            onUpdate={(index, field, value) =>
              formik.setFieldValue(
                'benefits',
                formik.values.benefits.map((item, i) =>
                  i === index ? { ...item, [field]: value } : item
                )
              )
            }
          />
        </div>

        {/* Competencias */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Valoración de Competencias
          </h2>
          <EvaluationTable
            title="Competencias"
            data={formik.values.evidences}
            type="competency"
            onUpdate={(index, field, value) =>
              formik.setFieldValue(
                'evidences',
                formik.values.evidences.map((item, i) =>
                  i === index ? { ...item, [field]: value } : item
                )
              )
            }
          />
        </div>

        {/* Feedback General */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Feedback General
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              Por favor, proporciona un feedback general sobre el desempeño y
              las oportunidades de mejora:
            </p>
            <textarea
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              className="w-full h-40 bg-gray-700 text-white rounded-lg p-4 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              placeholder="Escribe aquí tu feedback general sobre el desempeño y las oportunidades de mejora identificadas..."
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => formik.handleSubmit()}
            className="flex justify-end px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isSubmitting ? (
              <Spinner className="h-4 w-4 mr-2 mt-1" />
            ) : null}
            Guardar Evaluación
          </button>
        </div>
        <Dialog
            open={showSuccessModal}
            handler={() => null}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6 text-center">
              <div className="mb-6">
                <CheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl text-white mb-2">¡Envío exitoso!</h3>
                <p className="text-gray-300">
                Tu retroalimentacion ha sido enviada correctamente, puedes cerrar esta ventana              
                </p>
              </div>
            </div>
          </Dialog>
      </div>
    </div>
  );
};

export default EvaluationView;

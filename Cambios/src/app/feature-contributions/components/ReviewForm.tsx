import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Progress,
  Typography,
  Spinner,
  Dialog,
} from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { toast } from 'react-toastify';
import { TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { isTokenExpired, useAuth } from 'src/app/auth/provider/authProvider';
import { ReviewSummary } from './review/ReviewSummary';
import { EvaluatorList } from './review/EvaluatorList';
import { AddEvaluatorModal } from './review/AddEvaluatorModal';
import { ConfirmationModal } from './review/ConfirmationModal';
import { IContribution, ReviewFormValues, DialogSize } from '../types/index';
import { contributionsService } from '../services/contributionsService';
import api from 'src/app/core/api/apiProvider';
import { persistenceService } from '../services/persistenceService';
import { mapObjectAttributes } from 'src/app/feature-contributions/utils/attributeMapper'

interface ContributionSummary {
  id: string;
  // Parte 1: Información General
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  project_leader: {
    name: string;
    area: string;
    email: string;
  };
  team_members: string;
  impacted_areas: string;
  status: string;
  enviado: boolean;

  // Parte 2: Impacto y Beneficios
  business_problem: string;
  technical_approach: string;
  // business_benefit: string;
  // kpi_metric: string;
  // kpi_unit: string;
  // kpi_value: string;

  // Parte 3: Contribución y Evidencias
  skills: string[];
  highlighted_content: string[];
  contribution_percentage: number;
}

// Datos de ejemplo para testing
const mockContribution: IContribution = {
  id: '1',
  title: 'Proyecto Example',
  description: 'Descripción del proyecto',
  category: 'Innovación',
  start_date: '2024-04-01',
  end_date: '2024-04-10',
  project_leader: {
    name: 'John Doe',
    area: 'Tecnología',
    email: 'john@example.com',
  },
  team_members: 'María, Juan, Pedro',
  impacted_areas: 'Desarrollo, QA',
  status: 'BORRADOR',
  business_problem: 'Problema de negocio ejemplo',
  technical_approach: 'Enfoque técnico ejemplo',
  benefits: [{
    benefit: 'Beneficio de negocio ejemplo',
    kpi_metric: 'Eficiencia',
    impact: '85',
    unit: '%'
  }],
  evidences: [{
    competency: 'Desarrollo',
    contribution_percentage: '75',
    capabilities: 'React, TypeScript'
  }],
  evaluators: [],
  feedback_status: 'PENDIENTE',
  createdAt: '2024-04-01',
  updatedAt: '2024-04-01'
};

const ReviewForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddEvaluatorModal, setShowAddEvaluatorModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [contributionData, setContributionData] =
    useState<ContributionSummary | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [currentEvaluator, setCurrentEvaluator] = useState({
    name: '',
    lastname: '',
    position: '',
    area: '',
    email: '',
  });
  const navigate = useNavigate();
  const [loggedUserName, setLoggedUserName] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [evaluatorToDelete, setEvaluatorToDelete] = useState<number | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSuccessDraftModal, setShowSuccessDraftModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareRecipient, setShareRecipient] = useState({ name: '', email: '' });
  const { token, setToken } = useAuth();
  const [isEvaluatorOnlyMode, setIsEvaluatorOnlyMode] = useState(false);
  const [size, setSize] = React.useState<DialogSize | null>(null);

  const formik = useFormik<ReviewFormValues>({
    initialValues: {
      evaluators: [],
    },
    validationSchema: Yup.object({
      evaluators: Yup.array().of(
        Yup.object({
          name: Yup.string().required('El nombre es requerido'),
          lastname: Yup.string().required('El apellido es requerido'),
          position: Yup.string().required('El cargo es requerido'),
          area: Yup.string().required('El área es requerida'),
          email: Yup.string()
            .email('Email inválido')
            .required('El email es requerido'),
        })
      ),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        // Enviar evaluadores al backend
        await api.post('/api/contributions/evaluators', {
          contributionId: id,
          evaluators: values.evaluators
        });
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al guardar los evaluadores');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem('contributionDraft');
    if (savedData) {
      setContributionData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
          toast.error('No hay sesión activa');
          navigate('/login');
          return;
        }

        // Obtener el ID del usuario del localStorage
        const userId = localStorage.getItem('userId') || '85'; // 85 como fallback
        const response = await api.get(
          `/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`
            }
          }
        );
        setLoggedUserName(response.data.name || 'Usuario');
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
        } else {
          setLoggedUserName('Usuario');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    // Verificar si estamos en modo solo evaluadores basado en la URL
    const isReviewMode = location.pathname.includes('/review');
    setIsEvaluatorOnlyMode(isReviewMode);

    // Cargar los datos de la contribución si tenemos un ID
    if (id) {
      const loadContributionData = async () => {
        try {
          setLoading(true);
          const data = mockContribution;
          setContributionData(data);

          // Si la contribución ya fue enviada, forzar modo solo evaluadores
          if (data.enviado) {
            setIsEvaluatorOnlyMode(true);
            setCurrentStep(4); // Ir directamente al paso de evaluadores
          }
        } catch (error) {
          console.error('Error loading contribution:', error);
          toast.error('Error al cargar los datos de la contribución');
        } finally {
          setLoading(false);
        }
      };

      loadContributionData();
    }
  }, [id, location.pathname]);

  const [showDraftModal, setShowDraftModal] = useState(false);

  const handleOpen = (value: DialogSize | null) => setSize(value);

  const handleSubmit = () => {
    if (!formik.values.evaluators || formik.values.evaluators.length === 0) {
      toast.error('Debe agregar al menos un evaluador');
      return;
    }
    // Save the current evaluators to ensure they're available during confirmation
    persistenceService.saveStepData('review', { evaluators: formik.values });
    
    // Update contribution data with evaluators
    const updatedData = {
      ...contributionData,
      review: formik.values
    };
    
    // Save to state and localStorage
    setContributionData(updatedData);
    localStorage.setItem('contributionDraft', JSON.stringify(updatedData));
    
    setCurrentStep(1);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!contributionData) return;

    try {
      setLoading(true);

      const currentToken = localStorage.getItem('token');
      if (!currentToken || isTokenExpired(currentToken)) {
        toast.error('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
        return;
      }

      // Invitar a cada evaluador usando el servicio
      
      const mappedData = mapObjectAttributes(contributionData);

      try {
        const idContribution = await contributionsService.create(mappedData)
        await contributionsService.inviteEvaluator(idContribution);
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        persistenceService.clearContributionData();
        toast.success('Evaluadores invitados exitosamente');
      } catch (error: any) {
        console.error('Error al invitar evaluadores:', error);
        
        if (error.response?.status === 401) {
          toast.error('No tienes permisos para invitar evaluadores. Por favor, verifica tus credenciales.');
        } else if (error.response?.status === 404) {
          toast.error('El servicio de invitación no está disponible en este momento.');
        } else {
          toast.error(error.response?.data?.message || 'Error al invitar evaluadores. Por favor, intenta de nuevo.');
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvaluator = () => {
    // Usar una expresión regular más simple y compatible
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(currentEvaluator.email)) {
      toast.error('Por favor ingrese un correo electrónico válido');
      return;
    }
    if (currentEvaluator.name && currentEvaluator.email) {
      formik.setValues({
        ...formik.values,
        evaluators: [...formik.values.evaluators, currentEvaluator],
      });
      setCurrentEvaluator({
        name: '',
        lastname: '',
        position: '',
        area: '',
        email: '',
      });
      setShowAddEvaluatorModal(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      
      // Save the current evaluators to ensure they're available during confirmation
      persistenceService.saveStepData('review', { evaluators: formik.values });
      
      // Update contribution data with evaluators
      const updatedData = {
        ...contributionData,
        review: formik.values
      };
            // Save to state and localStorage
      setContributionData(updatedData);
      localStorage.setItem('contributionDraft', JSON.stringify(updatedData));
      const mappedData = mapObjectAttributes(updatedData);
      try {
        await contributionsService.create(mappedData)
        setShowSuccessDraftModal(true);
        persistenceService.clearContributionData();
        toast.success('Contribucion guardada como borrador');
      } catch (error: any) {
        console.error('Error al guardar la contribucion como borrrador:', error);
          toast.error(error.response?.data?.message || 'Error al invitar evaluadores. Por favor, intenta de nuevo.');
        }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteClick = (index: number) => {
    setEvaluatorToDelete(index);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (evaluatorToDelete !== null) {
      const newEvaluators = formik.values.evaluators.filter(
        (_: ReviewFormValues['evaluators'][0], index: number) => index !== evaluatorToDelete
      );
      formik.setFieldValue('evaluators', newEvaluators);
    }
    setShowDeleteConfirmModal(false);
    setEvaluatorToDelete(null);
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    if (!isEvaluatorOnlyMode) {
      setCurrentStep(1);
    }
  };

  const handleFinalConfirm = async () => {
    try {
      await handleConfirmSubmit();
      handleCloseModal();
    } catch (error) {
      console.error('Error al enviar:', error);
    }
  };

  const handleContinueEditing = () => {
    if (!contributionData) return;

    if (contributionData.enviado) {
      setCurrentStep(4);
      navigate(`/contributor/edit/${contributionData.id}`);
    } else {
      navigate(`/contributor/create`, {
        state: {
          contributionData,
          isEditing: true,
        },
      });
    }
  };

  // Cargar evaluadores guardados al montar
  useEffect(() => {
    const savedData = persistenceService.getStepData('review');
    if (savedData && savedData.evaluators) {
      formik.setValues({ evaluators: savedData.evaluators });
    }
  }, []);

  // Guardar evaluadores automáticamente cuando cambian
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formik.dirty) {
        persistenceService.saveStepData('review', { evaluators: formik.values.evaluators });
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [formik.values.evaluators]);

  const content = (
    <div className="min-h-screen bg-[#111827] p-8">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner className="h-12 w-12" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start justify-between">
            <div className="w-full lg:w-[47%] px-7 mb-11">
              <div className="relative mb-6">
                
                {!isEvaluatorOnlyMode ? (
                  <>
                    <Typography
                      variant="h3"
                      className="text-6xl mr-4 text-center mb-6 font-bold text-white"
                    >
                      4/4
                    </Typography>
                    <Progress
                      value={99}
                      className="bg-gray-600 w-full [&_div]:bg-primary-600"
                    />
                  </>
                ) : (
                  <Typography
                    variant="h3"
                    className="text-4xl mr-4 mb-6 font-bold text-white"
                  >
                    Gestión de Evaluadores
                  </Typography>
                )}
              </div>
              <h2 className="text-4xl text-white">
                {contributionData?.enviado
                  ? 'Agregar Evaluadores'
                  : 'Evaluadores'}
              </h2>
              <p className="text-gray-400 mb-4 mt-4">
                Agrega personas que puedan validar tu contribución y aportar feedback sobre el proyecto.
              </p>
              <p className="text-gray-400 mb-2">
                <b>Nombre y Apellido:</b>
                <p className="text-gray-400">
                  Escribe el nombre completo del evaluador.
                </p>
              </p>
              <p className="text-gray-400 mb-2">
                <b>Cargo o rol:</b>
                <p className="text-gray-400">
                  Indica su posición actual en la organización.
                </p>
              </p>
              <p className="text-gray-400 mb-2">
                <b>Área u organización:</b>
                <p className="text-gray-400">
                  Especifica el departamento o empresa a la que pertenece.
                </p>
              </p>
              <p className="text-gray-400 mb-2">
                <b>Correo electrónico:</b>
                <p className="text-gray-400">
                  Asegúrate de ingresar un email válido para contacto y envío del formulario.
                </p>
              </p>
              <p className="text-gray-400 mb-2">
                Al pie de este último paso tienes 4 acciones disponibles:
              </p>
              <p className="text-gray-400 mb-2">
              <ul className="list-disc pl-5 text-gray-400">
                <li><b>Cancelar:</b> Se te preguntará si deseas descartar el formulario sin guardar.</li>
                <li><b>Volver:</b> Regresa a la pantalla anterior sin perder datos.</li>
                <li><b>Guardar como borrador:</b> Guarda el formulario en estado “Borrador” para seguir completándolo luego. Con esta acción tu contribución NO se envía a los evaludadores</li>
                <li><b>Confirmar:</b> Guarda y envía tu contribución a todos los evaluadores cargados. El estado de la contribución pasará a “Enviado”.</li>
              </ul>
            </p>
            </div>

            <div className="w-full lg:w-2/3 text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:pl-12">
              <EvaluatorList
                evaluators={formik.values.evaluators}
                onAddEvaluator={() => setShowAddEvaluatorModal(true)}
                onDeleteEvaluator={handleDeleteClick}
              />

              <div className="flex justify-evelyn gap-16 mt-6">
                
                  <Button
                    onClick={() => setShowConfirmCancel(true)}
                    type="button"
                    outline
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => navigate('/contributor/create/evidence')}
                    type="button"
                    outline
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    type="button"
                    outline
                  >
                    Guardar como borrador
                  </Button>
                
                <Button
                  onClick={handleSubmit}
                  type="button"
                  disabled={loading}
                  primary
                >
                  {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                  Confirmar
                </Button>
              </div>
            </div>
          </div>

          <ConfirmationModal
            open={showConfirmModal}
            onClose={handleCloseModal}
            currentStep={currentStep}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onConfirm={handleFinalConfirm}
          >
            {currentStep === 1 ? (
              <ReviewSummary contributionData={contributionData} />
            ) : (
              <div className="space-y-6 text-white">
                <h3 className="text-2xl font-bold">
                  {currentStep === 2 ? 'Confirmar envío a evaluadores' : 'Confirmación Final'}
                </h3>
                {currentStep === 2 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {formik.values.evaluators.map((evaluator, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-600 rounded-lg bg-gray-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="font-bold text-lg">{`${evaluator.name} ${evaluator.lastname}`}</p>
                            <p className="text-gray-400">{evaluator.position}</p>
                            <p className="text-gray-400">{evaluator.area}</p>
                            <p className="text-gray-400">{evaluator.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700 p-6 rounded-lg">
                    <p className="text-gray-300 mb-6">
                    ¿Deseas confirmar y enviar esta Contribución a {' '}
                      <span className="font-bold text-white">
                        {formik.values.evaluators.length} evaluador
                        {formik.values.evaluators.length !== 1 ? 'es' : ''}
                      </span>
                      ?
                    </p>
                    <p className="text-gray-400 text-sm">
                      <span className="text-gray-400">Importante:</span>  Esta acción no se puede deshacer.
                    </p>
                  </div>
                )}
              </div>
            )}
          </ConfirmationModal>

          <AddEvaluatorModal
            open={showAddEvaluatorModal}
            onClose={() => setShowAddEvaluatorModal(false)}
            currentEvaluator={currentEvaluator}
            onChangeEvaluator={setCurrentEvaluator}
            onConfirm={handleAddEvaluator}
          />

          <Dialog
            open={showDeleteConfirmModal}
            handler={() => setShowDeleteConfirmModal(false)}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6">
              <h3 className="text-xl text-white mb-4">Confirmar eliminación</h3>
              <p className="text-gray-300 mb-6">
                ¿Está seguro que desea eliminar este evaluador?
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  type="button"
                  outline
                >
                  Cancelar
                </Button>
                <Button onClick={handleConfirmDelete} type="button" primary>
                  Eliminar
                </Button>
              </div>
            </div>
          </Dialog>

          <Dialog
            open={showSuccessModal}
            handler={() => {
              setShowSuccessModal(false);
              navigate('/contributor');
            }}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6 text-center">
              <div className="mb-6">
                <CheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl text-white mb-2">¡Envío exitoso!</h3>
                <p className="text-gray-300">
                Tu Contribución ha sido enviada correctamente a {' '}
                  <span className="font-bold text-white">
                    {formik.values.evaluators.length} evaluador
                    {formik.values.evaluators.length !== 1 ? 'es' : ''}
                  </span>
                  
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/contributor');
                  }}
                  type="button"
                  primary
                >
                  Aceptar
                </Button>
              </div>
            </div>
          </Dialog>
          <Dialog
            open={showSuccessDraftModal}
            handler={() => {
              setShowSuccessDraftModal(false);
              navigate('/contributor');
            }}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6 text-center">
              <div className="mb-6">
                <CheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl text-white mb-2">¡Guardado exitoso!</h3>
                <p className="text-gray-300">
                Tu Contribución ha sido guardada como borrador exitosamente
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setShowSuccessDraftModal(false);
                    navigate('/contributor');
                  }}
                  type="button"
                  primary
                >
                  Aceptar
                </Button>
              </div>
            </div>
          </Dialog>
          {/* Modal de confirmación de cancelar */}
          <Dialog
            open={showConfirmCancel}
            handler={() => setShowConfirmCancel(false)}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6">
              <h3 className="text-xl text-white mb-4">¿Confirmar cancelar?</h3>
              <p className="text-gray-300 mb-6">
                Los cambios no guardados se perderán. ¿Desea continuar?
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => setShowConfirmCancel(false)}
                  type="button"
                  outline
                >
                  No, continuar editando
                </Button>
                <Button
                  onClick={() => {
                    persistenceService.clearContributionData();
                    navigate('/contributor');
                  }}
                  type="button"
                  primary
                >
                  Sí, cancelar
                </Button>
              </div>
            </div>
          </Dialog>
        </div>
      )}
    </div>
  );

  return withNavbar({ children: content });
};

export default ReviewForm;

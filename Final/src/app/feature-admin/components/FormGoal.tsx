import React, { useState, useEffect } from 'react';
import withNavbar from '../../core/handlers/withNavbar';
import { useNavigate } from 'react-router-dom';
import { Progress, Spinner, Select, Option } from '@material-tailwind/react';
import Button from 'src/app/ui/Button/index';
import { SelectContentModal } from './modals/SelectContentModal';
import { SelectUserModal } from './modals/SelectUserModal';
import { Content, GoalPriority, GoalStatus } from '../types/goals';
import { User } from '../types/user';
import { useCreateGoal, CreateGoalRequest } from '../services/goalService';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SelectLine } from '../../ui/FormFields';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Dialog as DialogComponent } from '@material-tailwind/react';
import { useMutation } from '@tanstack/react-query';
import { getContentQuiz } from '../services/contentService';
import { checkContentQuiz } from '../services/quizService';
import api from '../../core/api/apiProvider';
import { useUser } from '../../core/feature-user/provider/userProvider';

interface FormData {
  name: string;
  type: 'contenido' | 'assessment';
  content: number | null;
  content_name: string;
  priority: GoalPriority;
  users: number[];
  user_names: string[];
  hasQuiz: boolean;
  quizId: string | null;
  expiration_date: string;
}

interface SelectLineProps {
  label: string;
  name: string;
  value: any;
  options: Array<{ value: string; label: string }>;
  handleChange: (value: any) => void;
  handleBlur: () => void;
  setFieldValue: (field: string, value: any) => void;
  errors: Record<string, any>;
  touched: Record<string, any>;
  className?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface Quiz {
  quiz_id: number;
  name: string;
  questions: any[];
}

const FormGoal: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isCheckingQuiz, setIsCheckingQuiz] = useState(false);
  const [hasAssociatedQuiz, setHasAssociatedQuiz] = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const { mutateAsync: createGoal } = useCreateGoal();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'contenido',
    content: null,
    content_name: '',
    priority: 'low',
    users: [],
    user_names: [],
    hasQuiz: false,
    quizId: null,
    expiration_date: new Date().toISOString().split('T')[0],
  });

  const selectedUsersForModal: User[] = formData.users.map((id, index) => ({
    id,
    public_name: formData.user_names[index] || '',
    username: formData.user_names[index] || '',
    first_name: '',
    last_name: '',
    email: '',
    organization: '',
    type: 'expert',
    organization_level: {} as any,
  }));

  const checkAssociatedQuiz = async (contentId: number) => {
    try {
      setIsCheckingQuiz(true);
      const { hasQuiz } = await checkContentQuiz(contentId);
      setFormData((prev) => ({
        ...prev,
        hasQuiz,
      }));
    } catch (error) {
      console.error('Error checking quiz:', error);
      setFormData((prev) => ({
        ...prev,
        hasQuiz: false,
      }));
    } finally {
      setIsCheckingQuiz(false);
    }
  };

  useEffect(() => {
    if (formData.content) {
      checkAssociatedQuiz(formData.content);
    }
  }, [formData.content]);

  const handleHasQuizChange = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasQuiz: value,
      quizId: value ? prev.quizId : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const createGoalsPromises = formData.users.map((userId) => {
        const requestData: CreateGoalRequest = {
          user: userId,
          name: formData.name,
          expiration_date: formData.expiration_date,
          content: formData.content!,
          priority: formData.priority as GoalPriority,
          status: 'pending' as GoalStatus,
        };

        return createGoal(requestData);
      });

      await Promise.all(createGoalsPromises);

      toast.success(
        formData.users.length === 1
          ? 'Meta creada exitosamente'
          : `${formData.users.length} metas creadas exitosamente`
      );

      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error creating goals:', error);
      toast.error('Error al crear las metas');
    } finally {
      setLoading(false);
    }
  };

  const { userInfo } = useUser();

  const handleContentSelect = async (content: Content) => {
    try {
      setIsCheckingQuiz(true);

      const contentType = formData.type;

      setFormData((prev) => ({
        ...prev,
        content: content.id,
        content_name: content.name,
        type: contentType,
      }));

      if (contentType === 'contenido') {
        const response = await api.get(
          `${import.meta.env.VITE_API_URL}/goals/quiz/${content.id}/`
        );

        if (response.data) {
          setHasAssociatedQuiz(true);

          if (Array.isArray(response.data)) {
            setAvailableQuizzes(response.data);
          } else {
            setAvailableQuizzes([
              {
                quiz_id: response.data.quiz_id || 0,
                name: response.data.name || 'Quiz',
                questions: response.data.questions || [],
              },
            ]);
          }

          setFormData((prev) => ({
            ...prev,
            hasQuiz: true,
            quiz_id: Array.isArray(response.data)
              ? response.data[0]?.quiz_id || null
              : response.data.quiz_id || null,
          }));
        } else {
          setHasAssociatedQuiz(false);
          setAvailableQuizzes([]);
          setFormData((prev) => ({
            ...prev,
            hasQuiz: false,
            quiz_id: null,
          }));
        }
      }
    } catch (error) {
      console.error('Error checking quiz:', error);
      setHasAssociatedQuiz(false);
      setAvailableQuizzes([]);
      setFormData((prev) => ({
        ...prev,
        hasQuiz: false,
        quiz_id: null,
      }));
    } finally {
      setIsCheckingQuiz(false);
      setIsContentModalOpen(false);
    }
  };

  const handleUserSelect = (users: User[]) => {
    setFormData((prev) => ({
      ...prev,
      users: users.map((u) => u.id),
      user_names: users.map((u) => u.public_name || u.username),
    }));
    setIsUserModalOpen(false);
  };

  const getContentTypeDisplay = (type: string) => {
    if (type === 'assessment') {
      return 'Assessment';
    }
    return 'Contenido';
  };

  return withNavbar({
    children: (
      <div className="relative flex flex-col lg:flex-row items-start justify-center min-h-screen bg-gray-900 p-4 mx-auto max-w-7xl">
        <button
          onClick={() => {
            localStorage.setItem('lastTab', 'Metas');
            navigate('/admin');
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
        </button>

        <div className="w-full lg:w-1/2 px-8 mb-8 lg:mb-0">
          <Progress
            value={50}
            className="bg-gray-700 w-3/4 [&_div]:bg-primary-500 mb-6"
          />
          <h2 className="text-4xl font-bold text-white mb-4">Nueva Meta</h2>
          <p className="text-gray-400 mb-4">
            Ingresa los detalles de la nueva Meta o Tarea y asígnala a uno o más
            usuarios.
          </p>
          <p className="text-gray-400">
            Elige el tipo de Meta que deseas asociar:
          </p>
          <p className="text-gray-400">
            1. "Asociado a un Contenido": Para asignar un curso, solución u otro
            material.
          </p>
          <p className="text-gray-400 mb-4">
            2. "Realizar Assessment" : Para solicitar que completen una
            evaluación.
          </p>
          <p className="text-gray-400">
            Selecciona la opción adecuada según tu objetivo.
          </p>
        </div>

        <div className="w-full lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-gray-700 py-8 px-8 lg:px-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Nombre de Meta/Tarea
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="Ingrese el nombre de la meta"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Tipo de Meta
              </label>
              <SelectLine
                label=""
                name="type"
                value={formData.type}
                options={[
                  {
                    value: 'contenido',
                    label: 'Asociada a un Contenido',
                  },
                  {
                    value: 'assessment',
                    label: 'Realizar un Assessment',
                  },
                ]}
                handleChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value,
                    content: null,
                    content_name: '',
                  }))
                }
                handleBlur={() => {}}
                setFieldValue={(field, value) =>
                  setFormData((prev) => ({ ...prev, [field]: value }))
                }
                errors={{}}
                touched={{}}
                containerClassName="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                {getContentTypeDisplay(formData.type)}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={formData.content_name}
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder={`Seleccione un ${
                    formData.type === 'assessment' ? 'Assessment' : 'Contenido'
                  }`}
                  readOnly
                />
                <Button
                  onClick={() => setIsContentModalOpen(true)}
                  variant="primary"
                  className="whitespace-nowrap"
                >
                  {getContentTypeDisplay(formData.type) === 'Assessment'
                    ? 'Seleccionar Assessment'
                    : 'Ver Contenidos'}
                </Button>
              </div>
            </div>

            {formData.type === 'contenido' && (
              <>
                {formData.content_name && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            hasAssociatedQuiz ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                        />
                        <span className="text-sm text-gray-400">
                          {isCheckingQuiz ? (
                            'Verificando quiz...'
                          ) : hasAssociatedQuiz ? (
                            <span>Este contenido incluye un Quiz</span>
                          ) : (
                            'Este contenido no incluye un Quiz'
                          )}
                        </span>
                      </div>

                      {!hasAssociatedQuiz && (
                        <Button
                          type="button"
                          onClick={() => {
                            const mailtoLink = `mailto:info@openkx.wiki?subject=Solicitud de Quiz&body=Solicitud de creación de Quiz:%0A%0AContenido ID: ${formData.content}%0ANombre del Contenido: ${formData.content_name}%0ASolicitado por: ${userInfo?.username}, muchas gracias! y un saludo a todos! :)`;
                            window.location.href = mailtoLink;
                            toast.info('Solicitud de quiz enviada');
                          }}
                          variant="primary"
                        >
                          Solicitar Quiz
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Usuario
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={formData.user_names.join(', ')}
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="Seleccione los usuarios"
                  readOnly
                />
                <Button
                  onClick={() => setIsUserModalOpen(true)}
                  variant="primary"
                  className="whitespace-nowrap"
                >
                  Ver Usuarios
                </Button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Prioridad
              </label>
              <SelectLine
                label=""
                name="priority"
                value={formData.priority}
                options={[
                  { value: 'low', label: 'Baja' },
                  { value: 'medium', label: 'Media' },
                  { value: 'high', label: 'Alta' },
                ]}
                handleChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e }))
                }
                handleBlur={() => {}}
                setFieldValue={(field, value) =>
                  setFormData((prev) => ({ ...prev, [field]: value }))
                }
                errors={{}}
                touched={{}}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Fecha Límite
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiration_date: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-colors"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="submit"
                disabled={
                  loading || !formData.content || !formData.users.length
                }
                variant="primary"
              >
                {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                Confirmar
              </Button>
            </div>
          </form>
        </div>

        <SelectContentModal
          open={isContentModalOpen}
          onClose={() => setIsContentModalOpen(false)}
          onSelect={handleContentSelect}
          contentType={
            getContentTypeDisplay(formData.type) === 'Assessment'
              ? 'assessment'
              : 'content'
          }
        />

        <SelectUserModal
          open={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSelect={handleUserSelect}
          multiple={true}
          selectedUsers={selectedUsersForModal}
        />

        <DialogComponent
          open={showSuccessDialog}
          handler={() => setShowSuccessDialog(false)}
          className="bg-gray-900 border border-gray-800"
        >
          <div className="p-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Meta creada exitosamente!
            </h2>
            <p className="text-gray-400 mb-6">
              ¿Qué deseas hacer a continuación?
            </p>

            <div className="flex items-center justify-center gap-4 px-4">
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  navigate('/admin', {
                    state: { defaultTab: 'Goals' },
                  });
                }}
                variant="primary"
                style={{
                  width: '200px',
                  height: '45px',
                }}
              >
                Ir a Panel de Metas
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  setFormData({
                    name: '',
                    type: 'contenido',
                    content: null,
                    content_name: '',
                    priority: 'low',
                    users: [],
                    user_names: [],
                    hasQuiz: false,
                    quizId: null,
                    expiration_date: new Date().toISOString().split('T')[0],
                  });
                }}
                variant="secondary"
                style={{
                  width: '200px',
                  height: '45px',
                }}
              >
                Crear Otra Meta
              </Button>
            </div>
          </div>
        </DialogComponent>
      </div>
    ),
  });
};

export default FormGoal;
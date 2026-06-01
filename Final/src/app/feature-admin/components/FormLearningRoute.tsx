import React, { useEffect, useMemo, useState } from 'react';
import withNavbar from '../../core/handlers/withNavbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '@material-tailwind/react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Button from 'src/app/ui/Button';
import { SelectUserModal } from './modals/SelectUserModal';
import { SelectContentModal } from './modals/SelectContentModal';
import type { User } from '../types/user';
import type { Content } from '../types/goals';
import { useGroupUsers } from '../services/userService';

const LEARNING_ROUTES_STORAGE_KEY = 'admin-learning-routes';
const LEARNING_ROUTE_DRAFT_KEY = 'learning-route-form-draft';
const LEARNING_ROUTE_SELECTED_ASSESSMENT_KEY =
  'learning-route-selected-assessment';
const LEARNING_ROUTE_RETURN_PATH_KEY = 'learning-route-return-path';

const FOCUS_AREAS = [
  'Competencias y capacidades',
  'Contenidos',
  'Tipos de aprendizaje',
  'Experiencia personalizada',
  'Gestión y negocio',
];

const LEARNING_TYPES = [
  'Learning on demand',
  'Social learning',
  'Cohortes y academias internas',
  'Mentorías y shadowing',
  'Retos prácticos y simulaciones',
  'Aprendizaje en flujo de trabajo',
];

const STRATEGIC_SCOPES = [
  'Ruta de bienvenida',
  'Ruta por rol',
  'Ruta por proyecto',
  'Ruta por carrera',
  'Ruta de liderazgo',
  'Ruta de transformación digital',
  'Ruta de IA aplicada',
];

type EvaluationType = 'none' | 'quiz' | 'assessment';
type RouteRole = 'parent' | 'child';
type PickerMode = 'content' | 'quiz' | 'assessment';
type CertificationMode = 'content' | 'total' | 'none';

type StoredRoute = {
  id: string;
  name: string;
  summary: string;
  strategic_scope: string;
  learning_type: string;
  focus_area: string;
  duration_days: number;
  hard_deadline_enabled: boolean;
  hard_deadline_date: string | null;
  status: 'draft' | 'active';
  certification: CertificationMode;
  route_role: RouteRole;
  parent_route_id: string | null;
  parent_route_name: string | null;
  child_order: number | null;
  evaluation_type: EvaluationType;
  evaluation: { id: number; name: string; type?: string } | null;
  users: Array<{ id: number; name: string }>;
  contents: Array<{ id: number; name: string }>;
  progress: number;
  completed: boolean;
  created_at: string;
};

type LearningRouteForm = {
  name: string;
  summary: string;
  focus_area: string;
  learning_type: string;
  strategic_scope: string;
  duration_days: number;
  hard_deadline_enabled: boolean;
  hard_deadline_date: string;
  status: 'draft' | 'active';
  certification: CertificationMode;
  route_role: RouteRole;
  parent_route_id: string;
  child_order: number;
  evaluation_type: EvaluationType;
  selectedUsers: User[];
  selectedContents: Content[];
  selectedEvaluation: Content | null;
};

const DEFAULT_FORM_DATA: LearningRouteForm = {
  name: '',
  summary: '',
  focus_area: FOCUS_AREAS[0],
  learning_type: LEARNING_TYPES[0],
  strategic_scope: STRATEGIC_SCOPES[0],
  duration_days: 30,
  hard_deadline_enabled: false,
  hard_deadline_date: '',
  status: 'active',
  certification: 'none',
  route_role: 'parent',
  parent_route_id: '',
  child_order: 1,
  evaluation_type: 'none',
  selectedUsers: [],
  selectedContents: [],
  selectedEvaluation: null,
};

const safeReadRoutes = (): StoredRoute[] => {
  try {
    const raw = localStorage.getItem(LEARNING_ROUTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeCertification = (value: any): CertificationMode => {
  if (value === 'content' || value === 'total' || value === 'none') {
    return value;
  }

  if (value === true) {
    return 'total';
  }

  return 'none';
};

const normalizeStoredRoute = (route: any): StoredRoute => ({
  id: route.id,
  name: route.name || '',
  summary: route.summary || '',
  strategic_scope: route.strategic_scope || STRATEGIC_SCOPES[0],
  learning_type: route.learning_type || LEARNING_TYPES[0],
  focus_area: route.focus_area || FOCUS_AREAS[0],
  duration_days: route.duration_days || route.duration_weeks * 7 || 30,
  hard_deadline_enabled: Boolean(route.hard_deadline_enabled || route.end_date),
  hard_deadline_date: route.hard_deadline_date || route.end_date || null,
  status: route.status || 'active',
  certification: normalizeCertification(route.certification),
  route_role: route.route_role || 'parent',
  parent_route_id: route.parent_route_id || null,
  parent_route_name: route.parent_route_name || null,
  child_order: route.child_order ?? null,
  evaluation_type: route.evaluation_type || 'none',
  evaluation: route.evaluation || null,
  users: Array.isArray(route.users) ? route.users : [],
  contents: Array.isArray(route.contents) ? route.contents : [],
  progress: route.progress ?? 0,
  completed: Boolean(route.completed),
  created_at: route.created_at || new Date().toISOString(),
});

const readDraftForm = (): LearningRouteForm | null => {
  try {
    if (!localStorage.getItem(LEARNING_ROUTE_RETURN_PATH_KEY)) {
      return null;
    }

    const raw = localStorage.getItem(LEARNING_ROUTE_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_FORM_DATA,
      ...parsed,
      selectedUsers: Array.isArray(parsed.selectedUsers)
        ? parsed.selectedUsers
        : [],
      selectedContents: Array.isArray(parsed.selectedContents)
        ? parsed.selectedContents
        : [],
      selectedEvaluation: parsed.selectedEvaluation || null,
    };
  } catch {
    return null;
  }
};

const readPendingAssessment = (): Content | null => {
  try {
    const raw = localStorage.getItem(LEARNING_ROUTE_SELECTED_ASSESSMENT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.id || !parsed?.name) return null;

    return parsed as Content;
  } catch {
    return null;
  }
};

const clearLearningRouteTempState = () => {
  localStorage.removeItem(LEARNING_ROUTE_DRAFT_KEY);
  localStorage.removeItem(LEARNING_ROUTE_SELECTED_ASSESSMENT_KEY);
  localStorage.removeItem(LEARNING_ROUTE_RETURN_PATH_KEY);
};

const getUserLabel = (user: User) =>
  user.public_name ||
  `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
  user.username ||
  user.email ||
  `Usuario ${user.id}`;

const FormLearningRoute: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedUserId = Number(searchParams.get('userId') || 0);
  const editingRouteId = searchParams.get('routeId') || '';
  const { data: groupUsers = [] } = useGroupUsers();

  const [loading, setLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>('content');

  const storedRoutes = useMemo(
    () => safeReadRoutes().map(normalizeStoredRoute),
    []
  );

  const routeToEdit = useMemo(
    () => storedRoutes.find((route) => route.id === editingRouteId) || null,
    [storedRoutes, editingRouteId]
  );

  const parentRoutes = useMemo(
    () =>
      storedRoutes.filter(
        (route) => route.route_role === 'parent' && route.id !== editingRouteId
      ),
    [storedRoutes, editingRouteId]
  );

  const [formData, setFormData] = useState<LearningRouteForm>(
    () => readDraftForm() || DEFAULT_FORM_DATA
  );

  useEffect(() => {
    const draft = readDraftForm();
    if (draft || !routeToEdit) return;

    const mappedUsers =
      routeToEdit.users
        .map((storedUser) => {
          const groupUser = groupUsers.find(
            (user: any) => user.id === storedUser.id
          );
          return (
            groupUser || {
              id: storedUser.id,
              public_name: storedUser.name,
              first_name: '',
              last_name: '',
              username: storedUser.name,
              email: '',
            }
          );
        })
        .filter(Boolean) as User[];

    const mappedContents = routeToEdit.contents.map((content) => ({
      id: content.id,
      name: content.name,
    })) as Content[];

    setFormData({
      name: routeToEdit.name,
      summary: routeToEdit.summary,
      focus_area: routeToEdit.focus_area,
      learning_type: routeToEdit.learning_type,
      strategic_scope: routeToEdit.strategic_scope,
      duration_days: routeToEdit.duration_days,
      hard_deadline_enabled: routeToEdit.hard_deadline_enabled,
      hard_deadline_date: routeToEdit.hard_deadline_date || '',
      status: routeToEdit.status,
      certification: routeToEdit.certification,
      route_role: routeToEdit.route_role,
      parent_route_id: routeToEdit.parent_route_id || '',
      child_order: routeToEdit.child_order ?? 1,
      evaluation_type: routeToEdit.evaluation_type,
      selectedUsers: mappedUsers,
      selectedContents: mappedContents,
      selectedEvaluation: routeToEdit.evaluation
        ? ({
            id: routeToEdit.evaluation.id,
            name: routeToEdit.evaluation.name,
            type: routeToEdit.evaluation.type,
          } as Content)
        : null,
    });
  }, [routeToEdit, groupUsers]);

  useEffect(() => {
    const pendingAssessment = readPendingAssessment();
    if (!pendingAssessment) return;

    setFormData((current) => ({
      ...current,
      evaluation_type: 'assessment',
      selectedEvaluation: pendingAssessment,
    }));

    localStorage.removeItem(LEARNING_ROUTE_SELECTED_ASSESSMENT_KEY);
  }, []);

  useEffect(() => {
    if (
      routeToEdit ||
      !requestedUserId ||
      !groupUsers.length ||
      formData.selectedUsers.length
    ) {
      return;
    }

    const preselectedUser = groupUsers.find(
      (user: any) => user.id === requestedUserId
    );
    if (preselectedUser) {
      setFormData((current) => ({
        ...current,
        selectedUsers: [preselectedUser],
      }));
    }
  }, [requestedUserId, groupUsers, formData.selectedUsers.length, routeToEdit]);

  const handleUserSelect = (users: User[]) => {
    setFormData((current) => ({
      ...current,
      selectedUsers: users,
    }));
  };

  const handleContentSelect = (content: Content) => {
    if (pickerMode === 'content') {
      setFormData((current) => {
        if (current.selectedContents.some((item) => item.id === content.id)) {
          return current;
        }

        return {
          ...current,
          selectedContents: [...current.selectedContents, content],
        };
      });
      return;
    }

    setFormData((current) => ({
      ...current,
      selectedEvaluation: content,
    }));
  };

  const removeSelectedContent = (contentId: number) => {
    setFormData((current) => ({
      ...current,
      selectedContents: current.selectedContents.filter(
        (content) => content.id !== contentId
      ),
    }));
  };

  const removeSelectedUser = (userId: number) => {
    setFormData((current) => ({
      ...current,
      selectedUsers: current.selectedUsers.filter((user) => user.id !== userId),
    }));
  };

  const persistDraftAndGoToAssessmentSelector = () => {
    const draft: LearningRouteForm = {
      ...formData,
      evaluation_type: 'assessment',
    };

    localStorage.setItem(LEARNING_ROUTE_DRAFT_KEY, JSON.stringify(draft));
    localStorage.setItem(
      LEARNING_ROUTE_RETURN_PATH_KEY,
      `${window.location.pathname}${window.location.search}`
    );

    navigate('/admin/learning-routes/assessment-selector');
  };

  const visibleUsers = formData.selectedUsers.slice(0, 3);
  const hiddenUsersCount = Math.max(formData.selectedUsers.length - 3, 0);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre de la ruta es obligatorio.');
      return;
    }

    if (!formData.summary.trim()) {
      toast.error('El resumen de la ruta es obligatorio.');
      return;
    }

    if (!formData.selectedUsers.length) {
      toast.error('Debes asignar al menos un usuario.');
      return;
    }

    if (!formData.duration_days || formData.duration_days < 1) {
      toast.error('Debes indicar en cuántos días debe completarse la ruta.');
      return;
    }

    if (formData.route_role === 'child' && !formData.parent_route_id) {
      toast.error('Debes seleccionar una ruta padre.');
      return;
    }

    if (formData.route_role === 'child' && formData.child_order < 1) {
      toast.error('Debes indicar un orden válido para la ruta hija.');
      return;
    }

    if (formData.hard_deadline_enabled && !formData.hard_deadline_date) {
      toast.error('Debes indicar la fecha límite.');
      return;
    }

    if (formData.evaluation_type !== 'none' && !formData.selectedEvaluation) {
      toast.error('Debes seleccionar la evaluación.');
      return;
    }

    setLoading(true);

    try {
      const existingRoutes = safeReadRoutes().map(normalizeStoredRoute);
      const parentRoute =
        formData.route_role === 'child'
          ? parentRoutes.find((route) => route.id === formData.parent_route_id)
          : null;

      const routePayload: StoredRoute = {
        id: routeToEdit?.id || `LR-${Date.now()}`,
        name: formData.name.trim(),
        summary: formData.summary.trim(),
        strategic_scope: formData.strategic_scope,
        learning_type: formData.learning_type,
        focus_area: formData.focus_area,
        duration_days: Number(formData.duration_days),
        hard_deadline_enabled: formData.hard_deadline_enabled,
        hard_deadline_date: formData.hard_deadline_enabled
          ? formData.hard_deadline_date
          : null,
        status: formData.status,
        certification: formData.certification,
        route_role: formData.route_role,
        parent_route_id: parentRoute?.id || null,
        parent_route_name: parentRoute?.name || null,
        child_order:
          formData.route_role === 'child'
            ? Number(formData.child_order || 1)
            : null,
        evaluation_type: formData.evaluation_type,
        evaluation: formData.selectedEvaluation
          ? {
              id: formData.selectedEvaluation.id,
              name: formData.selectedEvaluation.name,
              type: formData.selectedEvaluation.type,
            }
          : null,
        users: formData.selectedUsers.map((user) => ({
          id: user.id,
          name: getUserLabel(user),
        })),
        contents: formData.selectedContents.map((content) => ({
          id: content.id,
          name: content.name,
        })),
        progress: routeToEdit?.progress ?? 0,
        completed: routeToEdit?.completed ?? false,
        created_at: routeToEdit?.created_at || new Date().toISOString(),
      };

      const updatedRoutes = routeToEdit
        ? existingRoutes.map((route) =>
            route.id === routeToEdit.id ? routePayload : route
          )
        : [routePayload, ...existingRoutes];

      localStorage.setItem(
        LEARNING_ROUTES_STORAGE_KEY,
        JSON.stringify(updatedRoutes)
      );

      clearLearningRouteTempState();
      localStorage.setItem('lastTab', 'Rutas');
      toast.success(
        routeToEdit
          ? 'Ruta de aprendizaje actualizada correctamente.'
          : 'Ruta de aprendizaje creada correctamente.'
      );
      navigate('/admin');
    } catch {
      toast.error('No se ha podido guardar la ruta.');
    } finally {
      setLoading(false);
    }
  };

  return withNavbar({
    children: (
      <div className="mx-auto min-h-screen max-w-7xl bg-gray-900 px-4 py-8">
        <button
          onClick={() => {
            clearLearningRouteTempState();
            localStorage.setItem('lastTab', 'Rutas');
            navigate('/admin');
          }}
          className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gray-800 text-white transition hover:bg-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-300">
            Administrador
          </p>
          <h1 className="mt-2 text-4xl font-bold text-white">
            {routeToEdit
              ? 'Editar ruta de aprendizaje'
              : 'Añadir ruta de aprendizaje'}
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-300">
            Diseña una experiencia continua donde capacidades, contenidos y
            objetivos del negocio convergen en un itinerario formativo medible y
            accionable.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-gray-800 p-6">
            <h2 className="text-xl font-semibold text-white">
              Definición de la ruta
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Nombre de la ruta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                  placeholder="Ej. Ruta de aprendizaje en IA aplicada a negocio"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Resumen ejecutivo
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                  placeholder="Describe cómo esta ruta conecta capacidades, contenidos y objetivos del negocio."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Foco principal
                </label>
                <select
                  value={formData.focus_area}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      focus_area: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  {FOCUS_AREAS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Tipo de aprendizaje
                </label>
                <select
                  value={formData.learning_type}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      learning_type: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  {LEARNING_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Alcance estratégico
                </label>
                <select
                  value={formData.strategic_scope}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      strategic_scope: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  {STRATEGIC_SCOPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      status: event.target.value as 'draft' | 'active',
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  <option value="active">Activa</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Ruta padre o hija
                </label>
                <select
                  value={formData.route_role}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      route_role: event.target.value as RouteRole,
                      parent_route_id:
                        event.target.value === 'parent'
                          ? ''
                          : current.parent_route_id,
                      child_order:
                        event.target.value === 'parent'
                          ? 1
                          : current.child_order,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  <option value="parent">Ruta padre</option>
                  <option value="child">Ruta hija</option>
                </select>
              </div>

              {formData.route_role === 'child' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Asignar ruta padre
                  </label>
                  <select
                    value={formData.parent_route_id}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        parent_route_id: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                  >
                    <option value="">Selecciona una ruta padre</option>
                    {parentRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.route_role === 'child' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Orden dentro de la ruta padre
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.child_order}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        child_order: Number(event.target.value || 1),
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Días para completarla desde la asignación
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.duration_days}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      duration_days: Number(event.target.value || 1),
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Fecha límite obligatoria
                </label>
                <label className="flex h-[50px] w-full items-center justify-between rounded-xl border border-white/10 bg-gray-900 px-4 text-sm font-medium text-gray-300">
                  <span>Activar fecha límite</span>
                  <input
                    type="checkbox"
                    checked={formData.hard_deadline_enabled}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        hard_deadline_enabled: event.target.checked,
                        hard_deadline_date: event.target.checked
                          ? current.hard_deadline_date
                          : '',
                      }))
                    }
                  />
                </label>
              </div>

              {formData.hard_deadline_enabled && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={formData.hard_deadline_date}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        hard_deadline_date: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Certificado automático
                </label>
                <select
                  value={formData.certification}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      certification: event.target.value as CertificationMode,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  <option value="content">Certificado por contenido</option>
                  <option value="total">Certificado total</option>
                  <option value="none">Sin certificado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gray-800 p-6">
            <div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-end">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Tipo de evaluación
                </label>
                <select
                  value={formData.evaluation_type}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      evaluation_type: event.target.value as EvaluationType,
                      selectedEvaluation:
                        event.target.value === 'none'
                          ? null
                          : current.selectedEvaluation,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  <option value="none">Ninguna</option>
                  <option value="quiz">Quiz</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  disabled={formData.evaluation_type === 'none'}
                  onClick={() => {
                    if (formData.evaluation_type === 'none') return;

                    if (formData.evaluation_type === 'assessment') {
                      persistDraftAndGoToAssessmentSelector();
                      return;
                    }

                    setPickerMode('quiz');
                    setContentModalOpen(true);
                  }}
                  className="w-full justify-center md:w-[280px]"
                >
                  Seleccionar evaluación
                </Button>
              </div>
            </div>

            {formData.selectedEvaluation && (
              <div className="mt-4 rounded-2xl border border-primary-500/20 bg-primary-500/10 p-4">
                <p className="text-sm font-semibold text-primary-200">
                  Evaluación seleccionada
                </p>
                <p className="mt-2 text-white">{formData.selectedEvaluation.name}</p>
                <p className="mt-1 text-sm text-primary-200">
                  {formData.evaluation_type === 'quiz' ? 'Quiz' : 'Assessment'}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-gray-800 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Usuarios asignados
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Aquí defines a quién se le asigna la ruta.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={() => setUserModalOpen(true)}
              >
                Seleccionar usuarios
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {formData.selectedUsers.length > 0 ? (
                <>
                  {visibleUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gray-900 px-3 py-1 text-sm text-gray-200"
                    >
                      {getUserLabel(user)}
                      <button
                        type="button"
                        onClick={() => removeSelectedUser(user.id)}
                        className="text-gray-400 transition hover:text-white"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}

                  {hiddenUsersCount > 0 && (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-gray-900 px-3 py-1 text-sm text-gray-300">
                      +{hiddenUsersCount}
                    </span>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  Todavía no hay usuarios asignados.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gray-800 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Contenidos vinculados
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Puedes añadir cursos, vídeos, pódcasts, webinars o cualquier
                  contenido ya existente.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setPickerMode('content');
                  setContentModalOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4" /> Añadir contenido
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {formData.selectedContents.length > 0 ? (
                formData.selectedContents.map((content) => (
                  <span
                    key={content.id}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-sm text-primary-200"
                  >
                    {content.name}
                    <button
                      type="button"
                      onClick={() => removeSelectedContent(content.id)}
                      className="text-primary-200 transition hover:text-white"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">
                  Todavía no hay contenidos asociados.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              outline
              variant="secondary"
              onClick={() => {
                clearLearningRouteTempState();
                localStorage.setItem('lastTab', 'Rutas');
                navigate('/admin');
              }}
            >
              Cancelar
            </Button>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <Spinner className="h-4 w-4" />
              ) : routeToEdit ? (
                'Guardar cambios'
              ) : (
                'Guardar ruta'
              )}
            </Button>
          </div>
        </form>

        <SelectUserModal
          open={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          onSelect={handleUserSelect}
          multiple={true}
          selectedUsers={formData.selectedUsers}
        />

        <SelectContentModal
          open={contentModalOpen}
          onClose={() => setContentModalOpen(false)}
          onSelect={handleContentSelect}
          contentType={pickerMode}
        />
      </div>
    ),
  });
};

export default FormLearningRoute;
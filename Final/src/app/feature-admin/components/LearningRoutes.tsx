import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  Chip,
  Dialog,
  DialogBody,
  DialogHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@material-tailwind/react';
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LEARNING_ROUTES_STORAGE_KEY = 'admin-learning-routes';

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
  route_role: 'parent' | 'child';
  parent_route_id: string | null;
  parent_route_name: string | null;
  child_order: number | null;
  evaluation_type: 'none' | 'quiz' | 'assessment';
  evaluation: { id: number; name: string; type?: string } | null;
  users: Array<{
    id: number;
    name: string;
  }>;
  contents: Array<{
    id: number;
    name: string;
  }>;
  progress: number;
  completed: boolean;
  created_at: string;
};

interface LearningRoutesProps {
  searchTerm: string;
}

const TABLE_HEAD = [
  'ID',
  'Ruta',
  'Usuario',
  'Estado',
  'Evaluación',
  'Plazo',
  'Fecha límite',
  'Acciones',
];

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

const normalizeRoute = (route: any): StoredRoute => ({
  id: route.id,
  name: route.name || '',
  summary: route.summary || '',
  strategic_scope: route.strategic_scope || '',
  learning_type: route.learning_type || '',
  focus_area: route.focus_area || '',
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

const getStatusColor = (status: StoredRoute['status']) => {
  return status === 'active'
    ? 'bg-success-500 text-white'
    : 'bg-warning-600 text-black';
};

const getStatusLabel = (status: StoredRoute['status']) => {
  return status === 'active' ? 'Activa' : 'Borrador';
};

const getEvaluationLabel = (route: StoredRoute) => {
  if (route.evaluation_type === 'none') return 'Sin evaluación';
  if (route.evaluation_type === 'quiz') return 'Quiz';
  return 'Assessment';
};

const getCertificationLabel = (certification: CertificationMode) => {
  if (certification === 'content') return 'Certificado por contenido';
  if (certification === 'total') return 'Certificado total';
  return 'Sin certificado';
};

const RouteDetailDialog = ({
  route,
  open,
  onClose,
}: {
  route: StoredRoute | null;
  open: boolean;
  onClose: () => void;
}) => {
  if (!route) return null;

  return (
    <Dialog open={open} handler={onClose} size="lg" className="bg-gray-900 text-white">
      <DialogHeader className="flex items-start justify-between border-b border-white/10">
        <div>
          <Typography variant="h4" className="text-white">
            {route.name}
          </Typography>
          <Typography className="mt-2 text-sm text-gray-400">
            {route.focus_area} · {route.learning_type}
          </Typography>
        </div>

        <IconButton variant="text" color="white" onClick={onClose}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="space-y-6">
        <div>
          <Typography variant="h6" className="text-white">
            Resumen
          </Typography>
          <Typography className="mt-2 text-sm leading-6 text-gray-300">
            {route.summary}
          </Typography>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-gray-800 p-4">
            <Typography variant="small" className="uppercase tracking-[0.18em] text-gray-500">
              Tipo
            </Typography>
            <Typography className="mt-2 text-white">
              {route.route_role === 'parent' ? 'Ruta padre' : 'Ruta hija'}
            </Typography>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-4">
            <Typography variant="small" className="uppercase tracking-[0.18em] text-gray-500">
              Ruta padre
            </Typography>
            <Typography className="mt-2 text-white">
              {route.parent_route_name || 'No aplica'}
            </Typography>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-4">
            <Typography variant="small" className="uppercase tracking-[0.18em] text-gray-500">
              Días desde la asignación
            </Typography>
            <Typography className="mt-2 text-white">
              {route.duration_days} días
            </Typography>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-4">
            <Typography variant="small" className="uppercase tracking-[0.18em] text-gray-500">
              Fecha límite
            </Typography>
            <Typography className="mt-2 text-white">
              {route.hard_deadline_enabled && route.hard_deadline_date
                ? route.hard_deadline_date
                : 'Sin fecha fija'}
            </Typography>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-4">
            <Typography variant="small" className="uppercase tracking-[0.18em] text-gray-500">
              Evaluación
            </Typography>
            <Typography className="mt-2 text-white">
              {route.evaluation?.name || 'Sin evaluación'}
            </Typography>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-4">
            <Typography variant="small" className="uppercase tracking-[0.18em] text-gray-500">
              Certificado
            </Typography>
            <Typography className="mt-2 text-white">
              {getCertificationLabel(route.certification)}
            </Typography>
          </div>
        </div>

        <div>
          <Typography variant="h6" className="text-white">
            Contenidos vinculados
          </Typography>
          <div className="mt-3 flex flex-wrap gap-2">
            {route.contents.length > 0 ? (
              route.contents.map((content) => (
                <span
                  key={`${route.id}-content-${content.id}`}
                  className="rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-sm text-primary-200"
                >
                  {content.name}
                </span>
              ))
            ) : (
              <Typography className="text-sm text-gray-400">
                No hay contenidos asociados.
              </Typography>
            )}
          </div>
        </div>

        <div>
          <Typography variant="h6" className="text-white">
            Usuarios asignados
          </Typography>
          <div className="mt-3 flex flex-wrap gap-2">
            {route.users.length > 0 ? (
              route.users.map((user) => (
                <span
                  key={`${route.id}-user-${user.id}`}
                  className="rounded-full border border-white/10 bg-gray-800 px-3 py-1 text-sm text-gray-200"
                >
                  {user.name}
                </span>
              ))
            ) : (
              <Typography className="text-sm text-gray-400">
                No hay usuarios asignados.
              </Typography>
            )}
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
};

const LearningRoutes: React.FC<LearningRoutesProps> = ({ searchTerm }) => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<StoredRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<StoredRoute | null>(null);
  const [expandedParentIds, setExpandedParentIds] = useState<string[]>([]);

  useEffect(() => {
    const loadedRoutes = safeReadRoutes().map(normalizeRoute);
    setRoutes(loadedRoutes);
  }, []);

  const childMap = useMemo(() => {
    const grouped = routes.reduce<Record<string, StoredRoute[]>>((acc, route) => {
      if (route.parent_route_id) {
        if (!acc[route.parent_route_id]) {
          acc[route.parent_route_id] = [];
        }
        acc[route.parent_route_id].push(route);
      }
      return acc;
    }, {});

    Object.keys(grouped).forEach((parentId) => {
      grouped[parentId].sort((a, b) => {
        const orderA = a.child_order ?? 9999;
        const orderB = b.child_order ?? 9999;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    });

    return grouped;
  }, [routes]);

  const topLevelRoutes = useMemo(
    () => routes.filter((route) => !route.parent_route_id),
    [routes]
  );

  const filteredParents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return topLevelRoutes;

    return topLevelRoutes.filter((route) => {
      const children = childMap[route.id] || [];

      const routeMatches =
        route.name.toLowerCase().includes(term) ||
        route.focus_area.toLowerCase().includes(term) ||
        route.learning_type.toLowerCase().includes(term) ||
        route.users.some((user) => user.name.toLowerCase().includes(term));

      const childMatches = children.some(
        (child) =>
          child.name.toLowerCase().includes(term) ||
          child.focus_area.toLowerCase().includes(term) ||
          child.learning_type.toLowerCase().includes(term) ||
          child.users.some((user) => user.name.toLowerCase().includes(term))
      );

      return routeMatches || childMatches;
    });
  }, [topLevelRoutes, childMap, searchTerm]);

  const toggleParent = (routeId: string) => {
    setExpandedParentIds((current) =>
      current.includes(routeId)
        ? current.filter((id) => id !== routeId)
        : [...current, routeId]
    );
  };

  const handleDeleteRoute = (route: StoredRoute) => {
    const confirmDelete = window.confirm(
      route.route_role === 'parent'
        ? 'Si eliminas esta ruta padre también se eliminarán sus rutas hijas. ¿Quieres continuar?'
        : '¿Quieres eliminar esta ruta?'
    );

    if (!confirmDelete) return;

    const updatedRoutes = routes.filter((currentRoute) => {
      if (currentRoute.id === route.id) return false;
      if (route.route_role === 'parent' && currentRoute.parent_route_id === route.id) {
        return false;
      }
      return true;
    });

    setRoutes(updatedRoutes);
    localStorage.setItem(LEARNING_ROUTES_STORAGE_KEY, JSON.stringify(updatedRoutes));
    toast.success('Ruta eliminada correctamente.');
  };

  const renderRow = (route: StoredRoute, isChild = false, parentName = '') => (
    <tr
      key={route.id}
      className={`border-b border-blue-gray-50 ${isChild ? 'bg-white/[0.04]' : 'bg-white/[0.02]'}`}
    >
      <td className="p-4">
        <Typography variant="small" color="white" className="font-normal text-center">
          {route.id}
        </Typography>
      </td>

      <td className="p-4 text-left">
        <div className={`flex items-center gap-3 ${isChild ? 'pl-10' : ''}`}>
          {!isChild && (childMap[route.id] || []).length > 0 ? (
            <button
              type="button"
              onClick={() => toggleParent(route.id)}
              className="rounded-lg border border-white/10 bg-white/5 p-1 text-white transition hover:bg-white/10"
            >
              {expandedParentIds.includes(route.id) ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="inline-block h-6 w-6" />
          )}

          <div>
            <Typography variant="small" color="white" className="text-base font-semibold">
              {route.name}
            </Typography>
            {isChild && parentName ? (
              <Typography className="mt-1 text-xs text-white/50">
                Pertenece a {parentName} · Orden {route.child_order ?? '-'}
              </Typography>
            ) : null}
          </div>
        </div>
      </td>

      <td className="p-4">
        <Typography variant="small" color="white" className="font-normal text-center">
          {route.users.map((user) => user.name).join(', ') || 'Sin asignar'}
        </Typography>
      </td>

      <td className="p-4">
        <Chip
          size="sm"
          variant="filled"
          className={getStatusColor(route.status)}
          value={getStatusLabel(route.status)}
        />
      </td>

      <td className="p-4">
        <Typography variant="small" color="white" className="font-normal text-center">
          {getEvaluationLabel(route)}
        </Typography>
      </td>

      <td className="p-4">
        <Typography variant="small" color="white" className="font-normal text-center">
          {route.duration_days} días
        </Typography>
      </td>

      <td className="p-4">
        <Typography variant="small" color="white" className="font-normal text-center">
          {route.hard_deadline_enabled && route.hard_deadline_date
            ? route.hard_deadline_date
            : 'Sin fecha fija'}
        </Typography>
      </td>

      <td className="p-4">
        <div className="flex justify-center gap-2">
          <Tooltip content="Ver ruta">
            <IconButton
              variant="text"
              color="white"
              onClick={() => setSelectedRoute(route)}
            >
              <EyeIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>

          <Tooltip content="Editar ruta">
            <IconButton
              variant="text"
              color="white"
              onClick={() => {
                localStorage.setItem('lastTab', 'Rutas');
                navigate(`/admin/learning-routes?routeId=${route.id}`);
              }}
            >
              <PencilSquareIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>

          <Tooltip content="Eliminar ruta">
            <IconButton
              variant="text"
              color="white"
              onClick={() => handleDeleteRoute(route)}
            >
              <TrashIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      </td>
    </tr>
  );

  if (routes.length === 0) {
    return (
      <div className="mx-8 my-4">
        <Card className="h-full w-full bg-gray-800">
          <CardBody className="overflow-x-auto px-0">
            <div className="flex justify-center px-8 py-12">
              <Typography
                variant="small"
                color="white"
                className="font-normal text-center"
              >
                No hay rutas creadas todavía.
              </Typography>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-8 my-4">
      <Card className="h-full w-full bg-gray-800">
        <CardBody className="overflow-x-auto px-0">
          <table className="w-full min-w-max table-auto text-center">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b border-blue-gray-100 bg-gray-700 p-4"
                  >
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal leading-none opacity-70 text-center"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredParents.map((route) => {
                const children = childMap[route.id] || [];
                const rows = [renderRow(route)];

                if (expandedParentIds.includes(route.id)) {
                  children.forEach((child) => {
                    rows.push(renderRow(child, true, route.name));
                  });
                }

                return rows;
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <RouteDetailDialog
        route={selectedRoute}
        open={Boolean(selectedRoute)}
        onClose={() => setSelectedRoute(null)}
      />
    </div>
  );
};

export default LearningRoutes;
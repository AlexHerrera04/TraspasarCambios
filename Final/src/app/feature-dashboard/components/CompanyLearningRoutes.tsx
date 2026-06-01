import { useEffect, useMemo, useState } from 'react';
import {
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Checkbox } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import Button from 'src/app/ui/Button';
import { toast } from 'react-toastify';

const LEARNING_ROUTES_STORAGE_KEY = 'admin-learning-routes';
const COMPLETED_CARDS_STORAGE_KEY = 'admin-learning-routes-completed-cards';

type StoredRoute = {
  id: string;
  name: string;
  duration_days: number;
  hard_deadline_enabled: boolean;
  hard_deadline_date: string | null;
  status: 'draft' | 'active';
  route_role: 'parent' | 'child';
  parent_route_id: string | null;
  parent_route_name: string | null;
  child_order: number | null;
  evaluation_type: 'none' | 'quiz' | 'assessment';
  evaluation: { id: number; name: string; type?: string } | null;
  certification?: boolean | 'content' | 'total' | 'none';
  contents: Array<{ id: number; name: string }>;
  progress: number;
  completed: boolean;
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

const safeReadCompletedCards = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(COMPLETED_CARDS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const normalizeRoute = (route: any): StoredRoute => ({
  id: route.id,
  name: route.name || '',
  duration_days: route.duration_days || route.duration_weeks * 7 || 30,
  hard_deadline_enabled: Boolean(route.hard_deadline_enabled || route.end_date),
  hard_deadline_date: route.hard_deadline_date || route.end_date || null,
  status: route.status || 'active',
  route_role: route.route_role || 'parent',
  parent_route_id: route.parent_route_id || null,
  parent_route_name: route.parent_route_name || null,
  child_order: route.child_order ?? null,
  evaluation_type: route.evaluation_type || 'none',
  evaluation: route.evaluation || null,
  certification:
    route.certification === true ||
    route.certification === 'content' ||
    route.certification === 'total'
      ? route.certification
      : route.certification === 'none'
        ? 'none'
        : false,
  contents: Array.isArray(route.contents) ? route.contents : [],
  progress: route.progress ?? 0,
  completed: Boolean(route.completed),
});

const getDurationLabel = (days: number) => {
  if (days === 1) return '1 día estimado';
  return `${days} días estimados`;
};

const getDeadlineText = (route: StoredRoute) => {
  if (route.hard_deadline_enabled && route.hard_deadline_date) {
    const today = new Date();
    const deadline = new Date(route.hard_deadline_date);
    const diffInDays = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays > 1) return `${diffInDays} días restantes`;
    if (diffInDays === 1) return '1 día restante';
    if (diffInDays === 0) return 'Vence hoy';
    return 'Fuera de plazo';
  }

  return getDurationLabel(route.duration_days);
};

const getRouteCardCount = (route: StoredRoute) =>
  route.contents.length > 1 ? route.contents.length : 1;

const cardKey = (routeId: string, contentId?: number) =>
  contentId != null ? `${routeId}-${contentId}` : `${routeId}-single`;

const hasCertificate = (route: StoredRoute) =>
  route.certification === true ||
  route.certification === 'content' ||
  route.certification === 'total';

export default function CompanyLearningRoutes() {
  const [routes, setRoutes] = useState<StoredRoute[]>([]);
  const [expandedParentIds, setExpandedParentIds] = useState<string[]>([]);
  const [completedCards, setCompletedCards] = useState<Record<string, boolean>>(
    {}
  );
  const navigate = useNavigate();

  useEffect(() => {
    const loadedRoutes = safeReadRoutes().map(normalizeRoute);
    setRoutes(loadedRoutes);
    setCompletedCards(safeReadCompletedCards());

    const parentIdsWithChildren = loadedRoutes
      .filter((route) => !route.parent_route_id)
      .filter((route) =>
        loadedRoutes.some((child) => child.parent_route_id === route.id)
      )
      .map((route) => route.id);

    setExpandedParentIds(parentIdsWithChildren);
  }, []);

  const childMap = useMemo(() => {
    const grouped = routes.reduce<Record<string, StoredRoute[]>>(
      (acc, route) => {
        if (route.parent_route_id) {
          if (!acc[route.parent_route_id]) {
            acc[route.parent_route_id] = [];
          }
          acc[route.parent_route_id].push(route);
        }
        return acc;
      },
      {}
    );

    Object.keys(grouped).forEach((parentId) => {
      grouped[parentId].sort((a, b) => {
        const orderA = a.child_order ?? 9999;
        const orderB = b.child_order ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });
    });

    return grouped;
  }, [routes]);

  const parentRoutes = useMemo(
    () => routes.filter((route) => !route.parent_route_id),
    [routes]
  );

  const getCardKeysForRoute = (route: StoredRoute): string[] => {
    if (route.contents.length > 1) {
      return route.contents.map((c) => cardKey(route.id, c.id));
    }
    return [cardKey(route.id, route.contents[0]?.id)];
  };

  const getParentProgress = (
    parentRoute: StoredRoute,
    cards: Record<string, boolean>
  ) => {
    const children = childMap[parentRoute.id] || [];
    const allRoutes = [parentRoute, ...children];
    const allKeys = allRoutes.flatMap(getCardKeysForRoute);
    if (allKeys.length === 0) return 0;
    const completedCount = allKeys.filter((k) => cards[k]).length;
    return Math.round((completedCount / allKeys.length) * 100);
  };

  const handleToggleCard = (route: StoredRoute, contentId?: number) => {
    const key = cardKey(route.id, contentId);
    const nextCards = { ...completedCards, [key]: !completedCards[key] };
    setCompletedCards(nextCards);
    localStorage.setItem(COMPLETED_CARDS_STORAGE_KEY, JSON.stringify(nextCards));
  };

  const isCardCompleted = (route: StoredRoute, contentId?: number) =>
    Boolean(completedCards[cardKey(route.id, contentId)]);

  const isParentFullyCompleted = (parentRoute: StoredRoute) =>
    getParentProgress(parentRoute, completedCards) >= 100;

  const handleAccess = (contentId?: number) => {
    if (contentId) {
      navigate(`/explorer/${contentId}`);
      return;
    }
    navigate('/explorer');
  };

  const handleEvaluation = (route: StoredRoute) => {
    if (!route.evaluation) {
      toast('La evaluación todavía no está disponible');
      return;
    }
    if (route.evaluation_type === 'quiz') {
      navigate(`/quiz/${route.evaluation.id}`);
      return;
    }
    navigate(`/explorer/${route.evaluation.id}`);
  };

  const toggleParent = (routeId: string) => {
    setExpandedParentIds((current) =>
      current.includes(routeId)
        ? current.filter((id) => id !== routeId)
        : [...current, routeId]
    );
  };

  const renderProgressInfo = (parentRoute: StoredRoute) => {
    const progress = getParentProgress(parentRoute, completedCards);

    if (progress >= 100) {
      return (
        <span className="text-sm font-medium text-emerald-300">
          Ruta finalizada, enhorabuena
        </span>
      );
    }

    return (
      <>
        <span className="text-white/55">Progreso</span>
        <span className="font-medium text-white/80">{progress}%</span>
      </>
    );
  };

  const getCollapsedDeadlineText = (route: StoredRoute) => {
    const descendants = childMap[route.id] || [];
    const allRoutes = [route, ...descendants];
    const totalDays = allRoutes.reduce((sum, currentRoute) => {
      return sum + currentRoute.duration_days * getRouteCardCount(currentRoute);
    }, 0);
    return getDurationLabel(totalDays);
  };

  const renderRouteCard = (
    route: StoredRoute,
    title: string,
    contentId?: number
  ) => {
    const checkboxUniqueId = `route-status-${route.id}-${contentId ?? 'single'}`;
    const checked = isCardCompleted(route, contentId);

    return (
      <div
        key={contentId ? `${route.id}-${contentId}` : route.id}
        className="my-3 flex items-center justify-between overflow-x-auto rounded-md border border-tertiary p-3"
      >
        <h2 className="max-w-md text-base">{title}</h2>

        <div className="flex items-center gap-3">
          <Button
            outline
            onClick={() => handleAccess(contentId ?? route.contents[0]?.id)}
          >
            Acceder
          </Button>

          <span className="w-40 rounded-md border border-tertiary bg-tertiary/70 p-2 text-center text-sm">
            {getDeadlineText(route)}
          </span>

          <div className="hidden items-center sm:flex">
            <Checkbox
              checked={checked}
              color="deep-purple"
              onChange={() => handleToggleCard(route, contentId)}
              id={checkboxUniqueId}
            />
            <label htmlFor={checkboxUniqueId} className="w-[170px]">
              He finalizado la ruta
            </label>
          </div>

          <div className="hidden sm:block">
            <Button
              outline
              variant="primary"
              className="w-44"
              disabled={!checked || route.evaluation_type === 'none'}
              onClick={() => handleEvaluation(route)}
            >
              {route.evaluation_type === 'none'
                ? 'Sin evaluación'
                : route.evaluation_type === 'quiz'
                  ? 'Hacer evaluación'
                  : 'Ver assessment'}
            </Button>
          </div>

          <div className="hidden sm:block">
            <Button
              outline
              variant="secondary"
              className="w-44"
              disabled={!checked || !hasCertificate(route)}
              onClick={() => toast('Funcionalidad en desarrollo')}
            >
              <AcademicCapIcon className="mr-2 h-5 w-5" />
              Certificado único
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderRouteCards = (route: StoredRoute) => {
    if (route.contents.length > 1) {
      return route.contents.map((content) =>
        renderRouteCard(route, content.name, content.id)
      );
    }

    const title = route.contents[0]?.name || route.name;
    return [renderRouteCard(route, title, route.contents[0]?.id)];
  };

  if (parentRoutes.length === 0) {
    return (
      <div className="my-3 flex items-center justify-between rounded-md border border-tertiary p-3">
        <h2 className="text-base">No tienes rutas asignadas</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {parentRoutes.map((route) => {
        const children = childMap[route.id] || [];
        const isExpanded = expandedParentIds.includes(route.id);
        const parentProgress = getParentProgress(route, completedCards);
        const parentCompleted = isParentFullyCompleted(route);
        const showEvaluation =
          route.evaluation_type !== 'none' && Boolean(route.evaluation);
        const showCertificate = hasCertificate(route);

        return (
          <div key={route.id}>
            <button
              type="button"
              onClick={() => toggleParent(route.id)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-2">
                <p className="truncate text-xl font-semibold text-white">
                  {route.name}
                </p>

                {isExpanded ? (
                  <ChevronDownIcon className="h-5 w-5 shrink-0 text-white" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-white" />
                )}
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${parentProgress}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    {renderProgressInfo(route)}
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 rounded-md border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-100">
                  <ClockIcon className="h-4 w-4" />
                  {children.length > 0
                    ? getCollapsedDeadlineText(route)
                    : getDeadlineText(route)}
                </span>

                {showEvaluation && (
                  <div className="hidden shrink-0 sm:block">
                    <Button
                      outline
                      variant="primary"
                      className="w-44"
                      disabled={!parentCompleted}
                      onClick={() => handleEvaluation(route)}
                    >
                      {route.evaluation_type === 'quiz'
                        ? 'Hacer evaluación'
                        : 'Ver assessment'}
                    </Button>
                  </div>
                )}

                {showCertificate && (
                  <div className="hidden shrink-0 sm:block">
                    <Button
                      outline
                      variant="secondary"
                      className="w-44 text-xs"
                      disabled={!parentCompleted}
                      onClick={() => toast('Funcionalidad en desarrollo')}
                    >
                      <AcademicCapIcon className="mr-2 h-5 w-5" />
                      Certificado general
                    </Button>
                  </div>
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="mt-4">
                {route.contents.length > 0 && renderRouteCards(route)}
                {children.flatMap((child) => renderRouteCards(child))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
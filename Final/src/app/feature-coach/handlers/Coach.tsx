import { FormEvent, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';

type PersonalityId = 'pragmatico' | 'motivador' | 'brutal';
type CoachTab = 'libre' | 'cerrado' | 'diagnostico';
type ChatMode = 'libre' | 'cerrado';
type CoachStep = 'personality' | 'coach';
type PanelKey =
  | 'alcance'
  | 'dimensiones'
  | 'resumen'
  | 'contexto'
  | 'historial';
type DiagnosticFeedback = '' | 'like' | 'dislike';
type SelectedPersonValue = number | 'all';
type ScopePickerKey = 'empresa' | 'funcion' | 'area' | 'usuario' | null;
type DiagnosticDimension =
  | 'metas'
  | 'competencias'
  | 'colaborador'
  | 'colaboraciones'
  | 'contenido'
  | 'distribuciones'
  | 'organizacion';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

type Goal = {
  id?: number | string;
  name?: string;
  title?: string;
  status?: string;
  priority?: string;
  user?: { id?: number } | number | null;
};

type Capacity = {
  aspect?: string;
  value?: number;
};

type HistorySession = {
  id: string;
  mode: ChatMode;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
  personality: PersonalityId;
  messages: ChatMessage[];
};

type DiagnosticMeta = {
  generatedAt?: string;
  personality?: PersonalityId;
  targetScopeKey?: string | null;
  targetDimensionsKey?: string | null;
};

type DiagnosticSection = {
  id: string;
  title: string;
  content: string;
};

type OrganizationLevelInfo = {
  id?: number;
  name?: string;
  level_type?: number;
  level_name?: string;
  parent_name?: string;
};

type TargetAccountInfo = {
  id?: number | null;
  capacity?: string[];
  function?: string[];
  industry?: string[];
  level?: string[];
  profile?: string[];
  public_name?: string | null;
  type?: string | null;
  total_score?: number | null;
  organization_level?: OrganizationLevelInfo | null;
  root_organization_level?: OrganizationLevelInfo | null;
};

type AdminScopeUser = {
  id: number;
  public_name?: string;
  email?: string;
  username?: string;
  organization?: string;
  is_account_admin?: boolean;
  is_manager?: boolean;
};

const COACH_API_URL =
  import.meta.env.VITE_COACH_API_URL || 'http://localhost:3001';

const FREE_CHAT_STORAGE_KEY = 'desktopCoachFreeMessages';
const CLOSED_CHAT_STORAGE_KEY = 'desktopCoachClosedMessages';
const PERSONALITY_KEY = 'desktopCoachPersonality';
const DIAGNOSTIC_STORAGE_KEY = 'desktopCoachDiagnosticReport';
const DIAGNOSTIC_META_STORAGE_KEY = 'desktopCoachDiagnosticMeta';
const DIAGNOSTIC_FEEDBACK_STORAGE_KEY = 'desktopCoachDiagnosticFeedback';
const CHAT_HISTORY_STORAGE_KEY = 'desktopCoachHistory';
const FREE_SESSION_STORAGE_KEY = 'desktopCoachFreeSessionId';
const CLOSED_SESSION_STORAGE_KEY = 'desktopCoachClosedSessionId';
const PERSONALITY_ONBOARDING_KEY = 'desktopCoachPersonalityChosen';

const ALL_ORGANIZATIONS = '__ALL_ORGANIZATIONS__';
const ALL_FUNCTIONS = '__ALL_FUNCTIONS__';
const ALL_AREAS = '__ALL_AREAS__';

const DIAGNOSTIC_DIMENSIONS: {
  id: DiagnosticDimension;
  label: string;
  description: string;
}[] = [
  {
    id: 'metas',
    label: 'Metas',
    description: 'Cumplimiento, avance y pendientes.',
  },
  {
    id: 'competencias',
    label: 'Competencias',
    description: 'Capacidades clave y complementarias.',
  },
  {
    id: 'colaborador',
    label: 'Colaborador',
    description: 'Conocimiento enseñado a la comunidad.',
  },
  {
    id: 'colaboraciones',
    label: 'Contribuidor',
    description: 'Impacto en las participaciones.',
  },
  {
    id: 'contenido',
    label: 'Contenidos',
    description: 'Origen y uso de contenidos.',
  },
  {
    id: 'distribuciones',
    label: 'ADN digital',
    description: 'Reparto por función, área y nivel.',
  },
  {
    id: 'organizacion',
    label: 'Organización',
    description: 'Lectura estructural del alcance.',
  },
];

const PERSONALITIES: Record<
  PersonalityId,
  { label: string; emoji: string; description: string; prompt: string }
> = {
  pragmatico: {
    label: 'Pragmático',
    emoji: '⚡',
    description: 'Va al grano, con seriedad y cercanía.',
    prompt:
      'Eres un coach ejecutivo pragmático. Hablas de tú a tú, vas al grano, eres serio y cercano. Das contexto útil, pero no rodeos. Si detectas un problema, lo nombras con claridad y aterrizas en pasos concretos.',
  },
  motivador: {
    label: 'Motivador',
    emoji: '🌟',
    description: 'Anima y convierte energía en acción.',
    prompt:
      'Eres un coach ejecutivo motivador. Hablas de tú a tú con calidez, energía y cercanía. Das ánimo real, refuerzas lo valioso de la persona y conviertes esa energía en decisiones y acciones concretas.',
  },
  brutal: {
    label: 'Brutal',
    emoji: '👊',
    description: 'Frontal, exigente y útil.',
    prompt:
      'Eres un coach ejecutivo brutal. Hablas claro, detectas autoengaños y confrontas con firmeza. Puedes usar expresiones como "espabila", "deja de marearte" o similares si encajan, pero sin humillar. Tu objetivo es provocar avance real.',
  },
};

const NORMAL_CLOSED_ACTIONS = [
  '¿En qué debería enfocarme ahora mismo?',
  'Revisa mis metas y dime por dónde empezar.',
  'Dame un plan simple de 7 días para avanzar.',
  '¿Cuáles son mis fortalezas más aprovechables ahora mismo?',
];

const ADMIN_CLOSED_ACTIONS = [
  '¿Qué contenidos de formación están siendo más utilizados?',
  '¿Qué información clave no están encontrando los empleados?',
  '¿Qué tan efectiva es la formación actual?',
  '¿Quiénes no están accediendo a la formación crítica?',
  '¿Qué temas requieren más contenido o actualización?',
  '¿Cómo se está compartiendo el conocimiento dentro del equipo?',
];

const OPEN_KX_ALLOWED_PATTERNS = [
  /\bopen\s*kx\b/i,
  /\bformaci[oó]n\b/i,
  /\bcursos?\b/i,
  /\bcontenidos?\b/i,
  /\bdocumentos?\b/i,
  /\bconocimiento\b/i,
  /\binformaci[oó]n\b/i,
  /\bempleados?\b/i,
  /\busuarios?\b/i,
  /\bequipos?\b/i,
  /\bcolaboraci[oó]n\b/i,
  /\baprendizaje\b/i,
  /\bfeedback\b/i,
  /\bb[uú]squedas?\b/i,
  /\buso\b/i,
  /\bacceso\b/i,
  /\bconsumo\b/i,
  /\breutilizaci[oó]n\b/i,
  /\btemas?\b/i,
  /\bactualizaci[oó]n\b/i,
  /\bknowledge\b/i,
];

const CONTEXTUAL_SCOPE_PATTERNS = [
  /\besta persona\b/i,
  /\beste perfil\b/i,
  /\beste usuario\b/i,
  /\beste empleado\b/i,
  /\beste colaborador\b/i,
  /\bde esta persona\b/i,
  /\bde este perfil\b/i,
  /\bh[aá]blame sobre\b/i,
  /\bhabla de (?:esta persona|este perfil|[ée]l|ella)\b/i,
  /\bsu perfil\b/i,
  /\bsus competencias\b/i,
  /\bsus capacidades\b/i,
  /\bsus fortalezas\b/i,
  /\bsus debilidades\b/i,
  /\bsu evoluci[oó]n\b/i,
  /\bsu progreso\b/i,
  /\bsu potencial\b/i,
  /\bsu encaje\b/i,
  /\banal[ií]za(?:la|lo)?\b/i,
  /\bval[oó]rala?\b/i,
  /\bqu[eé] ves\b/i,
  /\bres[uú]meme\b/i,
  /\bprofundiza\b/i,
  /\bdime m[aá]s\b/i,
  /\bexpl[ií]came\b/i,
  /\bdesarr[oó]llalo\b/i,
  /\bampl[ií]a\b/i,
  /\bcomp[aá]rala?\b/i,
  /\bcomp[aá]ralo con el equipo\b/i,
  /\bcomp[aá]rala con el equipo\b/i,
  /\bqu[eé] competencias\b/i,
  /\bqu[eé] capacidades\b/i,
  /\bqu[eé] fortalezas\b/i,
  /\bqu[eé] riesgos\b/i,
  /\bqu[eé] oportunidades\b/i,
  /\by de formaci[oó]n\b/i,
  /\by del equipo\b/i,
  /\by en comparaci[oó]n\b/i,
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getScopedStorageKey(baseKey: string, isAdminMode: boolean) {
  return isAdminMode ? `${baseKey}Admin` : baseKey;
}

function getInitialMessages(
  mode: ChatMode,
  isAdminMode: boolean
): ChatMessage[] {
  if (isAdminMode) return [];

  if (mode === 'libre') {
    return [
      {
        id: 'free-initial-assistant',
        role: 'assistant',
        content:
          'Hola. Aquí puedes hablar conmigo con total libertad sobre tu situación, tus metas o cualquier bloqueo que quieras trabajar.',
      },
    ];
  }

  return [
    {
      id: 'closed-initial-assistant',
      role: 'assistant',
      content:
        'Esta es la conversación cerrada. No escribes libremente: eliges una acción y yo te respondo a partir de esa línea.',
    },
  ];
}

function safeParseJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeParseMessages(
  key: string,
  fallback: ChatMessage[]
): ChatMessage[] {
  const parsed = safeParseJson<ChatMessage[]>(key, fallback);
  return Array.isArray(parsed) ? parsed : fallback;
}

function safeReadString(key: string) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function safeReadBoolean(key: string) {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function safeReadDiagnosticMeta(key: string): DiagnosticMeta {
  return safeParseJson<DiagnosticMeta>(key, {});
}

function safeReadDiagnosticFeedback(key: string): DiagnosticFeedback {
  const stored = safeReadString(key) as DiagnosticFeedback;
  return stored === 'like' || stored === 'dislike' ? stored : '';
}

function truncate(text: string, max = 52) {
  const value = text.trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function getModeLabel(mode: CoachTab | ChatMode) {
  if (mode === 'libre') return 'Conversación libre';
  if (mode === 'cerrado') return 'Conversación cerrada';
  return 'Diagnóstico';
}

function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

function formatPercent(value: number, total: number) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function getPersonDisplayName(user?: AdminScopeUser | null) {
  return user?.public_name || user?.username || 'Persona sin nombre';
}

function cleanRootName(name?: string | null) {
  return (name || '').replace(/\s*\(root\)\s*$/i, '').trim();
}

function getRootOrganizationName(accountInfo?: TargetAccountInfo | null) {
  return cleanRootName(accountInfo?.root_organization_level?.name);
}

function getAreaName(accountInfo?: TargetAccountInfo | null) {
  return accountInfo?.organization_level?.name?.trim() || '';
}

function getGoalUserId(goal: Goal) {
  return typeof goal.user === 'object' ? Number(goal.user?.id) : Number(goal.user);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function flattenAccountField(
  accountInfos: TargetAccountInfo[],
  field: keyof Pick<
    TargetAccountInfo,
    'profile' | 'industry' | 'capacity' | 'function' | 'level'
  >
) {
  return uniqueStrings(accountInfos.flatMap((item) => item[field] || []));
}

function aggregateCapacities(accountInfos: TargetAccountInfo[]) {
  const counts = new Map<string, number>();

  accountInfos.forEach((info) => {
    (info.capacity || []).forEach((item) => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([label, count]) => `${label} (${count})`);
}

function countOccurrences(values: string[]) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    if (!value) return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
}

function formatCountSummary(label: string, values: string[], limit = 6) {
  const entries = countOccurrences(values).slice(0, limit);

  if (!entries.length) {
    return `${label}: sin datos directos.`;
  }

  return `${label}: ${entries
    .map(([value, count]) => `${value} (${count})`)
    .join(', ')}.`;
}

function normalizeDiagnosticReport(report: string) {
  return report
    .replace(/\r/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

function splitActionParagraphs(content: string) {
  const normalized = content
    .replace(/\r/g, '\n')
    .replace(
      /\b(primero|segundo|tercero|en primer lugar|en segundo lugar|en tercer lugar|por último|finalmente)\b\s*[:,.-]*/gi,
      '\n'
    )
    .replace(/\n?\s*(\d+[\.\)]|[-*])\s+/g, '\n')
    .trim();

  const parts = normalized
    .split(/\n{1,}/)
    .map((item) => item.trim().replace(/^[,;:\-–—\s]+/, ''))
    .filter(Boolean);

  if (parts.length >= 3) {
    return parts.slice(0, 3);
  }

  return normalized
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeActionsContent(content: string) {
  const paragraphs = splitActionParagraphs(content);
  return paragraphs.join('\n\n');
}

function getHeadingMatch(
  text: string,
  patterns: RegExp[]
): { index: number; matchText: string } | null {
  const matches = patterns
    .map((pattern) => {
      const match = pattern.exec(text);
      if (!match || typeof match.index !== 'number') return null;
      return {
        index: match.index,
        matchText: match[0],
      };
    })
    .filter(Boolean) as { index: number; matchText: string }[];

  if (!matches.length) return null;

  return matches.sort((a, b) => a.index - b.index)[0];
}

function parseDiagnosticSections(report: string): DiagnosticSection[] {
  const normalized = normalizeDiagnosticReport(report);

  if (!normalized) {
    return [
      {
        id: 'contexto',
        title: 'Contexto actual',
        content: 'Sin información disponible.',
      },
      {
        id: 'riesgo',
        title: 'Oportunidad y riesgo',
        content: 'Sin información disponible.',
      },
      {
        id: 'acciones',
        title: 'Acciones sugeridas',
        content: 'Sin información disponible.',
      },
    ];
  }

  const headingConfig = [
    {
      id: 'contexto',
      title: 'Contexto actual',
      patterns: [
        /^\s*(?:1[\.\)]\s*)?Contexto actual\s*:?\s*$/im,
        /^\s*(?:1[\.\)]\s*)?Contexto\s*:?\s*$/im,
      ],
    },
    {
      id: 'riesgo',
      title: 'Oportunidad y riesgo',
      patterns: [
        /^\s*(?:2[\.\)]\s*)?Oportunidad y riesgo\s*:?\s*$/im,
        /^\s*(?:2[\.\)]\s*)?Oportunidades y riesgos\s*:?\s*$/im,
        /^\s*(?:2[\.\)]\s*)?Riesgos y oportunidades\s*:?\s*$/im,
      ],
    },
    {
      id: 'acciones',
      title: 'Acciones sugeridas',
      patterns: [
        /^\s*(?:3[\.\)]\s*)?Acciones sugeridas\s*:?\s*$/im,
        /^\s*(?:3[\.\)]\s*)?Acciones\s*:?\s*$/im,
        /^\s*(?:3[\.\)]\s*)?Recomendaciones\s*:?\s*$/im,
      ],
    },
  ] as const;

  const foundHeadings = headingConfig
    .map((item) => {
      const match = getHeadingMatch(normalized, [...item.patterns]);
      if (!match) return null;
      return {
        id: item.id,
        title: item.title,
        index: match.index,
        headingLength: match.matchText.length,
      };
    })
    .filter(Boolean) as {
    id: string;
    title: string;
    index: number;
    headingLength: number;
  }[];

  if (foundHeadings.length >= 2) {
    const ordered = [...foundHeadings].sort((a, b) => a.index - b.index);

    const mapped = headingConfig.map((item) => {
      const current = ordered.find((entry) => entry.id === item.id);

      if (!current) {
        return {
          id: item.id,
          title: item.title,
          content: 'Sin información disponible.',
        };
      }

      const currentIndex = ordered.findIndex((entry) => entry.id === item.id);
      const next = ordered[currentIndex + 1];
      const start = current.index + current.headingLength;
      const end = next ? next.index : normalized.length;
      const content = normalized
        .slice(start, end)
        .replace(/^\s*[:\-\n\r]+/, '')
        .trim();

      return {
        id: item.id,
        title: item.title,
        content: content || 'Sin información disponible.',
      };
    });

    return mapped;
  }

  const classicRegex =
    /(?:^|\n)\s*(?:1[\.\)]\s*)?Contexto actual\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:2[\.\)]\s*)?(?:Oportunidad y riesgo|Oportunidades y riesgos|Riesgos y oportunidades)\s*:?\s*\n|$)(?:^|\n)\s*(?:2[\.\)]\s*)?(?:Oportunidad y riesgo|Oportunidades y riesgos|Riesgos y oportunidades)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:3[\.\)]\s*)?(?:Acciones sugeridas|Acciones|Recomendaciones)\s*:?\s*\n|$)(?:^|\n)\s*(?:3[\.\)]\s*)?(?:Acciones sugeridas|Acciones|Recomendaciones)\s*:?\s*\n([\s\S]*)$/im;

  const classicMatch = normalized.match(classicRegex);

  if (classicMatch) {
    return [
      {
        id: 'contexto',
        title: 'Contexto actual',
        content: classicMatch[1].trim() || 'Sin información disponible.',
      },
      {
        id: 'riesgo',
        title: 'Oportunidad y riesgo',
        content: classicMatch[2].trim() || 'Sin información disponible.',
      },
      {
        id: 'acciones',
        title: 'Acciones sugeridas',
        content: classicMatch[3].trim() || 'Sin información disponible.',
      },
    ];
  }

  return [
    {
      id: 'contexto',
      title: 'Contexto actual',
      content: normalized || 'Sin información disponible.',
    },
    {
      id: 'riesgo',
      title: 'Oportunidad y riesgo',
      content: 'Sin información disponible.',
    },
    {
      id: 'acciones',
      title: 'Acciones sugeridas',
      content: 'Sin información disponible.',
    },
  ];
}

function buildDiagnosticShareText(
  sections: DiagnosticSection[],
  generatedAt: string
) {
  const parts = ['Informe de diagnóstico'];

  if (generatedAt) {
    parts.push(`Generado el ${formatDateTime(generatedAt)}`);
  }

  sections.forEach((section, index) => {
    parts.push(`${index + 1}. ${section.title}`);
    parts.push(section.content);
  });

  return parts.join('\n\n');
}

function buildHistorySession(
  id: string,
  mode: ChatMode,
  messages: ChatMessage[],
  personality: PersonalityId,
  previous?: HistorySession
): HistorySession | null {
  const userMessages = messages.filter(
    (message) => message.role === 'user' && message.content.trim()
  );

  if (!userMessages.length) return null;

  const firstUserMessage = userMessages[0]?.content || '';
  const lastMessage = messages[messages.length - 1]?.content || firstUserMessage;
  const now = new Date().toISOString();

  return {
    id,
    mode,
    title: truncate(firstUserMessage, 40),
    preview: truncate(lastMessage, 72),
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    personality,
    messages,
  };
}

function upsertHistorySession(
  history: HistorySession[],
  id: string,
  mode: ChatMode,
  messages: ChatMessage[],
  personality: PersonalityId
) {
  const existing = history.find((item) => item.id === id);
  const nextItem = buildHistorySession(id, mode, messages, personality, existing);

  if (!nextItem) {
    return history.filter((item) => item.id !== id);
  }

  return [nextItem, ...history.filter((item) => item.id !== id)]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 20);
}

function buildTargetContext(
  profile: {
    publicName?: string | null;
    type?: string | null;
    profile?: string[];
    industry?: string[];
    capacity?: string[];
    function?: string[];
    level?: string[];
    organizationName?: string | null;
  } | null,
  goals: Goal[],
  capacityHighlights: string[],
  scopeTrail?: string[]
) {
  const pendingGoals = goals
    .filter((goal) => goal.status !== 'done')
    .slice(0, 6)
    .map(
      (goal) =>
        `- ${goal.name || goal.title || 'Meta sin nombre'} (${goal.status || 'sin estado'})`
    );

  const completedGoals = goals.filter((goal) => goal.status === 'done').length;

  const profileBits = [
    profile?.publicName ? `Nombre público: ${profile.publicName}` : null,
    profile?.type ? `Tipo de cuenta: ${profile.type}` : null,
    profile?.organizationName ? `Organización: ${profile.organizationName}` : null,
    profile?.profile?.length ? `Perfil: ${profile.profile.join(', ')}` : null,
    profile?.industry?.length ? `Industria: ${profile.industry.join(', ')}` : null,
    profile?.capacity?.length
      ? `Capacidades declaradas: ${profile.capacity.join(', ')}`
      : null,
    profile?.function?.length ? `Función: ${profile.function.join(', ')}` : null,
    profile?.level?.length ? `Nivel: ${profile.level.join(', ')}` : null,
  ].filter(Boolean);

  return [
    'Contexto del usuario:',
    ...(scopeTrail?.length
      ? [`Alcance seleccionado: ${scopeTrail.join(' > ')}`, '']
      : []),
    ...(profileBits.length ? profileBits : ['Sin datos de perfil disponibles.']),
    '',
    `Metas totales: ${goals.length}`,
    `Metas completadas: ${completedGoals}`,
    pendingGoals.length
      ? 'Metas pendientes:'
      : 'Metas pendientes: no se han detectado.',
    ...(pendingGoals.length ? pendingGoals : []),
    '',
    capacityHighlights.length
      ? 'Capacidades más fuertes:'
      : 'Capacidades más fuertes: sin datos.',
    ...(capacityHighlights.length ? capacityHighlights : []),
  ].join('\n');
}

function buildAdminDiagnosticDimensionContext(params: {
  dimensions: DiagnosticDimension[];
  scopedPeople: AdminScopeUser[];
  scopedGoals: Goal[];
  scopedAccountInfos: TargetAccountInfo[];
  topCapacityHighlights: string[];
  selectedOrganizationName: string | null;
  selectedFunctions: string[];
  selectedAreas: string[];
}) {
  const {
    dimensions,
    scopedPeople,
    scopedGoals,
    scopedAccountInfos,
    topCapacityHighlights,
    selectedOrganizationName,
    selectedFunctions,
    selectedAreas,
  } = params;

  const blocks: string[] = [];

  dimensions.forEach((dimension) => {
    if (dimension === 'metas') {
      const totalPeople = scopedPeople.length;
      const goalsByUser = new Map<number, { total: number; completed: number }>();

      scopedGoals.forEach((goal) => {
        const userId = getGoalUserId(goal);

        if (!userId || Number.isNaN(userId)) return;

        const current = goalsByUser.get(userId) || { total: 0, completed: 0 };
        current.total += 1;
        if (goal.status === 'done') current.completed += 1;
        goalsByUser.set(userId, current);
      });

      const assignedUsers = [...goalsByUser.values()].filter(
        (item) => item.total > 0
      ).length;
      const usersWithAllGoalsCompleted = [...goalsByUser.values()].filter(
        (item) => item.total > 0 && item.completed === item.total
      ).length;
      const usersWithPendingGoals = [...goalsByUser.values()].filter(
        (item) => item.total > 0 && item.completed < item.total
      ).length;
      const usersWithoutGoals = Math.max(totalPeople - assignedUsers, 0);
      const completedGoals = scopedGoals.filter((goal) => goal.status === 'done').length;
      const totalGoals = scopedGoals.length;
      const pendingGoalNames = scopedGoals
        .filter((goal) => goal.status !== 'done')
        .slice(0, 8)
        .map((goal) => goal.name || goal.title || 'Meta sin nombre');

      blocks.push(
        [
          '[Metas]',
          `Personas en alcance: ${totalPeople}.`,
          `Metas totales detectadas: ${totalGoals}.`,
          `Metas completadas: ${completedGoals} (${formatPercent(
            completedGoals,
            totalGoals
          )}).`,
          `Metas no completadas: ${Math.max(
            totalGoals - completedGoals,
            0
          )} (${formatPercent(Math.max(totalGoals - completedGoals, 0), totalGoals)}).`,
          `Personas con todas sus metas completadas: ${usersWithAllGoalsCompleted} (${formatPercent(
            usersWithAllGoalsCompleted,
            totalPeople
          )}).`,
          `Personas con metas pendientes: ${usersWithPendingGoals} (${formatPercent(
            usersWithPendingGoals,
            totalPeople
          )}).`,
          `Personas sin metas asignadas: ${usersWithoutGoals} (${formatPercent(
            usersWithoutGoals,
            totalPeople
          )}).`,
          pendingGoalNames.length
            ? `Ejemplos de metas pendientes: ${pendingGoalNames.join(', ')}.`
            : 'No se detectan ejemplos de metas pendientes.',
        ].join('\n')
      );
    }

    if (dimension === 'competencias') {
      blocks.push(
        [
          '[Competencias]',
          topCapacityHighlights.length
            ? `Capacidades más repetidas o fuertes: ${topCapacityHighlights.join(', ')}.`
            : 'No hay capacidades fuertes detectadas en el contexto actual.',
          formatCountSummary(
            'Distribución de capacidades',
            scopedAccountInfos.flatMap((item) => item.capacity || [])
          ),
          formatCountSummary(
            'Distribución de niveles',
            scopedAccountInfos.flatMap((item) => item.level || [])
          ),
        ].join('\n')
      );
    }

    if (dimension === 'colaborador') {
      blocks.push(
        [
          '[Colaborador]',
          `Personas analizadas: ${scopedPeople.length}.`,
          formatCountSummary(
            'Perfiles predominantes',
            scopedAccountInfos.flatMap((item) => item.profile || [])
          ),
          formatCountSummary(
            'Funciones predominantes',
            scopedAccountInfos.flatMap((item) => item.function || [])
          ),
          formatCountSummary(
            'Capacidades predominantes',
            scopedAccountInfos.flatMap((item) => item.capacity || [])
          ),
          'No hay una métrica directa de colaboración individual; esta lectura debe interpretarse como una aproximación a partir del perfil, la función y las capacidades.',
        ].join('\n')
      );
    }

    if (dimension === 'colaboraciones') {
      blocks.push(
        [
          '[Contribuidor]',
          'No hay métricas directas de contribución en el contexto disponible.',
          formatCountSummary(
            'Reparto por función',
            scopedAccountInfos.flatMap((item) => item.function || [])
          ),
          formatCountSummary(
            'Reparto por área',
            scopedAccountInfos.map((item) => getAreaName(item))
          ),
          'Si hablas de esta dimensión, deja claro que son señales indirectas derivadas de la estructura y no una métrica explícita.',
        ].join('\n')
      );
    }

    if (dimension === 'contenido') {
      blocks.push(
        [
          '[Contenidos]',
          'No hay métricas directas de consumo o uso de contenidos en el contexto actual.',
          'Si se analiza esta dimensión, debe explicitarse la falta de dato directo y evitar cualquier invención.',
        ].join('\n')
      );
    }

    if (dimension === 'distribuciones') {
      blocks.push(
        [
          '[ADN digital]',
          formatCountSummary(
            'Distribución por función',
            scopedAccountInfos.flatMap((item) => item.function || [])
          ),
          formatCountSummary(
            'Distribución por área',
            scopedAccountInfos.map((item) => getAreaName(item))
          ),
          formatCountSummary(
            'Distribución por perfil',
            scopedAccountInfos.flatMap((item) => item.profile || [])
          ),
          formatCountSummary(
            'Distribución por industria',
            scopedAccountInfos.flatMap((item) => item.industry || [])
          ),
          formatCountSummary(
            'Distribución por nivel',
            scopedAccountInfos.flatMap((item) => item.level || [])
          ),
        ].join('\n')
      );
    }

    if (dimension === 'organizacion') {
      blocks.push(
        [
          '[Organización]',
          selectedOrganizationName
            ? `Empresa seleccionada: ${selectedOrganizationName === ALL_ORGANIZATIONS ? 'Todas' : selectedOrganizationName}.`
            : 'Empresa seleccionada: sin definir.',
          selectedFunctions.length
            ? `Funciones seleccionadas: ${selectedFunctions.includes(ALL_FUNCTIONS) ? 'Todas' : selectedFunctions.join(', ')}.`
            : 'Funciones seleccionadas: sin definir.',
          selectedAreas.length
            ? `Áreas seleccionadas: ${selectedAreas.includes(ALL_AREAS) ? 'Todas' : selectedAreas.join(', ')}.`
            : 'Áreas seleccionadas: sin definir.',
          formatCountSummary(
            'Organización raíz',
            scopedAccountInfos
              .map((item) => getRootOrganizationName(item))
              .filter((value): value is string => Boolean(value))
          ),
          formatCountSummary(
            'Niveles organizativos',
            scopedAccountInfos.flatMap((item) => item.level || [])
          ),
        ].join('\n')
      );
    }
  });

  return blocks.join('\n\n');
}

function buildPerspectiveInstruction(
  isAdminMode: boolean,
  selectedPersonIds: SelectedPersonValue[],
  selectedPeopleCount: number,
  selectedPerson?: AdminScopeUser | null
) {
  if (!isAdminMode) {
    return [
      'El interlocutor es la persona analizada.',
      'Háblale siempre directamente en segunda persona singular.',
      'Usa "tú", "te", "tu" y "tus".',
      'No hables sobre la persona en tercera persona salvo que el usuario lo pida explícitamente.',
      'No uses "él", "ella", "ellos" o "ellas" para referirte al interlocutor.',
    ].join(' ');
  }

  const isPlural =
    selectedPersonIds.includes('all') || selectedPeopleCount !== 1 || !selectedPerson;

  if (isPlural) {
    return [
      'El interlocutor es una persona de RRHH.',
      'Está preguntando por otras personas, no por sí mismo.',
      'Habla siempre en tercera persona y en plural cuando corresponda: "ellos", "ellas", "el equipo", "las personas seleccionadas".',
      'No uses nunca "tú", "te", "tu" o "tus" para referirte al sujeto analizado.',
      'No trates al interlocutor como si fuera la persona evaluada.',
    ].join(' ');
  }

  return [
    'El interlocutor es una persona de RRHH.',
    `Está preguntando por ${getPersonDisplayName(selectedPerson)}.`,
    'Habla siempre en tercera persona: "él", "ella", "esta persona" o usando su nombre.',
    'No uses nunca "tú", "te", "tu" o "tus" para referirte al sujeto analizado.',
    'No trates al interlocutor como si fuera la persona evaluada.',
  ].join(' ');
}

function hasRecentScopeConversation(recentMessages: ChatMessage[]) {
  return recentMessages
    .slice(-6)
    .some(
      (message) =>
        message.content.trim().length > 0 &&
        /competenc|capacidades|fortalezas|debilidades|perfil|progreso|diagn[oó]stico|formaci[oó]n|conocimiento|equipo|open kx|persona|colectivo|empleado/i.test(
          message.content
        )
    );
}

function isContextualAdminPrompt(
  text: string,
  scopeReady: boolean,
  selectedPersonIds: SelectedPersonValue[],
  recentMessages: ChatMessage[]
) {
  if (!scopeReady) return false;

  const value = text.trim();
  if (!value) return false;
  if (!selectedPersonIds.length) return false;

  const matchesContextualPattern = CONTEXTUAL_SCOPE_PATTERNS.some((pattern) =>
    pattern.test(value)
  );

  if (matchesContextualPattern) return true;

  const shortFollowUp =
    value.length <= 120 &&
    /^(y|vale|ok|perfecto|entonces|ahora|tamb[ií]en|m[aá]s|s[ií]|de acuerdo|genial|bien)\b/i.test(
      value
    );

  const followUpQuestion =
    value.length <= 140 &&
    /^(y\s+)?(qu[eé]|c[oó]mo|cu[aá]l|cu[aá]les|por qu[eé]|y de|y en|comp[aá]ral[oa]?|profundiza|ampl[ií]a|desarr[oó]llalo|dime m[aá]s|expl[ií]came)/i.test(
      value
    );

  if (!shortFollowUp && !followUpQuestion) return false;

  return hasRecentScopeConversation(recentMessages);
}

function isAllowedCoachPrompt(params: {
  text: string;
  isAdminMode: boolean;
  scopeReady: boolean;
  selectedPersonIds: SelectedPersonValue[];
  recentMessages: ChatMessage[];
}) {
  const { text, isAdminMode, scopeReady, selectedPersonIds, recentMessages } =
    params;
  const value = text.trim();

  if (!value) return false;

  const matchesOpenKx = OPEN_KX_ALLOWED_PATTERNS.some((pattern) =>
    pattern.test(value)
  );

  if (matchesOpenKx) return true;

  if (isAdminMode) {
    return isContextualAdminPrompt(
      value,
      scopeReady,
      selectedPersonIds,
      recentMessages
    );
  }

  return false;
}

function toggleSelection<T extends string | number>(
  current: T[],
  value: T,
  allValue: T
) {
  if (value === allValue) return [allValue];

  const base = current.filter((item) => item !== allValue);

  if (base.includes(value)) {
    const next = base.filter((item) => item !== value);
    return next.length ? next : [allValue];
  }

  return [...base, value];
}

function toggleDimensionSelection(
  current: DiagnosticDimension[],
  value: DiagnosticDimension
) {
  if (current.includes(value)) {
    return current.length === 1 ? current : current.filter((item) => item !== value);
  }

  return [...current, value];
}

function formatMultiValueLabel(
  values: string[],
  allValue: string,
  singularFallback: string,
  pluralLabel: string,
  allLabel = 'Todos'
) {
  if (!values.length) return singularFallback;
  if (values.includes(allValue)) return allLabel;
  if (values.length === 1) return values[0];
  return `${values.length} ${pluralLabel}`;
}

function formatUserValueLabel(
  values: SelectedPersonValue[],
  selectedPeople: AdminScopeUser[]
) {
  if (!values.length) return 'Selecciona usuario';
  if (values.includes('all')) return 'Todos';
  if (selectedPeople.length === 1) return getPersonDisplayName(selectedPeople[0]);
  return `${selectedPeople.length} usuarios`;
}

async function askCoach(input: string, instructions: string) {
  const response = await fetch(`${COACH_API_URL}/api/coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
      instructions,
      maxTokens: 900,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'No se ha podido obtener respuesta del coach.');
  }

  if (!data?.text?.trim()) {
    throw new Error('Respuesta vacía del coach.');
  }

  return data.text.trim();
}

const Coach: FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('admin') === '1';
  const { userAccountInfo, userInfo } = useUser();

  const freeChatStorageKey = getScopedStorageKey(
    FREE_CHAT_STORAGE_KEY,
    isAdminMode
  );
  const closedChatStorageKey = getScopedStorageKey(
    CLOSED_CHAT_STORAGE_KEY,
    isAdminMode
  );
  const historyStorageKey = getScopedStorageKey(
    CHAT_HISTORY_STORAGE_KEY,
    isAdminMode
  );
  const freeSessionStorageKey = getScopedStorageKey(
    FREE_SESSION_STORAGE_KEY,
    isAdminMode
  );
  const closedSessionStorageKey = getScopedStorageKey(
    CLOSED_SESSION_STORAGE_KEY,
    isAdminMode
  );
  const diagnosticStorageKey = getScopedStorageKey(
    DIAGNOSTIC_STORAGE_KEY,
    isAdminMode
  );
  const diagnosticMetaStorageKey = getScopedStorageKey(
    DIAGNOSTIC_META_STORAGE_KEY,
    isAdminMode
  );
  const diagnosticFeedbackStorageKey = getScopedStorageKey(
    DIAGNOSTIC_FEEDBACK_STORAGE_KEY,
    isAdminMode
  );
  const personalityStorageKey = getScopedStorageKey(
    PERSONALITY_KEY,
    isAdminMode
  );
  const onboardingStorageKey = getScopedStorageKey(
    PERSONALITY_ONBOARDING_KEY,
    isAdminMode
  );

  const storedDiagnosticMeta = safeReadDiagnosticMeta(diagnosticMetaStorageKey);
  const freeInitialMessages = getInitialMessages('libre', isAdminMode);
  const closedInitialMessages = getInitialMessages('cerrado', isAdminMode);

  const pageTitle = isAdminMode ? 'Coach Adm' : 'Coach AI';
  const pageSubtitle = isAdminMode
    ? 'Selecciona una persona de tu organización y habla con el coach sobre su evolución.'
    : 'Elige cómo quieres interactuar con tu Coach AI.';
  const closedActions = isAdminMode
    ? ADMIN_CLOSED_ACTIONS
    : NORMAL_CLOSED_ACTIONS;

  const defaultDiagnosticDimensions = useMemo(
    () => DIAGNOSTIC_DIMENSIONS.map((item) => item.id),
    []
  );

  const [step, setStep] = useState<CoachStep>(() =>
    safeReadBoolean(onboardingStorageKey) ? 'coach' : 'personality'
  );
  const [activeTab, setActiveTab] = useState<CoachTab>('libre');
  const [freeSessionId, setFreeSessionId] = useState(
    () => safeReadString(freeSessionStorageKey) || createId()
  );
  const [closedSessionId, setClosedSessionId] = useState(
    () => safeReadString(closedSessionStorageKey) || createId()
  );
  const [freeMessages, setFreeMessages] = useState<ChatMessage[]>(() =>
    safeParseMessages(freeChatStorageKey, freeInitialMessages)
  );
  const [closedMessages, setClosedMessages] = useState<ChatMessage[]>(() =>
    safeParseMessages(closedChatStorageKey, closedInitialMessages)
  );
  const [historySessions, setHistorySessions] = useState<HistorySession[]>(() =>
    safeParseJson<HistorySession[]>(historyStorageKey, [])
  );
  const [previewSession, setPreviewSession] = useState<HistorySession | null>(null);
  const [previewOriginTab, setPreviewOriginTab] = useState<CoachTab | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<string>(() =>
    safeReadString(diagnosticStorageKey)
  );
  const [diagnosticGeneratedAt, setDiagnosticGeneratedAt] = useState(
    () => storedDiagnosticMeta.generatedAt || ''
  );
  const [diagnosticPersonality, setDiagnosticPersonality] = useState<
    PersonalityId | ''
  >(() => storedDiagnosticMeta.personality || '');
  const [diagnosticTargetScopeKey, setDiagnosticTargetScopeKey] = useState<
    string | null
  >(() => storedDiagnosticMeta.targetScopeKey || null);
  const [diagnosticTargetDimensionsKey, setDiagnosticTargetDimensionsKey] =
    useState<string | null>(() => storedDiagnosticMeta.targetDimensionsKey || null);
  const [diagnosticFeedback, setDiagnosticFeedback] =
    useState<DiagnosticFeedback>(() =>
      safeReadDiagnosticFeedback(diagnosticFeedbackStorageKey)
    );
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [openScopePicker, setOpenScopePicker] = useState<ScopePickerKey>(null);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState('');
  const [personality, setPersonality] = useState<PersonalityId>(() => {
    const stored = safeReadString(personalityStorageKey) as PersonalityId;
    return PERSONALITIES[stored] ? stored : 'pragmatico';
  });
  const [selectedOrganizationName, setSelectedOrganizationName] = useState<
    string | null
  >(null);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPersonIds, setSelectedPersonIds] = useState<
    SelectedPersonValue[]
  >([]);
  const [selectedDiagnosticDimensions, setSelectedDiagnosticDimensions] =
    useState<DiagnosticDimension[]>(defaultDiagnosticDimensions);
  const [openPanels, setOpenPanels] = useState({
    alcance: true,
    dimensiones: true,
    resumen: true,
    contexto: false,
    historial: false,
  });

  const goalsQuery = useQuery<Goal[]>({
    queryKey: ['coach-goals', isAdminMode ? 'admin' : 'user'],
    queryFn: async () => {
      const endpoint = isAdminMode
        ? `${import.meta.env.VITE_API_URL}/goals/manager`
        : `${import.meta.env.VITE_API_URL}/goals`;
      const { data } = await api.get(endpoint);
      return Array.isArray(data) ? data : [];
    },
  });

  const capacitiesQuery = useQuery<Capacity[]>({
    queryKey: ['coach-capacities'],
    enabled: !isAdminMode,
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/diagnoses/capacities-comparison`
      );
      return Array.isArray(data) ? data : [];
    },
  });

  const peopleQuery = useQuery<AdminScopeUser[]>({
    queryKey: ['coach-admin-people'],
    enabled: isAdminMode,
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/accounts/organization/users/`
      );
      return Array.isArray(data) ? data : [];
    },
  });

  const people = peopleQuery.data || [];

  useEffect(() => {
    if (isAdminMode) return;

    const hasAdminMessageInFree =
      freeMessages[0]?.role === 'assistant' &&
      freeMessages[0]?.content?.includes('Selecciona primero el alcance');

    if (hasAdminMessageInFree) {
      setFreeMessages(getInitialMessages('libre', false));
    }
  }, [freeMessages, isAdminMode]);

  useEffect(() => {
    if (isAdminMode) return;

    const hasAdminMessageInClosed =
      closedMessages[0]?.role === 'assistant' &&
      closedMessages[0]?.content?.includes('Selecciona primero el alcance');

    if (hasAdminMessageInClosed) {
      setClosedMessages(getInitialMessages('cerrado', false));
    }
  }, [closedMessages, isAdminMode]);

  const allPeopleIdsKey = useMemo(
    () =>
      people
        .map((person) => person.id)
        .sort((a, b) => a - b)
        .join(','),
    [people]
  );

  const organizationPeopleDetailsQuery = useQuery<
    Record<number, TargetAccountInfo>
  >({
    queryKey: ['coach-admin-organization-people-details', allPeopleIdsKey],
    enabled: isAdminMode && people.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        people.map(async (person) => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/accounts/accountinfo/${person.id}/`
          );
          return [person.id, data] as const;
        })
      );

      return Object.fromEntries(results);
    },
  });

  const organizationPeopleDetails = organizationPeopleDetailsQuery.data || {};

  const availableOrganizations = useMemo(() => {
    const items = uniqueStrings(
      people
        .map((person) =>
          getRootOrganizationName(organizationPeopleDetails[person.id])
        )
        .filter((value): value is string => Boolean(value))
    );

    return [ALL_ORGANIZATIONS, ...items];
  }, [people, organizationPeopleDetails]);

  useEffect(() => {
    if (!isAdminMode) return;
    if (selectedOrganizationName) return;
    if (!availableOrganizations.length) return;
    setSelectedOrganizationName(ALL_ORGANIZATIONS);
  }, [availableOrganizations, isAdminMode, selectedOrganizationName]);

  useEffect(() => {
    if (!selectedOrganizationName) {
      setSelectedFunctions([]);
      setSelectedAreas([]);
      setSelectedPersonIds([]);
      return;
    }

    if (isAdminMode) {
      setSelectedFunctions([ALL_FUNCTIONS]);
      setSelectedAreas([ALL_AREAS]);
      setSelectedPersonIds(['all']);
    } else {
      setSelectedFunctions([]);
      setSelectedAreas([]);
      setSelectedPersonIds([]);
    }
  }, [selectedOrganizationName, isAdminMode]);

  useEffect(() => {
    if (!isAdminMode) return;

    if (!selectedFunctions.length) {
      setSelectedAreas([]);
      setSelectedPersonIds([]);
      return;
    }

    setSelectedAreas([ALL_AREAS]);
    setSelectedPersonIds(['all']);
  }, [selectedFunctions, isAdminMode]);

  useEffect(() => {
    if (!isAdminMode) return;

    if (!selectedAreas.length) {
      setSelectedPersonIds([]);
      return;
    }

    setSelectedPersonIds(['all']);
  }, [selectedAreas, isAdminMode]);

  const peopleInCompany = useMemo(() => {
    if (
      !selectedOrganizationName ||
      selectedOrganizationName === ALL_ORGANIZATIONS
    ) {
      return people;
    }

    return people.filter(
      (person) =>
        getRootOrganizationName(organizationPeopleDetails[person.id]) ===
        selectedOrganizationName
    );
  }, [people, organizationPeopleDetails, selectedOrganizationName]);

  const availableFunctions = useMemo(() => {
    return [
      ALL_FUNCTIONS,
      ...uniqueStrings(
        peopleInCompany.flatMap(
          (person) => organizationPeopleDetails[person.id]?.function || []
        )
      ),
    ];
  }, [peopleInCompany, organizationPeopleDetails]);

  const peopleInFunction = useMemo(() => {
    if (!selectedFunctions.length || selectedFunctions.includes(ALL_FUNCTIONS)) {
      return peopleInCompany;
    }

    return peopleInCompany.filter((person) =>
      (organizationPeopleDetails[person.id]?.function || []).some((item) =>
        selectedFunctions.includes(item)
      )
    );
  }, [peopleInCompany, organizationPeopleDetails, selectedFunctions]);

  const availableAreas = useMemo(() => {
    if (!selectedFunctions.length) return [];
    return [
      ALL_AREAS,
      ...uniqueStrings(
        peopleInFunction
          .map((person) => getAreaName(organizationPeopleDetails[person.id]))
          .filter((value): value is string => Boolean(value))
      ),
    ];
  }, [peopleInFunction, organizationPeopleDetails, selectedFunctions]);

  const peopleInArea = useMemo(() => {
    if (!selectedAreas.length || selectedAreas.includes(ALL_AREAS)) {
      return [...peopleInFunction].sort((a, b) =>
        getPersonDisplayName(a).localeCompare(getPersonDisplayName(b))
      );
    }

    return peopleInFunction
      .filter((person) =>
        selectedAreas.includes(getAreaName(organizationPeopleDetails[person.id]))
      )
      .sort((a, b) =>
        getPersonDisplayName(a).localeCompare(getPersonDisplayName(b))
      );
  }, [organizationPeopleDetails, peopleInFunction, selectedAreas]);

  const selectedPeople = useMemo(() => {
    if (!selectedPersonIds.length || selectedPersonIds.includes('all')) {
      return [];
    }

    const ids = new Set(
      selectedPersonIds.filter(
        (value): value is number => typeof value === 'number'
      )
    );

    return peopleInArea.filter((person) => ids.has(person.id));
  }, [peopleInArea, selectedPersonIds]);

  const selectedPerson = selectedPeople.length === 1 ? selectedPeople[0] : null;

  const scopedPeople = useMemo(() => {
    if (!isAdminMode) return [];

    if (!selectedPersonIds.length || selectedPersonIds.includes('all')) {
      return peopleInArea;
    }

    const ids = new Set(
      selectedPersonIds.filter(
        (value): value is number => typeof value === 'number'
      )
    );

    return peopleInArea.filter((person) => ids.has(person.id));
  }, [isAdminMode, peopleInArea, selectedPersonIds]);

  const scopedPeopleIds = useMemo(
    () => new Set(scopedPeople.map((person) => person.id)),
    [scopedPeople]
  );

  const scopedAccountInfos = useMemo(() => {
    return scopedPeople
      .map((person) => organizationPeopleDetails[person.id])
      .filter(Boolean) as TargetAccountInfo[];
  }, [organizationPeopleDetails, scopedPeople]);

  const selectedPersonAccountInfo = useMemo(() => {
    if (!selectedPerson) return null;
    return organizationPeopleDetails[selectedPerson.id] || null;
  }, [organizationPeopleDetails, selectedPerson]);

  const scopedGoals = useMemo(() => {
    const allGoals = goalsQuery.data || [];

    if (!isAdminMode) {
      return allGoals;
    }

    if (!scopedPeopleIds.size) {
      return [];
    }

    return allGoals.filter((goal) => {
      const goalUserId = getGoalUserId(goal);
      return scopedPeopleIds.has(Number(goalUserId));
    });
  }, [goalsQuery.data, isAdminMode, scopedPeopleIds]);

  const topCapacityHighlights = useMemo(() => {
    if (isAdminMode) {
      if (selectedPeople.length === 1 && selectedPersonAccountInfo) {
        return (selectedPersonAccountInfo.capacity || []).slice(0, 5);
      }

      return aggregateCapacities(scopedAccountInfos);
    }

    return [...(capacitiesQuery.data || [])]
      .filter((item) => typeof item.value === 'number')
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
      .map((item) => `${item.aspect}: ${item.value}%`);
  }, [
    capacitiesQuery.data,
    isAdminMode,
    scopedAccountInfos,
    selectedPeople.length,
    selectedPersonAccountInfo,
  ]);

  const selectedCompanyLabel =
    selectedOrganizationName === ALL_ORGANIZATIONS
      ? 'Todas'
      : selectedOrganizationName || 'Sin seleccionar';

  const selectedFunctionLabel = formatMultiValueLabel(
    selectedFunctions,
    ALL_FUNCTIONS,
    'Selecciona función',
    'funciones',
    'Todas'
  );

  const selectedAreaLabel = formatMultiValueLabel(
    selectedAreas,
    ALL_AREAS,
    'Selecciona área',
    'áreas',
    'Todas'
  );

  const selectedUserLabel = formatUserValueLabel(selectedPersonIds, selectedPeople);

  const selectedDiagnosticDimensionLabels = useMemo(
    () =>
      selectedDiagnosticDimensions
        .map(
          (item) =>
            DIAGNOSTIC_DIMENSIONS.find((dimension) => dimension.id === item)?.label ||
            item
        )
        .join(', '),
    [selectedDiagnosticDimensions]
  );

  const scopeTrail = useMemo(
    () =>
      isAdminMode
        ? [
            selectedCompanyLabel,
            selectedFunctionLabel,
            selectedAreaLabel,
            selectedUserLabel,
          ]
        : [],
    [
      isAdminMode,
      selectedAreaLabel,
      selectedCompanyLabel,
      selectedFunctionLabel,
      selectedUserLabel,
    ]
  );

  const adminDiagnosticFocus = useMemo(() => {
    if (!isAdminMode) return '';

    const scopeIsFullyGlobal =
      selectedCompanyLabel === 'Todas' &&
      selectedFunctionLabel === 'Todas' &&
      selectedAreaLabel === 'Todas' &&
      selectedUserLabel === 'Todos';

    const scopeLabel = scopeIsFullyGlobal
      ? 'Todas'
      : [selectedCompanyLabel, selectedFunctionLabel, selectedAreaLabel, selectedUserLabel]
          .filter(Boolean)
          .join(' > ');

    return `Alcance -> ${scopeLabel} | Dimensiones -> ${selectedDiagnosticDimensionLabels}`;
  }, [
    isAdminMode,
    selectedAreaLabel,
    selectedCompanyLabel,
    selectedDiagnosticDimensionLabels,
    selectedFunctionLabel,
    selectedUserLabel,
  ]);

  const scopeReady =
    !isAdminMode ||
    Boolean(
      selectedOrganizationName &&
        selectedFunctions.length &&
        selectedAreas.length &&
        selectedPersonIds.length
    );

  const adminScopeKey = useMemo(() => {
    if (!isAdminMode) return 'self';

    const functionKey = [...selectedFunctions].sort().join(',');
    const areaKey = [...selectedAreas].sort().join(',');
    const personKey = [...selectedPersonIds]
      .map((value) => String(value))
      .sort()
      .join(',');

    return `${selectedOrganizationName || ''}|${functionKey}|${areaKey}|${personKey}`;
  }, [
    isAdminMode,
    selectedAreas,
    selectedFunctions,
    selectedOrganizationName,
    selectedPersonIds,
  ]);

  const diagnosticDimensionsKey = useMemo(() => {
    if (!isAdminMode) return 'default';
    return [...selectedDiagnosticDimensions].sort().join(',');
  }, [isAdminMode, selectedDiagnosticDimensions]);

  const targetProfile = useMemo(() => {
    if (isAdminMode) {
      if (selectedPeople.length === 1 && selectedPersonAccountInfo) {
        return {
          publicName:
            selectedPersonAccountInfo.public_name ||
            selectedPerson?.public_name ||
            selectedPerson?.username ||
            null,
          type: selectedPersonAccountInfo.type || null,
          profile: selectedPersonAccountInfo.profile || [],
          industry: selectedPersonAccountInfo.industry || [],
          capacity: selectedPersonAccountInfo.capacity || [],
          function: selectedPersonAccountInfo.function || [],
          level: selectedPersonAccountInfo.level || [],
          organizationName:
            selectedAreas.includes(ALL_AREAS)
              ? selectedOrganizationName === ALL_ORGANIZATIONS
                ? 'Todas las empresas'
                : selectedOrganizationName || null
              : selectedAreas.length === 1
                ? selectedAreas[0]
                : `${selectedAreas.length} áreas`,
        };
      }

      return {
        publicName:
          !selectedPersonIds.length || selectedPersonIds.includes('all')
            ? selectedAreas.includes(ALL_AREAS)
              ? selectedFunctions.includes(ALL_FUNCTIONS)
                ? selectedOrganizationName === ALL_ORGANIZATIONS
                  ? 'Toda la empresa'
                  : `Personas de ${selectedOrganizationName}`
                : selectedFunctions.length === 1
                  ? `Personas de ${selectedFunctions[0]}`
                  : `Personas de ${selectedFunctions.length} funciones`
              : selectedAreas.length === 1
                ? `Personas de ${selectedAreas[0]}`
                : `Personas de ${selectedAreas.length} áreas`
            : `${selectedPeople.length} usuarios`,
        type: null,
        profile: flattenAccountField(scopedAccountInfos, 'profile'),
        industry: flattenAccountField(scopedAccountInfos, 'industry'),
        capacity: flattenAccountField(scopedAccountInfos, 'capacity'),
        function: flattenAccountField(scopedAccountInfos, 'function'),
        level: flattenAccountField(scopedAccountInfos, 'level'),
        organizationName:
          selectedAreas.includes(ALL_AREAS)
            ? selectedOrganizationName === ALL_ORGANIZATIONS
              ? 'Todas las empresas'
              : selectedOrganizationName || null
            : selectedAreas.length === 1
              ? selectedAreas[0]
              : `${selectedAreas.length} áreas`,
      };
    }

    return {
      publicName: userAccountInfo?.public_name || null,
      type: userAccountInfo?.type || null,
      profile: userAccountInfo?.profile || [],
      industry: userAccountInfo?.industry || [],
      capacity: userAccountInfo?.capacity || [],
      function: userAccountInfo?.function || [],
      level: userAccountInfo?.level || [],
      organizationName: userInfo?.organization || null,
    };
  }, [
    isAdminMode,
    scopedAccountInfos,
    selectedAreas,
    selectedFunctions,
    selectedOrganizationName,
    selectedPeople.length,
    selectedPerson,
    selectedPersonAccountInfo,
    selectedPersonIds,
    userAccountInfo,
    userInfo?.organization,
  ]);

  const pendingGoals = scopedGoals
    .filter((goal) => goal.status !== 'done')
    .slice(0, 3);

  const completedGoalsCount = scopedGoals.filter(
    (goal) => goal.status === 'done'
  ).length;

  const totalGoalsCount = scopedGoals.length;

  const initialOffset = isAdminMode ? 0 : 1;
  const hasFreeConversation = freeMessages.length > initialOffset;
  const hasClosedConversation = closedMessages.length > initialOffset;
  const currentMessages = activeTab === 'libre' ? freeMessages : closedMessages;
  const currentHasConversation =
    activeTab === 'libre' ? hasFreeConversation : hasClosedConversation;
  const displayMessages = previewSession ? previewSession.messages : currentMessages;
  const displayHasConversation = previewSession
    ? previewSession.messages.length > 0
    : currentHasConversation;

  const activeDiagnosticReport =
    !isAdminMode ||
    (diagnosticTargetScopeKey === adminScopeKey &&
      diagnosticTargetDimensionsKey === diagnosticDimensionsKey)
      ? diagnosticReport
      : '';

  const activeDiagnosticGeneratedAt =
    !isAdminMode ||
    (diagnosticTargetScopeKey === adminScopeKey &&
      diagnosticTargetDimensionsKey === diagnosticDimensionsKey)
      ? diagnosticGeneratedAt
      : '';

  const activeDiagnosticFeedback =
    !isAdminMode ||
    (diagnosticTargetScopeKey === adminScopeKey &&
      diagnosticTargetDimensionsKey === diagnosticDimensionsKey)
      ? diagnosticFeedback
      : '';

  const diagnosticSections = activeDiagnosticReport
    ? parseDiagnosticSections(activeDiagnosticReport)
    : [];

  const shareText = activeDiagnosticReport
    ? buildDiagnosticShareText(diagnosticSections, activeDiagnosticGeneratedAt)
    : '';

  useEffect(() => {
    localStorage.setItem(freeChatStorageKey, JSON.stringify(freeMessages));
  }, [freeMessages, freeChatStorageKey]);

  useEffect(() => {
    localStorage.setItem(closedChatStorageKey, JSON.stringify(closedMessages));
  }, [closedMessages, closedChatStorageKey]);

  useEffect(() => {
    localStorage.setItem(personalityStorageKey, personality);
  }, [personality, personalityStorageKey]);

  useEffect(() => {
    localStorage.setItem(historyStorageKey, JSON.stringify(historySessions));
  }, [historySessions, historyStorageKey]);

  useEffect(() => {
    localStorage.setItem(freeSessionStorageKey, freeSessionId);
  }, [freeSessionId, freeSessionStorageKey]);

  useEffect(() => {
    localStorage.setItem(closedSessionStorageKey, closedSessionId);
  }, [closedSessionId, closedSessionStorageKey]);

  useEffect(() => {
    localStorage.setItem(diagnosticStorageKey, diagnosticReport);
  }, [diagnosticReport, diagnosticStorageKey]);

  useEffect(() => {
    localStorage.setItem(
      diagnosticMetaStorageKey,
      JSON.stringify({
        generatedAt: diagnosticGeneratedAt,
        personality: diagnosticPersonality,
        targetScopeKey: diagnosticTargetScopeKey,
        targetDimensionsKey: diagnosticTargetDimensionsKey,
      })
    );
  }, [
    diagnosticGeneratedAt,
    diagnosticMetaStorageKey,
    diagnosticPersonality,
    diagnosticTargetDimensionsKey,
    diagnosticTargetScopeKey,
  ]);

  useEffect(() => {
    localStorage.setItem(diagnosticFeedbackStorageKey, diagnosticFeedback);
  }, [diagnosticFeedback, diagnosticFeedbackStorageKey]);

  useEffect(() => {
    setHistorySessions((current) =>
      upsertHistorySession(current, freeSessionId, 'libre', freeMessages, personality)
    );
  }, [freeMessages, freeSessionId, personality]);

  useEffect(() => {
    setHistorySessions((current) =>
      upsertHistorySession(
        current,
        closedSessionId,
        'cerrado',
        closedMessages,
        personality
      )
    );
  }, [closedMessages, closedSessionId, personality]);

  const handleWhatsAppShare = () => {
    if (!shareText) return;
    setShareMenuOpen(false);

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleMailShare = () => {
    if (!shareText) return;
    setShareMenuOpen(false);

    const subject = encodeURIComponent('Informe de diagnóstico');
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const togglePanel = (panel: PanelKey) => {
    setOpenPanels((current) => ({
      ...current,
      [panel]: !current[panel],
    }));
  };

  const closePreview = () => {
    if (previewOriginTab) {
      setActiveTab(previewOriginTab);
    }
    setShareMenuOpen(false);
    setOpenScopePicker(null);
    setPreviewSession(null);
    setPreviewOriginTab(null);
  };

  const handleTabChange = (tab: CoachTab) => {
    setPreviewSession(null);
    setPreviewOriginTab(null);
    setShareMenuOpen(false);
    setOpenScopePicker(null);
    setActiveTab(tab);
  };

  const openPersonalityStep = () => {
    setPreviewSession(null);
    setPreviewOriginTab(null);
    setShareMenuOpen(false);
    setOpenScopePicker(null);
    setStep('personality');
  };

  const selectPersonality = (nextPersonality: PersonalityId) => {
    setPersonality(nextPersonality);
    localStorage.setItem(onboardingStorageKey, 'true');
    setStep('coach');
  };

  const sendPrompt = async (text: string, mode: ChatMode) => {
    const cleanText = text.trim();
    if (!cleanText || chatLoading || previewSession) return;

    if (isAdminMode && !scopeReady) {
      setChatError(
        'Completa el alcance antes de empezar a hablar con el coach.'
      );
      return;
    }

    if (
      mode === 'libre' &&
      !isAllowedCoachPrompt({
        text: cleanText,
        isAdminMode,
        scopeReady,
        selectedPersonIds,
        recentMessages: freeMessages,
      })
    ) {
      const userMessage: ChatMessage = {
        id: createId(),
        role: 'user',
        content: cleanText,
      };

      const rejectionMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: isAdminMode
          ? 'Esto aquí no toca. En Coach Adm solo respondo sobre Open KX, formación, contenidos, información, conocimiento y sobre la persona o colectivo seleccionados dentro de ese contexto. Si lo necesitas, reformula la pregunta dentro de ese alcance. ¿Necesitas algo más?'
          : 'Esto aquí no toca. Aquí solo respondo sobre Open KX: contenidos, formación, información y uso del conocimiento dentro de ese entorno. Si lo necesitas, reformula la pregunta dentro de ese alcance. ¿Necesitas algo más?',
      };

      setFreeMessages((current) => [...current, userMessage, rejectionMessage]);
      setInput('');
      setChatError('');
      return;
    }

    setChatError('');

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: cleanText,
    };

    const sourceMessages = mode === 'libre' ? freeMessages : closedMessages;
    const nextMessages = [...sourceMessages, userMessage];

    if (mode === 'libre') {
      setFreeMessages(nextMessages);
      setInput('');
    } else {
      setClosedMessages(nextMessages);
    }

    setChatLoading(true);

    try {
      const history = nextMessages
        .slice(-8)
        .map((message) =>
          `${message.role === 'user' ? 'Usuario' : 'Coach'}: ${message.content}`
        )
        .join('\n\n');

      const context = buildTargetContext(
        targetProfile,
        scopedGoals,
        topCapacityHighlights,
        isAdminMode ? scopeTrail : undefined
      );

      const modeInstruction =
        mode === 'libre'
          ? 'Modo conversación libre: responde con naturalidad, cercanía y foco. No suenes robótico.'
          : 'Modo conversación cerrada: responde solo a la acción elegida por el usuario. Ve al grano, sé útil y no abras líneas innecesarias.';

      const perspectiveInstruction = buildPerspectiveInstruction(
        isAdminMode,
        selectedPersonIds,
        scopedPeople.length,
        selectedPerson
      );

      const instructions = [
        PERSONALITIES[personality].prompt,
        'Responde siempre en español.',
        perspectiveInstruction,
        'Que la personalidad elegida se note de verdad.',
        'Mantén un tono humano, natural y cercano.',
        'Sé concreto.',
        'Cuando propongas acciones, prioriza 3 como máximo.',
        'Si faltan datos, dilo de forma breve y continúa con una recomendación útil.',
        modeInstruction,
        mode === 'libre'
          ? 'En conversación libre, responde solo sobre Open KX, formación, contenidos, información, conocimiento y análisis de la persona o colectivo seleccionado cuando el contexto ya esté fijado.'
          : '',
        mode === 'libre' && isAdminMode
          ? 'Si el usuario dice expresiones como "esta persona", "su perfil", "sus competencias", "profundiza", "compáralo con el equipo" o similares, debes entender que se refiere a la persona o colectivo seleccionados en el alcance actual.'
          : '',
        mode === 'libre'
          ? 'Si la pregunta se sale de ese alcance, debes rechazarla brevemente, decir que aquí no toca y preguntar si necesita algo más.'
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const coachReply = await askCoach(
        `${context}\n\nConversación reciente:\n${history}\n\nÚltimo mensaje del usuario:\n${cleanText}`,
        instructions
      );

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: coachReply,
      };

      if (mode === 'libre') {
        setFreeMessages((current) => [...current, assistantMessage]);
      } else {
        setClosedMessages((current) => [...current, assistantMessage]);
      }
    } catch (err: any) {
      setChatError(err?.message || 'Error inesperado al contactar con el coach.');
    } finally {
      setChatLoading(false);
    }
  };

  const generateDiagnostic = async () => {
    if (diagnosticLoading) return;

    if (isAdminMode && !scopeReady) {
      setDiagnosticError(
        'Completa el alcance antes de generar el diagnóstico.'
      );
      return;
    }

    setDiagnosticLoading(true);
    setDiagnosticError('');
    setShareMenuOpen(false);

    try {
      const baseContext = buildTargetContext(
        targetProfile,
        scopedGoals,
        topCapacityHighlights,
        isAdminMode ? scopeTrail : undefined
      );

      const adminDimensionContext =
        isAdminMode && selectedDiagnosticDimensions.length
          ? buildAdminDiagnosticDimensionContext({
              dimensions: selectedDiagnosticDimensions,
              scopedPeople,
              scopedGoals,
              scopedAccountInfos,
              topCapacityHighlights,
              selectedOrganizationName,
              selectedFunctions,
              selectedAreas,
            })
          : '';

      const diagnosticContext = [baseContext, adminDimensionContext]
        .filter(Boolean)
        .join('\n\n');

      const perspectiveInstruction = buildPerspectiveInstruction(
        isAdminMode,
        selectedPersonIds,
        scopedPeople.length,
        selectedPerson
      );

      const instructions = [
        PERSONALITIES[personality].prompt,
        'Responde siempre en español.',
        'No hagas preguntas.',
        'No actúes como chat.',
        perspectiveInstruction,
        'Devuelve un único informe continuo.',
        'Ese único informe debe incluir exactamente estos tres subtítulos y en este orden literal, cada uno en su propia línea:',
        '1. Contexto actual',
        '2. Oportunidad y riesgo',
        '3. Acciones sugeridas',
        isAdminMode
          ? 'En "3. Acciones sugeridas", escribe exactamente 3 párrafos breves, uno por acción.'
          : '',
        isAdminMode
          ? 'No uses las palabras "primero", "segundo" ni "tercero".'
          : '',
        'No añadas ningún otro título.',
        'Cada subtítulo debe tener contenido real debajo.',
        'No dejes vacíos "2. Oportunidad y riesgo" ni "3. Acciones sugeridas".',
        'No mezcles todo el contenido dentro de "1. Contexto actual".',
        'Todo debe formar parte del mismo informe.',
        'Cada apartado debe tener contenido propio y distinto.',
        'En acciones sugeridas prioriza un máximo de 3 acciones concretas.',
        'Que se note claramente la personalidad elegida.',
        'Si eres motivador, da ánimo de forma creíble.',
        'Si eres pragmático, ve al grano pero mantén cercanía.',
        'Si eres brutal, confronta con firmeza y utilidad, sin humillar.',
        'Máximo 500 palabras.',
        'No inventes datos que no estén en el contexto.',
        isAdminMode
          ? `Debes centrar el diagnóstico solo en estas dimensiones: ${selectedDiagnosticDimensions
              .map(
                (item) =>
                  DIAGNOSTIC_DIMENSIONS.find((dimension) => dimension.id === item)
                    ?.label || item
              )
              .join(', ')}.`
          : '',
        isAdminMode
          ? 'Si una dimensión seleccionada no tiene datos directos, dilo explícitamente y no inventes información.'
          : '',
        isAdminMode && scopedPeople.length > 1
          ? 'Si el alcance incluye varias personas, debes analizar el colectivo con cantidades absolutas y porcentajes cuando el contexto los aporte.'
          : '',
        isAdminMode && scopedPeople.length > 1
          ? 'Habla del grupo como grupo. Ejemplos válidos: "de 35 personas, 10 han completado..." o "solo el 29% ha completado...".'
          : '',
        isAdminMode && selectedDiagnosticDimensions.includes('metas')
          ? 'Cuando se analicen metas en un colectivo, prioriza cumplimiento, personas con metas pendientes, personas sin metas y diferencias internas.'
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const report = await askCoach(
        `${diagnosticContext}\n\nElabora un diagnóstico ejecutivo del usuario a partir de su perfil, su contexto y sus metas actuales.`,
        instructions
      );

      setDiagnosticReport(normalizeDiagnosticReport(report));
      setDiagnosticGeneratedAt(new Date().toISOString());
      setDiagnosticPersonality(personality);
      setDiagnosticTargetScopeKey(adminScopeKey);
      setDiagnosticTargetDimensionsKey(diagnosticDimensionsKey);
      setDiagnosticFeedback('');
    } catch (err: any) {
      setDiagnosticError(
        err?.message || 'No se ha podido generar el diagnóstico.'
      );
    } finally {
      setDiagnosticLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeTab === 'diagnostico' &&
      !activeDiagnosticReport &&
      !diagnosticLoading &&
      !goalsQuery.isLoading &&
      (!isAdminMode || scopeReady) &&
      (!isAdminMode ||
        !selectedOrganizationName ||
        !organizationPeopleDetailsQuery.isLoading)
    ) {
      void generateDiagnostic();
    }
  }, [
    activeDiagnosticReport,
    activeTab,
    diagnosticLoading,
    goalsQuery.isLoading,
    isAdminMode,
    organizationPeopleDetailsQuery.isLoading,
    scopeReady,
    selectedDiagnosticDimensions,
    selectedOrganizationName,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendPrompt(input, 'libre');
  };

  const resetCurrentTab = () => {
    setPreviewSession(null);
    setPreviewOriginTab(null);
    setChatError('');
    setDiagnosticError('');
    setInput('');
    setShareMenuOpen(false);
    setOpenScopePicker(null);

    if (activeTab === 'libre') {
      setFreeSessionId(createId());
      setFreeMessages(freeInitialMessages);
      return;
    }

    if (activeTab === 'cerrado') {
      setClosedSessionId(createId());
      setClosedMessages(closedInitialMessages);
      return;
    }

    setDiagnosticReport('');
    setDiagnosticFeedback('');
    void generateDiagnostic();
  };

  const openHistorySession = (session: HistorySession) => {
    if (!previewSession) {
      setPreviewOriginTab(activeTab);
    }
    setStep('coach');
    setActiveTab(session.mode);
    setChatError('');
    setShareMenuOpen(false);
    setOpenScopePicker(null);
    setPreviewSession(session);
  };

  const clearHistory = () => {
    setHistorySessions([]);
    setPreviewSession(null);
    setPreviewOriginTab(null);
    setOpenScopePicker(null);
  };

  const tabButtonClass = (tab: CoachTab) =>
    `rounded-xl px-4 py-3 text-sm font-semibold transition ${
      activeTab === tab
        ? 'bg-primary-600 text-white'
        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
    }`;

  const panelArrowClass = (isOpen: boolean) =>
    `text-xs text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`;

  const scopePickerButtonClass =
    'flex w-full items-center justify-between rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10';

  const scopeOptionClass = (active: boolean) =>
    `w-full rounded-xl px-3 py-2 text-left text-sm transition ${
      active
        ? 'bg-primary-600 text-white'
        : 'text-gray-200 hover:bg-white/10 hover:text-white'
    }`;

  const feedbackButtonClass = (type: Exclude<DiagnosticFeedback, ''>) =>
    `flex h-11 w-11 items-center justify-center rounded-xl border transition ${
      activeDiagnosticFeedback === type
        ? 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-900/30'
        : 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white'
    }`;

  const dimensionButtonClass = (active: boolean) =>
    `w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
      active
        ? 'border-primary-500 bg-primary-600/15 text-white'
        : 'border-white/10 bg-gray-900 text-gray-200 hover:bg-white/10 hover:text-white'
    }`;

  const personalitySelectionContent = (
    <div className="container mx-auto flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gray-800 p-6 md:p-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-primary-300">
          {pageTitle}
        </p>
        <h1 className="mt-3 text-center text-2xl font-bold text-white md:text-3xl">
          Elige la personalidad con la que quieres entrar
        </h1>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(Object.keys(PERSONALITIES) as PersonalityId[]).map((key) => {
            const item = PERSONALITIES[key];
            const active = key === personality;

            return (
              <div
                key={key}
                className={`rounded-2xl border p-5 text-left transition ${
                  active
                    ? 'border-primary-500 bg-primary-600/15 text-white'
                    : 'border-white/10 bg-gray-900 text-gray-100'
                }`}
              >
                <span className="block text-3xl">{item.emoji}</span>
                <span className="mt-4 block text-lg font-semibold">
                  {item.label}
                </span>
                <span className="mt-2 block text-sm text-gray-300">
                  {item.description}
                </span>

                <button
                  type="button"
                  onClick={() => selectPersonality(key)}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
                >
                  Seleccionar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const coachContent = (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
          <p className="mt-2 text-sm text-gray-300">{pageSubtitle}</p>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          {activeTab === 'diagnostico' && activeDiagnosticReport ? (
            <>
              <button
                type="button"
                onClick={() => setShareMenuOpen((current) => !current)}
                disabled={!shareText}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Compartir
                <svg
                  className={`h-4 w-4 transition-transform ${
                    shareMenuOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {shareMenuOpen && shareText && (
                <>
                  <button
                    type="button"
                    aria-label="Cerrar compartir"
                    onClick={() => setShareMenuOpen(false)}
                    className="fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px]"
                  />

                  <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-white/15 bg-[#0b1220] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Compartir informe
                    </p>

                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600/20 text-green-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.62 2 2.2 6.42 2.2 11.83c0 1.73.45 3.42 1.31 4.91L2 22l5.42-1.42a9.8 9.8 0 0 0 4.61 1.17h.01c5.41 0 9.83-4.42 9.83-9.83 0-2.62-1.02-5.08-2.82-6.99Zm-7.02 15.18h-.01a8.12 8.12 0 0 1-4.14-1.13l-.3-.18-3.21.84.86-3.13-.2-.32a8.14 8.14 0 0 1-1.25-4.34c0-4.5 3.66-8.16 8.17-8.16 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16Zm4.47-6.1c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.17-.71-.63-1.2-1.4-1.34-1.64-.14-.24-.01-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
                        </svg>
                      </span>
                      WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={handleMailShare}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 6h16v12H4z" />
                          <path d="m4 7 8 6 8-6" />
                        </svg>
                      </span>
                      Mail
                    </button>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => void generateDiagnostic()}
                disabled={diagnosticLoading || (isAdminMode && !scopeReady)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generar nuevo diagnóstico
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={resetCurrentTab}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Nueva conversación +
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleTabChange('libre')}
          className={tabButtonClass('libre')}
        >
          Conversación libre
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('cerrado')}
          className={tabButtonClass('cerrado')}
        >
          Conversación cerrada
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('diagnostico')}
          className={tabButtonClass('diagnostico')}
        >
          Diagnóstico
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1.45fr)] xl:grid-cols-[300px_minmax(0,1.7fr)]">
        <aside className="space-y-4">
          {isAdminMode && (
            <>
              <div className="rounded-2xl border border-white/10 bg-gray-800 p-5">
                <button
                  type="button"
                  onClick={() => togglePanel('alcance')}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
                    Alcance
                  </h2>
                  <span className={panelArrowClass(openPanels.alcance)}>{'>'}</span>
                </button>

                {openPanels.alcance && (
                  <>
                    <div className="mt-4 rounded-xl bg-gray-900 px-4 py-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Ruta activa
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {scopeTrail.join(' > ')}
                      </p>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-400">
                          Empresa
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenScopePicker((current) =>
                              current === 'empresa' ? null : 'empresa'
                            )
                          }
                          className={scopePickerButtonClass}
                        >
                          <span>
                            {selectedOrganizationName === ALL_ORGANIZATIONS
                              ? 'Todas'
                              : selectedOrganizationName || 'Selecciona empresa'}
                          </span>
                          <span className={panelArrowClass(openScopePicker === 'empresa')}>
                            {'>'}
                          </span>
                        </button>

                        {openScopePicker === 'empresa' && (
                          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-gray-950 p-2">
                            {availableOrganizations.map((organizationName) => (
                              <button
                                key={organizationName}
                                type="button"
                                onClick={() => {
                                  setSelectedOrganizationName(organizationName);
                                  setOpenScopePicker(null);
                                }}
                                className={scopeOptionClass(
                                  selectedOrganizationName === organizationName
                                )}
                              >
                                {organizationName === ALL_ORGANIZATIONS
                                  ? 'Todas'
                                  : organizationName}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-400">
                          Función
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedOrganizationName) return;
                            setOpenScopePicker((current) =>
                              current === 'funcion' ? null : 'funcion'
                            );
                          }}
                          disabled={!selectedOrganizationName}
                          className={`${scopePickerButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <span>{selectedFunctionLabel}</span>
                          <span className={panelArrowClass(openScopePicker === 'funcion')}>
                            {'>'}
                          </span>
                        </button>

                        {openScopePicker === 'funcion' && selectedOrganizationName && (
                          <div className="mt-2 rounded-xl border border-white/10 bg-gray-950 p-2">
                            <div className="max-h-56 overflow-y-auto">
                              {availableFunctions.map((item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() =>
                                    setSelectedFunctions((current) =>
                                      toggleSelection(current, item, ALL_FUNCTIONS)
                                    )
                                  }
                                  className={scopeOptionClass(
                                    selectedFunctions.includes(item)
                                  )}
                                >
                                  {item === ALL_FUNCTIONS ? 'Todas' : item}
                                </button>
                              ))}
                            </div>

                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setOpenScopePicker(null)}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                              >
                                Cerrar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-400">
                          Área
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedFunctions.length) return;
                            setOpenScopePicker((current) =>
                              current === 'area' ? null : 'area'
                            );
                          }}
                          disabled={!selectedFunctions.length}
                          className={`${scopePickerButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <span>{selectedAreaLabel}</span>
                          <span className={panelArrowClass(openScopePicker === 'area')}>
                            {'>'}
                          </span>
                        </button>

                        {openScopePicker === 'area' && selectedFunctions.length > 0 && (
                          <div className="mt-2 rounded-xl border border-white/10 bg-gray-950 p-2">
                            <div className="max-h-56 overflow-y-auto">
                              {availableAreas.map((item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() =>
                                    setSelectedAreas((current) =>
                                      toggleSelection(current, item, ALL_AREAS)
                                    )
                                  }
                                  className={scopeOptionClass(
                                    selectedAreas.includes(item)
                                  )}
                                >
                                  {item === ALL_AREAS ? 'Todas' : item}
                                </button>
                              ))}
                            </div>

                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setOpenScopePicker(null)}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                              >
                                Cerrar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-400">
                          Usuario
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedAreas.length) return;
                            setOpenScopePicker((current) =>
                              current === 'usuario' ? null : 'usuario'
                            );
                          }}
                          disabled={!selectedAreas.length}
                          className={`${scopePickerButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <span>{selectedUserLabel}</span>
                          <span className={panelArrowClass(openScopePicker === 'usuario')}>
                            {'>'}
                          </span>
                        </button>

                        {openScopePicker === 'usuario' && selectedAreas.length > 0 && (
                          <div className="mt-2 rounded-xl border border-white/10 bg-gray-950 p-2">
                            <div className="max-h-72 overflow-y-auto">
                              <button
                                type="button"
                                onClick={() => setSelectedPersonIds(['all'])}
                                className={scopeOptionClass(
                                  selectedPersonIds.includes('all')
                                )}
                              >
                                Todos
                              </button>

                              {peopleInArea.map((person) => (
                                <button
                                  key={person.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedPersonIds((current) =>
                                      toggleSelection(current, person.id, 'all')
                                    )
                                  }
                                  className={scopeOptionClass(
                                    selectedPersonIds.includes(person.id)
                                  )}
                                >
                                  {getPersonDisplayName(person)}
                                </button>
                              ))}
                            </div>

                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setOpenScopePicker(null)}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                              >
                                Cerrar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-gray-800 p-5">
                <button
                  type="button"
                  onClick={() => togglePanel('dimensiones')}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
                    Dimensiones
                  </h2>
                  <span className={panelArrowClass(openPanels.dimensiones)}>
                    {'>'}
                  </span>
                </button>

                {openPanels.dimensiones && (
                  <div className="mt-4 space-y-2">
                    {DIAGNOSTIC_DIMENSIONS.map((dimension) => {
                      const active = selectedDiagnosticDimensions.includes(
                        dimension.id
                      );

                      return (
                        <button
                          key={dimension.id}
                          type="button"
                          onClick={() =>
                            setSelectedDiagnosticDimensions((current) =>
                              toggleDimensionSelection(current, dimension.id)
                            )
                          }
                          className={dimensionButtonClass(active)}
                        >
                          <span className="block text-sm font-semibold text-white">
                            {dimension.label}
                          </span>
                          <span className="mt-1 block text-xs text-gray-400">
                            {dimension.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-5">
            <button
              type="button"
              onClick={() => togglePanel('resumen')}
              className="flex w-full items-center justify-between text-left"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
                Resumen rápido
              </h2>
              <span className={panelArrowClass(openPanels.resumen)}>{'>'}</span>
            </button>

            {openPanels.resumen && (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-900 px-4 py-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Metas
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {goalsQuery.isLoading ? '...' : totalGoalsCount}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">Totales</p>
                  </div>

                  <div className="rounded-xl bg-gray-900 px-4 py-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Capacidades
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {isAdminMode
                        ? topCapacityHighlights.length
                        : capacitiesQuery.isLoading
                          ? '...'
                          : topCapacityHighlights.length}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">Puntos clave</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-gray-900 px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Modo activo
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {previewSession
                      ? `${getModeLabel(previewSession.mode)} del historial`
                      : getModeLabel(activeTab)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {activeTab === 'libre' &&
                      !previewSession &&
                      (isAdminMode
                        ? 'Espacio abierto para hablar sobre el alcance seleccionado.'
                        : 'Espacio abierto para conversar sin restricciones.')}
                    {activeTab === 'cerrado' &&
                      !previewSession &&
                      'Interacción guiada mediante acciones predefinidas.'}
                    {activeTab === 'diagnostico' &&
                      !previewSession &&
                      'Lectura automática del contexto y las metas actuales.'}
                    {previewSession &&
                      'Estás viendo un chat guardado. Tu conversación actual sigue intacta.'}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-gray-900 px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Personalidad activa
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {PERSONALITIES[personality].emoji}{' '}
                    {PERSONALITIES[personality].label}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {PERSONALITIES[personality].description}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-5">
            <button
              type="button"
              onClick={() => togglePanel('contexto')}
              className="flex w-full items-center justify-between text-left"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
                Contexto actual
              </h2>
              <span className={panelArrowClass(openPanels.contexto)}>{'>'}</span>
            </button>

            {openPanels.contexto && (
              <>
                <div className="mt-4 space-y-3 text-sm text-gray-200">
                  <div>
                    <span className="text-gray-400">
                      {isAdminMode ? 'Alcance:' : 'Usuario:'}
                    </span>{' '}
                    {isAdminMode
                      ? scopeTrail.join(' > ')
                      : userAccountInfo?.public_name || 'Sin nombre público'}
                  </div>

                  <div>
                    <span className="text-gray-400">Metas pendientes:</span>{' '}
                    {goalsQuery.isLoading ? 'Cargando...' : pendingGoals.length}
                  </div>
                  <div>
                    <span className="text-gray-400">Metas completadas:</span>{' '}
                    {goalsQuery.isLoading ? 'Cargando...' : completedGoalsCount}
                  </div>
                  <div>
                    <span className="text-gray-400">Capacidades fuertes:</span>{' '}
                    {topCapacityHighlights.length}
                  </div>
                </div>

                {!!pendingGoals.length && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Metas prioritarias
                      </p>
                      {!isAdminMode && (
                        <button
                          type="button"
                          onClick={() => navigate('/home')}
                          className="rounded px-2 py-1 text-xs font-bold text-primary-300 transition hover:bg-white/10 hover:text-white"
                          aria-label="Ir a las metas"
                          title="Ir a las metas"
                        >
                          {'>'}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {pendingGoals.map((goal) => (
                        <span
                          key={String(goal.id || goal.name || goal.title)}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                        >
                          {goal.name || goal.title || 'Meta'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!!topCapacityHighlights.length && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Top capacidades
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topCapacityHighlights.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-primary-600/20 px-3 py-1 text-xs text-white"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-5">
            <button
              type="button"
              onClick={() => togglePanel('historial')}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
                  Historial
                </h2>
              </div>
              <span className={panelArrowClass(openPanels.historial)}>{'>'}</span>
            </button>

            {openPanels.historial && (
              <>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                    {historySessions.length}
                  </span>

                  <button
                    type="button"
                    onClick={clearHistory}
                    disabled={!historySessions.length}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Borrar historial
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {!historySessions.length && (
                    <div className="rounded-xl bg-gray-900 px-4 py-3 text-sm text-gray-400">
                      Aún no hay chats guardados.
                    </div>
                  )}

                  {historySessions.map((session) => {
                    const isPreview = previewSession?.id === session.id;
                    const isCurrent =
                      !previewSession &&
                      ((session.mode === 'libre' &&
                        session.id === freeSessionId) ||
                        (session.mode === 'cerrado' &&
                          session.id === closedSessionId));

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => openHistorySession(session)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                          isPreview || isCurrent
                            ? 'border-primary-500 bg-primary-600/15 text-white'
                            : 'border-white/10 bg-gray-900 text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {getModeLabel(session.mode)}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {formatDateTime(session.updatedAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {session.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {session.preview}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-800 p-5">
            <button
              type="button"
              onClick={openPersonalityStep}
              className="flex w-full items-center justify-between text-left transition hover:text-white"
            >
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
                  Cambiar personalidad
                </h2>
              </div>
              <span className="text-xs text-gray-400">{'>'}</span>
            </button>
          </div>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-gray-800">
          {previewSession && activeTab !== 'diagnostico' && (
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Viendo historial
                  </p>
                  <p className="mt-1 text-sm text-gray-200">
                    Estás viendo un chat guardado. Tu conversación actual sigue en
                    el presente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Volver al presente
                </button>
              </div>
            </div>
          )}

          {!previewSession && activeTab !== 'diagnostico' && isAdminMode && !scopeReady && (
            <div className="flex h-[64vh] items-center justify-center px-6 py-8 xl:h-[68vh]">
              <div className="max-w-md rounded-2xl border border-dashed border-white/10 bg-gray-900 px-6 py-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-300">
                  Coach Adm
                </p>
                <p className="mt-4 text-lg font-semibold text-white">
                  Completa el alcance para empezar
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Hasta que no selecciones empresa, función, área y usuario en el
                  panel de alcance, el coach no se activará.
                </p>
              </div>
            </div>
          )}

          {activeTab !== 'diagnostico' && (!isAdminMode || scopeReady || previewSession) && (
            <div
              className={`px-5 pt-5 ${
                displayHasConversation || previewSession
                  ? 'h-[64vh] space-y-4 overflow-y-auto pb-5 xl:h-[68vh]'
                  : 'space-y-4 pb-2'
              }`}
            >
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-4xl rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-900 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {chatLoading && !previewSession && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gray-900 px-4 py-3 text-sm text-gray-300">
                    Pensando respuesta...
                  </div>
                </div>
              )}

              {chatError && !previewSession && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {chatError}
                </div>
              )}

              {!displayMessages.length && !chatLoading && !isAdminMode && (
                <div className="rounded-2xl bg-gray-900 px-4 py-4 text-sm text-gray-400">
                  {activeTab === 'libre'
                    ? 'Escribe tu primera pregunta para empezar.'
                    : 'Selecciona una acción para continuar.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'libre' && !previewSession && (!isAdminMode || scopeReady) && (
            <form
              onSubmit={handleSubmit}
              className={`p-5 ${
                displayHasConversation || !isAdminMode
                  ? 'border-t border-white/10'
                  : 'pt-4'
              }`}
            >
              <div className="flex flex-col gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={
                    isAdminMode
                      ? 'Pregunta qué contenido están viendo más, qué falta, qué fortalezas ves o compara esta persona con el equipo...'
                      : 'Pregunta sobre Open KX, contenidos, formación, información o uso del conocimiento...'
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-primary-500"
                />

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={chatLoading || !input.trim()}
                    className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'cerrado' && !previewSession && (!isAdminMode || scopeReady) && (
            <div
              className={`p-5 ${
                displayHasConversation || !isAdminMode
                  ? 'border-t border-white/10'
                  : 'pt-4'
              }`}
            >
              <p className="mb-4 text-sm text-gray-300">
                Selecciona una acción para continuar.
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {closedActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => void sendPrompt(action, 'cerrado')}
                    disabled={chatLoading}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {previewSession && activeTab !== 'diagnostico' && (
            <div className="border-t border-white/10 px-5 py-4 text-xs text-gray-400">
              Este historial es solo de lectura.
            </div>
          )}

          {activeTab === 'diagnostico' && (
            <div className="min-h-[64vh] px-5 py-5 xl:min-h-[68vh]">
              {!scopeReady && isAdminMode && (
                <div className="mb-4 rounded-2xl bg-gray-900 px-4 py-4 text-sm text-gray-300">
                  Selecciona primero empresa, función, área y usuario para generar
                  el diagnóstico.
                </div>
              )}

              {diagnosticLoading && (
                <div className="rounded-2xl bg-gray-900 px-4 py-4 text-sm text-gray-300">
                  Generando diagnóstico...
                </div>
              )}

              {diagnosticError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {diagnosticError}
                </div>
              )}

              {!diagnosticLoading &&
                !diagnosticError &&
                activeDiagnosticReport && (
                  <div className="rounded-2xl bg-gray-900 px-5 py-5 text-sm leading-7 text-gray-100">
                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Informe de diagnóstico
                      </p>
                      {isAdminMode && (
                        <p className="mt-1 text-xs text-gray-400">
                          Foco: {adminDiagnosticFocus}
                        </p>
                      )}
                      {activeDiagnosticGeneratedAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          Generado el {formatDateTime(activeDiagnosticGeneratedAt)}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                      {diagnosticSections.map((section, index) => (
                        <div
                          key={section.id}
                          className={index === 0 ? '' : 'mt-6 border-t border-white/10 pt-6'}
                        >
                          <p className="text-sm font-semibold text-primary-300">
                            {index + 1}. {section.title}
                          </p>

                          {section.id === 'acciones' && isAdminMode ? (
                            <div className="mt-2 space-y-4 text-sm leading-7 text-gray-100">
                              {normalizeActionsContent(section.content)
                                .split(/\n{2,}/)
                                .map((paragraph) => paragraph.trim())
                                .filter(Boolean)
                                .map((paragraph, paragraphIndex) => (
                                  <p key={`${section.id}-${paragraphIndex}`}>
                                    {paragraph}
                                  </p>
                                ))}
                            </div>
                          ) : (
                            <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-100">
                              {section.content}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          setDiagnosticFeedback((current) =>
                            current === 'like' ? '' : 'like'
                          )
                        }
                        className={feedbackButtonClass('like')}
                        aria-label="Like"
                        title="Like"
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 10V5.5a2.5 2.5 0 0 0-2.5-2.5L7 10v11h10.28a2 2 0 0 0 1.97-1.64l1.22-7A2 2 0 0 0 18.5 10H14Z" />
                          <path d="M7 10H4v11h3" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDiagnosticFeedback((current) =>
                            current === 'dislike' ? '' : 'dislike'
                          )
                        }
                        className={feedbackButtonClass('dislike')}
                        aria-label="Dislike"
                        title="Dislike"
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 14v4.5A2.5 2.5 0 0 0 12.5 21l4.5-7V3H6.72a2 2 0 0 0-1.97 1.64l-1.22 7A2 2 0 0 0 5.5 14H10Z" />
                          <path d="M17 14h3V3h-3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

              {!diagnosticLoading &&
                !diagnosticError &&
                !activeDiagnosticReport &&
                (!isAdminMode || scopeReady) && (
                  <div className="rounded-2xl bg-gray-900 px-4 py-4 text-sm text-gray-300">
                    Genera un diagnóstico para ver el informe.
                  </div>
                )}
            </div>
          )}
        </section>
      </div>
    </div>
  );

  return withNavbar({
    children: step === 'personality' ? personalitySelectionContent : coachContent,
  });
};

export default Coach;
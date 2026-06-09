import {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/app/auth/provider/authProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';

type AccordionProps = PropsWithChildren<{
  title: string;
  defaultOpen?: boolean;
  description?: string;
}>;

type PersonalityId = 'motivador' | 'pragmatico' | 'brutal';
type AppLanguage = 'es' | 'en';

const LEGACY_PERSONALITY_KEY = 'personalidadCoach';
const COACH_PERSONALITY_KEY = 'desktopCoachPersonality';
const APP_LANGUAGE_KEY = 'appLanguage';

const getStoredLanguage = (): AppLanguage =>
  localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

const COACH_PERSONALITIES: Array<{
  id: PersonalityId;
  label: Record<AppLanguage, string>;
  emoji: string;
}> = [
  {
    id: 'motivador',
    label: { es: 'Motivador', en: 'Motivator' },
    emoji: '🌟',
  },
  {
    id: 'pragmatico',
    label: { es: 'Pragmático', en: 'Pragmatic' },
    emoji: '⚡',
  },
  {
    id: 'brutal',
    label: { es: 'Brutal', en: 'Brutal' },
    emoji: '👊',
  },
];

const getStoredNumber = (
  key: string,
  allowedValues: number[],
  fallback: number
): number => {
  const storedValue = Number(localStorage.getItem(key));
  return allowedValues.includes(storedValue) ? storedValue : fallback;
};

const joinValues = (values?: string[] | null): string => {
  if (!values?.length) return '-';
  return values.filter(Boolean).join(', ');
};

const readCoachPersonality = (): PersonalityId => {
  const modernValue = localStorage.getItem(COACH_PERSONALITY_KEY);
  if (
    modernValue === 'motivador' ||
    modernValue === 'pragmatico' ||
    modernValue === 'brutal'
  ) {
    return modernValue;
  }

  const legacyValue = localStorage.getItem(LEGACY_PERSONALITY_KEY);
  if (legacyValue === 'Motivador') return 'motivador';
  if (legacyValue === 'Pragmático') return 'pragmatico';
  if (legacyValue === 'Brutal') return 'brutal';

  return 'pragmatico';
};

const getCoachPersonalityLabel = (
  value: PersonalityId,
  language: AppLanguage
): string => {
  return (
    COACH_PERSONALITIES.find((item) => item.id === value)?.label[language] ||
    (language === 'en' ? 'Pragmatic' : 'Pragmático')
  );
};

const ProfileAccordion: FunctionComponent<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  description,
}) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-gray-800">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/5 sm:px-6"
      >
        <div>
          <h2 className="text-base font-semibold text-white sm:text-lg">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          ) : null}
        </div>

        <span
          className={`rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="border-t border-white/10 px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      ) : null}
    </section>
  );
};

const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-gray-900 px-3 py-3 sm:px-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
      {label}
    </p>
    <p className="mt-1 text-lg font-bold leading-none text-white sm:text-xl">
      {value}
    </p>
    {helper ? <p className="mt-1 text-[11px] text-gray-500">{helper}</p> : null}
  </div>
);

const SummaryCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-white/10 bg-gray-800 p-6">
    <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoRow = ({
  label,
  value,
  action,
  danger = false,
}: {
  label: string;
  value: string;
  action?: () => void;
  danger?: boolean;
}) => {
  const baseClass =
    'flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition sm:px-5';
  const toneClass = danger
    ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15'
    : 'border-white/10 bg-gray-900 text-white hover:bg-white/5';

  const content = (
    <>
      <span
        className={
          danger
            ? 'text-sm font-medium text-red-300'
            : 'text-sm font-medium text-gray-400'
        }
      >
        {label}
      </span>
      <span
        className={
          danger
            ? 'text-right text-sm font-semibold text-red-300'
            : 'text-right text-sm font-semibold text-white'
        }
      >
        {value}
      </span>
    </>
  );

  if (action) {
    return (
      <button
        type="button"
        onClick={action}
        className={`${baseClass} ${toneClass}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`${baseClass} ${toneClass}`}>{content}</div>;
};

const OptionChip = ({
  active,
  disabled = false,
  children,
  onClick,
  title,
}: PropsWithChildren<{
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}>) => {
  const className = disabled
    ? 'cursor-not-allowed rounded-full border border-dashed border-white/10 bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-600'
    : active
      ? 'rounded-full border border-primary-500 bg-primary-600 px-3 py-2 text-sm font-semibold text-white'
      : 'rounded-full border border-white/10 bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:border-primary-500 hover:text-white';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={className}
    >
      {children}
    </button>
  );
};

const PreferenceRow = ({
  label,
  children,
}: PropsWithChildren<{ label: string }>) => {
  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-left transition hover:bg-white/5 sm:px-5">
      <span className="shrink-0 text-sm font-medium text-gray-400">
        {label}
      </span>
      <div className="flex max-w-[55%] flex-nowrap items-center justify-end gap-2 overflow-x-auto whitespace-nowrap">
        {children}
      </div>
    </div>
  );
};

const MvpNoticeCard = ({
  publicName,
  language,
}: {
  publicName?: string | null;
  language: AppLanguage;
}) => {
  const copy =
    language === 'en'
      ? {
          eyebrow: 'Feedback',
          body: `Hi ${publicName || 'user'}, we would love to hear your opinion so we can adapt to your needs. Any comment is welcome, so feel free to share your feedback to help us keep improving your OpenKX experience.`,
          action: 'Feedback',
        }
      : {
          eyebrow: 'FeedBack',
          body: `Hola ${publicName || 'usuario'}, nos encantaría saber tu opinión para adaptarnos a tus necesidades, cualquier comentario será bienvenido así que no dudes en darnos tu feedback para seguir mejorando tu experiencia con OpenKX.`,
          action: 'Feedback',
        };

  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-gray-800 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-300">
            {copy.eyebrow}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-300">{copy.body}</p>
        </div>

        <a
          href="https://forms.gle/T2ELLU6vzwfC9RY9A"
          target="_blank"
          rel="noreferrer"
          className="inline-flex"
        >
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {copy.action}
          </button>
        </a>
      </div>
    </div>
  );
};

const Profile: FunctionComponent = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { userInfo, userAccountInfo, setUserInfo, setUserAccountInfo } =
    useUser();

  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage);
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('darkMode') === 'false' ? false : true
  );
  const [numPreguntas, setNumPreguntas] = useState<number>(() =>
    getStoredNumber('numPreguntas', [5, 10, 15], 5)
  );
  const [frecDesafio, setFrecDesafio] = useState<number>(() =>
    getStoredNumber('frecDesafio', [3, 5, 7], 5)
  );
  const [personalidadCoach, setPersonalidadCoach] =
    useState<PersonalityId>(readCoachPersonality);

  const opcionesPreguntas = [5, 10, 15];
  const opcionesFrecuencia = [3, 5, 7];

  const targetSemanal = frecDesafio * numPreguntas;

  const historialCount = useMemo(() => {
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem('historialContenidos') || '[]'
      ) as unknown;
      return Array.isArray(savedHistory) ? savedHistory.length : 0;
    } catch {
      return 0;
    }
  }, []);

  const likedCount = userAccountInfo?.liked_contents?.length || 0;

  useEffect(() => {
    localStorage.setItem(APP_LANGUAGE_KEY, language);
    window.dispatchEvent(new Event('app-language-change'));
  }, [language]);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('numPreguntas', String(numPreguntas));
  }, [numPreguntas]);

  useEffect(() => {
    localStorage.setItem('frecDesafio', String(frecDesafio));
  }, [frecDesafio]);

  useEffect(() => {
    localStorage.setItem(COACH_PERSONALITY_KEY, personalidadCoach);
    localStorage.setItem(
      LEGACY_PERSONALITY_KEY,
      getCoachPersonalityLabel(personalidadCoach, 'es')
    );
  }, [personalidadCoach]);

  const copy =
    language === 'en'
      ? {
          personalArea: 'Personal area',
          profile: 'Profile',
          profileSummary:
            'Your account, your preferences and your personal context in one place.',
          expertProfileSummary:
            'Summary of the information you completed during onboarding.',
          editProfile: 'Edit profile',
          signOut: 'Sign out',
          personalInformation: 'Personal information',
          firstName: 'First name',
          lastName: 'Last name',
          publicName: 'Public name',
          email: 'Email',
          phone: 'Phone',
          associatedCompany: 'Associated company',
          portfolioLink: 'Portfolio link',
          professionalContext: 'Professional context',
          industry: 'Industry',
          areaOrFunction: 'Area or function',
          level: 'Level',
          accountProfile: 'Profile',
          capabilities: 'Capabilities',
          accountType: 'Account type',
          accountTypeExpert: 'Expert',
          accountTypeCompany: 'Company',
          goBack: 'Go back',
          changePassword: 'Change password',
          viewHistory: 'View history',
          activeAccount: 'Active account',
          unnamedUser: 'User without public name',
          noEmail: 'No email available',
          noCompany: 'No company',
          coachPrefix: 'AI Coach',
          myScore: 'My score',
          favorites: 'Favorites',
          saved: 'Saved',
          history: 'History',
          viewed: 'Viewed',
          weeklyTarget: 'Weekly target',
          goal: 'Goal',
          points: 'Points',
          personalData: 'Personal details',
          personalDataDescription: 'Basic information about your account.',
          username: 'Username',
          companyProfile: 'Company profile',
          companyProfileDescription:
            'Professional context and organization data.',
          company: 'Company',
          function: 'Function',
          content: 'Content',
          contentDescription:
            'Quick access to your activity and contributions.',
          sharedContent: 'Shared content',
          goToCollaborator: 'Go to collaborator',
          myFavorites: 'My favorites',
          myHistory: 'My history',
          preferences: 'Preferences',
          preferencesDescription:
            'Personal settings and AI coach configuration.',
          language: 'Language',
          spanish: 'Spanish',
          english: 'English',
          lightMode: 'Light mode',
          off: 'OFF',
          on: 'ON',
          weeklyChallengeFrequency: 'Weekly challenge frequency',
          temporarilyUnavailable: 'Temporarily unavailable',
          questionsPerChallenge: 'Questions per challenge',
          coachPersonality: 'My AI Coach personality',
          coachRecommendations: 'My AI Coach recommendations',
          view: 'View',
          helpCenter: 'Help center',
          helpCenterDescription: 'Support, security and sign out.',
          support: 'Support',
          openHelpCenter: 'Open help center',
          privacyAndSecurity: 'Privacy and security',
          exit: 'Exit',
          sharedSaved: `${likedCount} saved`,
          historyValue:
            historialCount > 0 ? `${historialCount} viewed` : 'View history',
          scoreValue: `${userAccountInfo?.total_score ?? 0} points`,
          weeklyTargetValue: `${targetSemanal} points`,
        }
      : {
          personalArea: 'Área personal',
          profile: 'Perfil',
          profileSummary:
            'Tu cuenta, tus preferencias y tu contexto personal en un solo sitio.',
          expertProfileSummary:
            'Resumen de la información que completaste en el onboarding.',
          editProfile: 'Editar perfil',
          signOut: 'Cerrar sesión',
          personalInformation: 'Información personal',
          firstName: 'Nombre',
          lastName: 'Apellido',
          publicName: 'Nombre público',
          email: 'Mail',
          phone: 'Teléfono',
          associatedCompany: 'Empresa asociada',
          portfolioLink: 'Enlace de portfolio',
          professionalContext: 'Contexto profesional',
          industry: 'Industria',
          areaOrFunction: 'Área o función',
          level: 'Nivel',
          accountProfile: 'Perfil',
          capabilities: 'Capacidades',
          accountType: 'Tipo de cuenta',
          accountTypeExpert: 'Expert',
          accountTypeCompany: 'Company',
          goBack: 'Volver',
          changePassword: 'Cambiar contraseña',
          viewHistory: 'Ver historial',
          activeAccount: 'Cuenta activa',
          unnamedUser: 'Usuario sin nombre público',
          noEmail: 'Sin e-mail disponible',
          noCompany: 'Sin empresa',
          coachPrefix: 'Coach',
          myScore: 'Mi score',
          favorites: 'Favoritos',
          saved: 'Guardados',
          history: 'Historial',
          viewed: 'Vistos',
          weeklyTarget: 'Target semanal',
          goal: 'Objetivo',
          points: 'Puntos',
          personalData: 'Datos personales',
          personalDataDescription: 'Información básica de tu cuenta.',
          username: 'Usuario',
          companyProfile: 'Perfil de empresa',
          companyProfileDescription:
            'Contexto profesional y datos de organización.',
          company: 'Empresa',
          function: 'Función',
          content: 'Contenido',
          contentDescription:
            'Acceso rápido a tu actividad y contribuciones.',
          sharedContent: 'Contenido compartido',
          goToCollaborator: 'Ir al colaborador',
          myFavorites: 'Mis favoritos',
          myHistory: 'Mi historial',
          preferences: 'Preferencias',
          preferencesDescription:
            'Ajustes personales y configuración del coach.',
          language: 'Idioma',
          spanish: 'Español',
          english: 'English',
          lightMode: 'Modo claro',
          off: 'OFF',
          on: 'ON',
          weeklyChallengeFrequency: 'Frecuencia de desafío semanal',
          temporarilyUnavailable: 'Temporalmente no disponible',
          questionsPerChallenge: 'Preguntas por desafío',
          coachPersonality: 'Personalidad de mi Coach AI',
          coachRecommendations: 'Recomendaciones de mi Coach AI',
          view: 'Ver',
          helpCenter: 'Centro de ayuda',
          helpCenterDescription: 'Soporte, seguridad y salida de sesión.',
          support: 'Soporte',
          openHelpCenter: 'Abrir centro de ayuda',
          privacyAndSecurity: 'Privacidad y seguridad',
          exit: 'Salir',
          sharedSaved: `${likedCount} guardados`,
          historyValue:
            historialCount > 0 ? `${historialCount} vistos` : 'Ver historial',
          scoreValue: `${userAccountInfo?.total_score ?? 0} puntos`,
          weeklyTargetValue: `${targetSemanal} puntos`,
        };

  const handleLogout = () => {
    setUserInfo(null);
    setUserAccountInfo(null);
    logout();
    navigate('/login');
  };

  if (userAccountInfo?.type === 'expert') {
    const expertContent = (
      <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-300">
                {copy.personalArea}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                {copy.profile}
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                {copy.expertProfileSummary}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {copy.editProfile}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/15"
              >
                {copy.signOut}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SummaryCard title={copy.personalInformation}>
              <InfoRow
                label={copy.firstName}
                value={userInfo?.first_name || '-'}
              />
              <InfoRow label={copy.lastName} value={userInfo?.last_name || '-'} />
              <InfoRow
                label={copy.publicName}
                value={userAccountInfo?.public_name || '-'}
              />
              <InfoRow
                label={copy.email}
                value={userAccountInfo?.contact_email || userInfo?.email || '-'}
              />
              <InfoRow
                label={copy.phone}
                value={userAccountInfo?.phone_number || '-'}
              />
              <InfoRow
                label={copy.associatedCompany}
                value={userInfo?.organization || 'Acme'}
              />
              <InfoRow
                label={copy.portfolioLink}
                value={userAccountInfo?.portfolio_link || '-'}
              />
            </SummaryCard>

            <SummaryCard title={copy.professionalContext}>
              <InfoRow
                label={copy.industry}
                value={joinValues(userAccountInfo?.industry)}
              />
              <InfoRow
                label={copy.areaOrFunction}
                value={joinValues(userAccountInfo?.function)}
              />
              <InfoRow label={copy.level} value={joinValues(userAccountInfo?.level)} />
              <InfoRow
                label={copy.accountProfile}
                value={joinValues(userAccountInfo?.profile)}
              />
              <InfoRow
                label={copy.capabilities}
                value={joinValues(userAccountInfo?.capacity)}
              />
              <InfoRow
                label={copy.accountType}
                value={copy.accountTypeExpert}
              />
            </SummaryCard>
          </div>
        </div>
      </div>
    );

    return withNavbar({ children: expertContent });
  }

  const accountType =
    userAccountInfo?.type === 'company'
      ? copy.accountTypeCompany
      : userAccountInfo?.type === 'expert'
        ? copy.accountTypeExpert
        : '-';

  const pageContent = (
    <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={copy.goBack}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gray-800 text-white transition hover:bg-white/5"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-300">
                {copy.personalArea}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                {copy.profile}
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                {copy.profileSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('./change-password')}
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
            >
              {copy.changePassword}
            </button>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {copy.viewHistory}
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-gray-800 p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="xl:max-w-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                {copy.activeAccount}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {userAccountInfo?.public_name ||
                  userInfo?.username ||
                  copy.unnamedUser}
              </h2>
              <p className="mt-2 text-sm text-gray-300">
                {userInfo?.email || copy.noEmail}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-600/20 px-3 py-1 text-xs font-semibold text-primary-200">
                  {accountType}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                  {userInfo?.organization || copy.noCompany}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                  {copy.coachPrefix}{' '}
                  {getCoachPersonalityLabel(personalidadCoach, language)}
                </span>
              </div>
            </div>

            <div className="grid w-full max-w-[460px] grid-cols-2 gap-3">
              <StatCard
                label={copy.myScore}
                value={userAccountInfo?.total_score ?? 0}
                helper={copy.points}
              />
              <StatCard
                label={copy.favorites}
                value={likedCount}
                helper={copy.saved}
              />
              <StatCard
                label={copy.history}
                value={historialCount}
                helper={copy.viewed}
              />
              <StatCard
                label={copy.weeklyTarget}
                value={targetSemanal}
                helper={copy.goal}
              />
            </div>
          </div>
        </div>

        <MvpNoticeCard
          publicName={userAccountInfo?.public_name}
          language={language}
        />

        <div className="space-y-4">
          <ProfileAccordion
            title={copy.personalData}
            description={copy.personalDataDescription}
            defaultOpen={true}
          >
            <div className="space-y-3">
              <InfoRow label={copy.username} value={userInfo?.username || '-'} />
              <InfoRow
                label={copy.publicName}
                value={userAccountInfo?.public_name || '-'}
              />
              <InfoRow label={copy.email} value={userInfo?.email || '-'} />
              <InfoRow
                label={copy.firstName}
                value={userInfo?.first_name || '-'}
              />
              <InfoRow label={copy.lastName} value={userInfo?.last_name || '-'} />
              <InfoRow label={copy.myScore} value={copy.scoreValue} />
            </div>
          </ProfileAccordion>

          <ProfileAccordion
            title={copy.companyProfile}
            description={copy.companyProfileDescription}
          >
            <div className="space-y-3">
              <InfoRow
                label={copy.company}
                value={userInfo?.organization || '-'}
              />
              <InfoRow
                label={copy.industry}
                value={joinValues(userAccountInfo?.industry)}
              />
              <InfoRow
                label={copy.function}
                value={joinValues(userAccountInfo?.function)}
              />
              <InfoRow label={copy.level} value={joinValues(userAccountInfo?.level)} />
              <InfoRow label={copy.accountType} value={accountType} />
            </div>
          </ProfileAccordion>

          <ProfileAccordion
            title={copy.content}
            description={copy.contentDescription}
          >
            <div className="space-y-3">
              <InfoRow
                label={copy.sharedContent}
                value={copy.goToCollaborator}
                action={() => navigate('/content')}
              />
              <InfoRow label={copy.myFavorites} value={copy.sharedSaved} />
              <InfoRow
                label={copy.myHistory}
                value={copy.historyValue}
                action={() => navigate('/history')}
              />
            </div>
          </ProfileAccordion>

          <ProfileAccordion
            title={copy.preferences}
            description={copy.preferencesDescription}
          >
            <div className="space-y-3">
              <PreferenceRow label={copy.language}>
                <OptionChip
                  active={language === 'es'}
                  onClick={() => setLanguage('es')}
                >
                  {copy.spanish}
                </OptionChip>
                <OptionChip
                  active={language === 'en'}
                  onClick={() => setLanguage('en')}
                >
                  {copy.english}
                </OptionChip>
              </PreferenceRow>

              <InfoRow
                label={copy.lightMode}
                value={darkMode ? copy.off : copy.on}
                action={() => setDarkMode((current) => !current)}
              />

              <PreferenceRow label={copy.weeklyChallengeFrequency}>
                {opcionesFrecuencia.map((option) => {
                  const blocked = option !== 5;

                  return (
                    <OptionChip
                      key={option}
                      active={frecDesafio === option}
                      disabled={blocked}
                      title={blocked ? copy.temporarilyUnavailable : undefined}
                      onClick={() => setFrecDesafio(option)}
                    >
                      {option}
                    </OptionChip>
                  );
                })}
              </PreferenceRow>

              <PreferenceRow label={copy.questionsPerChallenge}>
                {opcionesPreguntas.map((option) => {
                  const blocked = ![5, 10].includes(option);

                  return (
                    <OptionChip
                      key={option}
                      active={numPreguntas === option}
                      disabled={blocked}
                      title={blocked ? copy.temporarilyUnavailable : undefined}
                      onClick={() => setNumPreguntas(option)}
                    >
                      {option}
                    </OptionChip>
                  );
                })}
              </PreferenceRow>

              <InfoRow
                label={copy.weeklyTarget}
                value={copy.weeklyTargetValue}
              />

              <PreferenceRow label={copy.coachPersonality}>
                {COACH_PERSONALITIES.map((option) => (
                  <OptionChip
                    key={option.id}
                    active={personalidadCoach === option.id}
                    onClick={() => setPersonalidadCoach(option.id)}
                  >
                    {option.emoji} {option.label[language]}
                  </OptionChip>
                ))}
              </PreferenceRow>

              <InfoRow
                label={copy.coachRecommendations}
                value={copy.view}
                action={() => navigate('/coach')}
              />
            </div>
          </ProfileAccordion>

          <ProfileAccordion
            title={copy.helpCenter}
            description={copy.helpCenterDescription}
          >
            <div className="space-y-3">
              <InfoRow
                label={copy.support}
                value={copy.openHelpCenter}
                action={() =>
                  window.open('https://support.openkx.ai/', '_blank')
                }
              />
              <InfoRow
                label={copy.privacyAndSecurity}
                value={copy.changePassword}
                action={() => navigate('./change-password')}
              />
              <InfoRow
                label={copy.signOut}
                value={copy.exit}
                action={handleLogout}
                danger={true}
              />
            </div>
          </ProfileAccordion>
        </div>
      </div>
    </div>
  );

  return withNavbar({ children: pageContent });
};

export default Profile;
import {
  FunctionComponent,
  PropsWithChildren,
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

const LEGACY_PERSONALITY_KEY = 'personalidadCoach';
const COACH_PERSONALITY_KEY = 'desktopCoachPersonality';

const COACH_PERSONALITIES: Array<{
  id: PersonalityId;
  label: string;
  emoji: string;
}> = [
  { id: 'motivador', label: 'Motivador', emoji: '🌟' },
  { id: 'pragmatico', label: 'Pragmático', emoji: '⚡' },
  { id: 'brutal', label: 'Brutal', emoji: '👊' },
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

const getCoachPersonalityLabel = (value: PersonalityId): string => {
  return (
    COACH_PERSONALITIES.find((item) => item.id === value)?.label || 'Pragmático'
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
      <button type="button" onClick={action} className={`${baseClass} ${toneClass}`}>
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

const MvpNoticeCard = ({ publicName }: { publicName?: string | null }) => {
  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-gray-800 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-300">
            FeedBack
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-300">
              Hola {publicName || 'usuario'}, nos encantaría saber tu opinión para adaptarnos a tus necesidades, cualquier comentario será bienvenido así que no dudes en darnos tu feedback para seguir mejorando tu experiencia con OpenKX.
          </p>
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
            Feedback
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
      getCoachPersonalityLabel(personalidadCoach)
    );
  }, [personalidadCoach]);

  const handleLogout = () => {
    setUserInfo(null);
    setUserAccountInfo(null);
    logout();
    navigate('/login');
  };

  const accountType =
    userAccountInfo?.type === 'company'
      ? 'Company'
      : userAccountInfo?.type === 'expert'
        ? 'Expert'
        : '-';

  const pageContent = (
    <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
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
                Área personal
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">Perfil</h1>
              <p className="mt-2 text-sm text-gray-300">
                Tu cuenta, tus preferencias y tu contexto personal en un solo sitio.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('./change-password')}
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
            >
              Cambiar contraseña
            </button>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ver historial
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-gray-800 p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="xl:max-w-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                Cuenta activa
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {userAccountInfo?.public_name ||
                  userInfo?.username ||
                  'Usuario sin nombre público'}
              </h2>
              <p className="mt-2 text-sm text-gray-300">
                {userInfo?.email || 'Sin e-mail disponible'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-600/20 px-3 py-1 text-xs font-semibold text-primary-200">
                  {accountType}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                  {userInfo?.organization || 'Sin empresa'}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                  Coach {getCoachPersonalityLabel(personalidadCoach)}
                </span>
              </div>
            </div>

            <div className="grid w-full max-w-[460px] grid-cols-2 gap-3">
              <StatCard
                label="Mi score"
                value={userAccountInfo?.total_score ?? 0}
                helper="Puntos"
              />
              <StatCard
                label="Favoritos"
                value={likedCount}
                helper="Guardados"
              />
              <StatCard
                label="Historial"
                value={historialCount}
                helper="Vistos"
              />
              <StatCard
                label="Target semanal"
                value={targetSemanal}
                helper="Objetivo"
              />
            </div>
          </div>
        </div>

        <MvpNoticeCard publicName={userAccountInfo?.public_name} />

        <div className="space-y-4">
          <ProfileAccordion
            title="Datos personales"
            description="Información básica de tu cuenta."
            defaultOpen={true}
          >
            <div className="space-y-3">
              <InfoRow label="Usuario" value={userInfo?.username || '-'} />
              <InfoRow
                label="Nombre público"
                value={userAccountInfo?.public_name || '-'}
              />
              <InfoRow label="E-mail" value={userInfo?.email || '-'} />
              <InfoRow label="Nombre" value={userInfo?.first_name || '-'} />
              <InfoRow label="Apellido" value={userInfo?.last_name || '-'} />
              <InfoRow
                label="Mi score"
                value={`${userAccountInfo?.total_score ?? 0} puntos`}
              />
            </div>
          </ProfileAccordion>

          <ProfileAccordion
            title="Perfil de empresa"
            description="Contexto profesional y datos de organización."
          >
            <div className="space-y-3">
              <InfoRow label="Empresa" value={userInfo?.organization || '-'} />
              <InfoRow
                label="Industria"
                value={joinValues(userAccountInfo?.industry)}
              />
              <InfoRow
                label="Función"
                value={joinValues(userAccountInfo?.function)}
              />
              <InfoRow
                label="Nivel"
                value={joinValues(userAccountInfo?.level)}
              />
              <InfoRow label="Tipo de cuenta" value={accountType} />
            </div>
          </ProfileAccordion>

          <ProfileAccordion
            title="Contenido"
            description="Acceso rápido a tu actividad y contribuciones."
          >
            <div className="space-y-3">
              <InfoRow
                label="Contenido compartido"
                value="Ir al colaborador"
                action={() => navigate('/content')}
              />
              <InfoRow
                label="Mis favoritos"
                value={`${likedCount} guardados`}
              />
              <InfoRow
                label="Mi historial"
                value={
                  historialCount > 0
                    ? `${historialCount} vistos`
                    : 'Ver historial'
                }
                action={() => navigate('/history')}
              />
            </div>
          </ProfileAccordion>

          <ProfileAccordion
            title="Preferencias"
            description="Ajustes personales y configuración del coach."
          >
            <div className="space-y-5">
              <InfoRow
                label="Modo claro"
                value={darkMode ? 'OFF' : 'ON'}
                action={() => setDarkMode((current) => !current)}
              />

              <div className="rounded-2xl border border-white/10 bg-gray-900 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <span className="text-sm font-medium text-gray-400">
                    Frecuencia de desafío semanal
                  </span>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {opcionesFrecuencia.map((option) => {
                      const blocked = option !== 5;

                      return (
                        <OptionChip
                          key={option}
                          active={frecDesafio === option}
                          disabled={blocked}
                          title={
                            blocked ? 'Temporalmente no disponible' : undefined
                          }
                          onClick={() => setFrecDesafio(option)}
                        >
                          {option}
                        </OptionChip>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gray-900 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <span className="text-sm font-medium text-gray-400">
                    Preguntas por desafío
                  </span>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {opcionesPreguntas.map((option) => {
                      const blocked = ![5, 10].includes(option);

                      return (
                        <OptionChip
                          key={option}
                          active={numPreguntas === option}
                          disabled={blocked}
                          title={
                            blocked ? 'Temporalmente no disponible' : undefined
                          }
                          onClick={() => setNumPreguntas(option)}
                        >
                          {option}
                        </OptionChip>
                      );
                    })}
                  </div>
                </div>
              </div>

              <InfoRow
                label="Target semanal"
                value={`${targetSemanal} puntos`}
              />

              <div className="rounded-2xl border border-white/10 bg-gray-900 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <span className="text-sm font-medium text-gray-400">
                    Personalidad de mi Coach AI
                  </span>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {COACH_PERSONALITIES.map((option) => (
                      <OptionChip
                        key={option.id}
                        active={personalidadCoach === option.id}
                        onClick={() => setPersonalidadCoach(option.id)}
                      >
                        {option.emoji} {option.label}
                      </OptionChip>
                    ))}
                  </div>
                </div>
              </div>

              <InfoRow
                label="Recomendaciones de mi Coach AI"
                value="Ver"
                action={() => navigate('/coach')}
              />
            </div>
          </ProfileAccordion>

          <ProfileAccordion
            title="Centro de ayuda"
            description="Soporte, seguridad y salida de sesión."
          >
            <div className="space-y-3">
              <InfoRow
                label="Soporte"
                value="Abrir centro de ayuda"
                action={() => window.open('https://openkx.ai/support', '_blank')}
              />
              <InfoRow
                label="Privacidad y seguridad"
                value="Cambiar contraseña"
                action={() => navigate('./change-password')}
              />
              <InfoRow
                label="Cerrar sesión"
                value="Salir"
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
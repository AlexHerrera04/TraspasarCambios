import React from 'react';

type PlaceholderVariant =
  | 'rings'
  | 'diagonal'
  | 'grid'
  | 'spotlight'
  | 'stack'
  | 'signal';

type PlaceholderTheme = {
  label: string;
  bgClass: string;
  accentClass: string;
  detailClass: string;
  titleClass: string;
  variant: PlaceholderVariant;
};

const THEMES: Record<string, PlaceholderTheme> = {
  acelerador: {
    label: 'Acelerador',
    bgClass: 'bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300',
    accentClass: 'bg-white/20',
    detailClass: 'border-white/30',
    titleClass: 'font-black tracking-[0.18em]',
    variant: 'signal',
  },
  articulo: {
    label: 'Articulo',
    bgClass: 'bg-gradient-to-br from-slate-700 via-slate-600 to-zinc-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-serif italic tracking-[0.08em]',
    variant: 'diagonal',
  },
  audiolibro: {
    label: 'Audiolibro',
    bgClass: 'bg-gradient-to-br from-fuchsia-700 via-violet-600 to-indigo-500',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-serif tracking-[0.14em]',
    variant: 'rings',
  },
  buenas_practicas: {
    label: 'Buenas Practicas',
    bgClass: 'bg-gradient-to-br from-emerald-700 via-green-600 to-lime-400',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-bold tracking-[0.16em]',
    variant: 'grid',
  },
  caso_de_exito: {
    label: 'Caso de Exito',
    bgClass: 'bg-gradient-to-br from-cyan-700 via-sky-500 to-blue-400',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-black tracking-[0.14em]',
    variant: 'spotlight',
  },
  caso_de_uso: {
    label: 'Caso de Uso',
    bgClass: 'bg-gradient-to-br from-teal-700 via-cyan-600 to-sky-500',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-semibold tracking-[0.18em]',
    variant: 'stack',
  },
  clase_magistral: {
    label: 'Clase Magistral',
    bgClass: 'bg-gradient-to-br from-rose-800 via-pink-700 to-fuchsia-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-serif font-bold tracking-[0.12em]',
    variant: 'rings',
  },
  conferencia: {
    label: 'Conferencia',
    bgClass: 'bg-gradient-to-br from-red-700 via-orange-600 to-amber-400',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-black tracking-[0.2em]',
    variant: 'diagonal',
  },
  corporativo: {
    label: 'Corporativo',
    bgClass: 'bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-semibold tracking-[0.22em]',
    variant: 'grid',
  },
  curso: {
    label: 'Curso',
    bgClass: 'bg-gradient-to-br from-blue-800 via-indigo-700 to-violet-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-black tracking-[0.16em]',
    variant: 'stack',
  },
  folleto_informativo: {
    label: 'Folleto Informativo',
    bgClass: 'bg-gradient-to-br from-amber-700 via-yellow-500 to-lime-300',
    accentClass: 'bg-black/10',
    detailClass: 'border-black/10',
    titleClass: 'font-bold tracking-[0.12em]',
    variant: 'spotlight',
  },
  generico: {
    label: 'Generico',
    bgClass: 'bg-gradient-to-br from-zinc-700 via-neutral-600 to-stone-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-semibold tracking-[0.2em]',
    variant: 'grid',
  },
  kit_de_recursos: {
    label: 'Kit de Recursos',
    bgClass: 'bg-gradient-to-br from-lime-700 via-emerald-600 to-teal-400',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-black tracking-[0.16em]',
    variant: 'stack',
  },
  manual_de_usuario: {
    label: 'Manual de Usuario',
    bgClass: 'bg-gradient-to-br from-stone-700 via-amber-700 to-orange-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-serif tracking-[0.12em]',
    variant: 'diagonal',
  },
  metodologia: {
    label: 'Metodologia',
    bgClass: 'bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-black tracking-[0.18em]',
    variant: 'signal',
  },
  pitch_deck: {
    label: 'Pitch Deck',
    bgClass: 'bg-gradient-to-br from-purple-900 via-fuchsia-700 to-pink-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-black uppercase tracking-[0.22em]',
    variant: 'spotlight',
  },
  podcast: {
    label: 'Podcast',
    bgClass: 'bg-gradient-to-br from-violet-800 via-purple-700 to-fuchsia-500',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-mono tracking-[0.16em]',
    variant: 'rings',
  },
  quiz: {
    label: 'Quiz',
    bgClass: 'bg-gradient-to-br from-sky-700 via-blue-600 to-indigo-500',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-black tracking-[0.24em]',
    variant: 'signal',
  },
  servicio: {
    label: 'Servicio',
    bgClass: 'bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-semibold tracking-[0.2em]',
    variant: 'grid',
  },
  solucion: {
    label: 'Solucion',
    bgClass: 'bg-gradient-to-br from-cyan-900 via-blue-700 to-indigo-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-black tracking-[0.18em]',
    variant: 'stack',
  },
  taller: {
    label: 'Taller',
    bgClass: 'bg-gradient-to-br from-orange-700 via-rose-600 to-pink-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-bold tracking-[0.18em]',
    variant: 'diagonal',
  },
  tendencia: {
    label: 'Tendencia',
    bgClass: 'bg-gradient-to-br from-zinc-900 via-slate-700 to-cyan-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-mono tracking-[0.22em]',
    variant: 'signal',
  },
  testimonial: {
    label: 'Testimonial',
    bgClass: 'bg-gradient-to-br from-pink-700 via-rose-500 to-orange-400',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-serif italic tracking-[0.12em]',
    variant: 'spotlight',
  },
  tutorial: {
    label: 'Tutorial',
    bgClass: 'bg-gradient-to-br from-blue-700 via-sky-500 to-cyan-300',
    accentClass: 'bg-white/15',
    detailClass: 'border-white/25',
    titleClass: 'font-mono tracking-[0.18em]',
    variant: 'grid',
  },
  webinar: {
    label: 'Webinar',
    bgClass: 'bg-gradient-to-br from-red-800 via-rose-700 to-fuchsia-500',
    accentClass: 'bg-white/10',
    detailClass: 'border-white/20',
    titleClass: 'font-black tracking-[0.2em]',
    variant: 'rings',
  },
};

function normalizeType(value?: string) {
  if (!value) return 'generico';

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '_');
}

function getTheme(type?: string) {
  const normalizedType = normalizeType(type);
  return THEMES[normalizedType] || THEMES.generico;
}

function renderDecoration(
  variant: PlaceholderVariant,
  accentClass: string,
  detailClass: string
) {
  switch (variant) {
    case 'rings':
      return (
        <>
          <div className={`absolute -left-8 -top-8 h-28 w-28 rounded-full border ${detailClass}`} />
          <div className={`absolute left-6 top-6 h-16 w-16 rounded-full border ${detailClass}`} />
          <div className={`absolute -bottom-10 -right-10 h-32 w-32 rounded-full border ${detailClass}`} />
        </>
      );

    case 'diagonal':
      return (
        <>
          <div className={`absolute -left-10 top-8 h-16 w-48 rotate-[-18deg] ${accentClass}`} />
          <div className={`absolute right-[-30px] bottom-10 h-12 w-40 rotate-[-18deg] ${accentClass}`} />
          <div className={`absolute left-1/3 top-0 h-full w-px ${accentClass}`} />
        </>
      );

    case 'grid':
      return (
        <>
          <div className={`absolute inset-x-6 top-6 h-px ${accentClass}`} />
          <div className={`absolute inset-x-6 bottom-6 h-px ${accentClass}`} />
          <div className={`absolute inset-y-6 left-6 w-px ${accentClass}`} />
          <div className={`absolute inset-y-6 right-6 w-px ${accentClass}`} />
          <div className={`absolute left-1/2 top-0 h-full w-px ${accentClass}`} />
        </>
      );

    case 'spotlight':
      return (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.24),transparent_35%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.16),transparent_30%)]" />
          <div className={`absolute left-6 top-6 h-10 w-10 rounded-full ${accentClass}`} />
        </>
      );

    case 'stack':
      return (
        <>
          <div className={`absolute left-6 top-6 h-8 w-24 rounded-sm ${accentClass}`} />
          <div className={`absolute left-10 top-18 h-8 w-32 rounded-sm ${accentClass}`} />
          <div className={`absolute right-6 bottom-6 h-8 w-28 rounded-sm ${accentClass}`} />
        </>
      );

    case 'signal':
      return (
        <>
          <div className={`absolute left-6 bottom-6 h-3 w-10 rounded-full ${accentClass}`} />
          <div className={`absolute left-6 bottom-12 h-3 w-20 rounded-full ${accentClass}`} />
          <div className={`absolute left-6 bottom-18 h-3 w-32 rounded-full ${accentClass}`} />
          <div className={`absolute right-8 top-8 h-20 w-20 rounded-full border ${detailClass}`} />
        </>
      );

    default:
      return null;
  }
}

const ContentPlaceholder = ({
  type,
  className = '',
  size = 'card',
}: {
  type?: string;
  className?: string;
  size?: 'card' | 'hero';
}) => {
  const theme = getTheme(type);

  return (
    <div
      className={`relative overflow-hidden rounded-lg text-white ${theme.bgClass} ${className}`}
    >
      <div className="absolute inset-0 bg-black/10" />
      {renderDecoration(theme.variant, theme.accentClass, theme.detailClass)}

      <div className="absolute left-4 top-4 rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
        Recurso
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
        <div>
          <div
            className={`uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] ${
              size === 'hero'
                ? 'text-3xl md:text-4xl'
                : 'text-xl md:text-2xl'
            } ${theme.titleClass}`}
          >
            {theme.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPlaceholder;
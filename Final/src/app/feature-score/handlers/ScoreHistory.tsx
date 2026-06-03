import { useMemo, useState } from 'react';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu, MenuHandler, MenuList, MenuItem } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';

type ScoreRange = '7d' | '14d' | '1m' | '1q';

type ScoreBreakdownRow = {
  id: string;
  origen: string;
  detalle: string;
  peso: string;
  puntos: number;
};

const RANGE_OPTIONS: Array<{ id: ScoreRange; label: string }> = [
  { id: '7d', label: 'Últimos 7 días' },
  { id: '14d', label: 'Últimos 14 días' },
  { id: '1m', label: 'Último mes' },
  { id: '1q', label: 'Último trimestre' },
];

const SCORE_DATA_BY_RANGE: Record<ScoreRange, ScoreBreakdownRow[]> = {
  '7d': [
    {
      id: 'views-7d',
      origen: 'Contenidos vistos',
      detalle: '2 contenidos vistos',
      peso: '20%',
      puntos: 4,
    },
    {
      id: 'goals-7d',
      origen: 'Metas completadas',
      detalle: '1 meta completada',
      peso: '50%',
      puntos: 8,
    },
    {
      id: 'routes-7d',
      origen: 'Rutas de aprendizaje',
      detalle: '0 rutas completadas',
      peso: '20%',
      puntos: 0,
    },
    {
      id: 'contributions-7d',
      origen: 'Contenido subido al colaborador',
      detalle: '0 contenidos publicados',
      peso: '10%',
      puntos: 0,
    },
  ],
  '14d': [
    {
      id: 'views-14d',
      origen: 'Contenidos vistos',
      detalle: '4 contenidos vistos',
      peso: '20%',
      puntos: 8,
    },
    {
      id: 'goals-14d',
      origen: 'Metas completadas',
      detalle: '2 metas completadas',
      peso: '50%',
      puntos: 16,
    },
    {
      id: 'routes-14d',
      origen: 'Rutas de aprendizaje',
      detalle: '1 ruta completada',
      peso: '20%',
      puntos: 6,
    },
    {
      id: 'contributions-14d',
      origen: 'Contenido subido al colaborador',
      detalle: '0 contenidos publicados',
      peso: '10%',
      puntos: 0,
    },
  ],
  '1m': [
    {
      id: 'views-1m',
      origen: 'Contenidos vistos',
      detalle: '7 contenidos vistos',
      peso: '20%',
      puntos: 14,
    },
    {
      id: 'goals-1m',
      origen: 'Metas completadas',
      detalle: '3 metas completadas',
      peso: '50%',
      puntos: 24,
    },
    {
      id: 'routes-1m',
      origen: 'Rutas de aprendizaje',
      detalle: '2 rutas completadas',
      peso: '20%',
      puntos: 12,
    },
    {
      id: 'contributions-1m',
      origen: 'Contenido subido al colaborador',
      detalle: '1 contenido publicado',
      peso: '10%',
      puntos: 6,
    },
  ],
  '1q': [
    {
      id: 'views-1q',
      origen: 'Contenidos vistos',
      detalle: '10 contenidos vistos',
      peso: '20%',
      puntos: 18,
    },
    {
      id: 'goals-1q',
      origen: 'Metas completadas',
      detalle: '4 metas completadas',
      peso: '50%',
      puntos: 30,
    },
    {
      id: 'routes-1q',
      origen: 'Rutas de aprendizaje',
      detalle: '3 rutas completadas',
      peso: '20%',
      puntos: 18,
    },
    {
      id: 'contributions-1q',
      origen: 'Contenido subido al colaborador',
      detalle: '2 contenidos publicados',
      peso: '10%',
      puntos: 8,
    },
  ],
};

const ScoreHistory = () => {
  const navigate = useNavigate();
  const { userAccountInfo } = useUser();
  const [selectedRange, setSelectedRange] = useState<ScoreRange>('1q');

  const rows = useMemo(
    () => SCORE_DATA_BY_RANGE[selectedRange],
    [selectedRange]
  );

  const filteredTotal = useMemo(
    () => rows.reduce((acc, item) => acc + item.puntos, 0),
    [rows]
  );

  const absoluteTotal = userAccountInfo?.total_score ?? filteredTotal;

  const selectedRangeLabel =
    RANGE_OPTIONS.find((option) => option.id === selectedRange)?.label ||
    'Último trimestre';

  const pageContent = (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al panel
          </button>

          <div className="rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-100">
            Total histórico: {absoluteTotal} puntos
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gray-800 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(145,110,255,0.22),_transparent_45%),linear-gradient(135deg,rgba(17,24,39,0.98),rgba(31,41,55,0.94))] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-200">
                  Score
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  Detalle de puntuación
                </h1>
                <p className="mt-2 text-sm text-gray-300">
                  Aquí puedes ver de dónde salen los puntos de tu score.
                </p>
              </div>

              <Menu placement="bottom-end">
                <MenuHandler>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {selectedRangeLabel}
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </MenuHandler>
                <MenuList className="border-white/10 bg-gray-900 p-2">
                  {RANGE_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.id}
                      onClick={() => setSelectedRange(option.id)}
                      className={`rounded-lg text-sm font-medium text-white ${
                        selectedRange === option.id ? 'bg-white/10' : ''
                      }`}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </div>

            <div className="mt-5 inline-flex rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-100">
              Total del periodo: {filteredTotal} puntos
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/[0.03]">
                <tr className="text-left text-[11px] uppercase tracking-[0.22em] text-gray-400">
                  <th className="px-6 py-4 font-semibold sm:px-8">Origen</th>
                  <th className="px-6 py-4 font-semibold">Detalle</th>
                  <th className="px-6 py-4 font-semibold">Peso</th>
                  <th className="px-6 py-4 text-right font-semibold sm:px-8">
                    Puntos
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-t border-white/10 transition hover:bg-white/[0.03] ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                    }`}
                  >
                    <td className="px-6 py-5 align-middle sm:px-8">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary-300" />
                        <span className="text-sm font-semibold text-white">
                          {item.origen}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-middle text-sm text-gray-300">
                      {item.detalle}
                    </td>

                    <td className="px-6 py-5 align-middle text-sm text-gray-300">
                      {item.peso}
                    </td>

                    <td className="px-6 py-5 text-right align-middle sm:px-8">
                      <span className="inline-flex min-w-[84px] justify-center rounded-full border border-primary-400/20 bg-primary-500/10 px-3 py-1.5 text-sm font-bold text-white">
                        {item.puntos} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t border-white/10 bg-white/[0.04]">
                  <td className="px-6 py-5 text-sm font-bold text-white sm:px-8">
                    Total
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-400">
                    Suma de todas las fuentes de puntos del periodo seleccionado
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-400">
                    {selectedRangeLabel}
                  </td>
                  <td className="px-6 py-5 text-right text-sm font-bold text-white sm:px-8">
                    {filteredTotal} pts
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return withNavbar({ children: pageContent });
};

export default ScoreHistory;
import { useMemo } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';

type ScoreBreakdownRow = {
  id: string;
  origen: string;
  detalle: string;
  puntos: number;
};

const SCORE_BREAKDOWN_MOCK: ScoreBreakdownRow[] = [
  {
    id: 'content-views',
    origen: 'Contenidos vistos',
    detalle: '4 contenidos vistos',
    puntos: 8,
  },
  {
    id: 'goals',
    origen: 'Metas completadas',
    detalle: '3 metas completadas',
    puntos: 43,
  },
  {
    id: 'learning-routes',
    origen: 'Rutas de aprendizaje',
    detalle: '2 rutas completadas',
    puntos: 12,
  },
  {
    id: 'contributions',
    origen: 'Contenido subido al colaborador',
    detalle: '1 contenido publicado',
    puntos: 9,
  },
];

const ScoreHistory = () => {
  const navigate = useNavigate();
  const { userAccountInfo } = useUser();

  const totalScore = userAccountInfo?.total_score ?? 0;

  const rows = useMemo(() => {
    return SCORE_BREAKDOWN_MOCK.map((item) => ({
      ...item,
      porcentaje:
        totalScore > 0 ? Math.round((item.puntos / totalScore) * 100) : 0,
    }));
  }, [totalScore]);

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
            Total: {totalScore} puntos
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gray-800 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(145,110,255,0.22),_transparent_45%),linear-gradient(135deg,rgba(17,24,39,0.98),rgba(31,41,55,0.94))] px-6 py-6 sm:px-8">
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

                    <td className="px-6 py-5 align-middle">
                      <div className="flex min-w-[160px] items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-200"
                            style={{ width: `${Math.min(item.porcentaje, 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-semibold text-gray-300">
                          {item.porcentaje}%
                        </span>
                      </div>
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
                    Suma de todas las fuentes de puntos
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-400">100%</td>
                  <td className="px-6 py-5 text-right text-sm font-bold text-white sm:px-8">
                    {totalScore} pts
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
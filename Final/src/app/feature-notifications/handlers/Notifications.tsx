import { FunctionComponent, useMemo, useState } from 'react';
import withNavbar from 'src/app/core/handlers/withNavbar';
import {
  getNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  tiempoRelativo,
} from '../utils/notificaciones';

const Notifications: FunctionComponent = () => {
  const [notis, setNotis] = useState(getNotificaciones());

  const noLeidas = useMemo(
    () => notis.filter((n) => !n.leida).length,
    [notis]
  );

  const handleMarcarLeida = (id: number) => {
    marcarLeida(id);
    setNotis((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const handleMarcarTodas = () => {
    marcarTodasLeidas();
    setNotis((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const pageContent = (
    <div className="container mx-auto my-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Notificaciones</h1>

        {noLeidas > 0 && (
          <button
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            onClick={handleMarcarTodas}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notis.length === 0 ? (
        <div className="rounded-2xl bg-gray-800 p-6 text-gray-300">
         Todavía no tienes notificaciones. ¡Sigue interactuando con la plataforma para recibirlas!
        </div>
      ) : (
        <div className="space-y-4">
          {notis.map((n) => (
            <div
              key={n.id}
              className={`cursor-pointer rounded-2xl border p-5 transition ${
                n.leida
                  ? 'border-white/10 bg-gray-800'
                  : 'border-primary-500 bg-gray-800/90'
              }`}
              onClick={() => handleMarcarLeida(n.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {n.titulo}
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">{n.texto}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!n.leida && (
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                  <span className="whitespace-nowrap text-xs text-gray-400">
                    {tiempoRelativo(n.tiempo)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return withNavbar({ children: pageContent });
};

export default Notifications;
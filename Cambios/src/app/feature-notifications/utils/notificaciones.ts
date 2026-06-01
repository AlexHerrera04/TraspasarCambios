const STORAGE_KEY = 'openkx_notificaciones';

export type Notificacion = {
  id: number;
  titulo: string;
  texto: string;
  tipo?: 'meta' | 'logro' | 'social' | 'info';
  tiempo: string;
  leida: boolean;
};

export function getNotificaciones(): Notificacion[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addNotificacion({
  titulo,
  texto,
  tipo = 'info',
}: {
  titulo: string;
  texto: string;
  tipo?: 'meta' | 'logro' | 'social' | 'info';
}) {
  const notis = getNotificaciones();
  const nueva: Notificacion = {
    id: Date.now(),
    titulo,
    texto,
    tipo,
    tiempo: new Date().toISOString(),
    leida: false,
  };
  const actualizado = [nueva, ...notis].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizado));
  return nueva;
}

export function marcarLeida(id: number) {
  const notis = getNotificaciones().map((n) =>
    n.id === id ? { ...n, leida: true } : n
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notis));
}

export function marcarTodasLeidas() {
  const notis = getNotificaciones().map((n) => ({ ...n, leida: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notis));
}

export function getNoLeidas() {
  return getNotificaciones().filter((n) => !n.leida).length;
}

export function tiempoRelativo(isoString: string) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);

  if (diff < 60) return 'Ara mateix';
  if (diff < 3600) return `Fa ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Fa ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Fa ${Math.floor(diff / 86400)} dies`;

  return new Date(isoString).toLocaleDateString('ca-ES');
}
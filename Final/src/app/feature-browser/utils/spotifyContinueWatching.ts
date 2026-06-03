export const SPOTIFY_CONTINUE_WATCHING_STORAGE_KEY =
  'spotify-continue-watching';
export const SPOTIFY_CONTINUE_WATCHING_UPDATED =
  'spotify-continue-watching-updated';

type SpotifyContinueWatchingEntry = {
  contentId: string;
  embedUrl: string;
  positionMs: number;
  durationMs: number;
  updatedAt: string;
};

const readEntries = (): SpotifyContinueWatchingEntry[] => {
  try {
    const raw = localStorage.getItem(SPOTIFY_CONTINUE_WATCHING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeEntries = (entries: SpotifyContinueWatchingEntry[]) => {
  localStorage.setItem(
    SPOTIFY_CONTINUE_WATCHING_STORAGE_KEY,
    JSON.stringify(entries)
  );

  window.dispatchEvent(new Event(SPOTIFY_CONTINUE_WATCHING_UPDATED));
};

export const getSpotifyContinueWatchingProgress = (
  contentId: string
): SpotifyContinueWatchingEntry | null => {
  const entries = readEntries();
  return (
    entries.find((entry) => String(entry.contentId) === String(contentId)) ||
    null
  );
};

export const upsertSpotifyContinueWatchingProgress = ({
  contentId,
  embedUrl,
  positionMs,
  durationMs,
}: {
  contentId: string | number;
  embedUrl: string;
  positionMs: number;
  durationMs: number;
}) => {
  if (!contentId || !durationMs || positionMs < 10000) {
    return;
  }

  const normalizedId = String(contentId);

  if (positionMs >= durationMs - 15000) {
    removeSpotifyContinueWatchingProgress(normalizedId);
    return;
  }

  const entries = readEntries().filter(
    (entry) => String(entry.contentId) !== normalizedId
  );

  entries.unshift({
    contentId: normalizedId,
    embedUrl,
    positionMs,
    durationMs,
    updatedAt: new Date().toISOString(),
  });

  writeEntries(entries.slice(0, 20));
};

export const removeSpotifyContinueWatchingProgress = (
  contentId: string | number
) => {
  const normalizedId = String(contentId);
  const nextEntries = readEntries().filter(
    (entry) => String(entry.contentId) !== normalizedId
  );
  writeEntries(nextEntries);
};

export const getSpotifyContinueWatchingItems = (contents: any[] = []) => {
  const entries = readEntries();

  return entries
    .map((entry) => {
      const match = contents.find(
        (content) => String(content.id) === String(entry.contentId)
      );

      if (!match) return null;

      return {
        ...match,
        spotify_progress_ms: entry.positionMs,
        spotify_duration_ms: entry.durationMs,
        spotify_embed_url: entry.embedUrl,
        spotify_updated_at: entry.updatedAt,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      return (
        new Date(b.spotify_updated_at).getTime() -
        new Date(a.spotify_updated_at).getTime()
      );
    });
};
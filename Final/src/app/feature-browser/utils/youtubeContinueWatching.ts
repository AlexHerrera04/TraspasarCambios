export interface ContinueWatchingContent {
  id: number | string;
  name?: string;
  title?: string;
  type?: string;
  public_image?: string;
  short_description?: string;
  external_source?: string;
  external_source_id?: string;
  description?: string;
  rating?: string;
  origin?: string;
  location_url?: string;
}

export interface ContinueWatchingItem extends ContinueWatchingContent {
  videoId: string;
  currentTime: number;
  duration: number;
  progress: number;
  updatedAt: string;
}

export const YOUTUBE_CONTINUE_WATCHING_UPDATED =
  'youtube-continue-watching-updated';

const STORAGE_KEY_PREFIX = 'browser-youtube-continue-watching';
const COMPLETION_THRESHOLD = 0.95;

const getScopedStorageKey = () => {
  if (typeof window === 'undefined') {
    return STORAGE_KEY_PREFIX;
  }

  const userScope =
    window.localStorage.getItem('email') ||
    window.localStorage.getItem('username') ||
    'anonymous';

  return `${STORAGE_KEY_PREFIX}:${userScope}`;
};

const parseStoredItems = (): ContinueWatchingItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getScopedStorageKey());
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ContinueWatchingItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistItems = (items: ContinueWatchingItem[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getScopedStorageKey(), JSON.stringify(items));
  window.dispatchEvent(new Event(YOUTUBE_CONTINUE_WATCHING_UPDATED));
};

export const formatPlaybackTime = (seconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const isYoutubeUrl = (value?: string) => {
  if (!value) {
    return false;
  }

  return /(?:youtube\.com|youtu\.be)/i.test(value);
};

export const extractYoutubeVideoId = (value?: string) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const match = trimmedValue.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );

  return match ? match[1] : null;
};

export const getYoutubeVideoId = (params: {
  content?: Partial<ContinueWatchingContent> | null;
  fileUrl?: string;
}) => {
  const { content, fileUrl } = params;

  const contentSource = `${content?.external_source || ''} ${
    content?.origin || ''
  }`.toLowerCase();

  const fromExternalSourceId = extractYoutubeVideoId(
    content?.external_source_id
  );
  if (fromExternalSourceId) {
    return fromExternalSourceId;
  }

  const fromLocationUrl = extractYoutubeVideoId(content?.location_url);
  if (fromLocationUrl) {
    return fromLocationUrl;
  }

  const fromFileUrl = extractYoutubeVideoId(fileUrl);
  if (fromFileUrl) {
    return fromFileUrl;
  }

  if (
    (contentSource.includes('youtube') || contentSource.includes('youtu')) &&
    typeof content?.external_source_id === 'string' &&
    /^[a-zA-Z0-9_-]{11}$/.test(content.external_source_id)
  ) {
    return content.external_source_id;
  }

  return null;
};

export const getContinueWatchingItems = () => {
  return parseStoredItems().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

export const getContinueWatchingByContentId = (
  contentId?: number | string | null
) => {
  if (contentId === undefined || contentId === null) {
    return null;
  }

  return (
    getContinueWatchingItems().find(
      (item) => String(item.id) === String(contentId)
    ) || null
  );
};

export const removeContinueWatchingItem = (
  contentId?: number | string | null
) => {
  if (contentId === undefined || contentId === null) {
    return;
  }

  const nextItems = getContinueWatchingItems().filter(
    (item) => String(item.id) !== String(contentId)
  );

  persistItems(nextItems);
};

export const saveContinueWatchingItem = ({
  content,
  fileUrl,
  currentTime,
  duration,
}: {
  content: ContinueWatchingContent;
  fileUrl?: string;
  currentTime: number;
  duration: number;
}) => {
  const videoId = getYoutubeVideoId({ content, fileUrl });

  if (!content?.id || !videoId) {
    return;
  }

  const safeCurrentTime = Math.max(0, Math.floor(currentTime));
  const safeDuration = Math.max(0, Math.floor(duration));

  if (safeCurrentTime < 5) {
    removeContinueWatchingItem(content.id);
    return;
  }

  const progressRatio =
    safeDuration > 0 ? safeCurrentTime / safeDuration : 0;

  const isCompleted =
    safeDuration > 0 &&
    (progressRatio >= COMPLETION_THRESHOLD ||
      safeCurrentTime >= Math.max(safeDuration - 5, safeDuration * COMPLETION_THRESHOLD));

  if (isCompleted) {
    removeContinueWatchingItem(content.id);
    return;
  }

  const progress =
    safeDuration > 0
      ? Math.min(100, Math.round((safeCurrentTime / safeDuration) * 100))
      : 0;

  const nextItem: ContinueWatchingItem = {
    id: content.id,
    name: content.name || 'Video de YouTube',
    title: content.name || 'Video de YouTube',
    type: content.type || 'Video',
    public_image: content.public_image || '',
    short_description: content.short_description || '',
    external_source: content.external_source || 'YouTube',
    external_source_id: content.external_source_id || videoId,
    description: content.description || '',
    rating: content.rating || '0',
    origin: content.origin || 'external',
    location_url: content.location_url || fileUrl || '',
    videoId,
    currentTime: safeCurrentTime,
    duration: safeDuration,
    progress,
    updatedAt: new Date().toISOString(),
  };

  const nextItems = [
    nextItem,
    ...getContinueWatchingItems().filter(
      (item) => String(item.id) !== String(content.id)
    ),
  ].slice(0, 20);

  persistItems(nextItems);
};
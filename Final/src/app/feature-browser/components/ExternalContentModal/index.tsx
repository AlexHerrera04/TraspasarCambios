import * as React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Backdrop from '../Backdrop';
import Button from 'src/app/ui/Button';
import api from 'src/app/core/api/apiProvider';
import {
  ContinueWatchingContent,
  formatPlaybackTime,
  getContinueWatchingByContentId,
  getYoutubeVideoId,
  isYoutubeUrl,
  removeContinueWatchingItem,
  saveContinueWatchingItem,
} from '../../utils/youtubeContinueWatching';
import {
  getSpotifyContinueWatchingProgress,
  removeSpotifyContinueWatchingProgress,
  upsertSpotifyContinueWatchingProgress,
} from '../../utils/spotifyContinueWatching';

declare global {
  interface Window {
    __spotifyIframeApi?: any;
    __spotifyIframeApiPromise?: Promise<any>;
    onSpotifyIframeApiReady?: (IFrameAPI: any) => void;
  }
}

const StyledMotionDiv = styled(motion.div).attrs({
  className:
    'container relative w-[min(96vw,1160px)] bg-surface rounded-md shadow-lg flex flex-col items-start',
})`
  position: absolute;
  padding: 3rem;
`;

const dropIn = {
  hidden: {
    y: '70vh',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.1,
      duration: 0.6,
    },
  },
  exit: {
    y: '100vh',
    opacity: 0,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 1,
    },
  },
};

const YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
const SPOTIFY_IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1';
const LEARNING_ROUTES_STORAGE_KEY = 'admin-learning-routes';
const COMPLETED_CARDS_STORAGE_KEY = 'admin-learning-routes-completed-cards';
const AUTO_COMPLETE_THRESHOLD = 0.95;

let youtubeIframeApiPromise: Promise<any> | null = null;

const safeReadLearningRoutes = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LEARNING_ROUTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const safeReadCompletedCards = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(COMPLETED_CARDS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const persistCompletedCards = (cards: Record<string, boolean>) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    COMPLETED_CARDS_STORAGE_KEY,
    JSON.stringify(cards)
  );
};

const getRouteCardKey = (routeId: string, contentId?: number | string | null) =>
  contentId != null ? `${routeId}-${contentId}` : `${routeId}-single`;

const markLearningRouteContentAsCompleted = (
  contentId?: number | string | null
) => {
  if (contentId === undefined || contentId === null) {
    return;
  }

  const routes = safeReadLearningRoutes();
  if (!routes.length) {
    return;
  }

  const completedCards = safeReadCompletedCards();
  let hasChanges = false;

  routes.forEach((route: any) => {
    const contents = Array.isArray(route?.contents) ? route.contents : [];
    const matchedContent = contents.find(
      (content: any) => String(content?.id) === String(contentId)
    );

    if (!matchedContent) {
      return;
    }

    const key = getRouteCardKey(String(route.id), matchedContent.id);

    if (!completedCards[key]) {
      completedCards[key] = true;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    persistCompletedCards(completedCards);
  }
};

const markGoalsContentAsCompleted = async (
  contentId?: number | string | null
) => {
  if (contentId === undefined || contentId === null) {
    return;
  }

  try {
    const { data } = await api.get(`${import.meta.env.VITE_API_URL}/goals`);
    const goals = Array.isArray(data) ? data : [];

    const matchingGoals = goals.filter((goal: any) => {
      return (
        String(goal?.content) === String(contentId) &&
        goal?.content_type !== 'quiz' &&
        goal?.status !== 'done'
      );
    });

    await Promise.all(
      matchingGoals.map((goal: any) =>
        api
          .patch(`${import.meta.env.VITE_API_URL}/goals/update/${goal.id}/`, {
            ...goal,
            status: 'done',
          })
          .catch(() => null)
      )
    );
  } catch {
    return;
  }
};

const loadYoutubeIframeApi = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window no disponible'));
  }

  const youtubeWindow = window as Window & typeof globalThis & {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  };

  if (youtubeWindow.YT?.Player) {
    return Promise.resolve(youtubeWindow.YT);
  }

  if (youtubeIframeApiPromise) {
    return youtubeIframeApiPromise;
  }

  youtubeIframeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${YOUTUBE_IFRAME_API_URL}"]`
    );
    const previousHandler = youtubeWindow.onYouTubeIframeAPIReady;

    youtubeWindow.onYouTubeIframeAPIReady = () => {
      if (previousHandler) {
        previousHandler();
      }
      resolve(youtubeWindow.YT);
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = YOUTUBE_IFRAME_API_URL;
      script.async = true;
      script.onerror = () =>
        reject(new Error('No se ha podido cargar YouTube IFrame Player API'));
      document.body.appendChild(script);
    }
  });

  return youtubeIframeApiPromise;
};

const loadSpotifyIframeApi = () => {
  if (window.__spotifyIframeApi) {
    return Promise.resolve(window.__spotifyIframeApi);
  }

  if (window.__spotifyIframeApiPromise) {
    return window.__spotifyIframeApiPromise;
  }

  window.__spotifyIframeApiPromise = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      window.__spotifyIframeApi = IFrameAPI;
      resolve(IFrameAPI);
    };

    const existingScript = document.querySelector(
      `script[src="${SPOTIFY_IFRAME_API_SRC}"]`
    ) as HTMLScriptElement | null;

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = SPOTIFY_IFRAME_API_SRC;
    script.async = true;
    script.onerror = () => reject(new Error('Spotify iFrame API load failed'));
    document.body.appendChild(script);
  });

  return window.__spotifyIframeApiPromise;
};

const parseSpotifyEpisodeUri = (url: string) => {
  const match = url.match(
    /open\.spotify\.com\/(?:embed\/)?episode\/([A-Za-z0-9]+)/i
  );

  if (!match) return null;

  return `spotify:episode:${match[1]}`;
};

const getContentIdFromPath = () => {
  if (typeof window === 'undefined') return null;

  const match = window.location.pathname.match(/\/explorer\/([^/?#]+)/);
  return match?.[1] || null;
};

interface ExternalContentModalProps {
  open: boolean;
  handleOpen: () => void;
  showCloseBtn?: boolean;
  fileUrl: string;
  content?: ContinueWatchingContent | null;
}

const ExternalContentModal = ({
  open,
  handleOpen,
  showCloseBtn = true,
  fileUrl,
  content = null,
}: ExternalContentModalProps) => {
  const playerElementIdRef = React.useRef(
    `youtube-player-${Math.random().toString(36).slice(2, 11)}`
  );
  const playerRef = React.useRef<any>(null);
  const syncIntervalRef = React.useRef<number | null>(null);
  const spotifyContainerRef = React.useRef<HTMLDivElement | null>(null);
  const spotifyControllerRef = React.useRef<any>(null);
  const autoCompleteTriggeredRef = React.useRef(false);

  const [playerReady, setPlayerReady] = React.useState(false);
  const [savedProgress, setSavedProgress] = React.useState(
    getContinueWatchingByContentId(content?.id)
  );

  const contentId = React.useMemo(() => getContentIdFromPath(), []);
  const isSpotifyContent = fileUrl.includes('spotify');
  const isSpotifyEpisode = Boolean(parseSpotifyEpisodeUri(fileUrl));
  const isYoutubeContent = Boolean(
    getYoutubeVideoId({ content, fileUrl }) || isYoutubeUrl(fileUrl)
  );
  const youtubeVideoId = getYoutubeVideoId({ content, fileUrl });

  React.useEffect(() => {
    document.body.style.overflowY = open ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, [open]);

  React.useEffect(() => {
    setSavedProgress(getContinueWatchingByContentId(content?.id));
  }, [content?.id, fileUrl, open]);

  React.useEffect(() => {
    autoCompleteTriggeredRef.current = false;
  }, [content?.id, fileUrl, open]);

  const clearSyncInterval = React.useCallback(() => {
    if (syncIntervalRef.current) {
      window.clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  const tryAutoCompleteAssignedItems = React.useCallback(
    async (currentTime: number, duration: number) => {
      if (autoCompleteTriggeredRef.current) {
        return;
      }

      if (!content?.id || duration <= 0) {
        return;
      }

      const progressRatio = currentTime / duration;
      if (progressRatio < AUTO_COMPLETE_THRESHOLD) {
        return;
      }

      autoCompleteTriggeredRef.current = true;

      markLearningRouteContentAsCompleted(content.id);
      await markGoalsContentAsCompleted(content.id);
    },
    [content?.id]
  );

  const persistProgress = React.useCallback(() => {
    if (!content || !playerRef.current) {
      return;
    }

    try {
      const currentTime = Number(playerRef.current.getCurrentTime?.() || 0);
      const duration = Number(playerRef.current.getDuration?.() || 0);

      saveContinueWatchingItem({
        content,
        fileUrl,
        currentTime,
        duration,
      });

      void tryAutoCompleteAssignedItems(currentTime, duration);

      setSavedProgress(getContinueWatchingByContentId(content.id));
    } catch {
      return;
    }
  }, [content, fileUrl, tryAutoCompleteAssignedItems]);

  React.useEffect(() => {
    if (!open || !isYoutubeContent || !youtubeVideoId) {
      return undefined;
    }

    let isCancelled = false;

    loadYoutubeIframeApi()
      .then((YT) => {
        if (isCancelled) {
          return;
        }

        const resumePoint = getContinueWatchingByContentId(content?.id);

        playerRef.current = new YT.Player(playerElementIdRef.current, {
          videoId: youtubeVideoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            start: resumePoint?.currentTime || 0,
          },
          events: {
            onReady: (event: any) => {
              if (resumePoint?.currentTime) {
                event.target.seekTo(resumePoint.currentTime, true);
              }

              setPlayerReady(true);
              event.target.playVideo?.();
            },
            onStateChange: (event: any) => {
              const youtubeWindow = window as Window & typeof globalThis & {
                YT?: any;
              };

              if (!youtubeWindow.YT?.PlayerState) {
                return;
              }

              if (event.data === youtubeWindow.YT.PlayerState.PLAYING) {
                clearSyncInterval();
                syncIntervalRef.current = window.setInterval(() => {
                  persistProgress();
                }, 5000);
                return;
              }

              if (event.data === youtubeWindow.YT.PlayerState.PAUSED) {
                clearSyncInterval();
                persistProgress();
                return;
              }

              if (event.data === youtubeWindow.YT.PlayerState.ENDED) {
                clearSyncInterval();

                const duration = Number(event.target.getDuration?.() || 0);
                void tryAutoCompleteAssignedItems(duration, duration);

                if (content?.id !== undefined && content?.id !== null) {
                  removeContinueWatchingItem(content.id);
                }

                setSavedProgress(null);
              }
            },
          },
        });
      })
      .catch(() => {
        setPlayerReady(false);
      });

    return () => {
      isCancelled = true;
      clearSyncInterval();

      if (playerRef.current) {
        persistProgress();
        playerRef.current.destroy?.();
        playerRef.current = null;
      }

      setPlayerReady(false);
    };
  }, [
    clearSyncInterval,
    content,
    fileUrl,
    isYoutubeContent,
    open,
    persistProgress,
    tryAutoCompleteAssignedItems,
    youtubeVideoId,
  ]);

  React.useEffect(() => {
    if (!open || !isSpotifyEpisode || !spotifyContainerRef.current) {
      return;
    }

    let isCancelled = false;
    let hasAppliedInitialSeek = false;

    loadSpotifyIframeApi()
      .then((IFrameAPI) => {
        if (isCancelled || !spotifyContainerRef.current) return;

        spotifyContainerRef.current.innerHTML = '';

        const episodeUri = parseSpotifyEpisodeUri(fileUrl);
        if (!episodeUri) return;

        IFrameAPI.createController(
          spotifyContainerRef.current,
          {
            uri: episodeUri,
            width: '100%',
            height: 400,
          },
          (EmbedController: any) => {
            if (isCancelled) return;

            spotifyControllerRef.current = EmbedController;

            const savedSpotifyProgress = contentId
              ? getSpotifyContinueWatchingProgress(String(contentId))
              : null;

            EmbedController.addListener('ready', () => {
              if (
                savedSpotifyProgress &&
                savedSpotifyProgress.positionMs > 0 &&
                !hasAppliedInitialSeek
              ) {
                hasAppliedInitialSeek = true;
                EmbedController.seek(
                  Math.max(0, Math.floor(savedSpotifyProgress.positionMs / 1000))
                );
              }
            });

            EmbedController.addListener('playback_update', (event: any) => {
              const payload = event?.data || event || {};
              const positionMs = Number(payload.position || 0);
              const durationMs = Number(payload.duration || 0);

              if (!contentId || !durationMs) return;

              if (positionMs >= durationMs - 15000) {
                removeSpotifyContinueWatchingProgress(String(contentId));
                return;
              }

              upsertSpotifyContinueWatchingProgress({
                contentId: String(contentId),
                embedUrl: fileUrl,
                positionMs,
                durationMs,
              });
            });
          }
        );
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
      if (spotifyContainerRef.current) {
        spotifyContainerRef.current.innerHTML = '';
      }
      spotifyControllerRef.current = null;
    };
  }, [open, isSpotifyEpisode, fileUrl, contentId]);

  const handleClose = () => {
    if (isYoutubeContent) {
      persistProgress();
      clearSyncInterval();
    }

    handleOpen();
  };

  if (!open) {
    return null;
  }

  return (
    <Backdrop>
      <StyledMotionDiv
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="w-full flex justify-center items-center">
          {isYoutubeContent && youtubeVideoId ? (
            <div className="w-full max-w-[1100px]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {content?.name || 'YouTube'}
                  </p>
                  <p className="text-sm text-gray-300">
                    {savedProgress?.currentTime
                      ? `Continuar desde ${formatPlaybackTime(
                          savedProgress.currentTime
                        )}`
                      : 'Guardado automático activado'}
                  </p>
                </div>
                {savedProgress?.progress ? (
                  <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                    {savedProgress.progress}% visto
                  </div>
                ) : null}
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                {!playerReady && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    Cargando vídeo...
                  </div>
                )}
                <div
                  id={playerElementIdRef.current}
                  className="h-full w-full"
                ></div>
              </div>
            </div>
          ) : isSpotifyEpisode ? (
            <div ref={spotifyContainerRef} className="w-full" />
          ) : isSpotifyContent ? (
            <iframe
              className="w-full rounded-xl"
              src={`${fileUrl}?utm_source=generator&theme=0`}
              width="100%"
              height="400"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          ) : null}
        </div>

        {showCloseBtn && (
          <div className="w-full flex justify-end mt-10 print:hidden">
            <Button variant="danger" onClick={handleClose}>
              <span className="font-bold text-base">Close</span>
            </Button>
          </div>
        )}
      </StyledMotionDiv>
    </Backdrop>
  );
};

export default ExternalContentModal;
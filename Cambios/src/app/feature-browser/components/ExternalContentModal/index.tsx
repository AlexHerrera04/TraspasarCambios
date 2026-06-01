import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Backdrop from '../Backdrop';
import Button from 'src/app/ui/Button';
import {
  ContinueWatchingContent,
  formatPlaybackTime,
  getContinueWatchingByContentId,
  getYoutubeVideoId,
  isYoutubeUrl,
  removeContinueWatchingItem,
  saveContinueWatchingItem,
} from '../../utils/youtubeContinueWatching';

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

let youtubeIframeApiPromise: Promise<any> | null = null;

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
  const playerElementIdRef = useRef(
    `youtube-player-${Math.random().toString(36).slice(2, 11)}`
  );
  const playerRef = useRef<any>(null);
  const syncIntervalRef = useRef<number | null>(null);

  const [playerReady, setPlayerReady] = useState(false);
  const [savedProgress, setSavedProgress] = useState(
    getContinueWatchingByContentId(content?.id)
  );

  const isYoutubeContent = Boolean(
    getYoutubeVideoId({ content, fileUrl }) || isYoutubeUrl(fileUrl)
  );

  const youtubeVideoId = getYoutubeVideoId({ content, fileUrl });

  useEffect(() => {
    document.body.style.overflowY = open ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, [open]);

  useEffect(() => {
    setSavedProgress(getContinueWatchingByContentId(content?.id));
  }, [content?.id, fileUrl, open]);

  const clearSyncInterval = useCallback(() => {
    if (syncIntervalRef.current) {
      window.clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  const persistProgress = useCallback(() => {
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

      setSavedProgress(getContinueWatchingByContentId(content.id));
    } catch {
      return;
    }
  }, [content, fileUrl]);

  useEffect(() => {
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
    youtubeVideoId,
  ]);

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
          ) : fileUrl.includes('spotify') ? (
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
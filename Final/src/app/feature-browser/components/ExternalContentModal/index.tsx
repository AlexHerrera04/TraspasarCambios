import * as React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Backdrop from '../Backdrop';
import Button from 'src/app/ui/Button';
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
    'container relative bg-surface rounded-md shadow-lg flex flex-col items-start ',
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

const SPOTIFY_IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1';

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

const ExternalContentModal = (props: any) => {
  const { open, handleOpen, showCloseBtn = true, fileUrl } = props;

  const spotifyContainerRef = React.useRef<HTMLDivElement | null>(null);
  const spotifyControllerRef = React.useRef<any>(null);

  const contentId = React.useMemo(() => getContentIdFromPath(), []);
  const isSpotifyContent = fileUrl.includes('spotify');
  const isSpotifyEpisode = Boolean(parseSpotifyEpisodeUri(fileUrl));
  const isYoutubeContent = fileUrl.includes('youtube');

  if (open) {
    document.body.style.overflowY = 'hidden';
  } else {
    document.body.style.overflowY = 'auto';
  }

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

            const savedProgress = contentId
              ? getSpotifyContinueWatchingProgress(String(contentId))
              : null;

            EmbedController.addListener('ready', () => {
              if (
                savedProgress &&
                savedProgress.positionMs > 0 &&
                !hasAppliedInitialSeek
              ) {
                hasAppliedInitialSeek = true;
                EmbedController.seek(
                  Math.max(0, Math.floor(savedProgress.positionMs / 1000))
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
      .catch(() => {
        // Fallback silencioso al iframe normal.
      });

    return () => {
      isCancelled = true;
      if (spotifyContainerRef.current) {
        spotifyContainerRef.current.innerHTML = '';
      }
      spotifyControllerRef.current = null;
    };
  }, [open, isSpotifyEpisode, fileUrl, contentId]);

  return (
    <>
      {open && (
        <Backdrop>
          <StyledMotionDiv
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="w-full flex justify-center items-center">
              {isYoutubeContent ? (
                <iframe
                  width="1100"
                  height="600"
                  src={fileUrl}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen={true}
                />
              ) : isSpotifyEpisode ? (
                <div ref={spotifyContainerRef} className="w-full" />
              ) : isSpotifyContent ? (
                <iframe
                  className="border-radius:12px"
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
                <Button variant="danger" onClick={handleOpen}>
                  <span className="font-bold text-base">Close</span>
                </Button>
              </div>
            )}
          </StyledMotionDiv>
        </Backdrop>
      )}
    </>
  );
};

export default ExternalContentModal;
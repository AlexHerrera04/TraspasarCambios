import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import classNames from 'classnames';
import { capitalize } from 'lodash';
import { Breadcrumbs, IconButton, Typography } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import ContentPlaceholder from '../ContentPlaceholder';
import Backdrop from '../Backdrop';
import Button from 'src/app/ui/Button';

export interface CardData {
  id: string | number;
  title: string;
  type: string;
  public_image: string;
  short_description: string;
  external_source?: string;
  external_source_id?: string;
  description: string;
  name: string;
  rating: string;
  origin: string;
}

interface Props extends CardData {
  isSelected?: boolean;
  onOpenDetails?: () => void;
  onRemove?: (id: string | number) => void;
}

const LOCAL_QUICK_SUMMARY_API_URL = 'http://localhost:3001/api/quick-summary';
const YOUTUBE_SOURCE_PATTERN = /\b(?:youtube|youtu\.be|yt)\b/i;

const StyledQuickSummaryModal = styled(motion.div).attrs({
  className:
    'container relative mx-auto my-8 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl bg-dark-600 py-8 flex flex-col items-start',
})``;

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

const QuickSummaryFeatureImage = ({
  image,
  type,
}: {
  image?: string;
  type?: string;
}) => {
  const hasImage = !!image;

  return (
    <div className="w-64 max-w-full rounded-md shadow-md shadow-dark transition-all">
      <motion.div
        className={classNames({
          'relative flex h-40 w-full flex-col items-center rounded-lg shadow-md shadow-blue-gray-500/10':
            true,
        })}
      >
        {hasImage ? (
          <div
            style={{
              backgroundImage: `url(${image})`,
            }}
            className="absolute inset-0 rounded-lg bg-center bg-cover bg-gray-600"
          />
        ) : (
          <ContentPlaceholder
            type={type || 'generic'}
            size="hero"
            className="absolute inset-0 rounded-lg"
          />
        )}

        <motion.div
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-dark-600/90 z-10 mt-4 ml-2 w-max self-start rounded px-4 py-2 shadow-lg shadow-dark backdrop-blur-sm"
        >
          <motion.span className="text-sm text-label-500">
            {type || 'Contenido'}
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
};

const QuickSummaryActions = ({
  name,
  handleClose,
}: {
  name: string;
  handleClose: () => void;
}) => {
  return (
    <div className="flex w-full items-start justify-between px-8">
      <Breadcrumbs
        className="mt-2 bg-transparent text-light-100"
        separator={
          <svg
            aria-hidden="true"
            className="h-6 w-6 text-light-100"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        }
      >
        <a className="opacity-80">Wiki</a>
        <a className="opacity-80">Quick Summary</a>
        <a className="font-bold">{name}</a>
      </Breadcrumbs>

      <IconButton
        className="rounded-full border-white/10 focus:ring-black/50"
        variant="outlined"
        color="blue-gray"
        onClick={handleClose}
      >
        <XMarkIcon strokeWidth={2} className="h-5 w-5" />
      </IconButton>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-5">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-primary-500" />
      <Typography variant="paragraph" className="text-center text-white/80">
        Preparando los aspectos destacados...
      </Typography>
    </div>
  );
};

const QuickSummaryBody = ({
  title,
  type,
  image,
  isLoading,
  error,
  summary,
  isCachedSummary,
  onOpenDetails,
}: {
  title: string;
  type: string;
  image?: string;
  isLoading: boolean;
  error: string;
  summary: string;
  isCachedSummary: boolean;
  onOpenDetails: () => void;
}) => {
  return (
    <div className="w-full p-4">
      <div className="my-4 flex w-full flex-col gap-8">
        <div className="flex w-full flex-col items-start gap-6 md:flex-row md:items-center">
          <QuickSummaryFeatureImage image={image} type={type} />

          <div className="flex w-full flex-col items-start justify-center gap-3 md:min-h-[10rem]">
            <Typography variant="h3">{title}</Typography>

            {isCachedSummary && (
              <Typography variant="small" className="text-[11px] text-gray-500">
                Cargado desde cache local
              </Typography>
            )}
          </div>
        </div>

        <div className="w-full">
          <Typography variant="h6">
            Aspectos destacados de este contenido
          </Typography>

          <div className="mt-3 min-h-[220px] w-full rounded-2xl border border-white/10 bg-black/10 p-5">
            {isLoading && <LoadingState />}

            {!isLoading && error && (
              <Typography variant="paragraph" className="text-red-300">
                {error}
              </Typography>
            )}

            {!isLoading && !error && !!summary && (
              <Typography variant="paragraph">{summary}</Typography>
            )}
          </div>
        </div>

        <div className="flex w-full justify-end">
          <Button primary type="button" onClick={onOpenDetails}>
            Ver detalle
          </Button>
        </div>
      </div>
    </div>
  );
};

const fetchQuickSummaryFromLocalServer = async (
  contentId: string,
  videoUrl: string
) => {
  const response = await fetch(LOCAL_QUICK_SUMMARY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentId,
      videoUrl,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || 'No se ha podido generar el Quick Summary.'
    );
  }

  if (!data?.summary || typeof data.summary !== 'string') {
    throw new Error('El servidor no ha devuelto un resumen valido.');
  }

  return data.summary;
};

export const Card = (props: Props) => {
  const navigate = useNavigate();
  const hasImage = !!props.public_image;
  const sourceLabel = props.external_source || props.origin || '';
  const isYoutubeContent = YOUTUBE_SOURCE_PATTERN.test(sourceLabel);
  const videoUrl = props.external_source_id
    ? `https://www.youtube.com/watch?v=${props.external_source_id}`
    : '';
  const isQuickSummaryAvailable = isYoutubeContent && !!props.external_source_id;

  const [isQuickSummaryOpen, setIsQuickSummaryOpen] = React.useState(false);
  const [isQuickSummaryLoading, setIsQuickSummaryLoading] = React.useState(false);
  const [quickSummaryError, setQuickSummaryError] = React.useState('');
  const [quickSummaryText, setQuickSummaryText] = React.useState('');
  const [isCachedSummary, setIsCachedSummary] = React.useState(false);

  const videoId = props.external_source_id || 'unknown';
  const cacheKey = `quick-summary:${String(props.id)}:${videoId}`;

  const handleCloseQuickSummary = React.useCallback(() => {
    setIsQuickSummaryOpen(false);
  }, []);

  const handleGoToDetails = React.useCallback(() => {
    handleCloseQuickSummary();
    navigate(`/explorer/${props.id}`);
  }, [handleCloseQuickSummary, navigate, props.id]);

  const handleQuickSummaryClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isQuickSummaryAvailable) {
      return;
    }

    setIsQuickSummaryOpen(true);
    setQuickSummaryError('');
    setIsCachedSummary(false);

    const cachedSummary = localStorage.getItem(cacheKey);
    if (cachedSummary) {
      setQuickSummaryText(cachedSummary);
      setIsCachedSummary(true);
      return;
    }

    try {
      setIsQuickSummaryLoading(true);
      setQuickSummaryText('');

      const summary = await fetchQuickSummaryFromLocalServer(
        String(props.id),
        videoUrl
      );

      localStorage.setItem(cacheKey, summary);
      setQuickSummaryText(summary);
    } catch (error: any) {
      setQuickSummaryError(
        error?.message || 'No se ha podido generar el Quick Summary.'
      );
    } finally {
      setIsQuickSummaryLoading(false);
    }
  };

  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    props.onRemove?.(props.id);
  };

  const quickSummaryModal =
    isQuickSummaryAvailable && isQuickSummaryOpen
      ? createPortal(
          <Backdrop onClick={handleCloseQuickSummary}>
            <StyledQuickSummaryModal
              variants={dropIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(event) => event.stopPropagation()}
            >
              <QuickSummaryActions
                name={props.name}
                handleClose={handleCloseQuickSummary}
              />

              <QuickSummaryBody
                title={props.name}
                type={props.type}
                image={props.public_image}
                isLoading={isQuickSummaryLoading}
                error={quickSummaryError}
                summary={quickSummaryText}
                isCachedSummary={isCachedSummary}
                onOpenDetails={handleGoToDetails}
              />
            </StyledQuickSummaryModal>
          </Backdrop>,
          document.body
        )
      : null;

  return (
    <>
      <div>
        <motion.div
          className={classNames({
            'relative flex h-48 flex-col items-center rounded-lg shadow-md shadow-blue-gray-500/10':
              true,
          })}
        >
          {hasImage ? (
            <div
              style={{
                backgroundImage: `url(${props.public_image})`,
              }}
              className="absolute inset-0 rounded-lg bg-center bg-cover bg-gray-600"
            />
          ) : (
            <ContentPlaceholder
              type={props.type}
              className="absolute inset-0 rounded-lg"
            />
          )}

          <span className="absolute left-2 top-2 rounded-lg bg-black/50 p-2 text-xs shadow-md drop-shadow-md">
            {capitalize(props.type ? props.type.split('_').join(' ') : 'Generic')}
          </span>

          {props.origin && (
            <span className="absolute right-2 top-2 rounded-lg bg-black/50 p-2 text-xs shadow-md drop-shadow-md">
              {props.external_source
                ? capitalize(props.external_source)
                : capitalize(props.origin)}
            </span>
          )}

          {isQuickSummaryAvailable && (
            <button
              type="button"
              onClick={handleQuickSummaryClick}
              className="absolute bottom-2 right-2 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-primary-900/30 transition hover:bg-primary-500"
            >
              Quick Summary
            </button>
          )}
        </motion.div>

        <motion.h2 className="mb-0 mt-3 text-lg font-bold">
          {props.name}
        </motion.h2>
        <motion.p className="my-2 text-sm text-white/60">
          {props.short_description}
        </motion.p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <motion.div className="text-xs font-bold text-white/60">
            {props.rating}
          </motion.div>

          {props.onRemove && (
            <button
              type="button"
              onClick={handleRemoveClick}
              className="rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-black/80"
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      {quickSummaryModal}
    </>
  );
};
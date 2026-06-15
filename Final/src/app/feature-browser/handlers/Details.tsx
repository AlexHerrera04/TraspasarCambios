import { useCallback, useEffect, useState } from 'react';
<<<<<<< HEAD
import { capitalize } from 'lodash';
=======
>>>>>>> d6d4571f5834be47f96349f33022f04cbd3499f9
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Rating,
  Spinner,
  Typography,
} from '@material-tailwind/react';
import {
  CheckCircleIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useMutation, useQuery } from '@tanstack/react-query';
import Table from '../../ui/Table';
import { toast } from 'react-toastify';
import withNavbar from 'src/app/core/handlers/withNavbar';
import api from 'src/app/core/api/apiProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import TextModal from '../components/TextModal';
import PdfModal from '../components/PdfModal';
import addfavoriteIcon from 'src/assets/icons/add-favorite.svg';
import removeFavoriteIcon from 'src/assets/icons/remove-favorite.svg';
import contactIcon from 'src/assets/icons/contact.svg';
import ContentPlaceholder from '../components/ContentPlaceholder';
import ExternalContentModal from '../components/ExternalContentModal';

const StyledMotionDiv = styled.div.attrs({
  className:
    'container mx-auto my-8 py-8 bg-white/5 flex flex-col items-start rounded-2xl',
})``;

const StyledRating = styled(Rating).attrs({})`
  & > span {
    height: 100%;
  }
`;

const OpenCardHeaderContainer = styled(motion.div).attrs({
  className: 'my-4 flex flex-col md:flex-row gap-8 items-start w-full',
})``;

const OpenCardHeaderUserPriceContainer = styled(motion.div).attrs({
  className: 'my-4 flex w-full justify-end items-center',
})``;

const OpenCardHeaderFeatureImage = ({ data }: any) => {
  const hasImage = !!data?.public_image;
<<<<<<< HEAD
  const sourceLabel = data?.external_source || data?.origin || '';
=======
  const sourceLabel =
    data?.external_source ||
    (data?.origin !== 'public' && data?.origin !== 'community'
      ? data?.origin
      : '');
>>>>>>> d6d4571f5834be47f96349f33022f04cbd3499f9

  return (
    <div className="rounded-md shadow-dark shadow-md transition-all w-96 max-w-full">
      <motion.div
        className={classNames({
          'relative flex flex-col h-64 items-center rounded-lg shadow-blue-gray-500/10 shadow-md w-full':
            true,
        })}
      >
        {hasImage ? (
          <div
            style={{
              backgroundImage: `url(${data.public_image})`,
            }}
            className="absolute inset-0 rounded-lg bg-center bg-cover bg-gray-600"
          />
        ) : (
          <ContentPlaceholder
            type={data?.type}
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
          className="bg-dark-600/90 backdrop-blur-sm px-4 py-2 rounded self-start w-max mt-4 ml-2 shadow-lg shadow-dark z-10"
        >
          <motion.span className="text-label-500 text-sm">
            {data.type}
          </motion.span>
        </motion.div>

        {sourceLabel && (
          <motion.div
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute right-2 top-4 z-10 rounded bg-dark-600/90 px-4 py-2 shadow-lg shadow-dark backdrop-blur-sm"
          >
            <motion.span className="text-sm text-white">
<<<<<<< HEAD
              {capitalize(String(sourceLabel))}
=======
              {sourceLabel}
>>>>>>> d6d4571f5834be47f96349f33022f04cbd3499f9
            </motion.span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const OpenCardHeaderActionsRatings = ({ data }: any) => {
  const rating = data.rating ? Math.round(Number(data.rating)) : 0;
  const reviews = data.number_of_reviews ? data.number_of_reviews : 0;

  const handleRatingChange = async (value: number) => {
    try {
      const response = await api.patch(
        `${import.meta.env.VITE_API_URL}/contents/submit_rating/${data.id}`,
        { rating: value }
      );

      if (response.status === 200) {
        await api.post(`${import.meta.env.VITE_API_URL}/scoring/interaction`, {
          interaction_type: 'Review',
          content: data.id,
        });

        toast.success('Rating submitted successfully!', {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Rating already submitted', {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      } else {
        toast.error('Failed to submit rating', {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      }
    }
  };

  return (
    <div className="flex justify-center gap-2 p-1">
      <StyledRating
        value={rating}
        onChange={(value: number) => handleRatingChange(value)}
      />
      <div className="flex gap-2 items-baseline justify-end">
        <span className="text-md font-bold leading-normal">{`${data.rating}`}</span>
        <span className="text-sm leading-normal text-gray-500 font-light">
          {reviews} Reviews
        </span>
      </div>
    </div>
  );
};

const OpenCardHeaderActionsCategory = ({ data }: any) => {
  const capacity = data.capacity ? data.capacity : ['N/A'];

  return (
    <div className="flex flex-wrap gap-2">
      {capacity.map((item: string) => (
        <Chip
          key={item}
          variant="ghost"
          color="blue-gray"
          size="md"
          value={item}
          className="normal-case bg-transparent font-thin text-sm"
          icon={<CheckCircleIcon strokeWidth={2} className="h-5 w-5" />}
        />
      ))}
    </div>
  );
};

const OpenCardHeaderActionsTags = ({ data }: any) => {
  const colors = ['light-green', 'indigo', 'pink'];
  const functionsTags = (data.function ? data.function : ['N/A']).map(
    (item: any) => ({
      color: colors[Math.floor(Math.random() * colors.length)],
      value: item,
    })
  );

  return (
    <div className="flex flex-wrap gap-2">
      {functionsTags.map((item: any) => (
        <Chip
          key={item.value}
          variant="ghost"
          color={item.color}
          size="sm"
          value={item.value}
          className="normal-case"
        />
      ))}
    </div>
  );
};

const OpenCardHeaderActionsCTAsContactMethodDialog = ({ contactID }: any) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  const { data, isFetching } = useQuery({
    queryKey: ['getContactAccountInfo', contactID],
    enabled: !!contactID,
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/accounts/accountinfo/${contactID}`
      );
      return data;
    },
  });

  const fullName =
    [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim() ||
    data?.public_name ||
    'N/A';

  const profileImage = data?.profile_picture || data?.wiki_avatar || '';

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpen}
        className="flex items-center justify-center p-2"
      >
        <img
          src={contactIcon}
          alt="contact-button"
          className="w-7 h-7 filter brightness-0 invert"
        />
      </Button>

      <Dialog
        open={open}
        handler={handleOpen}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
        className="bg-dark-600/95"
      >
        <DialogHeader className="text-label">Compartido por:</DialogHeader>
        <DialogBody divider>
          {isFetching ? (
            <div>Loading...</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={fullName}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
                    <UserCircleIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div>
                  <Typography variant="small" className="mb-1 text-white/50">
                    Nombre completo
                  </Typography>
                  <Typography variant="paragraph">{fullName}</Typography>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <Typography variant="small" className="mb-1 text-white/50">
                  Email
                </Typography>
                <Typography variant="paragraph">
                  {data?.contact_email ?? 'N/A'}
                </Typography>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <Typography variant="small" className="mb-1 text-white/50">
                  Teléfono
                </Typography>
                <Typography variant="paragraph">
                  {data?.phone_number ?? 'N/A'}
                </Typography>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <Typography variant="small" className="mb-3 text-white/50">
                  Portfolio
                </Typography>

                {data?.portfolio_link ? (
                  <a
                    href={data.portfolio_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-violet-300/30 bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/30"
                  >
                    Ir a portfolio
                  </a>
                ) : (
                  <Typography variant="paragraph">N/A</Typography>
                )}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" onClick={handleOpen}>
            <span>Close</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

const OpenCardHeaderActionsCTAs = ({ data }: any) => {
  const mutation = useMutation({
    mutationFn: (values: { content_id: number }) => {
      api.post(`${import.meta.env.VITE_API_URL}/scoring/interaction`, {
        interaction_type: 'Favorites',
        content: values.content_id,
      });

      return api.post(
        `${import.meta.env.VITE_API_URL}/accounts/toggle-like/`,
        values
      );
    },
  });

  const toggleLike = () => {
    const values = { content_id: data.id };
    const is_liked_by_user = data.is_liked_by_user;

    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(
          is_liked_by_user
            ? 'Removed from your favorites!'
            : 'Added to your favorites!',
          {
            position: toast.POSITION.BOTTOM_LEFT,
          }
        );
      },
      onError: () => {
        toast.error('Please, try again', {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      },
    });
  };

  return (
    <div className="mt-3 flex flex-wrap gap-4">
      {data.origin !== 'public' && data.origin !== 'community' && (
        <OpenCardHeaderActionsCTAsContactMethodDialog contactID={data.user} />
      )}

      <Button
        variant="outlined"
        className="flex items-center gap-3 rounded-full border-white/15 bg-white/5 px-4 py-2.5 shadow-lg shadow-black/10 transition-all hover:border-white/25 hover:bg-white/10"
        onClick={toggleLike}
      >
        <img
          src={data.is_liked_by_user ? removeFavoriteIcon : addfavoriteIcon}
          alt="favorite-button"
          className="h-6 w-6 filter brightness-0 invert"
        />
      </Button>
    </div>
  );
};

const OpenCardHeaderActionsPrice = ({ data }: any) => {
  const price = data.price ? `$ ${data.price}` : '$ 0.00';

  return (
    <Typography variant="h5">
      {price === '$ 0.00' ? 'FREE' : price}
    </Typography>
  );
};

const OpenCardHeaderActions = (props: any) => {
  return (
    <div className="flex flex-col items-start gap-2 w-3/5">
      <Typography variant="h3">{props.data?.name}</Typography>
      <OpenCardHeaderActionsRatings data={props.data} />
      <OpenCardHeaderActionsCategory data={props.data} />
      <OpenCardHeaderActionsTags data={props.data} />
      <OpenCardHeaderActionsCTAs data={props.data} />
    </div>
  );
};

const OpenCardHeader = (props: any) => {
  return (
    <>
      <OpenCardHeaderContainer>
        <OpenCardHeaderFeatureImage data={props.data} />
        <OpenCardHeaderActions data={props.data} />
      </OpenCardHeaderContainer>
      <OpenCardHeaderUserPriceContainer>
        <OpenCardHeaderActionsPrice data={props.data} />
      </OpenCardHeaderUserPriceContainer>
    </>
  );
};

const OpenCardHeaderResourcesTable = (props: any) => {
  const { id } = props.data;
  const { handleShowContent } = props;

  const { data, isFetching } = useQuery({
    queryKey: ['getAssets', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/assets/content/${id}`
      );

      const regex = /\bhttps?:\/\/\S+/g;
      const url = props.data.description.match(regex);

      if (url && url.length > 0) {
        data.unshift({
          content: 0,
          file_name: 'Link',
          file_extension: '.url',
          updated_at: 'N/A',
          location_url: url[0],
        });
      }

      return data;
    },
  });

  const triggerEvent = (contentId: number) => {
    api.post(`${import.meta.env.VITE_API_URL}/scoring/interaction`, {
      interaction_type: 'Download',
      content: contentId,
    });
  };

  if (isFetching) return <div>Loading...</div>;

  const columns = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'file_name',
      cell: (ctx: any) => ctx.getValue(),
    },
    {
      id: 'last_modified',
      header: 'Last Modified',
      accessorKey: 'updated_at',
      cell: (ctx: any) => ctx.getValue(),
    },
    {
      id: 'download',
      header: '',
      cell: (ctx: any) => {
        const { location_url, file_extension, type, id, content } =
          ctx.row.original;

        return (
          <Button
            className="normal-case text-sm font-normal tracking-wide p-3 bg-blue-800"
            onClick={() => {
              triggerEvent(content);

              if (file_extension === '.txt') {
                handleShowContent(String(id));
              } else if (file_extension === '.pdf') {
                handleShowContent(null, location_url);
              } else if (location_url?.includes('/embed/')) {
                handleShowContent(null, location_url);
              } else {
                window.open(location_url, '_blank');
              }
            }}
          >
            {file_extension === '.txt' || file_extension === '.pdf'
              ? 'Leer'
              : type === 'url'
                ? 'Abrir enlace'
                : 'Descargar'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="mt-4">
      <Typography variant="h6">Assets</Typography>
      <Table data={data} columns={columns} />
    </div>
  );
};

const CardActions = ({ data, handleClose }: any) => {
  return (
    <div className="flex justify-between items-start w-full px-8 pt">
      <Breadcrumbs
        className="bg-transparent text-light-100 mt-2"
        separator={
          <svg
            aria-hidden="true"
            className="w-6 h-6 text-light-100"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        }
      >
        <a className="opacity-80">Wiki</a>
        <a className="opacity-80">{data.type}</a>
        <a className="font-bold">{data.name}</a>
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

const OpenCardBody = ({ data }: any) => {
  return (
    <div>
      <Typography variant="h6">Description</Typography>
      <Typography variant="paragraph">{data.description}</Typography>
    </div>
  );
};

const Details = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userAccountInfo } = useUser();
  const isExpert = userAccountInfo?.type === 'expert';
  const handleClose = useCallback(() => navigate(-1), [navigate]);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [showExternalContentModal, setShowExternalContentModal] =
    useState<boolean>(false);

  const [fileUrl, setFileUrl] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<string>('');
  const [embededUrl, setEmbededUrl] = useState<string>('');

  const { data: userContents, isFetching: isFetchingUserContents } = useQuery({
    queryKey: ['expertUserContents'],
    enabled: isExpert,
    queryFn: async () => {
      const response = await api.get(
        `${import.meta.env.VITE_API_URL}/contents/user_contents/`
      );
      return response.data;
    },
  });

  const hasResolvedAccess = !isExpert || userContents !== undefined;
  const canAccessRequestedContent =
    !isExpert ||
    (Array.isArray(userContents) &&
      userContents.some((content: any) => String(content.id) === String(id)));

  useEffect(() => {
    if (hasResolvedAccess && !canAccessRequestedContent) {
      toast.error('No tienes permisos para ver este contenido.', {
        position: toast.POSITION.BOTTOM_LEFT,
      });
      navigate('/content', { replace: true });
    }
  }, [hasResolvedAccess, canAccessRequestedContent, navigate]);

  const { data, isFetching } = useQuery({
    queryKey: ['getCard', id],
    enabled: !!id && hasResolvedAccess && canAccessRequestedContent,
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/contents/${id}`
      );

      api.post(`${import.meta.env.VITE_API_URL}/scoring/interaction`, {
        interaction_type: 'View',
        content: id,
      });

      return data;
    },
  });

  const handleModal = () => {
    setShowModal((current: boolean) => !current);
  };

  const handlePdfModal = () => {
    setShowPdfModal((current: boolean) => !current);
  };

  const handleExternalContentModal = () => {
    setShowExternalContentModal((current: boolean) => !current);
  };

  const showContent = (textId: string | null, url?: string) => {
    if (textId) {
      setFileUrl(textId);
      setShowModal(true);
    } else if (url && url.includes('/embed/')) {
      setEmbededUrl(url);
      setShowExternalContentModal(true);
    } else if (url) {
      setPdfFile(url);
      setShowPdfModal(true);
    }
  };

  const detailsContent = (
    <StyledMotionDiv>
      <CardActions data={data} handleClose={handleClose} />

      <div className="p-4 w-full">
        <OpenCardHeader data={data} />
        <OpenCardBody data={data} />

        <OpenCardHeaderResourcesTable
          handleShowContent={showContent}
          data={data}
        />

        {fileUrl && (
          <TextModal
            fileUrl={fileUrl}
            handleOpen={handleModal}
            open={showModal}
          ></TextModal>
        )}

        {pdfFile && (
          <PdfModal
            fileUrl={pdfFile}
            handleOpen={handlePdfModal}
            open={showPdfModal}
          ></PdfModal>
        )}

        {embededUrl && (
          <ExternalContentModal
            fileUrl={embededUrl}
            content={data}
            handleOpen={handleExternalContentModal}
            open={showExternalContentModal}
          ></ExternalContentModal>
        )}
      </div>
    </StyledMotionDiv>
  );

  const loadingContent = (
    <div className="container mx-auto">
      <div className="flex justify-center my-72">
        <Spinner className="h-24 w-24"></Spinner>
      </div>
    </div>
  );

  if (isFetching || (isExpert && isFetchingUserContents) || !hasResolvedAccess) {
    return withNavbar({ children: loadingContent });
  }

  if (isExpert && !canAccessRequestedContent) {
    return withNavbar({ children: loadingContent });
  }

  return withNavbar({ children: detailsContent });
};

export default Details;
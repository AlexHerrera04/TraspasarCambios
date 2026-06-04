import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  Chip,
  IconButton,
  Spinner,
  Tooltip,
  Typography,
} from '@material-tailwind/react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { capitalize } from 'lodash';
import { FunctionComponent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';
import ContentPlaceholder from 'src/app/feature-browser/components/ContentPlaceholder';
import Button from 'src/app/ui/Button';

const APP_LANGUAGE_KEY = 'appLanguage';

const ActionButton = ({
  onClick,
  disabled,
  variant = 'outline',
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'outline' | 'primary';
  children: React.ReactNode;
}) => {
  const baseClassName =
    'inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-3 text-xs font-medium transition';
  const variantClassName =
    variant === 'primary'
      ? 'border-primary bg-primary text-white disabled:cursor-not-allowed disabled:opacity-50'
      : 'border-white/20 bg-transparent text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClassName} ${variantClassName}`}
    >
      {children}
    </button>
  );
};

const getLocalizedDate = (value: string, language: 'es' | 'en') => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES');
};

const getTypeLabel = (value: string) => {
  if (!value) return '-';

  return capitalize(value.split('_').join(' '));
};

const StatusBadge = ({
  status,
  language,
}: {
  status: boolean;
  language: 'es' | 'en';
}) => {
  const isPublished = !!status;
  const copy =
    language === 'en'
      ? {
          published: 'Published',
          inReview: 'In review',
        }
      : {
          published: 'Publicado',
          inReview: 'En revisión',
        };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
        isPublished
          ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
          : 'border-amber-400/30 bg-amber-500/10 text-amber-100'
      }`}
    >
      {isPublished ? (
        <CheckCircleIcon className="h-3.5 w-3.5" />
      ) : (
        <ClockIcon className="h-3.5 w-3.5" />
      )}
      {isPublished ? copy.published : copy.inReview}
    </div>
  );
};

const MetaItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
      {label}
    </p>
    <p className="mt-1 text-xs text-white/80">{value || '-'}</p>
  </div>
);

const ContentTable: FunctionComponent<any> = (props: any) => {
  const navigate = useNavigate();
  const { data, language, onDelete, deletingId } = props;

  const tableHead =
    language === 'en'
      ? ['Id', 'Name', 'Type', 'Status', 'Date', '']
      : ['Id', 'Nombre', 'Tipo', 'Estado', 'Fecha', ''];

  const copy =
    language === 'en'
      ? {
          published: 'Published',
          inReview: 'In review',
          viewContent: 'View Content',
          editContent: 'Edit Content',
          deleteContent: 'Delete Content',
        }
      : {
          published: 'Publicado',
          inReview: 'En revisión',
          viewContent: 'Ver contenido',
          editContent: 'Editar contenido',
          deleteContent: 'Eliminar contenido',
        };

  return (
    <table className="mt-4 w-full min-w-max table-auto text-left">
      <thead>
        <tr>
          {tableHead.map((head) => (
            <th
              key={head}
              className="border-y border-blue-gray-100 bg-gray-700 p-4"
            >
              <Typography
                variant="small"
                color="white"
                className="font-normal leading-none opacity-70"
              >
                {head}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map(
          (
            { id, name, type, created_at, status }: any,
            index: number
          ) => {
            const isLast = index === data.length - 1;
            const classes = isLast ? 'p-4' : 'border-b border-blue-gray-50 p-4';

            return (
              <tr key={id}>
                <td className={classes}>
                  <Typography variant="small" color="white" className="font-normal">
                    {id}
                  </Typography>
                </td>

                <td className={classes}>
                  <Typography variant="small" color="white" className="font-normal">
                    {name}
                  </Typography>
                </td>

                <td className={classes}>
                  <Typography variant="small" color="white" className="font-normal">
                    {type}
                  </Typography>
                </td>

                <td className={classes}>
                  <div className="w-max">
                    <Chip
                      variant="ghost"
                      size="sm"
                      value={status ? copy.published : copy.inReview}
                      color={status ? 'green' : 'blue-gray'}
                    />
                  </div>
                </td>

                <td className={classes}>
                  <Typography variant="small" color="white" className="font-normal">
                    {getLocalizedDate(created_at, language)}
                  </Typography>
                </td>

                <td className={classes}>
                  <Tooltip content={copy.viewContent}>
                    <IconButton
                      variant="text"
                      onClick={() => navigate(`/explorer/${id}`)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip content={copy.editContent}>
                    <IconButton
                      variant="text"
                      onClick={() => navigate(`edit/${id}`)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip content={copy.deleteContent}>
                    <IconButton
                      variant="text"
                      onClick={() => onDelete(id)}
                      disabled={deletingId === id}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
};

const ExpertContentCards: FunctionComponent<any> = (props: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, language, onDelete, deletingId } = props;

  const copy =
    language === 'en'
      ? {
          createdLabel: 'Created',
          ratingLabel: 'Rating',
          viewContent: 'View details',
          editContent: 'Edit',
          deleteContent: 'Delete',
        }
      : {
          createdLabel: 'Creado',
          ratingLabel: 'Valoración',
          viewContent: 'Ver detalle',
          editContent: 'Editar',
          deleteContent: 'Eliminar',
        };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {data.map((content: any) => {
        const hasImage = !!content.public_image;
        const contentName = content.name || content.title || '-';
        const contentType = getTypeLabel(content.type);

        return (
          <div
            key={content.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 shadow-lg shadow-black/10"
          >
            <Link
              to={`/explorer/${content.id}`}
              state={{ background: location }}
              className="block"
            >
              <div className="relative flex h-48 flex-col items-center">
                {hasImage ? (
                  <div
                    style={{
                      backgroundImage: `url(${content.public_image})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                    }}
                    className="absolute inset-2 rounded-lg bg-center bg-gray-600"
                  />
                ) : (
                  <ContentPlaceholder
                    type={content.type}
                    className="absolute inset-0"
                  />
                )}

                <span className="absolute left-3 top-3 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                  {contentType}
                </span>

                {(content.origin || content.external_source) && (
                  <span className="absolute right-3 top-3 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                    {capitalize(content.external_source || content.origin)}
                  </span>
                )}
              </div>
            </Link>

            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/explorer/${content.id}`}
                  state={{ background: location }}
                  className="min-w-0 flex-1"
                >
                  <h3 className="text-base font-bold text-white">{contentName}</h3>
                </Link>

                <StatusBadge status={content.status} language={language} />
              </div>

              <p className="text-xs leading-5 text-white/65">
                {content.short_description || content.description || '-'}
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <MetaItem
                  label={copy.createdLabel}
                  value={getLocalizedDate(content.created_at, language)}
                />
                <MetaItem
                  label={copy.ratingLabel}
                  value={content.rating || '-'}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <ActionButton onClick={() => navigate(`/explorer/${content.id}`)}>
                  <EyeIcon className="h-3.5 w-3.5" />
                  {copy.viewContent}
                </ActionButton>

                <ActionButton onClick={() => navigate(`edit/${content.id}`)}>
                  <PencilIcon className="h-3.5 w-3.5" />
                  {copy.editContent}
                </ActionButton>

                <ActionButton
                  variant="primary"
                  onClick={() => onDelete(content.id)}
                  disabled={deletingId === content.id}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  {copy.deleteContent}
                </ActionButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Content: FunctionComponent<any> = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userAccountInfo } = useUser();
  const language = localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';
  const isExpert = userAccountInfo?.type === 'expert';

  const copy =
    language === 'en'
      ? {
          companyTitle: 'Share your knowledge.',
          expertTitle: 'Content management',
          expertDescription:
            'Manage the resources you have shared and review their publication status.',
          description:
            'Publish relevant content, visible only to users in your company, encouraging collaboration and knowledge sharing.',
          addContent: 'Add Content',
          emptyState: "You haven't published any content.",
          confirmDelete: 'Are you sure you want to delete this content?',
          deleteError: 'Error deleting content.',
        }
      : {
          companyTitle: 'Comparte tu conocimiento.',
          expertTitle: 'Gestión de contenidos',
          expertDescription:
            'Gestiona los recursos que has compartido y revisa su estado de publicación.',
          description:
            'Publica contenido relevante, visible sólo para los usuarios de tu empresa, fomentando la colaboración y el intercambio de conocimiento.',
          addContent: 'Agregar Contenido',
          emptyState: 'No has publicado ningún contenido.',
          confirmDelete: 'Estas seguro de que quieres eliminar este contenido?',
          deleteError: 'Error al eliminar el contenido.',
        };

  const { data, isFetching } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const response = await api.get(
        `${import.meta.env.VITE_API_URL}/contents/user_contents/`
      );
      return response.data;
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: number | string) => {
      await api.delete(`${import.meta.env.VITE_API_URL}/contents/${contentId}/`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: () => {
      alert(copy.deleteError);
    },
  });

  const handleDelete = (contentId: number | string) => {
    if (!window.confirm(copy.confirmDelete)) return;
    deleteContentMutation.mutate(contentId);
  };

  const pageContent = (
    <div className="container mx-auto my-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="mb-4 mt-10 text-4xl font-bold">
            {isExpert ? copy.expertTitle : copy.companyTitle}
          </h2>

          {isExpert ? (
            <p className="mb-7 max-w-3xl text-white/70">{copy.expertDescription}</p>
          ) : (
            <p className="mb-7">{copy.description}</p>
          )}
        </div>

        <div className="mt-10 flex gap-3">
          <Button primary onClick={() => navigate('new')}>
            <PlusCircleIcon strokeWidth={2} className="h-4 w-4" />{' '}
            {copy.addContent}
          </Button>
        </div>
      </div>

      {isFetching && (
        <div className="flex justify-center py-10">
          <Spinner className="h-8 w-8"></Spinner>
        </div>
      )}

      {data && data.length > 0 && (
        <ExpertContentCards
          data={data}
          language={language}
          onDelete={handleDelete}
          deletingId={deleteContentMutation.variables}
        />
      )}

      {data && data.length === 0 && (
        <div className="flex justify-center py-8">
          <Typography variant="small" color="white" className="font-normal">
            {copy.emptyState}
          </Typography>
        </div>
      )}
    </div>
  );

  return withNavbar({ children: pageContent });
};

export default Content;
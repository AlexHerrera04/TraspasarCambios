import {
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
import { FunctionComponent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { Card as BrowserCard } from 'src/app/feature-browser/components/Card';
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
    'inline-flex h-9 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium transition';
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
          published: 'publicado',
          inReview: 'en revisión',
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
            const classes = isLast ? 'p-4' : 'p-4 border-b border-blue-gray-50';

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
                    {new Date(created_at).toLocaleDateString()}
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
  const { data, language, onDelete, deletingId } = props;

  const copy =
    language === 'en'
      ? {
          editContent: 'Edit',
          deleteContent: 'Delete',
        }
      : {
          editContent: 'Editar',
          deleteContent: 'Eliminar',
        };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 xl:grid-cols-4">
      {data.map((content: any) => (
        <div key={content.id} className="w-54">
          <Link to={`/explorer/${content.id}`} state={{ background: location }}>
            <BrowserCard
              id={content.id}
              title={content.title || content.name}
              type={content.type}
              public_image={content.public_image}
              short_description={content.short_description || ''}
              external_source={content.external_source}
              external_source_id={content.external_source_id}
              description={content.description || ''}
              name={content.name}
              rating={content.rating || ''}
              origin={content.origin || ''}
            />
          </Link>

          <div className="mt-3 flex justify-end gap-2">
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
      ))}
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
          expertTitle: 'Your Content',
          description:
            'Publish relevant content, visible only to users in your company, encouraging collaboration and knowledge sharing.',
          addContent: 'Add Content',
          emptyState: "You haven't published any content.",
          confirmDelete: 'Are you sure you want to delete this content?',
          deleteError: 'Error deleting content.',
        }
      : {
          companyTitle: 'Comparte tu conocimiento.',
          expertTitle: 'Tu Contenido',
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-7 mt-10 text-4xl font-bold">
            {isExpert ? copy.expertTitle : copy.companyTitle}
          </h2>

          {!isExpert && <p className="mb-7">{copy.description}</p>}
        </div>

        <div className="flex gap-3">
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

      {data && data.length > 0 && !isExpert && (
        <div className="rounded-xl bg-gray-800">
          <div className="overflow-y-auto px-0">
            <ContentTable
              data={data}
              language={language}
              onDelete={handleDelete}
              deletingId={deleteContentMutation.variables}
            />
          </div>
        </div>
      )}

      {data && data.length > 0 && isExpert && (
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
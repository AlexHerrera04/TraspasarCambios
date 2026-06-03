import {
  EyeIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardBody,
  Chip,
  IconButton,
  Spinner,
  Tooltip,
  Typography,
} from '@material-tailwind/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';
import Button from 'src/app/ui/Button';

const APP_LANGUAGE_KEY = 'appLanguage';

const ContentTable: FunctionComponent<any> = (props: any) => {
  const navigate = useNavigate();
  const { data, language } = props;

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
          ({ id, name, type, created_at, status }: any, index: number) => {
            const isLast = index === data.length - 1;
            const classes = isLast ? 'p-4' : 'p-4 border-b border-blue-gray-50';

            return (
              <tr key={id}>
                <td className={classes}>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <Typography
                        variant="small"
                        color="white"
                        className="font-normal"
                      >
                        {id}
                      </Typography>
                    </div>
                  </div>
                </td>

                <td className={classes}>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <Typography
                        variant="small"
                        color="white"
                        className="font-normal"
                      >
                        {name}
                      </Typography>
                    </div>
                  </div>
                </td>

                <td className={classes}>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <Typography
                        variant="small"
                        color="white"
                        className="font-normal"
                      >
                        {type}
                      </Typography>
                    </div>
                  </div>
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
                  <Typography
                    variant="small"
                    color="white"
                    className="font-normal"
                  >
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
                    <IconButton variant="text">
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

const Content: FunctionComponent<any> = () => {
  const navigate = useNavigate();
  const { userAccountInfo } = useUser();
  const language = localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

  const copy =
    language === 'en'
      ? {
          companyTitle: 'Share your knowledge.',
          expertTitle: 'Your Content',
          description:
            'Publish relevant content, visible only to users in your company, encouraging collaboration and knowledge sharing.',
          addContent: 'Add Content',
          emptyState: "You haven't published any content.",
        }
      : {
          companyTitle: 'Comparte tu conocimiento.',
          expertTitle: 'Tu Contenido',
          description:
            'Publica contenido relevante, visible sólo para los usuarios de tu empresa, fomentando la colaboración y el intercambio de conocimiento.',
          addContent: 'Agregar Contenido',
          emptyState: 'No has publicado ningún contenido.',
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

  const pageContent = (
    <div className="my-5 container mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mt-10 mb-7 text-4xl font-bold">
            {userAccountInfo?.type === 'company'
              ? copy.companyTitle
              : copy.expertTitle}
          </h2>

          {userAccountInfo?.type === 'company' && (
            <p className="mb-7">{copy.description}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button primary onClick={() => navigate('new')}>
            <PlusCircleIcon strokeWidth={2} className="h-4 w-4" />{' '}
            {copy.addContent}
          </Button>
        </div>
      </div>

      <Card className="h-full w-full bg-gray-800">
        <CardBody className="overflow-y-auto px-0">
          {isFetching && (
            <div className="flex justify-center">
              <Spinner className="h-8 w-8"></Spinner>
            </div>
          )}

          {data && data.length > 0 && (
            <ContentTable data={data} language={language} />
          )}

          {data && data.length === 0 && (
            <div className="flex justify-center">
              <Typography
                variant="small"
                color="white"
                className="font-normal"
              >
                {copy.emptyState}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  return withNavbar({ children: pageContent });
};

export default Content;
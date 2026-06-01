import withNavbar from 'src/app/core/handlers/withNavbar';
import {
  Card,
  CardBody,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Dialog,
  Spinner,
} from '@material-tailwind/react';
import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ContributionDetails } from '../components/ContributionDetails';
import { ShareContributionDialog } from '../components/ShareContributionDialog';
import { toast } from 'react-toastify';
import { contributionsService, Contribution } from '../services/contributionsService';
import dayjs from 'dayjs';
import { persistenceService } from '../services/persistenceService';
import { unmapObjectAttributes } from '../utils/attributeMapper'

const Contributions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [selectedContributionId, setSelectedContributionId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedContributionForShare, setSelectedContributionForShare] = useState<Contribution | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const data = await contributionsService.getAll();
        setContributions(data);
      } catch (error: any) {
        console.error('Error fetching contributions:', error);
        toast.error('Error al cargar las contribuciones');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  // Filtrado de contribuciones
  const filteredContributions = contributions.filter((c) =>
    c.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler para el lápiz
  const handleEdit = (contribution: Contribution) => {
    if (contribution.status === 'draft') {
      const formatedContribution = unmapObjectAttributes(contribution)
      persistenceService.saveContributionData(formatedContribution)
      navigate('create')
    } else {
      toast.error('Solo se puede editar una contribucion en borrador')
    }

    // if (!contribution.enviado) {
    //   navigate(`/contributor/${contribution.id}/edit`);
    // } else {
    //   navigate(`/contributor/${contribution.id}/edit/review`);
    // }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleShare = (contribution: Contribution) => {
    setSelectedContributionForShare(contribution);
    setShareDialogOpen(true);
  };

  const content = (
    <div className="min-h-screen bg-[#111827] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Buscar contribuciones..."
              className="w-full px-4 py-2 bg-[#1e2633] text-white rounded-lg border border-gray-600 focus:border-primary-900 focus:ring-2 focus:ring-primary-900 focus:outline-none"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => navigate('create')}
            className="w-60 px-6 py-2 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap bg-primary-900 hover:bg-primary-800 text-white transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Agregar Contribución
          </button>
        </div>

        <Card className="h-full w-full bg-gray-800">
          <CardBody className="overflow-x-hidden px-0">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Spinner className="h-12 w-12" />
              </div>
            ) : (
              <table className="w-full min-w-max table-auto text-center">
                <thead>
                  <tr>
                    {[
                      'ID',
                      'Proyecto / Iniciativa',
                      'Lider',
                      'Estado',
                      'F.Creación',
                      'F.Envío',
                      // 'Eval.',
                      // 'Feedback',
                      'Acciones',
                    ].map((head) => (
                      <th
                        key={head}
                        className={`border-b border-blue-gray-100 bg-gray-700 p-4 ${
                          head === 'Proyecto / Iniciativa'
                            ? 'w-72'
                            : head === 'Lider'
                            ? 'w-48'
                            : head === 'ID'
                            ? 'w-12'
                            : head === 'Estado'
                            ? 'w-28'
                            : head === 'Feedback'
                            ? 'w-28'
                            : head === 'Acc.'
                            ? 'w-40'
                            : 'w-24'
                        }`}
                      >
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal leading-none opacity-70 text-center whitespace-nowrap"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredContributions.map((contribution) => (
                    <tr
                      key={contribution.id}
                      className="border-b border-blue-gray-50 hover:bg-gray-600/50 transition-colors"
                    > 
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal text-center"
                        >
                          {contribution.id}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal text-center"
                        >
                          {contribution.project_name}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal text-center"
                        >
                          {contribution.project_leader_name} {contribution.project_leader_last_name}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Chip
                          size="sm"
                          variant="filled"
                          className={
                            contribution.status === 'draft'
                              ? 'bg-warning-600 text-black'
                              : 'bg-success-500 text-white'
                          }
                          value={contribution.status_display}
                        />
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal text-center whitespace-nowrap"
                        >
                          {contribution.created_at ? dayjs(contribution.created_at).format('DD-MM-YY') : ''}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal text-center whitespace-nowrap"
                        >
                          {contribution.feedback_requested_at ? dayjs(contribution.feedback_requested_at).format('DD-MM-YY') : ''}
                        </Typography>
                      </td>
                      {/* <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal text-center"
                        >
                          {contribution.evaluadores.toString()}
                        </Typography>
                      </td> */}
                      {/* <td className="p-4">
                        <Chip
                          size="sm"
                          variant="filled"
                          className={
                            contribution.feedback === 'EN_PROCESO'
                              ? 'bg-success-500 text-white'
                              : 'bg-warning-600 text-black'
                          }
                          value={contribution.feedback}
                        />
                      </td> */}
                      <td className="p-4">
                        <div className="flex justify-center">
                          <Tooltip content="Ver detalles">
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() =>
                                setSelectedContributionId(contribution.id)
                              }
                            >
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Continuar editando">
                            <IconButton
                              variant="text"
                              color="white"
                              onClick={() => handleEdit(contribution)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Compartir">
                            <IconButton 
                              variant="text" 
                              color="white"
                              onClick={() => handleShare(contribution)}
                            >
                              <ShareIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Modal de detalles */}
      {selectedContributionId && (
        <Dialog
          open={!!selectedContributionId}
          handler={() => setSelectedContributionId(null)}
          className="bg-transparent shadow-none"
        >
          <ContributionDetails
            contribution={contributions.find((con) => con.id === selectedContributionId)!}
            onClose={() => setSelectedContributionId(null)}
          />
        </Dialog>
      )}

      {/* Modal de compartir */}
      {selectedContributionForShare && (
        <ShareContributionDialog
          open={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setSelectedContributionForShare(null);
          }}
          contribution={selectedContributionForShare}
        />
      )}
    </div>
  );

  return withNavbar({ children: content });
};

export default Contributions;

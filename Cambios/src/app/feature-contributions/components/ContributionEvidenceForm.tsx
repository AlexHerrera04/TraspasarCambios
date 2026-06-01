import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  Progress,
  Typography,
  Spinner,
  Dialog,
  IconButton,
} from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import SelectInput from 'src/app/ui/SelectInput';
import { useNavigate } from 'react-router-dom';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { Content } from 'src/app/feature-admin/types/goals';
import { SelectContentModal } from 'src/app/feature-admin/components/modals/SelectContentModal';
import { useLayerZeroOptions } from 'src/app/feature-admin/services/userService';
import { toast } from 'react-toastify';
import { persistenceService } from '../services/persistenceService';
import { ContributionEvidenceForm as ContributionEvidenceFormType } from '../types';

interface ContributionEvidenceForm {
  skills: string[]; // Habilidades del ADN
  highlighted_content: string[]; // Contenidos destacados
  contribution_percentage: number; // Porcentaje de contribución
}

interface Evidence {
  competency: string[];
  competency_id: string[];
  contribution_percentage: string;
  capabilities: string;
  capabilities_id: string;
}

interface TableEvidence {
  competency: string;
  competency_id: string;
  contribution_percentage: string;
  capabilities: string;
  capabilities_id: string;
}

const ContributionEvidenceForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [evidences, setEvidences] = useState<TableEvidence[]>([]);
  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showCompetencyModal, setShowCompetencyModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const { data: layerZeroOptions, isLoading: isLoadingCapacities } = useLayerZeroOptions();
  const [currentEvidence, setCurrentEvidence] = useState<Evidence>({
    competency: [],
    competency_id: [],
    contribution_percentage: '',
    capabilities: '',
    capabilities_id: '',
  });

  const [selectedCompetency, setSelectedCompetency] = useState<any>(null);


  const formik = useFormik<ContributionEvidenceFormType>({
    initialValues: {
      skills: [],
      highlighted_content: [],
      contribution_percentage: 0,
    },
    validationSchema: Yup.object({
      skills: Yup.array().of(Yup.string()),
      highlighted_content: Yup.array().of(Yup.string()),
      contribution_percentage: Yup.number().min(0).max(100),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        persistenceService.saveStepData('evidence', {
          ...values,
          evidences
        });
        navigate('/contributor/create/review');
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleOpenCompetencyModal = () => {
    setShowAddEvidenceModal(false);  // Cerrar el modal de agregar evidencia
    setShowCompetencyModal(true);    // Abrir el modal de competencias
  };

  const handleCompetencySelection = () => {
    if (selectedCompetency) {
      setCurrentEvidence({
        ...currentEvidence,
        competency: [selectedCompetency.label],
        competency_id: [selectedCompetency.id.toString()],
      });
    }
    setShowCompetencyModal(false);
    setShowAddEvidenceModal(true);
  };

  useEffect(() => {
    const savedData = persistenceService.getStepData('evidence');
    if (savedData) {
      formik.setValues(savedData);
      if (savedData.evidences) {
        setEvidences(savedData.evidences);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formik.dirty) {
        persistenceService.saveStepData('evidence', {
          ...formik.values,
          evidences
        });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formik.values, evidences]);

  const handleAddEvidence = () => {
    if (currentEvidence.competency.length > 0 && currentEvidence.contribution_percentage) {
      const tableEvidence: TableEvidence = {
        competency: currentEvidence.competency.join(', '),
        competency_id: currentEvidence.competency_id.join(', '),
        contribution_percentage: currentEvidence.contribution_percentage,
        capabilities: currentEvidence.capabilities,
        capabilities_id: currentEvidence.capabilities_id
      };
      const newEvidences = [...evidences, tableEvidence];
      setEvidences(newEvidences);

      persistenceService.saveStepData('evidence', {
        ...formik.values,
        evidences: newEvidences
      });

      setCurrentEvidence({
        competency: [],
        competency_id: [],
        contribution_percentage: '',
        capabilities: '',
        capabilities_id: '',
      });
      setShowAddEvidenceModal(false);
    }
  };

  const handleDeleteClick = (index: number) => {
    const newEvidences = evidences.filter((_, i) => i !== index);
    setEvidences(newEvidences);

    persistenceService.saveStepData('evidence', {
      ...formik.values,
      evidences: newEvidences
    });
  };

  const handleContentSelect = (content: Content) => {
    setCurrentEvidence((prev) => ({
      ...prev,
      capabilities: content.name,
      capabilities_id: content.id.toString(),
    }));
    setShowContentModal(false);
    setTimeout(() => setShowAddEvidenceModal(true), 100);
  };

  const competencyOptions = layerZeroOptions?.capacities?.map((capacity: any) => ({
    value: capacity.name,
    label: capacity.name,
    id: capacity.id,
  })) || [];

  const content = (
    <div className="min-h-screen bg-[#111827] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between">
          <div className="w-full lg:w-[66%] px-7 mb-11">
            <div className="relative mb-6">
              <Typography
                variant="h3"
                className="text-6xl mr-4 text-center mb-6 font-bold text-white"
              >
                3/4
              </Typography>
              <Progress
                value={75}
                className="bg-gray-600 w-full [&_div]:bg-primary-600"
              />
            </div>
            <h2 className="text-4xl text-white">Contribución y Evidencias</h2>
            <p className="text-gray-400 mb-4 mt-4">
              Ahora destaca las competencias y contenidos clave que has empleado para realizar esta contribución.
            </p>
            <p className="text-gray-400 mb-4 mt-4">
              Para iniciar la carga debes seleccionar el botón “Agregar Evidencia” y completar los datos:
            </p>
            <p className="text-gray-400 mb-2">
              <b>Habilidades y competencias utilizadas:</b>
              <p className="text-gray-400">
                Selecciona las capacidades que aplicaste, según tu perfil (ADN).
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Contenido destacado (opcional):</b>
              <p className="text-gray-400">
                Selecciona recursos de tu historial que hayan influido o inspirado el proyecto.
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>% de contribución:</b>
              <p className="text-gray-400">
                Estima tu aporte personal en relación al trabajo colaborativo total (0–100%).
              </p>
              <p className="text-gray-400">
                Importante: La suma de los % de todas las Evidencias debe ser como máximo 100%
              </p>
            </p>
          </div>

          <div className="w-full lg:w-[87%] text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:pl-12">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300 self-end">
                    Beneficio para la empresa
                  </label>
                  <Button
                    onClick={() => setShowAddEvidenceModal(true)}
                    type="button"
                    primary
                  >
                    Agregar Evidencia
                  </Button>
                </div>

                <div className="bg-gray-600 rounded-lg w-full">
                  <table className="w-full text-white">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-3 w-[73%] text-left">Competencia</th>
                        <th className="p-3 text-center">Contribución</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-600">
                      {evidences.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center p-3 text-gray-400"
                          >
                            No hay evidencias
                          </td>
                        </tr>
                      ) : (
                        evidences.map((evidence, index) => (
                          <tr
                            key={index}
                            className="border-t border-gray-600"
                          >
                            <td className="p-3">{evidence.competency}</td>
                            <td className="p-3 text-center">
                              {evidence.contribution_percentage} %
                            </td>
                            <td className="p-3 text-center">
                              <TrashIcon 
                                className="w-6 h-6 cursor-pointer hover:text-red-500 mx-auto" 
                                onClick={() => handleDeleteClick(index)}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <Button
                  onClick={() => navigate('/contributor/create/impact')}
                  type="button"
                  outline
                >
                  Volver
                </Button>
                <Button
                  onClick={() => navigate('/contributor/create/review')}
                  type="button"
                  primary
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>

          {/* Modal para agregar evidencia */}
          <Dialog
            open={showAddEvidenceModal}
            handler={() => setShowAddEvidenceModal(false)}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6">
              <h3 className="text-xl text-white mb-4">Agregar Evidencia</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Seleccione Competencia o Capacidad utilizada
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={currentEvidence.competency.join(', ')}
                      readOnly
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                      placeholder="Seleccione una o más competencias..."
                    />
                    <Button 
                      onClick={handleOpenCompetencyModal}
                      type="button"
                      primary
                    >
                      Seleccionar Competencia
                    </Button>
                  </div>
                </div>
                
                <br />
                
                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Ingresa el porcentaje que esta competencia aportó al resultado del proyecto.
                  </label>
                  <div className="flex items-center">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentEvidence.contribution_percentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          // Only update if value is valid and within range
                          if (e.target.value === '' || (!isNaN(value) && value >= 0 && value <= 100)) {
                            setCurrentEvidence({
                              ...currentEvidence,
                              contribution_percentage: e.target.value,
                            });
                          }
                        }}
                        className="w-28 p-2 rounded-lg bg-gray-700 text-white border text-right pr-8 border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>


                <br />
                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Selecciona el contenido que más te ayudó a mejorar esta competencia o capacidad.
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={currentEvidence.capabilities}
                      readOnly
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                      placeholder="Seleccione un contenido..."
                    />
                    <Button 
                      onClick={() => {
                        setShowAddEvidenceModal(false);
                        setShowContentModal(true);
                      }} 
                      type="button"
                      primary
                    >
                      Seleccionar Contenido
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    onClick={() => setShowAddEvidenceModal(false)}
                    type="button"
                    outline
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddEvidence} type="button" primary>
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </Dialog>

          {/* Modal para seleccionar competencia */}
          <Dialog
            open={showCompetencyModal}
            handler={() => {
              setShowCompetencyModal(false);
              setShowAddEvidenceModal(true); // Reabrir el modal de agregar evidencia al cerrar
            }}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Typography variant="h5" className="text-white">
                    Seleccionar Competencia
                  </Typography>
                  <Typography variant="small" className="text-gray-400">
                    Seleccione las competencias utilizadas
                  </Typography>
                </div>
                <IconButton
                  variant="text"
                  color="white"
                  onClick={() => {
                    setShowCompetencyModal(false);
                    setShowAddEvidenceModal(true);
                  }}
                >
                  <XMarkIcon className="h-6 w-6" />
                </IconButton>
              </div>

              <div className="space-y-4">
                <SelectInput
                  label="Seleccionar competencia"
                  name="competencies"
                  isMulti={false}
                  value={selectedCompetency}
                  options={competencyOptions}
                  onChange={(selectedOption: any) => {
                    setSelectedCompetency(selectedOption);
                  }}
                  onBlur={() => {}}
                  error=""
                />
                <Typography variant="small" className="text-gray-400">
                  Selecciona una competencia de la lista.
                </Typography>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <Button
                  onClick={() => {
                    setShowCompetencyModal(false);
                    setShowAddEvidenceModal(true);
                  }}
                  type="button"
                  outline
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCompetencySelection}
                  type="button"
                  primary
                  disabled={isLoadingCapacities || !selectedCompetency}
                >
                  {isLoadingCapacities ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : null}
                  Confirmar Selección
                </Button>
              </div>
            </div>
          </Dialog>

          {/* Modal para seleccionar contenido */}
          <SelectContentModal
            open={showContentModal}
            onClose={() => setShowContentModal(false)}
            onSelect={handleContentSelect}
          />
        </div>
      </div>
    </div>
  );

  return withNavbar({ children: content });
};

export default ContributionEvidenceForm;

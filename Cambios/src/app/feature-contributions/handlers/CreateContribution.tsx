import { useState, useEffect } from 'react';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { Input, Textarea, Select, Option } from "@material-tailwind/react";

interface ContributionForm {
  // Form 1: Información de la Contribución
  contributionInfo: {
    title: string;
    description: string;
    project: string;
    initiative: string;
    capacities: string[];
    impact: string;
    roi: string;
  };
  // Form 2: Información del Evaluador
  evaluatorInfo: {
    evaluatorId: string;
    evaluatorName: string;
    position: string;
    feedback: string;
  };
  // Form 3: Detalles de Validación
  validationDetails: {
    status: 'pending' | 'approved' | 'rejected';
    comments: string;
    evaluationDate: string;
  };
  // Form 4: Reportes y Análisis
  reportsAnalysis: {
    metrics: string[];
    conclusions: string;
    recommendations: string;
  };
}

const CreateContribution: React.FC = () => {
  // Estado inicial
  const [formData, setFormData] = useState<ContributionForm>({
    contributionInfo: {
      title: '',
      description: '',
      project: '',
      initiative: '',
      capacities: [],
      impact: '',
      roi: '',
    },
    evaluatorInfo: {
      evaluatorId: '',
      evaluatorName: '',
      position: '',
      feedback: '',
    },
    validationDetails: {
      status: 'pending',
      comments: '',
      evaluationDate: new Date().toISOString().split('T')[0],
    },
    reportsAnalysis: {
      metrics: [],
      conclusions: '',
      recommendations: '',
    },
  });

  // Cargar datos guardados
  useEffect(() => {
    const savedData = localStorage.getItem('contributionFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Guardar datos
  const saveFormData = (newData: ContributionForm) => {
    localStorage.setItem('contributionFormData', JSON.stringify(newData));
    setFormData(newData);
  };

  // Manejadores de cambios para cada formulario
  const handleContributionInfoChange = (
    field: keyof ContributionForm['contributionInfo'],
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      contributionInfo: {
        ...prev.contributionInfo,
        [field]: value
      }
    }));
  };

  const handleEvaluatorInfoChange = (
    field: keyof ContributionForm['evaluatorInfo'],
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      evaluatorInfo: {
        ...prev.evaluatorInfo,
        [field]: value
      }
    }));
  };

  const handleValidationDetailsChange = (
    field: keyof ContributionForm['validationDetails'],
    value: string | 'pending' | 'approved' | 'rejected'
  ) => {
    setFormData(prev => ({
      ...prev,
      validationDetails: {
        ...prev.validationDetails,
        [field]: value
      }
    }));
  };

  const handleReportsAnalysisChange = (
    field: keyof ContributionForm['reportsAnalysis'],
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      reportsAnalysis: {
        ...prev.reportsAnalysis,
        [field]: value
      }
    }));
  };

  const content = (
    <div className="min-h-screen bg-[#111827] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Nueva Contribución</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                localStorage.removeItem('contributionFormData');
                window.history.back();
              }}
              className="px-6 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={() => console.log('Guardar', formData)}
              className="px-6 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-lg"
            >
              Guardar
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Form 1: Información de la Contribución */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800/40">
            <h2 className="text-xl font-semibold text-white mb-6">
              Información de la Contribución
            </h2>
            <div className="space-y-4">
              <Input
                type="text"
                label="Título"
                value={formData.contributionInfo.title}
                onChange={(e) => handleContributionInfoChange('title', e.target.value)}
                className="!text-white"
                labelProps={{
                  className: "!text-gray-400",
                }}
                containerProps={{
                  className: "!text-white",
                }}
              />
              <Textarea
                label="Descripción"
                value={formData.contributionInfo.description}
                onChange={(e) => handleContributionInfoChange('description', e.target.value)}
                className="!text-white"
                labelProps={{
                  className: "!text-gray-400",
                }}
                containerProps={{
                  className: "!text-white",
                }}
              />
              <Input
                type="text"
                label="Proyecto"
                value={formData.contributionInfo.project}
                onChange={(e) => handleContributionInfoChange('project', e.target.value)}
                className="!text-white"
                labelProps={{
                  className: "!text-gray-400",
                }}
                containerProps={{
                  className: "!text-white",
                }}
              />
              <Input
                type="text"
                label="Iniciativa"
                value={formData.contributionInfo.initiative}
                onChange={(e) => handleContributionInfoChange('initiative', e.target.value)}
                className="!text-white"
                labelProps={{
                  className: "!text-gray-400",
                }}
                containerProps={{
                  className: "!text-white",
                }}
              />
              <Textarea
                label="Impacto"
                value={formData.contributionInfo.impact}
                onChange={(e) => handleContributionInfoChange('impact', e.target.value)}
                className="!text-white"
                labelProps={{
                  className: "!text-gray-400",
                }}
                containerProps={{
                  className: "!text-white",
                }}
              />
              <Input
                type="text"
                label="ROI"
                value={formData.contributionInfo.roi}
                onChange={(e) => handleContributionInfoChange('roi', e.target.value)}
                className="!text-white"
                labelProps={{
                  className: "!text-gray-400",
                }}
                containerProps={{
                  className: "!text-white",
                }}
              />
            </div>
          </div>

          {/* Form 2: Información del Evaluador */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800/40">
            <h2 className="text-xl font-semibold text-white mb-4">
              Información del Evaluador
            </h2>
            {/* Aquí van los campos del Form 2 */}
          </div>

          {/* Form 3: Detalles de Validación */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800/40">
            <h2 className="text-xl font-semibold text-white mb-4">
              Detalles de Validación
            </h2>
            {/* Aquí van los campos del Form 3 */}
          </div>

          {/* Form 4: Reportes y Análisis */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800/40">
            <h2 className="text-xl font-semibold text-white mb-4">
              Reportes y Análisis
            </h2>
            {/* Aquí van los campos del Form 4 */}
          </div>
        </div>
      </div>
    </div>
  );

  return withNavbar({ children: content });
};

export default CreateContribution;

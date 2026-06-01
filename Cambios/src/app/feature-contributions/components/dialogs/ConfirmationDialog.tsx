import React from 'react';
import { Dialog } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import { ContributionSummary, Evaluator } from '../../types';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => (
  <Dialog open={open} handler={onClose} className="bg-gray-800 max-w-md">
    <div className="p-6">
      <h3 className="text-xl text-white mb-4">{title}</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        <Button onClick={onClose} type="button" outline>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} type="button" primary>
          {confirmText}
        </Button>
      </div>
    </div>
  </Dialog>
);

interface ContributionConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  contributionData: ContributionSummary;
  evaluators: Evaluator[];
  sentEvaluators: Set<number>;
  onSendEmail: (evaluator: Evaluator, index: number) => void;
}

export const ContributionConfirmDialog: React.FC<
  ContributionConfirmDialogProps
> = ({
  open,
  onClose,
  onConfirm,
  currentStep,
  setCurrentStep,
  contributionData,
  evaluators,
  sentEvaluators,
  onSendEmail,
}) => (
  <Dialog open={open} handler={onClose} className="bg-[#1E293B] max-w-6xl">
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-white">Confirmar Envío</h2>
        <div className="space-x-2">
          <span
            className={`px-3 py-1 rounded ${
              currentStep === 1 ? 'bg-primary-600' : 'bg-gray-600'
            }`}
          >
            1
          </span>
          <span
            className={`px-3 py-1 rounded ${
              currentStep === 2 ? 'bg-primary-600' : 'bg-gray-600'
            }`}
          >
            2
          </span>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto pr-6">
        {currentStep === 1 ? (
          <ContributionSummaryView contributionData={contributionData} />
        ) : (
          <EvaluatorsSummaryView
            evaluators={evaluators}
            sentEvaluators={sentEvaluators}
            onSendEmail={onSendEmail}
          />
        )}
      </div>

      <div className="flex justify-between mt-6">
        {currentStep === 2 ? (
          <Button onClick={() => setCurrentStep(1)} type="button" outline>
            Anterior
          </Button>
        ) : null}

        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} type="button" outline>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (currentStep === 1) {
                setCurrentStep(2);
              } else {
                onConfirm();
              }
            }}
            type="button"
            primary
            disabled={
              currentStep === 2 && sentEvaluators.size !== evaluators.length
            }
          >
            {currentStep === 1 ? 'Siguiente' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  </Dialog>
);

const ContributionSummaryView: React.FC<{
  contributionData: ContributionSummary;
}> = ({ contributionData }) => (
  <div className="space-y-6 text-white">
    <div>
      <h3 className="text-2xl mb-6">Información General</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-gray-400 mb-1">Título</p>
            <p>{contributionData.title}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Categoría</p>
            <p>{contributionData.category}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 mb-1">Descripción</p>
            <p>{contributionData.description}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Fecha Inicio</p>
            <p>{contributionData.start_date}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Fecha Fin</p>
            <p>{contributionData.end_date}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EvaluatorsSummaryView: React.FC<{
  evaluators: Evaluator[];
  sentEvaluators: Set<number>;
  onSendEmail: (evaluator: Evaluator, index: number) => void;
}> = ({ evaluators, sentEvaluators, onSendEmail }) => (
  <div className="space-y-6 text-white">
    <h3 className="text-2xl font-bold">Evaluadores</h3>
    {evaluators.map((evaluator, index) => (
      <div
        key={index}
        className="p-4 border border-gray-600 rounded-lg flex justify-between"
      >
        <div>
          <p className="font-bold">{`${evaluator.name} ${evaluator.lastname}`}</p>
          <p className="text-gray-400">{evaluator.position}</p>
          <p className="text-gray-400">{evaluator.area}</p>
          <p className="text-gray-400">{evaluator.email}</p>
        </div>
        <Button
          onClick={() => onSendEmail(evaluator, index)}
          type="button"
          primary
          style={{ alignSelf: 'center', marginRight: '23px' }}
          disabled={sentEvaluators.has(index)}
        >
          {sentEvaluators.has(index) ? 'Enviado' : 'Enviar'}
        </Button>
      </div>
    ))}
  </div>
);

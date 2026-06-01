import React from 'react';
import { Dialog } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  currentStep,
  onNext,
  onPrev,
  onConfirm,
  children,
}) => {
  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
      className="bg-gray-800"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-white"></h2>
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
            <span
              className={`px-3 py-1 rounded ${
                currentStep === 3 ? 'bg-primary-600' : 'bg-gray-600'
              }`}
            >
              3
            </span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        <div className="flex justify-between mt-6">
          {currentStep > 1 ? (
            <Button onClick={onPrev} type="button" outline>
              Anterior
            </Button>
          ) : (
            <div></div>
          )}

          <div className="space-x-4">
            <Button onClick={onClose} type="button" outline>
              Cancelar
            </Button>
            <Button
              onClick={currentStep < 3 ? onNext : onConfirm}
              type="button"
              primary
            >
              {currentStep < 3 ? 'Siguiente' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}; 
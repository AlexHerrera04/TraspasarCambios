import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  IconButton,
  Card,
  CardBody,
} from '@material-tailwind/react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Content } from '../../types/goals';

interface SelectAssessmentModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (content: Content) => void;
}

export const SelectAssessmentModal: React.FC<SelectAssessmentModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const assessments = [
    {
      id: 1,
      name: 'Assessment de Liderazgo IT',
      description: 'Assessment que analiza 21 capacidades claves sobre Liderazgo en un área de tecnología',
      type: 'quiz'
    },
    {
      id: 2,
      name: 'Assessment de Comunicación Efectiva',
      description: 'Assessment de Comunicación Efectiva',
      type: 'quiz'
    },
    {
      id: 3,
      name: 'Assessment de Coaching',
      description: 'Assessment de Coaching',
      type: 'quiz'
    }
  ];

  return (
    <Dialog 
      open={open} 
      handler={onClose}
      className="bg-gray-900 text-white max-w-3xl"
    >
      <DialogHeader className="relative border-b border-gray-700 px-6 py-4">
        <Typography variant="h5" className="text-white font-semibold">
          Seleccionar Assessment
        </Typography>
        <IconButton
          variant="text"
          color="white"
          onClick={onClose}
          className="!absolute top-2 right-2 rounded-full p-2 hover:bg-gray-800"
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="p-6">
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <Card 
              key={assessment.id}
              className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700"
            >
              <CardBody className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="h6" className="text-white mb-1">
                      {assessment.name}
                    </Typography>
                    <Typography className="text-sm text-gray-400 mb-3">
                      {assessment.description}
                    </Typography>
                    <button
                      onClick={() => {
                        onSelect(assessment as Content);
                        onClose();
                      }}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600"
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </DialogBody>
    </Dialog>
  );
}; 
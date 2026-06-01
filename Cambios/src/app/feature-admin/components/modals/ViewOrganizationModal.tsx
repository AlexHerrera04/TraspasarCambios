import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  IconButton,
} from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { OrganizationType } from '../../types/organization';

interface ViewOrganizationModalProps {
  open: boolean;
  handleOpen: () => void;
  organization: OrganizationType;
}

export const ViewOrganizationModal: React.FC<ViewOrganizationModalProps> = ({
  open,
  handleOpen,
  organization,
}) => {
  return (
    <Dialog
      open={open}
      handler={handleOpen}
      className="bg-[#1B2541] text-white max-w-[500px]"
      size="md"
    >
      <DialogHeader className="flex justify-between items-center p-4 border-b border-gray-800">
        <Typography variant="h4" className="text-white text-xl">
          {organization.name}
        </Typography>
        <IconButton
          variant="text"
          onClick={handleOpen}
          className="text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1E2A4A] p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-1">
              Tipo de Organizacion
            </Typography>
            <Typography className="text-white text-lg">
              {organization.level_type}
            </Typography>
          </div>

          <div className="bg-[#1E2A4A] p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-1">
              Nombre del Nivel
            </Typography>
            <Typography className="text-white text-lg">
              {organization.level_name}
            </Typography>
          </div>

          <div className="bg-[#1E2A4A] p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-1">
              Organizacion Superior
            </Typography>
            <Typography className="text-white text-lg">
              {organization.parent_name || 'N/A'}
            </Typography>
          </div>

          <div className="bg-[#1E2A4A] p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 mb-1">
              Usuarios Asociados
            </Typography>
            <Typography className="text-white text-lg">
              {organization.associated_users || 0}
            </Typography>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
};

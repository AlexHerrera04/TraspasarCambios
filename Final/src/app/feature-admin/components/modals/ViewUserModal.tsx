import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  IconButton,
  Chip,
} from '@material-tailwind/react';
import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { GroupUser } from '../../types/user';

interface ViewUserModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  open,
  onClose,
  user,
}) => {
  return (
    <Dialog
      open={open}
      handler={onClose}
      className="bg-gray-900 text-white max-w-[600px] rounded-xl shadow-xl"
    >
      <DialogHeader className="flex justify-between items-center border-b border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
          <div>
            <Typography variant="h5" className="text-white font-bold">
              Detalles del Usuario
            </Typography>
            <Typography variant="small" className="text-gray-400">
              ID: {user.id}
            </Typography>
          </div>
        </div>
        <IconButton
          variant="text"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Rol */}
          <div className="col-span-2 bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 text-xs mb-2">
              Rol
            </Typography>
            <div className="flex gap-2">
              <Chip
                value=
                {
                    user.is_account_admin ? 'Administrador':
                    user.is_manager ? 'Manager'
                    : 'Usuario'
                }
                className="bg-gray-700 text-gray-200"
              />
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 text-xs mb-2">
              Email
            </Typography>
            <Typography className="text-white">{user.contact_email}</Typography>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 text-xs mb-2">
              Nombre de Usuario
            </Typography>
            <Typography className="text-white">
              {user.username || 'N/A'}
            </Typography>
          </div>

          {/* Información Organizacional */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 text-xs mb-2">
              Tipo
            </Typography>
            <Typography className="text-white">
              {user.type || 'Usuario Estándar'}
            </Typography>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 text-xs mb-2">
              Organización
            </Typography>
            <Typography className="text-white">
              {user.organization || 'Sin asignar'}
            </Typography>
          </div>

          {/* <div className="col-span-2 bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 text-xs mb-2">
              Niveles Organizacionales
            </Typography>
            <div className="flex flex-wrap gap-2">
              {user.organization ? (
                user.organization.map((level, index) => (
                  <Chip
                    key={index}
                    value={level}
                    className="bg-gray-700 text-gray-200"
                  />
                ))
              ) : (
                <Typography className="text-gray-400 italic">
                  No hay niveles asignados
                </Typography>
              )}
            </div>
          </div> */}

          {/* Estado de la Cuenta */}
          <div className="col-span-2 bg-gray-800 p-4 rounded-lg">
            <Typography variant="small" className="text-gray-400 text-xs mb-3">
              Estado de la Cuenta
            </Typography>
            <div className="flex gap-4">
              <Chip
                value="Información de Cuenta"
                className="bg-gray-700 text-gray-200"
              />
              <Chip
                value="Onboarding Completado"
                className="bg-gray-700 text-gray-200"
              />
            </div>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
};

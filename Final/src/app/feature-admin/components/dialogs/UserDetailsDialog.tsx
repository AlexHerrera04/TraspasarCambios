import React from 'react';
import {
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { GroupUser } from '../../types/user';

interface UserDetailsDialogProps {
  user: GroupUser;
  onClose: () => void;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  onClose
}) => {
  return (
    <>
      <DialogHeader>Detalles del Usuario</DialogHeader>
      <DialogBody divider className="grid grid-cols-2 gap-4">
        <div>
          <h6 className="font-bold">Nombre Público</h6>
          <p>{user.public_name}</p>
        </div>
        <div>
          <h6 className="font-bold">Email</h6>
          <p>{user.contact_email}</p>
        </div>
        <div>
          <h6 className="font-bold">Tipo</h6>
          <p>{user.type}</p>
        </div>
        <div>
          <h6 className="font-bold">Organización</h6>
          <p>{user.organization}</p>
        </div>
        <div>
          <h6 className="font-bold">Niveles</h6>
          <p>{user.organization_level.name}</p>{/* <p>{user.organization_level.join(", ")}</p> */}
        </div>
        <div>
          <h6 className="font-bold">Manager</h6>
          <p>{user.is_manager ? "Sí" : "No"}</p>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={onClose}
          className="mr-1"
        >
          Cerrar
        </Button>
      </DialogFooter>
    </>
  );
}; 
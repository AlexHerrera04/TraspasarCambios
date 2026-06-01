import React, { useState, forwardRef } from 'react';
import {
  Card,
  CardBody,
  IconButton,
  Tooltip,
  Typography,
} from '@material-tailwind/react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { OrganizationType, User } from '../types/organization';
import { ViewOrganizationModal } from './modals/ViewOrganizationModal';
import { DeleteConfirmationModal } from './modals/DeleteConfirmationModal';
import {
  useOrganizationLevels,
  useOrganizationUsers,
} from '../services/organizationService';

interface OrganizationProps {
  searchTerm: string;
  organizations: OrganizationType[];
  users: User[];
  userRole: string;
  userGroupId: string;
  onDelete: (id: string) => void;
  onEdit: (organization: OrganizationType) => void;
}

const ActionButton = forwardRef<HTMLButtonElement, any>((props, ref) => (
  <IconButton {...props} ref={ref} />
));
ActionButton.displayName = 'ActionButton';

const Organization: React.FC<OrganizationProps> = ({
  searchTerm,
  organizations = [],
}) => {
  const [selectedOrg, setSelectedOrg] = useState<OrganizationType | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { isLoading } = useOrganizationLevels();

  const handleView = (org: OrganizationType) => {
    setSelectedOrg(org);
    setIsViewOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;
    try {
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const UserCountCell: React.FC<{ orgId: number }> = ({ orgId }) => {
    const { data: users = [], isLoading } = useOrganizationUsers(orgId);

    if (isLoading)
      return (
        <Typography variant="small" color="white" className="font-normal">
          ...
        </Typography>
      );

    const activeUsers = users.filter((user) =>
      user.organization_level.id === orgId
    );

    return (
      <Tooltip
        content={
          activeUsers.length > 0
            ? activeUsers.map((user) => user.public_name).join(', ')
            : 'No hay usuarios'
        }
      >
        <Typography
          variant="small"
          color="white"
          className="font-normal cursor-help"
        >
          {activeUsers.length}
        </Typography>
      </Tooltip>
    );
  };

  const filteredItems = organizations.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.id.toString().includes(searchLower) ||
      String(item.level_type).toLowerCase().includes(searchLower)
    );
  });

  if (organizations.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No hay organizaciones disponibles
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-4">
        Cargando niveles organizacionales...
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Card className="h-full w-full bg-gray-800">
        <CardBody className="overflow-y-auto px-0">
          <table className="w-full min-w-max table-auto text-center">
            <thead>
              <tr>
                {[
                  'ID',
                  'Nombre',
                  'Tipo',
                  'Nivel',
                  'Superior',
                  'Usuarios',
                  'Acciones',
                ].map((head) => (
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
              {filteredItems.map((org) => (
                <tr key={org.id} className="hover:bg-gray-600/50">
                  {[
                    org.id,
                    org.name,
                    org.level_type,
                    org.level_name,
                    org.parent_name || '-',
                  ].map((value, index) => (
                    <td
                      key={index}
                      className="p-4 border-b border-blue-gray-50"
                    >
                      <Typography
                        variant="small"
                        color="white"
                        className="font-normal"
                      >
                        {value}
                      </Typography>
                    </td>
                  ))}
                  <td className="p-4 border-b border-blue-gray-50">
                    <UserCountCell orgId={org.id} />
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <div className="flex justify-center gap-2">
                      <Tooltip content="Ver detalles">
                        <ActionButton
                          variant="text"
                          color="white"
                          onClick={() => handleView(org)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </ActionButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {selectedOrg && (
        <>
          <ViewOrganizationModal
            open={isViewOpen}
            handleOpen={() => setIsViewOpen(false)}
            organization={selectedOrg}
          />
          <DeleteConfirmationModal
            open={isDeleteOpen}
            handleOpen={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
            organizationName={selectedOrg.name}
          />
        </>
      )}
    </div>
  );
};

export default Organization;
export type { OrganizationProps };

// import React, { useState } from 'react';
// import { UserDetailsTable } from './tables/UserDetailsTable';
// import { useGroupUsers, useDeleteUser } from '../services/userService';
// import { GroupUser } from '../types/user';
// import { toast } from 'react-toastify';
// import { Dialog } from '@material-tailwind/react';
// import { UserDetailsDialog } from './dialogs/UserDetailsDialog';

// export const UserManagement = () => {
//   const { data: users = [], isLoading } = useGroupUsers();
//   const deleteUserMutation = useDeleteUser();
//   const [selectedUser, setSelectedUser] = useState<GroupUser | null>(null);
//   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

//   const handleView = (user: GroupUser) => {
//     setSelectedUser(user);
//     setIsViewDialogOpen(true);
//   };

//   const handleEdit = (user: GroupUser) => {
//     // Implementar navegación a la página de edición
//     console.log('Edit user:', user);
//   };

//   const handleDelete = async (user: GroupUser) => {
//     if (window.confirm(`¿Estás seguro de eliminar a ${user.public_name}?`)) {
//       try {
//         await deleteUserMutation.mutateAsync(user.id);
//         toast.success('Usuario eliminado exitosamente');
//       } catch (error) {
//         toast.error('Error al eliminar el usuario');
//       }
//     }
//   };

//   if (isLoading) {
//     return <div>Cargando...</div>;
//   }

//   return (
//     <div className="container mx-auto px-4">
//       <UserDetailsTable
//         users={users}
//         onView={handleView}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//       />

//       <Dialog
//         open={isViewDialogOpen}
//         handler={() => setIsViewDialogOpen(false)}
//         size="xl"
//       >
//         {selectedUser && (
//           <UserDetailsDialog
//             user={selectedUser}
//             onClose={() => setIsViewDialogOpen(false)}
//           />
//         )}
//       </Dialog>
//     </div>
//   );
// }; 
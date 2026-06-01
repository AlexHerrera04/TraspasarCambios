// import { useInvalidateUserCount } from '../../services/organizationService';
// import { createUser } from 'src/app/feature-admin/services/userService'
// import { FormData } from 'src/app/feature-admin/components/FormGoal'

// export const CreateUserForm = () => {
//   const { invalidateCount } = useInvalidateUserCount();
  
//   const handleSubmit = async (data: FormData) => {
//     try {
//       await createUser(data);
//       // Invalidar el caché del conteo para la organización del nuevo usuario
//       invalidateCount(data.organizationId);
//     } catch (error) {
//       console.error('Error creating user:', error);
//     }
//   };

//   // ... resto del código ...
// }; 
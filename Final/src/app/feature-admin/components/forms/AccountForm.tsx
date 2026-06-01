import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { Progress, Typography, Spinner } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import * as Yup from 'yup';
import { CreateAccountFormData } from 'src/app/feature-admin/types/user';
import { checkUsernameAvailability } from '../../services/userService';
import { toast } from 'react-toastify';
import { useUser } from '../../../core/feature-user/provider/userProvider';
import { 
  useCreateAccount, 
} from '../../services/userService';


interface AccountFormProps {
  onSubmit: (data: CreateAccountFormData) => Promise<void>;
  onCancel: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onSubmit, onCancel }) => {
  const { userInfo } = useUser();
  const [loading, setLoading] = useState(false);

  const formik = useFormik<CreateAccountFormData>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      organization: userInfo?.group_id || '',
      isLayerZero: false
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('El nombre de usuario es requerido')
        .min(3, 'Mínimo 3 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
      email: Yup.string()
        .email('Email inválido')
        .required('El email es requerido'),
      password: Yup.string()
        .required('La contraseña es requerida')
        .min(8, 'Mínimo 8 caracteres'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
        .required('Confirma la contraseña'),
      first_name: Yup.string().required('El nombre es requerido'),
      last_name: Yup.string().required('El apellido es requerido')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const isAvailable = await checkUsernameAvailability(values.username);
        
        if (!isAvailable) {
          formik.setFieldError('username', 'El nombre de usuario no está disponible');
          return;
        }
        
        const submitData = {
          ...values,
          organization: values.organization || userInfo?.group_id || ''
        };
        
        console.log('Submitting data:', submitData);
        await onSubmit(submitData);
      } catch (error) {
        console.error('Error en el formulario:', error);
        toast.error('Error al procesar el formulario');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (userInfo?.group_id && !formik.values.organization) {
      formik.setFieldValue('organization', userInfo.group_id);
    }
  }, [userInfo]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <div className="w-full max-w-md p-6">
        <form onSubmit={formik.handleSubmit}>
          <div className="relative mb-6">
            <Typography
              variant="h3"
              className="absolute top-[-60px] left-1/3 transform -translate-x-1/2 text-5xl font-bold text-white"
            >
              1/2
            </Typography>
            <Progress
              value={50}
              className="bg-gray-600 w-3/4 [&_div]:bg-primary-600"
            />
          </div>
          <h2 className="text-4xl">Nuevo Usuario</h2>
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Email
            </label>
            <input
              type="email"
              {...formik.getFieldProps('email')}
              autoComplete="email"
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-2 text-sm text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                {...formik.getFieldProps('first_name')}
                autoComplete="given-name"
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
              />
              {formik.touched.first_name && formik.errors.first_name && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.first_name}</div>
              )}
            </div>

            <div className="w-1/2">
              <label className="block mb-2 text-sm text-gray-300">
                Apellido
              </label>
              <input
                type="text"
                {...formik.getFieldProps('last_name')}
                autoComplete="family-name"
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.last_name}</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block text-white mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="username"
              {...formik.getFieldProps('username')}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ingrese nombre de usuario"
            />
            {formik.touched.username && formik.errors.username && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.username}</div>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Contraseña
            </label>
            <input
              type="password"
              {...formik.getFieldProps('password')}
              autoComplete="new-password"
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              {...formik.getFieldProps('confirmPassword')}
              autoComplete="new-password"
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</div>
            )}
          </div>

          <div className="flex justify-between">
            <Button onClick={onCancel} type="button" outline>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} primary>
              {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Siguiente
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
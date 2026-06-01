import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TextInput from 'src/app/ui/TextInput';
import Button from 'src/app/ui/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EvaluatorLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Email inválido')
        .required('El email es requerido'),
      password: Yup.string().required('La contraseña es requerida'),
    }),
    onSubmit: (values) => {
      setLoading(true);
      try {
        const evaluators = JSON.parse(
          localStorage.getItem('evaluators') || '[]'
        );
        const evaluator = evaluators.find(
          (e: any) => e.email === values.email && e.password === values.password
        );

        if (evaluator) {
          localStorage.setItem('currentEvaluator', JSON.stringify(evaluator));
          toast.success('Inicio de sesión exitoso');
          navigate('/evaluator/evaluation');
        } else {
          toast.error('Credenciales inválidas');
        }
      } catch (error) {
        console.error('Error en login:', error);
        toast.error('Error al iniciar sesión');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <svg
            width="113"
            height="24"
            viewBox="0 0 113 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2V22M19.0711 4.92893L4.92893 19.0711M22 12H2M19.0711 19.0711L4.92893 4.92893"
              stroke="#BDA8FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M38.9112 18.128C38.0579 18.128 37.2632 17.984 36.5272 17.696C35.8019 17.408 35.1725 17.008 34.6392 16.496C34.1059 15.9733 33.6899 15.3653 33.3912 14.672C33.0925 13.9787 32.9432 13.2213 32.9432 12.4C32.9432 11.5787 33.0925 10.8213 33.3912 10.128C33.6899 9.43467 34.1059 8.832 34.6392 8.32C35.1725 7.79733 35.8019 7.392 36.5272 7.104C37.2525 6.816 38.0472 6.672 38.9112 6.672C39.7645 6.672 40.5485 6.816 41.2632 7.104C41.9885 7.38133 42.6179 7.78133 43.1512 8.304C43.6952 8.816 44.1112 9.41867 44.3992 10.112C44.6979 10.8053 44.8472 11.568 44.8472 12.4C44.8472 13.232 44.6979 13.9947 44.3992 14.688C44.1112 15.3813 43.6952 15.9893 43.1512 16.512C42.6179 17.024 41.9885 17.424 41.2632 17.712C40.5485 17.9893 39.7645 18.128 38.9112 18.128ZM38.9112 16.704C39.5299 16.704 40.1005 16.5973 40.6232 16.384C41.1565 16.1707 41.6152 15.872 41.9992 15.488C42.3939 15.0933 42.6979 14.6347 42.9112 14.112C43.1352 13.5893 43.2472 13.0187 43.2472 12.4C43.2472 11.7813 43.1352 11.2107 42.9112 10.688C42.6979 10.1653 42.3939 9.712 41.9992 9.328C41.6152 8.93333 41.1565 8.62933 40.6232 8.416C40.1005 8.20267 39.5299 8.096 38.9112 8.096C38.2819 8.096 37.7005 8.20267 37.1672 8.416C36.6445 8.62933 36.1859 8.93333 35.7912 9.328C35.3965 9.712 35.0872 10.1653 34.8632 10.688C34.6499 11.2107 34.5432 11.7813 34.5432 12.4C34.5432 13.0187 34.6499 13.5893 34.8632 14.112C35.0872 14.6347 35.3965 15.0933 35.7912 15.488C36.1859 15.872 36.6445 16.1707 37.1672 16.384C37.7005 16.5973 38.2819 16.704 38.9112 16.704ZM48.0927 18V6.8H52.4607C53.442 6.8 54.2794 6.95467 54.9727 7.264C55.666 7.57333 56.1994 8.02133 56.5727 8.608C56.946 9.19467 57.1327 9.89333 57.1327 10.704C57.1327 11.5147 56.946 12.2133 56.5727 12.8C56.1994 13.376 55.666 13.824 54.9727 14.144C54.2794 14.4533 53.442 14.608 52.4607 14.608H48.9727L49.6927 13.856V18H48.0927ZM49.6927 14.016L48.9727 13.216H52.4127C53.4367 13.216 54.21 12.9973 54.7327 12.56C55.266 12.1227 55.5327 11.504 55.5327 10.704C55.5327 9.904 55.266 9.28533 54.7327 8.848C54.21 8.41067 53.4367 8.192 52.4127 8.192H48.9727L49.6927 7.392V14.016ZM61.7393 11.632H67.4993V12.992H61.7393V11.632ZM61.8833 16.608H68.4113V18H60.2833V6.8H68.1873V8.192H61.8833V16.608ZM71.8021 18V6.8H73.1141L80.5221 16H79.8341V6.8H81.4341V18H80.1221L72.7141 8.8H73.4021V18H71.8021ZM92.7763 15.44L92.6323 12.448L97.9923 6.8H100.872L96.0403 12L94.6003 13.536L92.7763 15.44ZM90.4563 18V6.8H93.0323V18H90.4563ZM98.1203 18L94.1363 13.12L95.8323 11.28L101.144 18H98.1203ZM101.148 18L105.964 11.36V13.248L101.356 6.8H104.3L107.484 11.296L106.252 11.312L109.388 6.8H112.204L107.628 13.136V11.28L112.476 18H109.484L106.188 13.248H107.372L104.124 18H101.148Z"
              fill="white"
            />
          </svg>
        </div>
        <h2 className="text-2xl text-white mb-6 text-center">
          Acceso Evaluador
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <TextInput
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
            />
          </div>
          <div>
            <TextInput
              label="Contraseña"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
            />
          </div>
          <Button type="submit" primary disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EvaluatorLogin;

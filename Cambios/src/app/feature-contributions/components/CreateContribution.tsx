import React, { useState, useEffect } from 'react';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Progress,
  Typography,
  Spinner,
  Dialog,
} from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SelectLine } from 'src/app/ui/FormFields';
import { useNavigate, useParams } from 'react-router-dom';
import { persistenceService } from '../services/persistenceService';
import { ContributionForm } from '../types';
import { contributionsService } from '../services/contributionsService';
import { unmapObjectAttributes } from '../utils/attributeMapper';

const CreateContribution: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const { id } = useParams();

  const formik = useFormik<ContributionForm>({
    initialValues: {
      title: '',
      description: '',
      category: '',
      start_date: '',
      end_date: '',
      project_leader: {
        name: '',
        area: '',
        email: '',
      },
      team_members: '',
      impacted_areas: '',
      status: 'in_progress',
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('El título es requerido')
        .max(100, 'Máximo 100 caracteres'),
      description: Yup.string()
        .required('La descripción es requerida')
        .max(250, 'Máximo 250 caracteres'),
      category: Yup.string(),
      start_date: Yup.string(),
      end_date: Yup.string(),
      project_leader: Yup.object({
        name: Yup.string(),
        area: Yup.string(),
        email: Yup.string().email('Email inválido'),
      }),
      team_members: Yup.string().max(200, 'Máximo 200 caracteres'),
      impacted_areas: Yup.string().max(200, 'Máximo 200 caracteres'),
      status: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (!values.title || !values.description || !values.start_date || !values.end_date) {
          toast.error(
            'Por favor complete los campos obligatorios: Título, Descripción, Fecha de Inicio y Fecha estimada de finalizacion',
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'dark',
              style: {
                backgroundColor: '#ef4444',
                color: 'white',
              },
            }
          );
          return;
        }
        persistenceService.saveStepData('general', values);
        navigate('/contributor/create/impact');
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  function mapContributionToForm(data: any) {
    return {
      title: data.title || '',
      description: data.description || '',
      category: data.category || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      project_leader: {
        name: data.project_leader?.name || '',
        area: data.project_leader?.area || '',
        email: data.project_leader?.email || '',
      },
      team_members: data.team_members || '',
      impacted_areas: data.impacted_areas || '',
      status: data.status || 'in_progress',
    };
  }

  useEffect(() => {
    // Try to load from contributionDraft in localStorage first
    const contributionDraftStr = localStorage.getItem('contributionDraft');
    try {
      const contributionDraft = JSON.parse(contributionDraftStr);
      // Map the nested data to form format
      formik.setValues( (contributionDraft.general || {}));
    } catch (error) {
      console.error('Error parsing contributionDraft from localStorage:', error);
    }
  }, [])

  // Autoguardado cuando cambian los valores
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formik.dirty) {
        persistenceService.saveStepData('general', formik.values);
      }
    }, 1000); // Guardar después de 1 segundo de inactividad

    return () => clearTimeout(timeoutId);
  }, [formik.values]);

  const categoryOptions = [
    { value: 'innovation', label: 'Innovación' },
    { value: 'training', label: 'Formación' },
    { value: 'process_improvement', label: 'Mejora de Procesos' },
    { value: 'other', label: 'Otro' },
  ];

  const statusOptions = [
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'paused', label: 'En Pausa' },
  ];

  const [nothing, setNothing] = useState(false);

  function handleNothing(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === '') {
      setNothing(true);
    }

    setNothing(false);
  }

  const content = (
    <div className="min-h-screen bg-[#111827] p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between">
          <div className="w-full lg:w-[49%] px-7 mb-11">
            
            <div className="relative mb-6">
              <Typography
                variant="h3"
                className="text-6xl mr-4 text-center mb-6 font-bold text-white"
              >
                1/4
              </Typography>
              <Progress
                value={25}
                className="bg-gray-600 w-full [&_div]:bg-primary-600"
              />
            </div>
            <h2 className="text-4xl text-white">Información General</h2>
            <p className="text-gray-400 mb-4 mt-4">
              Completa los datos clave para identificar y contextualizar el proyecto donde has contribuido:
            </p>
            <p className="text-gray-400 mb-2">
              <b>Nombre del proyecto:</b>
              <p className="text-gray-400">Dale un título claro y representativo (máx. 100 caracteres).</p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Descripción breve:</b>
              <p className="text-gray-400">
                Resume objetivo y alcance en pocas palabras (máx. 250 caracteres).
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Rol o función:</b>
              <p className="text-gray-400">
                Describe tu rol principal para este proyecto.
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Categoría:</b>
              <p className="text-gray-400">
                Selecciona el tipo de proyecto (Innovación, Formación, etc.).
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Fechas:</b>
              <p className="text-gray-400">
                Indica inicio y final estimado (formato dd/mm/aaaa).
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Líder del proyecto:</b>
              <p className="text-gray-400">
                Nombre, área y correo de la persona responsable.
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Estado actual:</b>
              <p className="text-gray-400">
                Elige entre: En progreso, Completado o En pausa.
              </p>
            </p>
          </div>

          <div className="w-full lg:w-[78%] text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:px-16">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Nombre del proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...formik.getFieldProps('title')}
                  className={`w-full p-2 rounded-lg bg-gray-700 text-white border ${
                    formik.touched.title && formik.errors.title
                      ? 'border-red-500'
                      : 'border-gray-600'
                  }`}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.title}
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Descripción breve <span className="text-red-500">*</span>
                </label>
                <textarea
                  maxLength={250}
                  {...formik.getFieldProps('description')}
                  className={`w-full p-2 rounded-lg bg-gray-700 text-white border ${
                    formik.touched.description && formik.errors.description
                      ? 'border-red-500'
                      : 'border-gray-600'
                  }`}
                  rows={3}
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.description}
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Describe tu rol o función en el proyecto
                </label>
                <input
                  maxLength={200}
                  {...formik.getFieldProps('team_members')}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                />
              </div>

              <div className="w-[49%]">
                <label className="block mb-2 text-sm text-gray-300">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <SelectLine
                  label=""
                  name="category"
                  value={formik.values.category}
                  options={categoryOptions}
                  handleChange={(e) =>
                    formik.setFieldValue('category', e.value)
                  }
                  handleBlur={() => formik.setFieldTouched('category')}
                  setFieldValue={formik.setFieldValue}
                  errors={{}}
                  touched={{}}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 place-content-center">
                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Fecha de inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...formik.getFieldProps('start_date')}
                    className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Fecha estimada de finalización <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...formik.getFieldProps('end_date')}
                    className=" p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  />
                </div>
              </div>

              <fieldset className="space-y-4 border-2 padding-top: 0; border-white rounded-lg p-6">
                <legend className="px-2 block mb-2 text-sm text-gray-300">
                  Líder de Proyecto
                </legend>
                <div className="flex gap-5 !-mt-4">
                  <div className="w-[50%]">
                    <label className="block mb-2 text-sm w-[50%] text-gray-300">
                      Nombre
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps('project_leader.name')}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    />
                  </div>
                  <div className="w-[50%]">
                    <label className="block mb-2 text-sm text-gray-300">
                      Apellido
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps('project_leader.last_name')}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    />
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-[50%]">
                    <label className="block mb-2 text-sm text-gray-300">
                      Área
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps('project_leader.area')}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    />
                  </div>
                  <div className="w-[50%]">
                    <label className="block mb-2 text-sm text-gray-300">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      {...formik.getFieldProps('project_leader.email')}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    />
                  </div>
                </div>
              </fieldset>

              {/* <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Áreas/departamentos impactados
                </label>
                <textarea
                  maxLength={200}
                  {...formik.getFieldProps('impacted_areas')}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  rows={3}
                />
              </div> */}

              <div className="w-[49%]">
                <label className="block mb-2 t-ext-sm text-gray-300">
                  Status actual
                </label>
                <SelectLine
                  label=""
                  name="status"
                  value={formik.values.status}
                  options={statusOptions}
                  handleChange={(e) => formik.setFieldValue('status', e.value)}
                  handleBlur={() => formik.setFieldTouched('status')}
                  setFieldValue={formik.setFieldValue}
                  errors={{}}
                  touched={{}}
                />
              </div>

              <div className="flex justify-between pt-5">
                <Button
                  onClick={() => setShowConfirmCancel(true)}
                  type="button"
                  outline
                >
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
      </div>

      {/* Modal de confirmación de cancelar */}
      <Dialog
        open={showConfirmCancel}
        handler={() => setShowConfirmCancel(false)}
        className="bg-gray-800 max-w-md"
      >
        <div className="p-6">
          <h3 className="text-xl text-white mb-4">¿Confirmar cancelar?</h3>
          <p className="text-gray-300 mb-6">
            Los cambios no guardados se perderán. ¿Desea continuar?
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => setShowConfirmCancel(false)}
              type="button"
              outline
            >
              No, continuar editando
            </Button>
            <Button
              onClick={() => {
                persistenceService.clearContributionData();
                navigate('/contributor');
              }}
              type="button"
              primary
            >
              Sí, cancelar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );

  return withNavbar({ children: content });
};

export default CreateContribution;
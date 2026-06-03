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

const APP_LANGUAGE_KEY = 'appLanguage';

const CreateContribution: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const { id } = useParams();

  const language =
    localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

  const copy =
    language === 'en'
      ? {
          validation: {
            titleRequired: 'Title is required',
            titleMax: 'Maximum 100 characters',
            descriptionRequired: 'Description is required',
            descriptionMax: 'Maximum 250 characters',
            invalidEmail: 'Invalid email',
            teamMembersMax: 'Maximum 200 characters',
            impactedAreasMax: 'Maximum 200 characters',
            requiredFields:
              'Please complete the required fields: Title, Description, Start Date and Estimated End Date',
          },
          categoryOptions: [
            { value: 'innovation', label: 'Innovation' },
            { value: 'training', label: 'Training' },
            { value: 'process_improvement', label: 'Process Improvement' },
            { value: 'other', label: 'Other' },
          ],
          statusOptions: [
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'paused', label: 'Paused' },
          ],
          generalInfo: 'General Information',
          helperIntro:
            'Complete the key details to identify and contextualize the project where you contributed:',
          projectNameTitle: 'Project name:',
          projectNameText:
            'Give it a clear and representative title (max. 100 characters).',
          shortDescriptionTitle: 'Brief description:',
          shortDescriptionText:
            'Summarize the objective and scope in a few words (max. 250 characters).',
          roleTitle: 'Role or function:',
          roleText: 'Describe your main role in this project.',
          categoryTitle: 'Category:',
          categoryText:
            'Select the type of project (Innovation, Training, etc.).',
          datesTitle: 'Dates:',
          datesText:
            'Indicate the start date and estimated end date (dd/mm/yyyy format).',
          leaderTitle: 'Project leader:',
          leaderText:
            'Name, area, and email of the responsible person.',
          currentStatusTitle: 'Current status:',
          currentStatusText:
            'Choose one of: In progress, Completed, or Paused.',
          fields: {
            projectName: 'Project name',
            briefDescription: 'Brief description',
            describeRole: 'Describe your role or function in the project',
            category: 'Category',
            startDate: 'Start date',
            estimatedEndDate: 'Estimated end date',
            projectLeader: 'Project Leader',
            name: 'First name',
            lastName: 'Last name',
            area: 'Area',
            email: 'Email',
            currentStatus: 'Current status',
          },
          buttons: {
            cancel: 'Cancel',
            next: 'Next',
            confirmCancel: 'Confirm cancel?',
            unsavedChanges:
              'Unsaved changes will be lost. Do you want to continue?',
            keepEditing: 'No, continue editing',
            yesCancel: 'Yes, cancel',
          },
        }
      : {
          validation: {
            titleRequired: 'El título es requerido',
            titleMax: 'Máximo 100 caracteres',
            descriptionRequired: 'La descripción es requerida',
            descriptionMax: 'Máximo 250 caracteres',
            invalidEmail: 'Email inválido',
            teamMembersMax: 'Máximo 200 caracteres',
            impactedAreasMax: 'Máximo 200 caracteres',
            requiredFields:
              'Por favor complete los campos obligatorios: Título, Descripción, Fecha de Inicio y Fecha estimada de finalizacion',
          },
          categoryOptions: [
            { value: 'innovation', label: 'Innovación' },
            { value: 'training', label: 'Formación' },
            { value: 'process_improvement', label: 'Mejora de Procesos' },
            { value: 'other', label: 'Otro' },
          ],
          statusOptions: [
            { value: 'in_progress', label: 'En Progreso' },
            { value: 'completed', label: 'Completado' },
            { value: 'paused', label: 'En Pausa' },
          ],
          generalInfo: 'Información General',
          helperIntro:
            'Completa los datos clave para identificar y contextualizar el proyecto donde has contribuido:',
          projectNameTitle: 'Nombre del proyecto:',
          projectNameText:
            'Dale un título claro y representativo (máx. 100 caracteres).',
          shortDescriptionTitle: 'Descripción breve:',
          shortDescriptionText:
            'Resume objetivo y alcance en pocas palabras (máx. 250 caracteres).',
          roleTitle: 'Rol o función:',
          roleText: 'Describe tu rol principal para este proyecto.',
          categoryTitle: 'Categoría:',
          categoryText:
            'Selecciona el tipo de proyecto (Innovación, Formación, etc.).',
          datesTitle: 'Fechas:',
          datesText:
            'Indica inicio y final estimado (formato dd/mm/aaaa).',
          leaderTitle: 'Líder del proyecto:',
          leaderText:
            'Nombre, área y correo de la persona responsable.',
          currentStatusTitle: 'Estado actual:',
          currentStatusText:
            'Elige entre: En progreso, Completado o En pausa.',
          fields: {
            projectName: 'Nombre del proyecto',
            briefDescription: 'Descripción breve',
            describeRole: 'Describe tu rol o función en el proyecto',
            category: 'Categoría',
            startDate: 'Fecha de inicio',
            estimatedEndDate: 'Fecha estimada de finalización',
            projectLeader: 'Líder de Proyecto',
            name: 'Nombre',
            lastName: 'Apellido',
            area: 'Área',
            email: 'Correo Electrónico',
            currentStatus: 'Status actual',
          },
          buttons: {
            cancel: 'Cancelar',
            next: 'Siguiente',
            confirmCancel: '¿Confirmar cancelar?',
            unsavedChanges:
              'Los cambios no guardados se perderán. ¿Desea continuar?',
            keepEditing: 'No, continuar editando',
            yesCancel: 'Sí, cancelar',
          },
        };

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
        .required(copy.validation.titleRequired)
        .max(100, copy.validation.titleMax),
      description: Yup.string()
        .required(copy.validation.descriptionRequired)
        .max(250, copy.validation.descriptionMax),
      category: Yup.string(),
      start_date: Yup.string(),
      end_date: Yup.string(),
      project_leader: Yup.object({
        name: Yup.string(),
        area: Yup.string(),
        email: Yup.string().email(copy.validation.invalidEmail),
      }),
      team_members: Yup.string().max(200, copy.validation.teamMembersMax),
      impacted_areas: Yup.string().max(200, copy.validation.impactedAreasMax),
      status: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (!values.title || !values.description || !values.start_date || !values.end_date) {
          toast.error(copy.validation.requiredFields, {
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
          });
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
    const contributionDraftStr = localStorage.getItem('contributionDraft');
    try {
      const contributionDraft = JSON.parse(contributionDraftStr);
      formik.setValues((contributionDraft.general || {}));
    } catch (error) {
      console.error('Error parsing contributionDraft from localStorage:', error);
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formik.dirty) {
        persistenceService.saveStepData('general', formik.values);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formik.values]);

  const categoryOptions = copy.categoryOptions;
  const statusOptions = copy.statusOptions;

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
            <h2 className="text-4xl text-white">{copy.generalInfo}</h2>
            <p className="text-gray-400 mb-4 mt-4">
              {copy.helperIntro}
            </p>
            <p className="text-gray-400 mb-2">
              <b>{copy.projectNameTitle}</b>
              <p className="text-gray-400">{copy.projectNameText}</p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>{copy.shortDescriptionTitle}</b>
              <p className="text-gray-400">
                {copy.shortDescriptionText}
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>{copy.roleTitle}</b>
              <p className="text-gray-400">
                {copy.roleText}
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>{copy.categoryTitle}</b>
              <p className="text-gray-400">
                {copy.categoryText}
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>{copy.datesTitle}</b>
              <p className="text-gray-400">
                {copy.datesText}
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>{copy.leaderTitle}</b>
              <p className="text-gray-400">
                {copy.leaderText}
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>{copy.currentStatusTitle}</b>
              <p className="text-gray-400">
                {copy.currentStatusText}
              </p>
            </p>
          </div>

          <div className="w-full lg:w-[78%] text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:px-16">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  {copy.fields.projectName} <span className="text-red-500">*</span>
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
                  {copy.fields.briefDescription} <span className="text-red-500">*</span>
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
                  {copy.fields.describeRole}
                </label>
                <input
                  maxLength={200}
                  {...formik.getFieldProps('team_members')}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                />
              </div>

              <div className="w-[49%]">
                <label className="block mb-2 text-sm text-gray-300">
                  {copy.fields.category} <span className="text-red-500">*</span>
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
                    {copy.fields.startDate} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...formik.getFieldProps('start_date')}
                    className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    {copy.fields.estimatedEndDate} <span className="text-red-500">*</span>
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
                  {copy.fields.projectLeader}
                </legend>
                <div className="flex gap-5 !-mt-4">
                  <div className="w-[50%]">
                    <label className="block mb-2 text-sm w-[50%] text-gray-300">
                      {copy.fields.name}
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps('project_leader.name')}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    />
                  </div>
                  <div className="w-[50%]">
                    <label className="block mb-2 text-sm text-gray-300">
                      {copy.fields.lastName}
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
                      {copy.fields.area}
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps('project_leader.area')}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    />
                  </div>
                  <div className="w-[50%]">
                    <label className="block mb-2 text-sm text-gray-300">
                      {copy.fields.email}
                    </label>
                    <input
                      type="email"
                      {...formik.getFieldProps('project_leader.email')}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="w-[49%]">
                <label className="block mb-2 t-ext-sm text-gray-300">
                  {copy.fields.currentStatus}
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
                  {copy.buttons.cancel}
                </Button>
            
                <Button type="submit" disabled={loading} primary>
                  {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                  {copy.buttons.next}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Dialog
        open={showConfirmCancel}
        handler={() => setShowConfirmCancel(false)}
        className="bg-gray-800 max-w-md"
      >
        <div className="p-6">
          <h3 className="text-xl text-white mb-4">{copy.buttons.confirmCancel}</h3>
          <p className="text-gray-300 mb-6">
            {copy.buttons.unsavedChanges}
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => setShowConfirmCancel(false)}
              type="button"
              outline
            >
              {copy.buttons.keepEditing}
            </Button>
            <Button
              onClick={() => {
                persistenceService.clearContributionData();
                navigate('/contributor');
              }}
              type="button"
              primary
            >
              {copy.buttons.yesCancel}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );

  return withNavbar({ children: content });
};

export default CreateContribution;
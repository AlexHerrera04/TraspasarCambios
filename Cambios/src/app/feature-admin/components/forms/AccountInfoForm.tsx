import React, { useState, useEffect, useMemo } from 'react';
import { useFormik, FormikErrors, FormikTouched } from 'formik';
import {
  Progress,
  Typography,
  Spinner,
  Checkbox,
} from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import { SelectLine } from '../../../ui/FormFields';
import * as Yup from 'yup';
import {
  CreateAccountInfoRequest,
  UserOptions,
  SelectOption,
  LayerZeroOption,
  AccountInfoInitialData,
} from '../../types/user';
import {
  useAvailableOrganizations,
  checkPublicNameAvailability,
  useLayerZeroOptions,
} from '../../services/userService';
import { toast } from 'react-toastify';
import { useUser } from '../../../core/feature-user/provider/userProvider';

interface AccountInfoFormProps {
  userId: number;
  onSubmit: (data: CreateAccountInfoRequest) => Promise<void>;
  onPrevious: () => void;
  onCancel: () => void;
  organizationId?: string;
  initialData?: AccountInfoInitialData;
}

interface SelectLineProps {
  label: string;
  name: string;
  value: any;
  options: SelectOption[];
  isMulti?: boolean;
  handleChange: (value: any) => void;
  handleBlur: () => void;
  setFieldValue: (field: string, value: any) => void;
  errors?: FormikErrors<CreateAccountInfoRequest>;
  touched?: FormikTouched<CreateAccountInfoRequest>;
}

export const AccountInfoForm: React.FC<AccountInfoFormProps> = ({
  userId,
  onSubmit,
  onPrevious,
  onCancel,
  organizationId,
  initialData,
}) => {
  const { userInfo } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedOrgType, setSelectedOrgType] = useState('');
  const { data: organizations = [] } = useAvailableOrganizations();
  const { data: layerZeroOptions, isLoading, error } = useLayerZeroOptions();

  const mapToSelectOptions = (
    options: LayerZeroOption[] | undefined
  ): SelectOption[] => {
    if (!options) return [];
    return options.map((option) => ({
      value: option.id.toString(),
      label: option.name,
    }));
  };

  const selectOptions = useMemo(() => {
    if (!layerZeroOptions) return {};

    return {
      industries: layerZeroOptions.industries.map((item) => ({
        value: item.id ? item.id.toString() : "",
        label: item.name,
      })),
      functions: layerZeroOptions.functions.map((item) => ({
        value: item.id ? item.id.toString() : "",
        label: item.name,
      })),
      levels: layerZeroOptions.levels.map((item) => ({
        value: item.id ? item.id.toString() : "",
        label: item.name,
      })),
      capacities: layerZeroOptions.capacities.map((item) => ({
        value: item.id ? item.id.toString() : "",
        label: item.name,
      })),
      profiles: layerZeroOptions.profiles.map((item) => ({
        value: item.id ? item.id.toString() : "",
        label: item.name,
      })),
    };
  }, [layerZeroOptions]);

  const formik = useFormik<CreateAccountInfoRequest>({
    initialValues: {
      account: userId,
      type: 'expert',
      public_name: initialData?.public_name || '',
      organization_level_id: organizationId ? Number(organizationId) : 1,
      function: [],
      level: [],
      capacity: [],
      profile: [],
      business_driver: [],
      idiom: [],
      industry: [],
      tool: [],
      theme: [],
      user_allowed_themes: [],
      is_manager: false
    },
    validationSchema: Yup.object({
      public_name: Yup.string().required('El nombre público es requerido'),
      organization_level_id: Yup.number().min(1, 'Seleccione una organización'),
      function: Yup.array().min(1, 'Seleccione al menos una función'),
      level: Yup.array().min(1, 'Seleccione al menos un nivel'),
      capacity: Yup.array().min(1, 'Seleccione al menos una capacidad'),
      profile: Yup.array().min(1, 'Seleccione al menos un perfil'),
      industry: Yup.array().min(1, 'Seleccione al menos una industria'),
      user_allowed_themes: Yup.array().min(1, 'Seleccione al menos un tema'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        console.log('Submitting form with values:', values);

        const dataToSubmit = {
          account: Number(userId),
          type: 'expert' as const,
          public_name: values.public_name,
          organization_level_id: Number(values.organization_level_id),
          function: values.function.map(String),
          level: values.level.map(String),
          capacity: values.capacity.map(String),
          profile: values.profile.map(String),
          industry: values.industry.map(String),
          business_driver: values.business_driver?.map(String) || [],
          idiom: values.idiom?.map(String) || [],
          tool: values.tool?.map(String) || [],
          theme: values.theme || ['default_theme'],
          user_allowed_themes: values.theme?.length > 0 ? values.theme : ['default_theme'],
          is_manager: values.is_manager|| false
        };

        console.log('Data to submit:', dataToSubmit);

        if (!dataToSubmit.organization_level_id) {
          toast.error('Falta el ID de la organización');
          return;
        }

        await onSubmit(dataToSubmit);
        toast.success('Usuario creado exitosamente');
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('Error al procesar el formulario');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (
      initialData?.first_name &&
      initialData?.last_name &&
      !formik.values.public_name
    ) {
      formik.setFieldValue(
        'public_name',
        `${initialData.first_name} ${initialData.last_name}`.trim()
      );
    }
  }, [initialData, formik.values.public_name]);

  const handleOrganizationChange = (orgId: string) => {
    const org = organizations.find((org) => org.id === Number(orgId));
    setSelectedOrgType(String(org?.level_type) || '');
    formik.setFieldValue('organization_level_id', Number(orgId));
  };

  const handleSelectChange = (field: string, value: any) => {
    if (Array.isArray(value)) {
      const values = value.map((item) => Number(item.value));
      formik.setFieldValue(field, values);
    } else {
      formik.setFieldValue(field, value ? Number(value.value) : '');
    }
  };

  const handleBlur = (field: string) => {
    formik.setFieldTouched(field, true);
  };

  if (isLoading) {
    return <div>Cargando opciones...</div>;
  }

  if (error) {
    return (
      <div>Error al cargar las opciones. Por favor, intente de nuevo.</div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <div className="w-full lg:w-1/2 px-8">
        <div className="relative mb-6">
          <Typography
            variant="h3"
            className="absolute top-[-60px] left-1/3 transform -translate-x-1/2 text-5xl font-bold text-white"
          >
            2/2
          </Typography>
          <Progress
            value={100}
            className="bg-gray-600 w-3/4 [&_div]:bg-primary-600"
          />
        </div>
        <h2 className="text-4xl">Información Adicional</h2>
      </div>

      <div className="w-full lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:px-16">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Organización
            </label>
            <SelectLine
              label=""
              name="organization_level_id"
              value={formik.values.organization_level_id.toString()}
              options={organizations.map((org) => ({
                value: org.id.toString(),
                label: org.name,
              }))}
              handleChange={(e) =>
                handleSelectChange('organization_level_id', e)
              }
              handleBlur={() => handleBlur('organization_level_id')}
              setFieldValue={formik.setFieldValue}
              errors={formik.errors}
              touched={formik.touched}
            />
          </div>

          {formik.values.organization_level_id > 0 && (
            <div className="flex items-center gap-4">
              <label className="block text-sm text-gray-300">
                {`¿Es manager de ${selectedOrgType.toLowerCase()}?`}
              </label>
              <Checkbox
                checked={Boolean(formik.values.is_manager)}
                onChange={(e) =>
                  formik.setFieldValue('is_manager', e.target.checked)
                }
                className="!text-white"
              />
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Nombre Público
            </label>
            <input
              type="text"
              {...formik.getFieldProps('public_name')}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
            {formik.touched.public_name && formik.errors.public_name && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.public_name}
              </div>
            )}
          </div>

          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              {...formik.getFieldProps('is_manager')}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">
              Es manager de {userInfo?.organization || 'la organización'}
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Industria/s
            </label>
            <SelectLine
              label=""
              name="industry"
              value={formik.values.industry}
              options={selectOptions.industries || []}
              isMulti
              handleChange={(e) => handleSelectChange('industry', e)}
              handleBlur={() => handleBlur('industry')}
              setFieldValue={formik.setFieldValue}
              errors={formik.errors}
              touched={formik.touched}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Funciones
            </label>
            <SelectLine
              label=""
              name="function"
              value={formik.values.function}
              options={selectOptions.functions || []}
              isMulti
              handleChange={(e) => handleSelectChange('function', e)}
              handleBlur={() => handleBlur('function')}
              setFieldValue={formik.setFieldValue}
              errors={formik.errors}
              touched={formik.touched}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">Nivel</label>
            <SelectLine
              label=""
              name="level"
              value={formik.values.level}
              options={selectOptions.levels || []}
              isMulti
              handleChange={(e) => handleSelectChange('level', e)}
              handleBlur={() => handleBlur('level')}
              setFieldValue={formik.setFieldValue}
              errors={formik.errors}
              touched={formik.touched}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Capacidades
            </label>
            <SelectLine
              label=""
              name="capacity"
              value={formik.values.capacity}
              options={selectOptions.capacities || []}
              isMulti
              handleChange={(e) => handleSelectChange('capacity', e)}
              handleBlur={() => handleBlur('capacity')}
              setFieldValue={formik.setFieldValue}
              errors={formik.errors}
              touched={formik.touched}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">Perfil</label>
            <SelectLine
              label=""
              name="profile"
              value={formik.values.profile}
              options={selectOptions.profiles || []}
              isMulti
              handleChange={(e) => handleSelectChange('profile', e)}
              handleBlur={() => handleBlur('profile')}
              setFieldValue={formik.setFieldValue}
              errors={formik.errors}
              touched={formik.touched}
            />
          </div>

          <div className="flex justify-between">
            <Button onClick={onPrevious} type="button" outline>
              Anterior
            </Button>
            <Button onClick={onCancel} type="button" outline>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-600"
              onClick={(e: any) => {
                e.preventDefault();
                console.log('Form values:', formik.values);
                formik.handleSubmit();
              }}
            >
              {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Crear Usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

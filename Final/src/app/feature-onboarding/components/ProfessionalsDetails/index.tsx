import { Progress, Spinner } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import BackButton from '../BackButton';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useQueries } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import SelectInput from 'src/app/ui/SelectInput';

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-white/10 bg-gray-800 p-6">
    <div className="mb-5 border-b border-white/10 pb-3">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      ) : null}
    </div>
    {children}
  </div>
);

const ProfessionalsDetails = ({ userInfo, nextStep, previousStep }: any) => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['industriesQuery'],
        queryFn: async () => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/layerzero/industries/`
          );
          return data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        },
      },
      {
        queryKey: ['functionsList'],
        queryFn: async () => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/layerzero/functions/`
          );
          return data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        },
      },
      {
        queryKey: ['capacitiesList'],
        queryFn: async () => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/layerzero/capacities/`
          );
          return data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        },
      },
      {
        queryKey: ['levelsList'],
        queryFn: async () => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/layerzero/levels/`
          );
          return data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        },
      },
      {
        queryKey: ['profilesQuery'],
        queryFn: async () => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/layerzero/profiles/`
          );
          return data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        },
      },
      {
        queryKey: ['businessDriversList'],
        queryFn: async () => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/layerone/businessdrivers/`
          );
          return data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        },
      },
      {
        queryKey: ['toolsList'],
        queryFn: async () => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/layerone/tools/`
          );
          return data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        },
      },
    ],
  });

  const [
    industriesQuery,
    functionsQuery,
    capacitiesQuery,
    levelsQuery,
    profilesQuery,
    businessDriversQuery,
    toolsQuery,
  ] = results;

  const industries = industriesQuery.data || [];
  const functions = functionsQuery.data || [];
  const capacities = capacitiesQuery.data || [];
  const levels = levelsQuery.data || [];
  const profiles = profilesQuery.data || [];
  const businessDrivers = businessDriversQuery.data || [];
  const tools = toolsQuery.data || [];

  const isLoading = results.some((query) => query.isFetching);

  const handleSubmit = (values: any) => {
    nextStep(
      {
        ...userInfo,
        industry: values.industry.map((item: any) => item.label),
        function: values.function.map((item: any) => item.label),
        capacity: values.capacity.map((item: any) => item.label),
        level: values.level.map((item: any) => item.label),
        profile: values.profile.map((item: any) => item.label),
        business_driver: (values.business_driver || []).map(
          (item: any) => item.label
        ),
        tools: (values.tools || []).map((item: any) => item.label),
      },
      true
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <BackButton onClick={previousStep} className="mb-6" />
        <Progress
          className="mb-4 h-3 bg-gray-700 [&_div]:bg-primary-600"
          value={100}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">
              2/2
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Datos Técnicos
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-gray-400">
            
          </p>
        </div>
      </div>

      <Formik
        enableReinitialize
        initialValues={{
          industry: industries.filter((o: any) =>
            userInfo.industry?.includes(o.label)
          ),
          function: functions.filter((o: any) =>
            userInfo.function?.includes(o.label)
          ),
          capacity: capacities.filter((o: any) =>
            userInfo.capacity?.includes(o.label)
          ),
          level: levels.filter((o: any) => userInfo.level?.includes(o.label)),
          profile: profiles.filter((o: any) =>
            userInfo.profile?.includes(o.label)
          ),
          business_driver: businessDrivers.filter((o: any) =>
            userInfo.business_driver?.includes(o.label)
          ),
          tools: tools.filter((o: any) => userInfo.tools?.includes(o.label)),
        }}
        validationSchema={Yup.object({
          industry: Yup.array().min(1, 'Required').required('Required'),
          function: Yup.array().min(1, 'Required').required('Required'),
          capacity: Yup.array().min(1, 'Required').required('Required'),
          level: Yup.array().min(1, 'Required').required('Required'),
          profile: Yup.array().min(1, 'Required').required('Required'),
          business_driver: Yup.array(),
          tools: Yup.array(),
        })}
        onSubmit={handleSubmit}
      >
        {({ values, handleBlur, setFieldValue }) => (
          <Form className="space-y-6">
            <SectionCard
              title="Contexto profesional"
              description="Completa la información técnica y profesional de tu perfil."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm text-gray-300" htmlFor="industry">
                    Industria
                  </label>
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <SelectInput
                      isMulti
                      options={industries}
                      id="industry"
                      name="industry"
                      value={values.industry}
                      onBlur={handleBlur}
                      placeholder="Seleccionar una opción"
                      onChange={(selectedOption: any) => {
                        setFieldValue('industry', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300" htmlFor="function">
                    Área o función
                  </label>
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <SelectInput
                      isMulti
                      options={functions}
                      id="function"
                      name="function"
                      value={values.function}
                      onBlur={handleBlur}
                      placeholder="Seleccionar una opción"
                      onChange={(selectedOption: any) => {
                        setFieldValue('function', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300" htmlFor="level">
                    Nivel
                  </label>
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <SelectInput
                      isMulti
                      options={levels}
                      id="level"
                      name="level"
                      value={values.level}
                      onBlur={handleBlur}
                      placeholder="Seleccionar una opción"
                      onChange={(selectedOption: any) => {
                        setFieldValue('level', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300" htmlFor="profile">
                    Perfil (Business / Tech / BusinessTech)
                  </label>
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <SelectInput
                      isMulti
                      options={profiles}
                      id="profile"
                      name="profile"
                      value={values.profile}
                      onBlur={handleBlur}
                      placeholder="Seleccionar una opción"
                      onChange={(selectedOption: any) => {
                        setFieldValue('profile', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm text-gray-300" htmlFor="capacity">
                    Capacidades
                  </label>
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <SelectInput
                      isMulti
                      options={capacities}
                      id="capacity"
                      name="capacity"
                      value={values.capacity}
                      onBlur={handleBlur}
                      placeholder="Seleccionar una opción"
                      onChange={(selectedOption: any) => {
                        setFieldValue('capacity', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div>
                  <label
                    className="block mb-2 text-sm text-gray-300"
                    htmlFor="business_driver"
                  >
                    Palancas de negocio
                  </label>
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <SelectInput
                      isMulti
                      options={businessDrivers}
                      id="business_driver"
                      name="business_driver"
                      value={values.business_driver}
                      onBlur={handleBlur}
                      placeholder="Seleccionar una opción"
                      onChange={(selectedOption: any) => {
                        setFieldValue('business_driver', selectedOption);
                      }}
                    />
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300" htmlFor="tools">
                    Herramientas
                  </label>
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <SelectInput
                      isMulti
                      options={tools}
                      id="tools"
                      name="tools"
                      value={values.tools}
                      onBlur={handleBlur}
                      placeholder="Seleccionar una opción"
                      onChange={(selectedOption: any) => {
                        setFieldValue('tools', selectedOption);
                      }}
                    />
                  )}
                </div>
              </div>
            </SectionCard>

            <div className="flex justify-between gap-4">
              <Button type="button" outline onClick={previousStep}>
                Anterior
              </Button>
              <Button type="submit" primary>
                Finalizar
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfessionalsDetails;
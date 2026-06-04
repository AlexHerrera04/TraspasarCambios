import React from 'react';
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

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 text-sm leading-6 text-gray-400">{children}</p>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-white">{children}</span>
);

const ProfessionalsDetails = ({
  language,
  userInfo,
  nextStep,
  previousStep,
}: {
  language: 'es' | 'en';
  userInfo: any;
  nextStep: Function;
  previousStep: () => void;
}) => {
  const copy =
    language === 'en'
      ? {
          step: '2/2',
          title: 'Technical information',
          sectionTitle: 'Professional context',
          placeholder: 'Select an option',
          previous: 'Previous',
          finish: 'Finish',
          required: 'Required',
        }
      : {
          step: '2/2',
          title: 'Información técnica',
          sectionTitle: 'Contexto profesional',
          placeholder: 'Seleccionar una opción',
          previous: 'Anterior',
          finish: 'Finalizar',
          required: 'Obligatorio',
        };

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
              {copy.step}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              {copy.title}
            </h1>
          </div>
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
          industry: Yup.array().min(1, copy.required).required(copy.required),
          function: Yup.array().min(1, copy.required).required(copy.required),
          capacity: Yup.array().min(1, copy.required).required(copy.required),
          level: Yup.array().min(1, copy.required).required(copy.required),
          profile: Yup.array().min(1, copy.required).required(copy.required),
          business_driver: Yup.array(),
          tools: Yup.array(),
        })}
        onSubmit={handleSubmit}
      >
        {({ values, handleBlur, setFieldValue }) => (
          <Form className="space-y-6">
            <SectionCard title={copy.sectionTitle}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldHint>
                    {language === 'en' ? (
                      <>
                        The <Highlight>Industry</Highlight> indicates the sector
                        where you have the most experience.
                      </>
                    ) : (
                      <>
                        La <Highlight>Industria</Highlight> indica el sector en el
                        que tienes más experiencia.
                      </>
                    )}
                  </FieldHint>
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
                      placeholder={copy.placeholder}
                      onChange={(selectedOption: any) => {
                        setFieldValue('industry', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div>
                  <FieldHint>
                    {language === 'en' ? (
                      <>
                        Your <Highlight>Function</Highlight> describes the area
                        where you contribute the most value.
                      </>
                    ) : (
                      <>
                        La <Highlight>Función</Highlight> describe el área donde
                        aportas más valor.
                      </>
                    )}
                  </FieldHint>
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
                      placeholder={copy.placeholder}
                      onChange={(selectedOption: any) => {
                        setFieldValue('function', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div>
                  <FieldHint>
                    {language === 'en' ? (
                      <>
                        The <Highlight>Level</Highlight> reflects your seniority
                        and depth of experience.
                      </>
                    ) : (
                      <>
                        El <Highlight>Nivel</Highlight> refleja tu seniority y tu
                        profundidad de experiencia.
                      </>
                    )}
                  </FieldHint>
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
                      placeholder={copy.placeholder}
                      onChange={(selectedOption: any) => {
                        setFieldValue('level', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div>
                  <FieldHint>
                    {language === 'en' ? (
                      <>
                        The <Highlight>Profile</Highlight> defines whether your
                        focus is.
                      </>
                    ) : (
                      <>
                        El <Highlight>Perfil</Highlight> define si tu enfoque es
                        Business, Tech o BusinessTech.
                      </>
                    )}
                  </FieldHint>
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
                      placeholder={copy.placeholder}
                      onChange={(selectedOption: any) => {
                        setFieldValue('profile', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <FieldHint>
                    {language === 'en' ? (
                      <>
                        Your <Highlight>Capabilities</Highlight> summarize the
                        skills and strengths you master.
                      </>
                    ) : (
                      <>
                        Las <Highlight>Capacidades</Highlight> resumen las
                        habilidades y fortalezas que dominas.
                      </>
                    )}
                  </FieldHint>
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
                      placeholder={copy.placeholder}
                      onChange={(selectedOption: any) => {
                        setFieldValue('capacity', selectedOption);
                      }}
                      required
                    />
                  )}
                </div>

                <div>
                  <FieldHint>
                    {language === 'en' ? (
                      <>
                        The <Highlight>Business drivers</Highlight> show the
                        business outcomes you can enhance.
                      </>
                    ) : (
                      <>
                        Las <Highlight>Palancas</Highlight> muestran los
                        resultados de negocio que puedes ayudar a mejorar.
                      </>
                    )}
                  </FieldHint>
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
                      placeholder={copy.placeholder}
                      onChange={(selectedOption: any) => {
                        setFieldValue('business_driver', selectedOption);
                      }}
                    />
                  )}
                </div>

                <div>
                  <FieldHint>
                    {language === 'en' ? (
                      <>
                        The <Highlight>Tools</Highlight> indicate the platforms
                        and solutions you work with regularly.
                      </>
                    ) : (
                      <>
                        Las <Highlight>Herramientas</Highlight> indican las
                        plataformas y soluciones con las que trabajas.
                      </>
                    )}
                  </FieldHint>
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
                      placeholder={copy.placeholder}
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
                {copy.previous}
              </Button>
              <Button type="submit" primary>
                {copy.finish}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfessionalsDetails;
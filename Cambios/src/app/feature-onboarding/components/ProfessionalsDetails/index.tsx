import { Progress, Select, Option, Spinner } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import BackButton from '../BackButton';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import SelectInput from 'src/app/ui/SelectInput';

const ProfessionalsDetails = ({ userInfo, nextStep, previousStep }: any) => {
  const { data, isFetching } = useQuery({
    queryKey: ['industriesQuery'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/layerzero/industries/`
      );
      return data.map((industry: any) => ({
        value: industry.id,
        label: industry.name,
      }));
    },
  });

  const { data: functions, isFetching: fetchingFunctions } = useQuery({
    queryKey: ['functionsList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/layerzero/functions/`
      );
      return data.map((f: any) => ({
        value: f.id,
        label: f.name,
      }));
    },
  });

  const { data: capacities, isFetching: fetchingCapacities } = useQuery({
    queryKey: ['capacitiesList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/layerzero/capacities/`
      );
      return data.map((c: any) => ({
        value: c.id,
        label: c.name,
      }));
    },
  });

  const handleSubmit = (values: any) => {
    userInfo.industry = values.industry.map((i: any) => i.label);
    userInfo.function = values.function.map((i: any) => i.label);
    userInfo.capacity = values.capacity.map((i: any) => i.label);
    nextStep(userInfo, false);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <div className="w-full lg:w-1/2 px-8">
        <BackButton onClick={previousStep} className="mb-6" />
        <Progress
          className="bg-gray-600 w-3/4 [&_div]:bg-primary-600 mb-4"
          value={66}
        />
        <div>
          <h3 className=" text-2xl mb-4">2/3</h3>
          <h2 className=" text-4xl">Detalles profesionales</h2>
        </div>
      </div>
      <div className="w-full lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:px-16">
        <Formik
          initialValues={{
            industry: data?.filter((o: any) =>
              userInfo.industry?.includes(o.label)
            ),
            function: functions?.filter((o: any) =>
              userInfo.function?.includes(o.label)
            ),
            capacity: capacities?.filter((o: any) =>
              userInfo.capacity?.includes(o.label)
            ),
          }}
          validationSchema={Yup.object({
            industry: Yup.array().required('Required'),
            function: Yup.array().required('Required'),
            capacity: Yup.array().required('Required'),
          })}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form>
              <div className="mb-6">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="industry"
                >
                  Industria en la que trabajas o quieres explorar
                </label>
                {isFetching ? (
                  <Spinner className="h-4 w-4"></Spinner>
                ) : (
                  <SelectInput
                    isMulti
                    options={data}
                    id="industry"
                    name="industry"
                    value={values.industry}
                    onBlur={handleBlur}
                    placeholder="Seleccionar una opción"
                    // Handle the selection of option(s) from the dropdown
                    onChange={(selectedOption: any) => {
                      setFieldValue('industry', selectedOption);
                    }}
                    required
                  ></SelectInput>
                )}
              </div>
              <div className="mb-6">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="function"
                >
                  Área (o Función de Negocio)
                </label>
                {fetchingCapacities ? (
                  <Spinner className="h-4 w-4"></Spinner>
                ) : (
                  <SelectInput
                    isMulti
                    options={functions}
                    id="function"
                    name="function"
                    value={values.function}
                    onBlur={handleBlur}
                    placeholder="Seleccionar una opción"
                    // Handle the selection of option(s) from the dropdown
                    onChange={(selectedOption: any) => {
                      setFieldValue('function', selectedOption);
                    }}
                    required
                  ></SelectInput>
                )}
              </div>
              <div className="mb-6">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="capacity"
                >
                  Capacidades
                </label>
                {fetchingCapacities ? (
                  <Spinner className="h-4 w-4"></Spinner>
                ) : (
                  <SelectInput
                    isMulti
                    options={capacities}
                    id="capacity"
                    name="capacity"
                    value={values.capacity}
                    onBlur={handleBlur}
                    placeholder="Seleccionar una opción"
                    // Handle the selection of option(s) from the dropdown
                    onChange={(selectedOption: any) => {
                      setFieldValue('capacity', selectedOption);
                    }}
                    required
                  ></SelectInput>
                )}
              </div>
              <Button type="submit" primary>
                Siguiente
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProfessionalsDetails;

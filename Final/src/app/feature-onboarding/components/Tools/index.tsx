import { Progress, Select, Option, Spinner } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import BackButton from '../BackButton';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import SelectInput from 'src/app/ui/SelectInput';

const Tools = ({ userInfo, nextStep, previousStep }: any) => {
  const { data: businessDrivers, isFetching: isFetchingBDrivers } = useQuery({
    queryKey: ['businessDriversList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/layerone/businessdrivers/`
      );

      return data.map((c: any) => ({
        value: c.id,
        label: c.name,
      }));
    },
  });

  const { data: tools, isFetching: isFetchingTools } = useQuery({
    queryKey: ['capacitiesList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/layerone/tools/`
      );

      return data.map((c: any) => ({
        value: c.id,
        label: c.name,
      }));
    },
  });

  const handleSubmit = (values: any) => {
    userInfo.business_driver = values.business_driver 
      ? values.business_driver.map((i: any) => i.label) 
      : [];
    
    userInfo.tools = values.tools 
      ? values.tools.map((i: any) => i.label) 
      : [];
    
    nextStep(userInfo, true);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <div className="w-full lg:w-1/2 px-8">
        <BackButton onClick={previousStep} className="mb-6" />
        <Progress
          className="bg-gray-600 w-3/4 [&_div]:bg-primary-600 mb-4"
          value={99}
        />
        <div>
          <h3 className=" text-2xl mb-4">3/3</h3>
          <h2 className=" text-4xl">Seleccionar Palancas de Negocio & Herramientas</h2>
        </div>
      </div>
      <div className="w-full lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:px-16">
        <Formik
          initialValues={{
            business_driver: businessDrivers?.filter((o: any) =>
              userInfo.business_driver?.includes(o.label)
            ),
            tools: tools?.filter((o: any) => userInfo.tool?.includes(o.label)),
          }}
          validationSchema={Yup.object({
            business_driver: Yup.array(),
            tools: Yup.array(),
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
                  Palancas de Negocio que deseas focalizarte
                </label>
                {isFetchingBDrivers ? (
                  <Spinner className="h-4 w-4"></Spinner>
                ) : (
                  <SelectInput
                    isMulti
                    options={businessDrivers}
                    id="business_driver"
                    name="business_driver"
                    value={values.business_driver}
                    onBlur={handleBlur}
                    placeholder="Seleccionar una opción"
                    // Handle the selection of option(s) from the dropdown
                    onChange={(selectedOption: any) => {
                      setFieldValue('business_driver', selectedOption);
                    }}
                  ></SelectInput>
                )}
              </div>
              <div className="mb-6">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="function"
                >
                  Herramientas de tu interés
                </label>
                {isFetchingTools ? (
                  <Spinner className="h-4 w-4"></Spinner>
                ) : (
                  <SelectInput
                    isMulti
                    options={tools}
                    id="tools"
                    name="tools"
                    value={values.tools}
                    onBlur={handleBlur}
                    placeholder="Seleccionar una opción"
                    // Handle the selection of option(s) from the dropdown
                    onChange={(selectedOption: any) => {
                      setFieldValue('tools', selectedOption);
                    }}
                  ></SelectInput>
                )}
              </div>

              <Button type="submit" primary>
                Finalizar
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Tools;

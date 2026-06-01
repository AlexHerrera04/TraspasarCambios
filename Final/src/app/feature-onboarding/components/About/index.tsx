import { Progress, Spinner } from '@material-tailwind/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ErrorMessage, Form, Formik } from 'formik';
import { toast } from 'react-toastify';
import api from 'src/app/core/api/apiProvider';
import Button from 'src/app/ui/Button';
import SelectInput from 'src/app/ui/SelectInput';
import TextInput from 'src/app/ui/TextInput';
import * as Yup from 'yup';
import { UserInfo } from 'src/app/core/models/UserInfo.model';
import { useState } from 'react';
import { set } from 'lodash';

const About = ({
  userInfo,
  onClick,
}: {
  userInfo: UserInfo;
  onClick: Function;
}) => {
  const { data: profiles, isFetching: fetchingProfiles } = useQuery({
    queryKey: ['profilesQuery'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/layerzero/profiles/`
      );
      return data.map((p: any) => ({
        value: p.id,
        label: p.name,
      }));
    },
  });

  const { data: roles, isFetching: fetchingRoles } = useQuery({
    queryKey: ['rolessQuery'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/layerzero/levels/`
      );
      return data.map((p: any) => ({
        value: p.id,
        label: p.name,
      }));
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    userInfo.public_name = values.username;
    userInfo.level = values.level.map((i: any) => i.label);
    userInfo.profile = values.profile.map((i: any) => i.label);

    //verify public name is unique
    setIsLoading(true);
    const { data } = await api.get(
      `${
        import.meta.env.VITE_API_URL
      }/accounts/check-public-name-availability?public_name=${values.username}`
    );
    setIsLoading(false);

    if (!data.is_available) {
      toast.error('El nombre de usuario ya está en uso.', {
        position: toast.POSITION.BOTTOM_LEFT,
      });
      return;
    }

    onClick(userInfo);
    /*mutation.mutate(values, {
      onSuccess: (data) => {
        console.log(data);
        onClick();
      },
      onError: (error) => {
        toast.error('Something went wrong, please try again.', {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      },
    });*/
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <div className="w-full lg:w-1/2 px-8">
        <Progress
          className="bg-gray-600 w-3/4 [&_div]:bg-primary-600 mb-4"
          value={33}
        />
        <div>
          <h3 className=" text-2xl mb-4">1/3</h3>
          <h2 className=" text-4xl">Sobre ti</h2>
        </div>
      </div>
      <div className="w-full lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:px-16">
        <Formik
          initialValues={{
            username: userInfo.public_name || '',
            level: roles?.filter((o: any) => userInfo.level?.includes(o.label)),
            profile: profiles?.filter((o: any) =>
              userInfo.profile?.includes(o.label)
            ),
          }}
          validationSchema={Yup.object({
            username: Yup.string().required('Required'),
            level: Yup.array().required('Required'),
            profile: Yup.array().required('Required'),
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
              <div>
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="username"
                >
                  Elige un nombre de usuario
                </label>
                <div className="relative flex w-full">
                  <TextInput
                    id="username"
                    name="username"
                    size="lg"
                    value={values.username}
                    placeholder="@nickname"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.username}
                    success={!errors.username && touched.username}
                    className={`!rounded-lg  focus:!border-tertiary !bg-gray-700 !text-gray-300 ${
                      !!errors.username
                        ? 'border-red-500 !placeholder-red-500::placeholder'
                        : '!border-tertiary '
                    }`}
                    labelProps={{
                      className: 'before:content-none after:content-none',
                    }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="level"
                >
                  Tu nivel organizacional
                </label>

                {fetchingRoles ? (
                  <Spinner className="h-4 w-4"></Spinner>
                ) : (
                  <SelectInput
                    isMulti
                    id="level"
                    name="level"
                    size="lg"
                    value={values.level}
                    onChange={(evt: any) => {
                      setFieldValue('level', evt);
                    }}
                    onBlur={handleBlur}
                    placeholder="Seleccionar una opción"
                    options={roles}
                  ></SelectInput>
                )}
              </div>

              <div className="mb-6">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="industry"
                >
                  Tu lenguaje de preferencia
                </label>
                {fetchingProfiles ? (
                  <Spinner className="h-4 w-4"></Spinner>
                ) : (
                  <SelectInput
                    isMulti
                    id="profile"
                    name="profile"
                    size="lg"
                    value={values.profile}
                    onChange={(evt: any) => {
                      setFieldValue('profile', evt);
                    }}
                    onBlur={handleBlur}
                    placeholder="Seleccionar una opción"
                    options={profiles}
                  ></SelectInput>
                )}
              </div>

              <Button type="submit" primary disabled={isLoading}>
                {isLoading && <Spinner className="h-4 w-4 mr-3"></Spinner>}{' '}
                Siguiente
              </Button>

              {/* <ErrorMessage name="_action" component="div" /> */}
              <ErrorMessage name="_action">
                {(errorMsg) => {
                  return <div className="text-danger">{errorMsg}</div>;
                }}
              </ErrorMessage>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default About;

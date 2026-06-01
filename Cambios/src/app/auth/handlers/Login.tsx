import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { FunctionComponent, useEffect } from 'react';
import loginImg from '../../../assets/images/login.png';
import wikiLogo from '../../../assets/images/wiki-logo2.svg';
import { Card, Typography } from '@material-tailwind/react';

import TextInput from '../../ui/TextInput';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, useAuth } from '../provider/authProvider';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { isEmpty } from 'lodash';
import api from 'src/app/core/api/apiProvider';
import Button from 'src/app/ui/Button';

interface LoginHandlerProps {}

const LoginForm = () => {
  const { setToken, token } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (values: { email: string; password: string }) => {
      return api.post(`${import.meta.env.VITE_API_URL}/accounts/login`, values);
    },
  });

  const handleLogin = (values: any) => {
    mutation.mutate(values, {
      onSuccess: async (data) => {
        setToken(data.data.token);
      },
      onError: (error) => {
        toast.error('Something went wrong, please try again.', {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      },
    });
  };

  useEffect(() => {
    if (!isEmpty(token)) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        setToken(null);
      } else {
        checkOnboarding(token as string);
      }
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const checkOnboarding = async (token: string) => {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const { data: user } = await api.get(
      `${import.meta.env.VITE_API_URL}/accounts/accountinfo/${decoded.user_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (user.is_onboarded) {
      navigate('/home', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  };

  return (
    <Card
      color="transparent"
      shadow={false}
      className="flex flex-col h-full justify-center"
    >
      <img
        className="self-start -ml-3 mb-6"
        src={wikiLogo}
        alt="nature image"
      />
      <div className="flex flex-col justify-center items-center">
        <div className="self-start"></div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={Yup.object({
            email: Yup.string()
              .email('Invalid email address')
              .required('Required'),
            password: Yup.string()
              .required('Required')
              .min(8, 'Password is too short - should be 8 chars minimum.'),
          })}
          onSubmit={handleLogin}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
              <div className="mb-4 flex flex-col gap-2">
                <Typography color="white" size="md">
                  Email
                </Typography>

                <TextInput
                  name="email"
                  size="lg"
                  placeholder="Email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  error={errors.email && touched.email && errors.email}
                  success={!errors.email && touched.email}
                  className={`!rounded-lg focus:!border-tertiary !bg-gray-700 !text-gray-300 ${
                    !!errors.email
                      ? 'border-red-500 !placeholder-red-500::placeholder'
                      : '!border-tertiary '
                  }`}
                  labelProps={{
                    className: 'before:content-none after:content-none',
                  }}
                />

                <Typography color="white" size="md">
                  Password
                </Typography>
                <TextInput
                  type="password"
                  name="password"
                  placeholder="Password"
                  size="lg"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  error={errors.password && touched.password && errors.password}
                  success={!errors.password && touched.password}
                  className={`!rounded-lg focus:!border-tertiary !bg-gray-700 !text-gray-300 ${
                    !!errors.password
                      ? 'border-red-500 !placeholder-red-500::placeholder'
                      : '!border-tertiary '
                  }`}
                  labelProps={{
                    className: 'before:content-none after:content-none',
                  }}
                />
              </div>
              {/* <div className="flex flex-wrap justify-end">
                <Button variant="text">Forgot password</Button>
              </div> */}
              <Button primary type="submit" disabled={isSubmitting}>
                Entrar
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Card>
  );
};

const LoginHandler: FunctionComponent<LoginHandlerProps> = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 h-screen w-full">
      <div className="bg-surface flex flex-col justify-center items-center">
        <LoginForm />
      </div>

      <div className="hidden sm:block">
        <img className="w-full h-full object-cover" src={loginImg} alt="" />
      </div>
    </div>
  );
};

export default LoginHandler;

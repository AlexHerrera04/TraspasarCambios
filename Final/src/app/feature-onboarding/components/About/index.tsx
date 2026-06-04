import React, { useState } from 'react';
import { Progress, Spinner } from '@material-tailwind/react';
import { Form, Formik } from 'formik';
import { toast } from 'react-toastify';
import api from 'src/app/core/api/apiProvider';
import Button from 'src/app/ui/Button';
import TextInput from 'src/app/ui/TextInput';
import * as Yup from 'yup';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';

const inputClassName =
  '!rounded-lg focus:!border-tertiary !bg-gray-700 !text-gray-300 !border-tertiary';

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

const FileField = ({
  label,
  name,
  setFieldValue,
}: {
  label: string;
  name: string;
  setFieldValue: (field: string, value: any) => void;
}) => (
  <div>
    <label className="mb-2 block text-sm text-gray-300" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      name={name}
      type="file"
      accept="image/*"
      className="block w-full cursor-pointer rounded-lg border border-gray-600 bg-gray-700 px-3 py-3 text-sm text-gray-300"
      onChange={(event: any) => {
        setFieldValue(name, event.currentTarget.files?.[0] || null);
      }}
    />
  </div>
);

const About = ({
  language,
  userInfo,
  onClick,
}: {
  language: 'es' | 'en';
  userInfo: any;
  onClick: Function;
}) => {
  const { userInfo: sessionUserInfo, userAccountInfo } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const copy =
    language === 'en'
      ? {
          step: '1/2',
          title: 'Personal information',
          sectionTitle: 'Identification details',
          email: 'Company email',
          phone: 'Phone number',
          sourceCompany: 'Company of origin',
          organization: 'Associated company',
          portfolio: 'Link to your portfolio',
          firstName: 'First name',
          lastName: 'Last name',
          publicName: 'Public name',
          visualTitle: 'Visual profile',
          visualDescription:
            'Both images are optional, but we recommend uploading at least one so your profile looks more complete.',
          profilePicture: 'Profile picture',
          wikiAvatar: 'Wiki avatar',
          next: 'Next',
          required: 'Required',
          invalidEmail: 'Invalid email',
          invalidUrl: 'Invalid URL',
          publicNameTaken: 'The public name is already in use.',
        }
      : {
          step: '1/2',
          title: 'Información personal',
          sectionTitle: 'Datos de identificación',
          email: 'Mail de empresa',
          phone: 'Teléfono',
          sourceCompany: 'Empresa Proveniente',
          organization: 'Empresa Asociada',
          portfolio: 'Link de tu portfolio',
          firstName: 'Nombre',
          lastName: 'Apellido',
          publicName: 'Nombre público',
          visualTitle: 'Perfil visual',
          visualDescription:
            'Ambas imágenes son opcionales, pero te recomendamos subir al menos una para que tu perfil sea más atractivo.',
          profilePicture: 'Foto de perfil',
          wikiAvatar: 'Avatar wiki',
          next: 'Siguiente',
          required: 'Obligatorio',
          invalidEmail: 'Email inválido',
          invalidUrl: 'URL inválida',
          publicNameTaken: 'El nombre público ya está en uso.',
        };

  const handleSubmit = async (values: any) => {
    const normalizedPublicName = values.public_name.trim();
    const currentPublicName = userAccountInfo?.public_name || '';

    if (normalizedPublicName !== currentPublicName) {
      setIsLoading(true);
      const { data } = await api.get(
        `${
          import.meta.env.VITE_API_URL
        }/accounts/check-public-name-availability?public_name=${normalizedPublicName}`
      );
      setIsLoading(false);

      if (!data.is_available) {
        toast.error(copy.publicNameTaken, {
          position: toast.POSITION.BOTTOM_LEFT,
        });
        return;
      }
    }

    onClick({
      ...userInfo,
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      public_name: normalizedPublicName,
      contact_email: values.contact_email.trim(),
      phone_number: values.phone_number.trim(),
      source_company: values.source_company.trim(),
      organization: values.organization,
      portfolio_link: values.portfolio_link.trim(),
      profile_picture: values.profile_picture || null,
      wiki_avatar: values.wiki_avatar || null,
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <Progress
          className="mb-4 h-3 bg-gray-700 [&_div]:bg-primary-600"
          value={50}
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
          first_name: userInfo.first_name || sessionUserInfo?.first_name || '',
          last_name: userInfo.last_name || sessionUserInfo?.last_name || '',
          public_name: userInfo.public_name || userAccountInfo?.public_name || '',
          contact_email:
            userInfo.contact_email ||
            userAccountInfo?.contact_email ||
            sessionUserInfo?.email ||
            '',
          phone_number: userInfo.phone_number || userAccountInfo?.phone_number || '',
          source_company: userInfo.source_company || '',
          organization: 'Acme',
          portfolio_link:
            userInfo.portfolio_link || userAccountInfo?.portfolio_link || '',
          profile_picture: null,
          wiki_avatar: null,
        }}
        validationSchema={Yup.object({
          first_name: Yup.string().required(copy.required),
          last_name: Yup.string().required(copy.required),
          public_name: Yup.string().required(copy.required),
          contact_email: Yup.string()
            .email(copy.invalidEmail)
            .required(copy.required),
          phone_number: Yup.string().required(copy.required),
          source_company: Yup.string(),
          organization: Yup.string().required(copy.required),
          portfolio_link: Yup.string().url(copy.invalidUrl).nullable(),
        })}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
        }) => (
          <Form className="space-y-6">
            <SectionCard title={copy.sectionTitle}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-sm text-gray-300"
                    htmlFor="first_name"
                  >
                    {copy.firstName}
                  </label>
                  <TextInput
                    id="first_name"
                    name="first_name"
                    size="lg"
                    value={values.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.first_name}
                    success={!errors.first_name && touched.first_name}
                    className={inputClassName}
                    labelProps={{ className: 'before:content-none after:content-none' }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm text-gray-300"
                    htmlFor="last_name"
                  >
                    {copy.lastName}
                  </label>
                  <TextInput
                    id="last_name"
                    name="last_name"
                    size="lg"
                    value={values.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.last_name}
                    success={!errors.last_name && touched.last_name}
                    className={inputClassName}
                    labelProps={{ className: 'before:content-none after:content-none' }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm text-gray-300"
                    htmlFor="public_name"
                  >
                    {copy.publicName}
                  </label>
                  <TextInput
                    id="public_name"
                    name="public_name"
                    size="lg"
                    value={values.public_name}
                    placeholder="@nickname"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.public_name}
                    success={!errors.public_name && touched.public_name}
                    className={inputClassName}
                    labelProps={{ className: 'before:content-none after:content-none' }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm text-gray-300"
                    htmlFor="contact_email"
                  >
                    {copy.email}
                  </label>
                  <TextInput
                    id="contact_email"
                    name="contact_email"
                    size="lg"
                    value={values.contact_email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.contact_email}
                    success={!errors.contact_email && touched.contact_email}
                    className={inputClassName}
                    labelProps={{ className: 'before:content-none after:content-none' }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm text-gray-300"
                    htmlFor="phone_number"
                  >
                    {copy.phone}
                  </label>
                  <TextInput
                    id="phone_number"
                    name="phone_number"
                    size="lg"
                    value={values.phone_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.phone_number}
                    success={!errors.phone_number && touched.phone_number}
                    className={inputClassName}
                    labelProps={{ className: 'before:content-none after:content-none' }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm text-gray-300"
                    htmlFor="source_company"
                  >
                    {copy.sourceCompany}
                  </label>
                  <TextInput
                    id="source_company"
                    name="source_company"
                    size="lg"
                    value={values.source_company}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    labelProps={{ className: 'before:content-none after:content-none' }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm text-gray-300"
                    htmlFor="organization"
                  >
                    {copy.organization}
                  </label>
                  <TextInput
                    id="organization"
                    name="organization"
                    size="lg"
                    disabled
                    value={values.organization}
                    className={inputClassName}
                    labelProps={{ className: 'before:content-none after:content-none' }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm text-gray-300"
                    htmlFor="portfolio_link"
                  >
                    {copy.portfolio}
                  </label>
                  <TextInput
                    id="portfolio_link"
                    name="portfolio_link"
                    size="lg"
                    value={values.portfolio_link}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.portfolio_link}
                    success={!errors.portfolio_link && touched.portfolio_link}
                    className={inputClassName}
                    labelProps={{ className: 'before:content-none after:content-none' }}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={copy.visualTitle}
              description={copy.visualDescription}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FileField
                  label={copy.profilePicture}
                  name="profile_picture"
                  setFieldValue={setFieldValue}
                />
                <FileField
                  label={copy.wikiAvatar}
                  name="wiki_avatar"
                  setFieldValue={setFieldValue}
                />
              </div>
            </SectionCard>

            <div className="flex justify-end">
              <Button type="submit" primary disabled={isLoading}>
                {isLoading ? <Spinner className="mr-3 h-4 w-4" /> : null}
                {copy.next}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default About;
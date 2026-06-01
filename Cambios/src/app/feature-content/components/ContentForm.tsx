import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import TextInput from 'src/app/ui/TextInput';
import Button from 'src/app/ui/Button';
import SelectInput from 'src/app/ui/SelectInput';
import { Spinner } from '@material-tailwind/react';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';

const InputLine = ({
  value,
  isText = false,
  label,
  name,
  handleChange,
  handleBlur,
  errors,
  touched,
  disabled = false,
}: any) => (
  <div>
    <label className="block mb-2 text-md text-gray-300" htmlFor="name">
      {label}
    </label>
    <div className="relative w-full">
      <TextInput
        id={name}
        isText={isText}
        name={name}
        size="lg"
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors[name]}
        success={!errors[name] && touched[name]}
        className={`!rounded-lg  focus:!border-tertiary !bg-gray-700 !text-gray-300 ${
          !!errors.name
            ? 'border-red-500 !placeholder-red-500::placeholder'
            : '!border-tertiary '
        }`}
        labelProps={{
          className: 'before:content-none after:content-none',
        }}
      />
    </div>
  </div>
);

export const SelectLine = ({
  value,
  options,
  isMulti = false,
  label,
  name,
  handleChange,
  handleBlur,
  setFieldValue,
  errors,
  touched,
  required = false,
  isFetching = false
}: any) => (
  <div>
    <label className="block mb-2 text-md text-gray-300" htmlFor="name">
      {label}
    </label>
    {isFetching ? (
      <div className="animate-pulse flex space-x-4 mb-2">
        <div className="w-full h-12 bg-gray-700 rounded-xl flex justify-center items-center">
          <Spinner></Spinner>
        </div>
      </div>
    ) : (
      <div className="relative flex w-full">
        <SelectInput
          required={required}
          isMulti={isMulti}
          id={name}
          name={name}
          size="lg"
          value={value}
          onChange={(evt: any) => {
            setFieldValue(name, evt);
          }}
          onBlur={handleBlur}
          placeholder="Seleccionar..."
          options={options}
          error={errors[name]}
        ></SelectInput>
      </div>
    )}
  </div>
);

const ContentForm = ({
  capacities,
  levels,
  industries,
  functions,
  profiles,
  businessDrivers,
  idioms,
  contentTypes,
  handleSubmit,
  initialValues,
  isEdit,
  isFetching,
}: any) => {
  if (isEdit) {
    if (
      capacities &&
      capacities.length > 0 &&
      typeof initialValues.capacity[0] === 'string'
    ) {
      initialValues.capacity = capacities.filter((c: any) =>
        initialValues.capacity.includes(c.label)
      );
    }

    if (
      levels &&
      levels.length > 0 &&
      typeof initialValues.level[0] === 'string'
    ) {
      initialValues.level = levels.filter((c: any) =>
        initialValues.level.includes(c.label)
      );
    }

    if (
      industries &&
      industries.length > 0 &&
      typeof initialValues.industry[0] === 'string'
    ) {
      initialValues.industry = industries.filter((c: any) =>
        initialValues.industry.includes(c.label)
      );
    }

    if (
      functions &&
      functions.length > 0 &&
      typeof initialValues.function[0] === 'string'
    ) {
      initialValues.function = functions.filter((c: any) =>
        initialValues.function.includes(c.label)
      );
    }

    if (
      profiles &&
      profiles.length > 0 &&
      typeof initialValues.profile[0] === 'string'
    ) {
      initialValues.profile = profiles.filter((c: any) =>
        initialValues.profile.includes(c.label)
      );
    }

    if (
      businessDrivers &&
      businessDrivers.length > 0 &&
      typeof initialValues.business_driver[0] === 'string'
    ) {
      initialValues.business_driver = businessDrivers.filter((c: any) =>
        initialValues.business_driver.includes(c.label)
      );
    }

    if (
      idioms &&
      idioms.length > 0 &&
      typeof initialValues.idiom[0] === 'string'
    ) {
      initialValues.idiom = idioms.filter((c: any) =>
        initialValues.idiom.includes(c.label)
      )[0];
    }

    if (
      contentTypes &&
      contentTypes.length > 0 &&
      typeof initialValues.type === 'string'
    ) {
      initialValues.type = contentTypes.filter(
        (c: any) => initialValues.type === c.label
      )[0];
    }
  } else {
    initialValues = {
      industry: [],
      industry_id: [],
      name: '',
      description: '',
      short_description: '',
      status: false,
      type: null,
      is_organic: true,
      user: 0,
      function: [],
      level: [],
      capacity: [],
      profile: [],
      business_driver: [],
      idiom: [],
      price: '0',
      rating: '0',
      number_of_reviews: 0,
      public_image: null,
    };
  }

  const user = useUser();

  const handleClick = (values: any) => {
    const content = new FormData();

    content.append('name', values.name);
    content.append('description', values.description);
    content.append('short_description', values.short_description);
    content.append('status', values.status);
    content.append('is_organic', values.is_organic);
    content.append('price', values.price);
    content.append('rating', values.rating);
    content.append('number_of_reviews', values.number_of_reviews);

    content.append(
      'function',
      values.function.map((f: any) => f.value)
    );
    content.append(
      'level',
      values.level.map((f: any) => f.value)
    );
    content.append(
      'capacity',
      values.capacity.map((f: any) => f.value)
    );
    content.append(
      'profile',
      values.profile.map((f: any) => f.value)
    );
    content.append(
      'business_driver',
      values.business_driver.map((f: any) => f.value)
    );
    content.append('idiom', values.idiom.value);
    content.append('type', values.type.value);

    content.append(
      'industry',
      values.industry.map((f: any) => f.value)
    );
    content.append(
      'industry_id',
      values.industry.map((f: any) => f.value)
    );

    content.append('user', user.userID ? user.userID.toString() : '');
    content.append('public_image', values.public_image);

    handleSubmit(content);
  };

  const validateForm = (values: any) => {
    const errors: any = {};

    if (!values.name || values.name === '') {
      errors.name = 'Name is required';
    }

    if (!values.description || values.description === '') {
      errors.description = 'Description is required';
    }

    if (!values.short_description || values.short_description === '') {
      errors.short_description = 'Short description is required';
    }

    if (values.industry?.length === 0) {
      errors.industry = 'Industry is required';
    }

    if (values.name && values.name.length > 120) {
      errors.name = 'Name is too long';
    }

    if (values.short_description && values.short_description.length > 70) {
      errors.short_description = 'Short description is too long';
    }

    if (values.description && values.description.length > 500) {
      errors.description = 'Description is too long';
    }

    if (values.public_image && values.public_image.size > 5000000) {
      errors.public_image = 'Image is too big';
    }

    if (!values.public_image && !isEdit) {
      errors.public_image = 'Image is required';
    }

    if (values.function?.length === 0) {
      errors.function = 'Function is required';
    }

    if (values.level?.length === 0) {
      errors.level = 'Level is required';
    }

    if (values.capacity?.length === 0) {
      errors.capacity = 'Capacity is required';
    }

    if (values.profile?.length === 0) {
      errors.profile = 'Profile is required';
    }

    if (!values.type) {
      errors.type = 'Type is required';
    }

    if (values.business_driver?.length === 0) {
      errors.business_driver = 'Business driver is required';
    }

    if (!values.idiom || !values.idiom.value) {
      errors.idiom = 'Idiom is required';
    }

    return errors;
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        onSubmit={handleClick}
        validate={validateForm}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
          isValid,
          setFieldValue,
        }) => (
          <Form className="pb-10">
            {isFetching && isEdit && (
              <div className="flex justify-center">
                <Spinner className="h-12 w-12"></Spinner>
              </div>
            )}
            {(!isEdit || (!isFetching && isEdit)) && (
              <>
                <InputLine
                  label="Título (un buen título puede atraer a más usuarios)"
                  name="name"
                  value={values.name}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                  disabled={isFetching && isEdit}
                />
                <InputLine
                  label="Descripción (cuenta a los usuarios de que se trata tu contenido)"
                  name="description"
                  isText
                  value={values.description}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                  disabled={isFetching && isEdit}
                />
                <InputLine
                  label="Descripción corta (resumen ejecutivo, máximo 70 caracteres)"
                  name="short_description"
                  isText
                  value={values.short_description}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                  disabled={isFetching && isEdit}
                />
                <div className="mb-4">
                  <label
                    className="block mb-2 text-md text-gray-300"
                    htmlFor="name"
                  >
                    Imagen de portada
                  </label>
                  <div className="relative w-full">
                    <input
                      disabled={isFetching && isEdit}
                      name="public_image"
                      onChange={(event: any) => {
                        setFieldValue(
                          'public_image',
                          event.currentTarget.files[0]
                        );
                      }}
                      className="block w-full text-lg text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                      id="public_image"
                      type="file"
                      accept="image/*"
                    />
                  </div>
                </div>
                {errors.public_image && (
                  <div className="text-red-500 text-sm mb-4">
                    {errors.public_image.toString()}
                  </div>
                )}
              </>
            )}

            <SelectLine
              label="Tipo de contenido"
              name="type"
              value={values.type}
              options={contentTypes}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />

            <SelectLine
              label="Industria a la que aplica este contenido (Puede seleccionar más de una)"
              name="industry"
              isMulti
              value={values.industry}
              options={industries}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />
            <h2 className="text-lg font-bold text-gray-300 border-b-2 border-b-white/25 my-3">
              Clasifica la audiencia de este contenido (en todos los campos,
              puedes elegir más de una opción presionando)
            </h2>

            <SelectLine
              label="Función o área de empresa"
              name="function"
              isMulti
              value={values.function}
              options={functions}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />

            <SelectLine
              label="Nivel de la organización (mejor calificado, más probabilidad de ser visualizado)"
              name="level"
              isMulti
              value={values.level}
              options={levels}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />
            <SelectLine
              label="Capacidad (si tu contenido involucra alguna capacidad tecnológica o herramienta)"
              name="capacity"
              isMulti
              value={values.capacity}
              options={capacities}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />
            <SelectLine
              isMulti
              label="Perfil (que tipo de lenguaje contiene este contenido)"
              name="profile"
              value={values.profile}
              options={profiles}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />
            <SelectLine
              isMulti
              label="Palanca de Negocio (este contenido, apuntar a mejorar alguna/s dimensión/es del negocio)"
              name="business_driver"
              value={values.business_driver}
              options={businessDrivers}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />
            <SelectLine
              label="Idioma del contenido"
              name="idiom"
              value={values.idiom}
              options={idioms}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />

            <div className="flex justify-end">
              <Button primary type="submit" disabled={!isValid}>
                {isEdit ? 'Actualizar contenido' : 'Siguiente'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ContentForm;

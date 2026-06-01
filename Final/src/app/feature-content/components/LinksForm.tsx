import React from 'react';
import { Formik, FieldArray, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import TextInput from 'src/app/ui/TextInput';
import Button from 'src/app/ui/Button';
import { TrashIcon } from '@heroicons/react/24/outline';
import { IconButton, Spinner, Tooltip } from '@material-tailwind/react';
import api from 'src/app/core/api/apiProvider';
interface Asset {
  file: string;
  type: string;
  file_name?: string;
  location_url?: string;
  id?: string;
}

const LinksForm = ({ onSaveLinks, assets, uploading, handleDelete }: any) => {
  const initialValues = {
    links: [],
  };

  const validationSchema = Yup.object().shape({
    links: Yup.array().of(
      Yup.object().shape({
        url: Yup.string()
          .url('La url es inválida. Recuerda agregar "https://"')
          .required('La url es obligatoria'),
        name: Yup.string().required('El título es obligatorio'),
      })
    ),
  });

  const handleSubmit = (values: any) => {
    onSaveLinks(values.links);
    // Handle form submission here
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors }) => (
          <form>
            <FieldArray name="links">
              {({ push, remove }) => (
                <div className=" border-b-2 border-b-white/25 pb-5">
                  <div className="flex justify-between">
                    <h2 className="text-xl mb-3">Enlaces</h2>
                    <Button
                      type="button"
                      primary
                      onClick={() => push({ url: '', name: '' })}
                    >
                      Agregar nuevo enlace
                    </Button>
                  </div>
                  {values.links.map((link, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="mb-3">
                        <label htmlFor={`links.${index}.name`}>Enlace: </label>

                        <Field
                          type="text"
                          id={`links.${index}.url`}
                          name={`links.${index}.url`}
                          placeholder="https://www.ejemplo.com"
                          className={` !inline-block !w-[200px] !rounded-lg p-2 focus:!border-tertiary !bg-gray-700 !text-gray-300 ${
                            !!errors
                              ? 'border-red-500 !placeholder-red-500::placeholder'
                              : '!border-tertiary '
                          }`}
                        />

                        <ErrorMessage
                          name={`links.${index}.url`}
                          component="div"
                          className="text-red-500 text-sm mb-2"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`links.${index}.name`}
                          className=" inline-block mr-2"
                        >
                          Título:{' '}
                        </label>
                        <Field
                          type="text"
                          mb="10px"
                          id={`links.${index}.name`}
                          name={`links.${index}.name`}
                          placeholder="Titulo del enlace"
                          className={`!rounded-lg p-2 focus:!border-tertiary !bg-gray-700 !text-gray-300 ${
                            !!errors
                              ? 'border-red-500 !placeholder-red-500::placeholder'
                              : '!border-tertiary '
                          }`}
                        />

                        <ErrorMessage
                          name={`links.${index}.name`}
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          outline
                          variant="secondary"
                          type="button"
                          onClick={() => remove(index)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FieldArray>
            <div className="flex justify-end mt-3">
              <Button
                primary
                type="button"
                onClick={() => {
                  handleSubmit(values);
                }}
              >
                Finalizar
              </Button>
            </div>
          </form>
        )}
      </Formik>
      <div className="flex justify-center my-3">
        {uploading && (
          <Spinner color="deep-purple" className="h-8 w-8"></Spinner>
        )}
      </div>
      <div className="mt-3">
        {assets
          .filter((a: any) => a.type == 'url')
          ?.map((asset: Asset, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mt-2"
            >
              <div>
                {asset.file_name} -{' '}
                <span className="text-sm">({asset.location_url})</span>{' '}
              </div>
              <div>
                <Tooltip content="Delete item">
                  <IconButton
                    variant="text"
                    onClick={() => {
                      handleDelete(asset);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              </div>

              {
                // <Button>Eliminar</Button>
              }
            </div>
          ))}
      </div>
    </div>
  );
};

export default LinksForm;

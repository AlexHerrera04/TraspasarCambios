// new content form component

import { FunctionComponent, useEffect, useState } from 'react';
import ContentForm from '../components/ContentForm';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { useQuery } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import {
  Progress,
  Spinner,
  Step,
  Stepper,
  Typography,
} from '@material-tailwind/react';
import { set } from 'lodash';
import AssetsForm from '../components/AssetsForm';
import { useNavigate, useParams } from 'react-router-dom';
import LinksForm from '../components/LinksForm';
import Button from 'src/app/ui/Button';

const NewContent: FunctionComponent<any> = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  let [capacities, setCapacities] = useState([]);
  let [contentTypes, setContentTypes] = useState([]);
  let [levels, setLevels] = useState([]);
  let [industries, setIndustries] = useState([]);
  let [functions, setFunctions] = useState([]);
  let [profiles, setProfiles] = useState([]);
  let [businessDrivers, setBusinessDrivers] = useState([]);
  let [idioms, setIdioms] = useState([]);
  let [contentId, setContentId] = useState(id ?? null);

  let [activeStep, setActiveStep] = useState(0);
  let [uploading, setUploading] = useState(false);
  let [assets, setAssets] = useState([] as any[]);
  let [assetUploading, setAssetUploading] = useState(false);
  let [initialValues, setInitialValues] = useState({});
  let [fetchingOptions, setFetchingOptions] = useState(true);

  const { data: content, isFetching } = useQuery({
    queryKey: ['getContent'],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/contents/${id}`
      );
      setInitialValues(data);
      return data;
    },
  });

  const { data: assetsData, isFetching: isFetchingAssets } = useQuery({
    queryKey: ['getAssets'],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/assets/content/${id}`
      );

      setAssets(data);
      return data;
    },
  });

  const handleSubmit = async (values: FormData) => {
    if (!id) {
      uploadContent(values);
    } else {
      updateContent(values);
    }
  };

  const uploadContent = async (values: FormData) => {
    try {
      setUploading(true);
      values.delete('industry_id');

      const { data } = await api.post(
        `${import.meta.env.VITE_API_URL}/contents/create/`,
        values
      );
      setUploading(false);
      setActiveStep(1);
      if (data.content_id) {
        setContentId(data.content_id);
      } else {
        throw new Error('Error creating content');
      }
    } catch (error) {
      //TODO: Handle and show error
      alert('Error creating content, Try again.');
      console.log(error);
      setUploading(false);
    }
  };

  const updateContent = async (values: FormData) => {
    try {
      setUploading(true);
      values.delete('industry_id');
      if (
        typeof values.get('public_image') === 'string' ||
        !values.get('public_image')
      ) {
        values.delete('public_image');
      }

      const { data } = await api.put(
        `${import.meta.env.VITE_API_URL}/contents/update/${id}`,
        values
      );
      setContentId(data.id);
      setUploading(false);
      setActiveStep(1);
    } catch (error) {
      alert('Error updating content, Try again.');
      console.log(error);
      setUploading(false);
    }
  };

  const handleAssetAdded = async (file: any) => {
    try {
      setAssetUploading(true);
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('type', 'file');

      const upload = await api.post(
        `${import.meta.env.VITE_API_URL}/assets/content/${
          contentId ?? id
        }/create_asset/`,
        formData
      );

      setAssets((prev) => [...prev, upload.data.asset]);
      setAssetUploading(false);
    } catch (error) {
      alert('Error uploading asset, Try again.');
    }
  };

  const handleLinkAdded = async (links: any[]) => {
    try {
      setAssetUploading(true);
      links.forEach(async (link) => {
        const formData = new FormData();
        formData.append('file_name', link.name);
        formData.append('url', link.url);

        formData.append('type', 'url');

        const upload = await api.post(
          `${import.meta.env.VITE_API_URL}/assets/content/${
            contentId ?? id
          }/create_asset/`,
          formData
        );
        setAssets((prev) => [...prev, { file: link.url, type: 'url' }]);
      });
      navigate('/content');
      setAssetUploading(false);
    } catch (error) {
      alert('Error uploading asset, Try again.');
    }
  };

  const handleDelete = async (asset: any) => {
    // Handle delete here
    try {
      const res = await api.delete(
        `${import.meta.env.VITE_API_URL}/assets/delete-asset/${asset.id}`
      );
      setAssets((prev) => prev.filter((a: any) => a.id !== asset.id));
    } catch (error) {
      alert('Error deleting asset, Try again.');
    }
  };

  useEffect(() => {
    const getData = async () => {
      const [
        capacities,
        levels,
        industries,
        functions,
        profiles,
        businessDrivers,
        idioms,
        contentTypes,
      ] = await fetchData();
      setCapacities(capacities);
      setLevels(levels);
      setIndustries(industries);
      setFunctions(functions);
      setProfiles(profiles);
      setBusinessDrivers(businessDrivers);
      setIdioms(idioms);
      setContentTypes(contentTypes);
      setFetchingOptions(false);
    };
    getData();
  }, []);
  // New content form with validation
  const pageContent = (
    <>
      <div className="my-5 container mx-auto">
        <h2 className="text-4xl font-bold mt-10 mb-7">
          {id ? 'Editar Contenido' : 'Nuevo Contenido'}
        </h2>
        <div className="flex justify-center mb-3">
          <div className="w-1/2 flex flex-col justify-center items-center">
            <Progress
              className="bg-gray-600 h-6 w-3/4 [&_div]:bg-primary-600 mb-4"
              value={5 + 90 * activeStep}
            />
            <div>
              <h3 className=" text-lg mb-2 text-center">{activeStep + 1}/2</h3>
              <h2 className=" text-2xl text-center">
                {activeStep === 0 ? 'Detalles del contenido' : 'Recursos'}
              </h2>
            </div>
          </div>
        </div>

        {isFetching && (
          <div className="flex justify-center items-center h-96">
            <Spinner color="deep-purple" className="h-10 w-10" />
          </div>
        )}

        {activeStep === 0 && !uploading && !isFetching && (
          <ContentForm
            capacities={capacities}
            levels={levels}
            industries={industries}
            functions={functions}
            profiles={profiles}
            businessDrivers={businessDrivers}
            idioms={idioms}
            contentTypes={contentTypes}
            initialValues={initialValues}
            isEdit={!!id}
            isFetching={fetchingOptions}
            handleSubmit={handleSubmit}
          />
        )}
        {activeStep === 1 && !uploading && (
          <>
            <div>
              <AssetsForm
                onAssetAdded={handleAssetAdded}
                assets={assets}
                uploading={assetUploading}
                isEdit={!!id}
                handleDelete={handleDelete}
              />
            </div>
            <div className=" border-t-2 border-t-white/25 mt-10 mb-5 pt-10">
              <LinksForm
                onSaveLinks={handleLinkAdded}
                assets={assets}
                uploading={assetUploading}
                handleDelete={handleDelete}
                isEdit={!!id}
              />
            </div>
          </>
        )}
        {uploading && (
          <div className="flex justify-center items-center h-96">
            <Spinner color="deep-purple" className="h-10 w-10" />
          </div>
        )}
      </div>
    </>
  );

  return withNavbar({ children: pageContent });
};

const fetchData = async (): Promise<any[]> => {
  const contentTypes = await fetchContentTypes();

  const { data } = await api.get(
    `${
      import.meta.env.VITE_API_URL
    }/diagnoses/all-model-data?model_names=capacity,function,industry,level,tool,idiom,profile,business_driver`
  );

  return [
    data.capacity,
    data.level,
    data.industry,
    data.function,
    data.profile,
    data.business_driver,
    data.idiom,
    contentTypes,
  ].map((p: any) => p.map((p: any) => ({ value: p.id, label: p.name })));
};

const fetchContentTypes = async () => {
  const { data } = await api.get(
    `${import.meta.env.VITE_API_URL}/contents/content_types/`
  );
  return data;
};

const fetchBusinessDrivers = async () => {
  const { data } = await api.get(
    `${import.meta.env.VITE_API_URL}/layerone/businessdrivers/`
  );
  return data;
};

export default NewContent;

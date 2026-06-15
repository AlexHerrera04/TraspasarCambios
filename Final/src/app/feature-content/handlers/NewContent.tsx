// new content form component

import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { useQuery } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import { Progress, Spinner } from '@material-tailwind/react';
import AssetsForm from '../components/AssetsForm';
import { useNavigate, useParams } from 'react-router-dom';
import LinksForm from '../components/LinksForm';
import Button from 'src/app/ui/Button';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import SelectInput from 'src/app/ui/SelectInput';
import TextInput from 'src/app/ui/TextInput';
import ContentForm from '../components/ContentForm';

type AppLanguage = 'es' | 'en';

type SelectOption = {
  value: number | string;
  label: string;
};

type CapacityOption = SelectOption & {
  capacityGroup: string;
};

type ExpertProfileState = {
  publicName: string;
  phoneNumber: string;
  portfolioLink: string;
  visibleCompany: string;
  profilePicture: File | null;
  wikiAvatar: File | null;
};

type ExpertContentState = {
  selectedCapacityGroups: SelectOption[];
  selectedFunctions: SelectOption[];
  selectedIndustries: SelectOption[];
  selectedLevels: SelectOption[];
  selectedTools: SelectOption[];
  name: string;
  description: string;
  shortDescription: string;
  type: SelectOption | null;
  idiom: SelectOption | null;
  publicImage: File | null;
};

const APP_LANGUAGE_KEY = 'appLanguage';

const getStoredLanguage = (): AppLanguage =>
  localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

const normalizeValue = (value: string) =>
  value.toLowerCase().replace(/\s+/g, '').trim();

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div className="mb-5 border-b border-white/10 pb-3">
    <h3 className="text-xl font-bold text-white">{title}</h3>
    {description ? (
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    ) : null}
  </div>
);

const ExpertField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-300">
      {label}
    </label>
    {children}
  </div>
);

const ExpertTextLine = ({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) => (
  <ExpertField label={label}>
    <TextInput
      size="lg"
      disabled={disabled}
      value={value}
      onChange={(event: any) => onChange?.(event.target.value)}
      className="!rounded-lg !border-tertiary !bg-gray-700 !text-gray-300"
      labelProps={{
        className: 'before:content-none after:content-none',
      }}
    />
  </ExpertField>
);

const ExpertSelectLine = ({
  label,
  value,
  options,
  isMulti = false,
  onChange,
  placeholder,
  isDisabled = false,
}: {
  label: string;
  value: any;
  options: SelectOption[];
  isMulti?: boolean;
  onChange?: (value: any) => void;
  placeholder?: string;
  isDisabled?: boolean;
}) => (
  <ExpertField label={label}>
    <SelectInput
      isMulti={isMulti}
      value={value}
      options={options}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
    />
  </ExpertField>
);

const ExpertFileLine = ({
  label,
  onChange,
}: {
  label: string;
  onChange?: (file: File | null) => void;
}) => (
  <ExpertField label={label}>
    <input
      onChange={(event: any) => {
        onChange?.(event.currentTarget.files?.[0] || null);
      }}
      className="block w-full cursor-pointer rounded-lg border border-gray-600 bg-gray-700 px-3 py-3 text-sm text-gray-300 focus:outline-none"
      type="file"
      accept="image/*"
    />
  </ExpertField>
);

const ExpertCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-white/10 bg-gray-800 p-6">
    <SectionTitle title={title} description={description} />
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{children}</div>
  </div>
);

const buildExpertContentPayload = ({
  contentData,
  userID,
  capacities,
  fixedProfile,
}: {
  contentData: ExpertContentState;
  userID: number | null;
  capacities: CapacityOption[];
  fixedProfile: SelectOption | null;
}) => {
  const formData = new FormData();

  formData.append('name', contentData.name);
  formData.append('description', contentData.description);
  formData.append('short_description', contentData.shortDescription);
  formData.append('status', 'false');
  formData.append('is_organic', 'true');
  formData.append('price', '0');
  formData.append('rating', '0');
  formData.append('number_of_reviews', '0');

  const selectedCapacityGroupValues = new Set(
    contentData.selectedCapacityGroups.map((item) => String(item.value))
  );

  const selectedCapacityIds = capacities
    .filter((item) => selectedCapacityGroupValues.has(item.capacityGroup))
    .map((item) => item.value);

  formData.append(
    'function',
    contentData.selectedFunctions.map((item) => item.value).toString()
  );
  formData.append(
    'level',
    contentData.selectedLevels.map((item) => item.value).toString()
  );
  formData.append('capacity', selectedCapacityIds.toString());
  formData.append('profile', fixedProfile ? String(fixedProfile.value) : '');
  formData.append('business_driver', '');
  formData.append(
    'idiom',
    contentData.idiom ? String(contentData.idiom.value) : ''
  );
  formData.append(
    'type',
    contentData.type ? String(contentData.type.value) : ''
  );

  formData.append(
    'industry',
    contentData.selectedIndustries.map((item) => item.value).toString()
  );
  formData.append(
    'industry_id',
    contentData.selectedIndustries.map((item) => item.value).toString()
  );

  formData.append('user', userID ? userID.toString() : '');

  if (contentData.publicImage) {
    formData.append('public_image', contentData.publicImage);
  }

  return formData;
};

const fetchData = async (): Promise<any[]> => {
  const contentTypes = await fetchContentTypes();

  const { data } = await api.get(
    `${
      import.meta.env.VITE_API_URL
    }/diagnoses/all-model-data?model_names=capacity,function,industry,level,tool,idiom,profile,business_driver`
  );

  const capacityOptions: CapacityOption[] = data.capacity.map((item: any) => ({
    value: item.id,
    label: item.name,
    capacityGroup: item.capacity_group,
  }));

  const capacityGroupOptions = Array.from(
    new Set(
      data.capacity
        .map((item: any) => item.capacity_group)
        .filter(Boolean)
    )
  ).map((group: any) => ({
    value: group,
    label: group,
  }));

  return [
    capacityOptions,
    capacityGroupOptions,
    data.level.map((item: any) => ({ value: item.id, label: item.name })),
    data.industry.map((item: any) => ({ value: item.id, label: item.name })),
    data.function.map((item: any) => ({ value: item.id, label: item.name })),
    data.profile.map((item: any) => ({ value: item.id, label: item.name })),
    data.business_driver.map((item: any) => ({
      value: item.id,
      label: item.name,
    })),
    data.idiom.map((item: any) => ({ value: item.id, label: item.name })),
    contentTypes,
    data.tool.map((item: any) => ({ value: item.id, label: item.name })),
  ];
};

const fetchContentTypes = async (): Promise<SelectOption[]> => {
  const { data } = await api.get(
    `${import.meta.env.VITE_API_URL}/contents/content_types/`
  );

  return (data || []).map((item: any) => ({
    value: item.id ?? item.value ?? item.name,
    label: item.name ?? item.label ?? String(item.value ?? ''),
  }));
};

const NewContent: FunctionComponent<any> = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userInfo, userAccountInfo, userID } = useUser();

  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage);
  const [capacities, setCapacities] = useState<CapacityOption[]>([]);
  const [capacityGroups, setCapacityGroups] = useState<SelectOption[]>([]);
  const [contentTypes, setContentTypes] = useState<SelectOption[]>([]);
  const [levels, setLevels] = useState<SelectOption[]>([]);
  const [industries, setIndustries] = useState<SelectOption[]>([]);
  const [functions, setFunctions] = useState<SelectOption[]>([]);
  const [profiles, setProfiles] = useState<SelectOption[]>([]);
  const [businessDrivers, setBusinessDrivers] = useState<SelectOption[]>([]);
  const [idioms, setIdioms] = useState<SelectOption[]>([]);
  const [tools, setTools] = useState<SelectOption[]>([]);
  const [contentId, setContentId] = useState(id ?? null);

  const [activeStep, setActiveStep] = useState(0);
  const [expertStep, setExpertStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([] as any[]);
  const [assetUploading, setAssetUploading] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [fetchingOptions, setFetchingOptions] = useState(true);

  const [expertUserData, setExpertUserData] = useState<ExpertProfileState>({
    publicName: '',
    phoneNumber: '',
    portfolioLink: '',
    visibleCompany: 'Acme',
    profilePicture: null,
    wikiAvatar: null,
  });

  const [expertContentData, setExpertContentData] = useState<ExpertContentState>({
    selectedCapacityGroups: [],
    selectedFunctions: [],
    selectedIndustries: [],
    selectedLevels: [],
    selectedTools: [],
    name: '',
    description: '',
    shortDescription: '',
    type: null,
    idiom: null,
    publicImage: null,
  });

  useEffect(() => {
    const syncLanguage = () => setLanguage(getStoredLanguage());

    window.addEventListener('app-language-change', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      window.removeEventListener('app-language-change', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const copy =
    language === 'en'
      ? {
          selectPlaceholder: 'Select',
          createError: 'Error creating content. Please try again.',
          updateError: 'Error updating content. Please try again.',
          uploadAssetError: 'Error uploading asset. Please try again.',
          deleteAssetError: 'Error deleting asset. Please try again.',
          expertStepCounterUser: '1/2',
          expertStepCounterContent: '2/2',
          expertUserTitle: 'User information',
          expertUserCardTitle: 'User information',
          expertUserCardDescription:
            'Expert details and default company visibility.',
          type: 'Type',
          expert: 'Expert',
          publicName: 'Public name',
          contactEmail: 'Contact email',
          phone: 'Phone',
          visibleCompany: 'Company visible for',
          portfolioLink: 'Portfolio link',
          profilePicture: 'Profile picture',
          wikiAvatar: 'Wiki avatar',
          back: 'Back',
          next: 'Next',
          contentClassification: 'Content classification',
          contentClassificationDescription:
            'All content segmentation attributes.',
          capacityGroup: 'Capacity group',
          function: 'Function',
          industry: 'Industry',
          level: 'Level',
          profile: 'Profile',
          tool: 'Tool',
          contentInformation: 'Content information',
          contentInformationDescription: 'Details of the content to be uploaded.',
          title: 'Title',
          contentType: 'Content type',
          description: 'Description',
          shortDescription: 'Short description',
          language: 'Language',
          coverImage: 'Cover image',
          previous: 'Previous',
          saveAndContinue: 'Save and continue',
          contentStepTitle: 'Content information',
          editContent: 'Edit Content',
          newContent: 'New Content',
          contentDetails: 'Content details',
          resources: 'Resources',
        }
      : {
          selectPlaceholder: 'Seleccionar',
          createError: 'Error creating content. Inténtalo de nuevo.',
          updateError: 'Error updating content. Inténtalo de nuevo.',
          uploadAssetError: 'Error uploading asset. Inténtalo de nuevo.',
          deleteAssetError: 'Error deleting asset. Inténtalo de nuevo.',
          expertStepCounterUser: '1/2',
          expertStepCounterContent: '2/2',
          expertUserTitle: 'Información del usuario',
          expertUserCardTitle: 'Información del usuario',
          expertUserCardDescription:
            'Datos del experto y visibilidad empresarial por defecto.',
          type: 'Tipo',
          expert: 'Experto',
          publicName: 'Nombre público',
          contactEmail: 'Email de contacto',
          phone: 'Teléfono',
          visibleCompany: 'Empresa visible para',
          portfolioLink: 'Enlace de portfolio',
          profilePicture: 'Foto de perfil',
          wikiAvatar: 'Avatar wiki',
          back: 'Volver',
          next: 'Siguiente',
          contentClassification: 'Clasificación del contenido',
          contentClassificationDescription:
            'Todos los atributos de segmentación del contenido.',
          capacityGroup: 'Grupo de capacidad',
          function: 'Función',
          industry: 'Industria',
          level: 'Nivel',
          profile: 'Perfil',
          tool: 'Herramienta',
          contentInformation: 'Información del contenido',
          contentInformationDescription:
            'Datos del contenido que va a subir el usuario.',
          title: 'Título',
          contentType: 'Tipo de contenido',
          description: 'Descripción',
          shortDescription: 'Descripción corta',
          language: 'Idioma',
          coverImage: 'Imagen de portada',
          previous: 'Anterior',
          saveAndContinue: 'Guardar y continuar',
          contentStepTitle: 'Información del contenido',
          editContent: 'Editar Contenido',
          newContent: 'Nuevo Contenido',
          contentDetails: 'Detalles del contenido',
          resources: 'Recursos',
        };

  const fixedProfile = useMemo(() => {
    return (
      profiles.find(
        (profile) => normalizeValue(profile.label || '') === 'businesstechnology'
      ) ||
      profiles.find((profile) =>
        normalizeValue(profile.label || '').includes('businesstechnology')
      ) ||
      null
    );
  }, [profiles]);

  const fixedProfileLabel = fixedProfile?.label || 'Business Technology';

  const { isFetching } = useQuery({
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

  useQuery({
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
      alert(copy.createError);
      setUploading(false);
    }
  };

  const updateContent = async (values: FormData) => {
    try {
      setUploading(true);
      values.delete('industry_id');
      values.set('status', 'false');

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
      alert(copy.updateError);
      setUploading(false);
    }
  };

  const handleSubmit = async (values: FormData) => {
    if (!id) {
      uploadContent(values);
    } else {
      updateContent(values);
    }
  };

  const handleExpertContentSubmit = async () => {
    const payload = buildExpertContentPayload({
      contentData: expertContentData,
      userID,
      capacities,
      fixedProfile,
    });

    if (!id) {
      uploadContent(payload);
    } else {
      updateContent(payload);
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
      alert(copy.uploadAssetError);
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

        await api.post(
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
      alert(copy.uploadAssetError);
    }
  };

  const handleDelete = async (asset: any) => {
    try {
      await api.delete(
        `${import.meta.env.VITE_API_URL}/assets/delete-asset/${asset.id}`
      );
      setAssets((prev) => prev.filter((a: any) => a.id !== asset.id));
    } catch (error) {
      alert(copy.deleteAssetError);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const [
        fetchedCapacities,
        fetchedCapacityGroups,
        fetchedLevels,
        fetchedIndustries,
        fetchedFunctions,
        fetchedProfiles,
        fetchedBusinessDrivers,
        fetchedIdioms,
        fetchedContentTypes,
        fetchedTools,
      ] = await fetchData();

      setCapacities(fetchedCapacities);
      setCapacityGroups(fetchedCapacityGroups);
      setLevels(fetchedLevels);
      setIndustries(fetchedIndustries);
      setFunctions(fetchedFunctions);
      setProfiles(fetchedProfiles);
      setBusinessDrivers(fetchedBusinessDrivers);
      setIdioms(fetchedIdioms);
      setContentTypes(fetchedContentTypes);
      setTools(fetchedTools);
      setFetchingOptions(false);
    };

    getData();
  }, []);

  const expertUserScreen = (
    <div className="my-5 container mx-auto">
      <div className="mb-3 flex justify-center">
        <div className="flex w-1/2 flex-col items-center justify-center">
          <Progress
            className="mb-4 h-6 w-3/4 bg-gray-600 [&_div]:bg-primary-600"
            value={50}
          />
          <div>
            <h3 className="mb-2 text-center text-lg">
              {copy.expertStepCounterUser}
            </h3>
            <h2 className="text-center text-2xl">{copy.expertUserTitle}</h2>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ExpertCard
          title={copy.expertUserCardTitle}
          description={copy.expertUserCardDescription}
        >
          <ExpertTextLine label={copy.type} value={copy.expert} disabled={true} />

          <ExpertTextLine
            label={copy.publicName}
            value={expertUserData.publicName}
            onChange={(value) =>
              setExpertUserData((current) => ({
                ...current,
                publicName: value,
              }))
            }
          />

          <ExpertTextLine
            label={copy.contactEmail}
            value={userAccountInfo?.contact_email || userInfo?.email || ''}
            disabled={true}
          />

          <ExpertTextLine
            label={copy.phone}
            value={expertUserData.phoneNumber}
            onChange={(value) =>
              setExpertUserData((current) => ({
                ...current,
                phoneNumber: value,
              }))
            }
          />

          <ExpertTextLine
            label={copy.visibleCompany}
            value={expertUserData.visibleCompany}
            onChange={(value) =>
              setExpertUserData((current) => ({
                ...current,
                visibleCompany: value,
              }))
            }
          />

          <ExpertTextLine
            label={copy.portfolioLink}
            value={expertUserData.portfolioLink}
            onChange={(value) =>
              setExpertUserData((current) => ({
                ...current,
                portfolioLink: value,
              }))
            }
          />

          <ExpertFileLine
            label={copy.profilePicture}
            onChange={(file) =>
              setExpertUserData((current) => ({
                ...current,
                profilePicture: file,
              }))
            }
          />

          <ExpertFileLine
            label={copy.wikiAvatar}
            onChange={(file) =>
              setExpertUserData((current) => ({
                ...current,
                wikiAvatar: file,
              }))
            }
          />
        </ExpertCard>

        <div className="flex justify-end gap-4">
          <Button outline onClick={() => navigate('/content')}>
            {copy.back}
          </Button>
          <Button primary onClick={() => setExpertStep(1)}>
            {copy.next}
          </Button>
        </div>
      </div>
    </div>
  );

  const expertContentDetails = (
    <div className="space-y-6">
      <ExpertCard
        title={copy.contentClassification}
        description={copy.contentClassificationDescription}
      >
        <ExpertSelectLine
          label={copy.capacityGroup}
          value={expertContentData.selectedCapacityGroups}
          options={capacityGroups}
          isMulti={true}
          placeholder={copy.selectPlaceholder}
          onChange={(value) =>
            setExpertContentData((current) => ({
              ...current,
              selectedCapacityGroups: value || [],
            }))
          }
        />

        <ExpertSelectLine
          label={copy.function}
          value={expertContentData.selectedFunctions}
          options={functions}
          isMulti={true}
          placeholder={copy.selectPlaceholder}
          onChange={(value) =>
            setExpertContentData((current) => ({
              ...current,
              selectedFunctions: value || [],
            }))
          }
        />

        <ExpertSelectLine
          label={copy.industry}
          value={expertContentData.selectedIndustries}
          options={industries}
          isMulti={true}
          placeholder={copy.selectPlaceholder}
          onChange={(value) =>
            setExpertContentData((current) => ({
              ...current,
              selectedIndustries: value || [],
            }))
          }
        />

        <ExpertSelectLine
          label={copy.level}
          value={expertContentData.selectedLevels}
          options={levels}
          isMulti={true}
          placeholder={copy.selectPlaceholder}
          onChange={(value) =>
            setExpertContentData((current) => ({
              ...current,
              selectedLevels: value || [],
            }))
          }
        />

        <ExpertTextLine
          label={copy.profile}
          value={fixedProfileLabel}
          disabled={true}
        />

        <ExpertSelectLine
          label={copy.tool}
          value={expertContentData.selectedTools}
          options={tools}
          isMulti={true}
          placeholder={copy.selectPlaceholder}
          onChange={(value) =>
            setExpertContentData((current) => ({
              ...current,
              selectedTools: value || [],
            }))
          }
        />
      </ExpertCard>

      <ExpertCard
        title={copy.contentInformation}
        description={copy.contentInformationDescription}
      >
        <ExpertTextLine
          label={copy.title}
          value={expertContentData.name}
          onChange={(value) =>
            setExpertContentData((current) => ({
              ...current,
              name: value,
            }))
          }
        />

        <ExpertSelectLine
          label={copy.contentType}
          value={expertContentData.type}
          options={contentTypes}
          placeholder={copy.selectPlaceholder}
          onChange={(value) =>
            setExpertContentData((current) => ({
              ...current,
              type: value || null,
            }))
          }
        />

        <div className="lg:col-span-2">
          <ExpertTextLine
            label={copy.description}
            value={expertContentData.description}
            onChange={(value) =>
              setExpertContentData((current) => ({
                ...current,
                description: value,
              }))
            }
          />
        </div>

        <div className="lg:col-span-2">
          <ExpertTextLine
            label={copy.shortDescription}
            value={expertContentData.shortDescription}
            onChange={(value) =>
              setExpertContentData((current) => ({
                ...current,
                shortDescription: value,
              }))
            }
          />
        </div>

        <ExpertSelectLine
          label={copy.language}
          value={expertContentData.idiom}
          options={idioms}
          placeholder={copy.selectPlaceholder}
          onChange={(value) =>
            setExpertContentData((current) => ({
              ...current,
              idiom: value || null,
            }))
          }
        />

        <ExpertFileLine
          label={copy.coverImage}
          onChange={(file) =>
            setExpertContentData((current) => ({
              ...current,
              publicImage: file,
            }))
          }
        />
      </ExpertCard>

      <div className="flex justify-end gap-4">
        <Button outline onClick={() => setExpertStep(0)}>
          {copy.previous}
        </Button>

        <Button
          primary
          onClick={handleExpertContentSubmit}
          disabled={
            uploading ||
            !expertContentData.name.trim() ||
            !expertContentData.description.trim() ||
            !expertContentData.shortDescription.trim() ||
            !expertContentData.type ||
            !expertContentData.idiom ||
            !expertContentData.publicImage
          }
        >
          {uploading ? <Spinner className="h-4 w-4" /> : copy.saveAndContinue}
        </Button>
      </div>
    </div>
  );

  const expertResources = (
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

      <div className="mt-10 mb-5 border-t-2 border-t-white/25 pt-10">
        <LinksForm
          onSaveLinks={handleLinkAdded}
          assets={assets}
          uploading={assetUploading}
          handleDelete={handleDelete}
          isEdit={!!id}
        />
      </div>
    </>
  );

  const expertContentScreen = (
    <div className="my-5 container mx-auto">
      <div className="mb-3 flex justify-center">
        <div className="flex w-1/2 flex-col items-center justify-center">
          <Progress
            className="mb-4 h-6 w-3/4 bg-gray-600 [&_div]:bg-primary-600"
            value={100}
          />
          <div>
            <h3 className="mb-2 text-center text-lg">
              {copy.expertStepCounterContent}
            </h3>
            <h2 className="text-center text-2xl">{copy.contentStepTitle}</h2>
          </div>
        </div>
      </div>

      {!uploading && activeStep === 0 && expertContentDetails}
      {!uploading && activeStep === 1 && expertResources}

      {uploading && (
        <div className="flex h-96 items-center justify-center">
          <Spinner color="deep-purple" className="h-10 w-10" />
        </div>
      )}
    </div>
  );

  const expertContent =
    expertStep === 0 ? expertUserScreen : expertContentScreen;

  const companyContent = (
    <div className="my-5 container mx-auto">
      <h2 className="mt-10 mb-7 text-4xl font-bold">
        {id ? copy.editContent : copy.newContent}
      </h2>
      <div className="mb-3 flex justify-center">
        <div className="flex w-1/2 flex-col items-center justify-center">
          <Progress
            className="mb-4 h-6 w-3/4 bg-gray-600 [&_div]:bg-primary-600"
            value={5 + 90 * activeStep}
          />
          <div>
            <h3 className="mb-2 text-center text-lg">{activeStep + 1}/2</h3>
            <h2 className="text-center text-2xl">
              {activeStep === 0 ? copy.contentDetails : copy.resources}
            </h2>
          </div>
        </div>
      </div>

      {isFetching && (
        <div className="flex h-96 items-center justify-center">
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
          language={language}
          showVisibleFor={userAccountInfo?.type === 'expert'}
          visibleForOptions={[{ value: 'acme', label: 'Acme' }]}
          visibleForValue={{ value: 'acme', label: 'Acme' }}
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
          <div className="mt-10 mb-5 border-t-2 border-t-white/25 pt-10">
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
        <div className="flex h-96 items-center justify-center">
          <Spinner color="deep-purple" className="h-10 w-10" />
        </div>
      )}
    </div>
  );

  return withNavbar({
  children: companyContent,
});
};

export default NewContent;
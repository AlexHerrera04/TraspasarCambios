import React, { FunctionComponent } from 'react';
import Intro from '../components/Intro';
import ProfessionalsDetails from '../components/ProfessionalsDetails';
import About from '../components/About';
import { motion } from 'framer-motion';
import api from 'src/app/core/api/apiProvider';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';

type AppLanguage = 'es' | 'en';

const APP_LANGUAGE_KEY = 'appLanguage';

const getStoredLanguage = (): AppLanguage =>
  localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -24 },
};

type OnboardingUserInfo = {
  first_name?: string;
  last_name?: string;
  public_name?: string;
  contact_email?: string;
  phone_number?: string;
  source_company?: string;
  organization?: string;
  portfolio_link?: string;
  profile_picture?: File | null;
  wiki_avatar?: File | null;
  function?: string[];
  industry?: string[];
  profile?: string[];
  level?: string[];
  capacity?: string[];
  business_driver?: string[];
  tools?: string[];
  type?: string;
};

const buildAccountInfoFormData = (values: OnboardingUserInfo) => {
  const formData = new FormData();

  formData.append('public_name', values.public_name || '');
  formData.append('contact_email', values.contact_email || '');
  formData.append('phone_number', values.phone_number || '');
  formData.append('portfolio_link', values.portfolio_link || '');

  (values.level || []).forEach((item) => formData.append('level', item));
  (values.profile || []).forEach((item) => formData.append('profile', item));
  (values.industry || []).forEach((item) => formData.append('industry', item));
  (values.function || []).forEach((item) => formData.append('function', item));
  (values.capacity || []).forEach((item) => formData.append('capacity', item));
  (values.business_driver || []).forEach((item) =>
    formData.append('business_driver', item)
  );
  (values.tools || []).forEach((item) => formData.append('tool', item));

  if (values.profile_picture) {
    formData.append('profile_picture', values.profile_picture);
  }

  if (values.wiki_avatar) {
    formData.append('wiki_avatar', values.wiki_avatar);
  }

  return formData;
};

const Onboarding: FunctionComponent = () => {
  const navigate = useNavigate();
  const { userInfo: sessionUserInfo, userAccountInfo } = useUser();

  const [index, setIndex] = React.useState(0);
  const [language, setLanguage] = React.useState<AppLanguage>(getStoredLanguage);
  const [userInfo, setUserInfo] = React.useState<OnboardingUserInfo>({
    first_name: sessionUserInfo?.first_name || '',
    last_name: sessionUserInfo?.last_name || '',
    public_name: userAccountInfo?.public_name || '',
    contact_email:
      userAccountInfo?.contact_email || sessionUserInfo?.email || '',
    phone_number: userAccountInfo?.phone_number || '',
    source_company: '',
    organization: sessionUserInfo?.organization || 'Acme',
    portfolio_link: userAccountInfo?.portfolio_link || '',
    profile_picture: null,
    wiki_avatar: null,
    function: userAccountInfo?.function || [],
    industry: userAccountInfo?.industry || [],
    profile: userAccountInfo?.profile || [],
    level: userAccountInfo?.level || [],
    capacity: userAccountInfo?.capacity || [],
    business_driver: [],
    tools: [],
    type: userAccountInfo?.type || 'expert',
  });

  const updateLanguage = React.useCallback((newLanguage: AppLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem(APP_LANGUAGE_KEY, newLanguage);
    window.dispatchEvent(new Event('app-language-change'));
  }, []);

  const nextStep = async (
    newUserInfo: OnboardingUserInfo,
    lastStep: boolean = false
  ) => {
    if (!lastStep) {
      setUserInfo(newUserInfo);
      setIndex((current) => current + 1);
      return;
    }

    try {
      const userPayload = {
        first_name: newUserInfo.first_name || '',
        last_name: newUserInfo.last_name || '',
        email: newUserInfo.contact_email || '',
      };

      try {
        await api.patch(
          `${import.meta.env.VITE_API_URL}/accounts/userinfo`,
          userPayload
        );
      } catch (error) {
        console.error(
          language === 'en'
            ? 'Could not update userinfo:'
            : 'No se pudo actualizar userinfo:',
          error
        );
      }

      if (newUserInfo.profile_picture || newUserInfo.wiki_avatar) {
        const formData = buildAccountInfoFormData(newUserInfo);
        await api.patch(
          `${import.meta.env.VITE_API_URL}/accounts/accountinfo/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        await api.patch(`${import.meta.env.VITE_API_URL}/accounts/accountinfo/`, {
          public_name: newUserInfo.public_name || '',
          contact_email: newUserInfo.contact_email || '',
          phone_number: newUserInfo.phone_number || '',
          portfolio_link: newUserInfo.portfolio_link || '',
          level: newUserInfo.level || [],
          profile: newUserInfo.profile || [],
          industry: newUserInfo.industry || [],
          function: newUserInfo.function || [],
          capacity: newUserInfo.capacity || [],
          business_driver: newUserInfo.business_driver || [],
          tool: newUserInfo.tools || [],
        });
      }

      toast.success(
        language === 'en'
          ? 'Your profile has been updated successfully.'
          : 'Tu perfil ha sido actualizado correctamente.'
      );
      navigate('/content');
    } catch (error) {
      toast.error(
        language === 'en'
          ? 'Something went wrong, please try again.'
          : 'Algo salió mal, por favor inténtalo de nuevo.',
        {
          position: toast.POSITION.BOTTOM_LEFT,
        }
      );
    }
  };

  const previousStep = () => {
    setIndex((current) => current - 1);
  };

  const steps = [
    <Intro
      language={language}
      onLanguageChange={updateLanguage}
      onClick={() => {
        setIndex((current) => current + 1);
      }}
    />,
    <About language={language} userInfo={userInfo} onClick={nextStep} />,
    <ProfessionalsDetails
      language={language}
      userInfo={userInfo}
      nextStep={nextStep}
      previousStep={previousStep}
    />,
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="out"
        variants={cardVariants}
        transition={{ duration: 0.2 }}
        className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 lg:px-8"
        key={index}
      >
        {steps[index]}
      </motion.div>
    </div>
  );
};

export default Onboarding;
import React, { FunctionComponent } from 'react';
import WikiLogo from '/src/assets/images/wiki-logo2.svg';
import Button from 'src/app/ui/Button';
import { Progress } from '@material-tailwind/react';
import Intro from '../components/Intro';
import ProfessionalsDetails from '../components/ProfessionalsDetails';
import About from '../components/About';
import { motion } from 'framer-motion';
import Capacities from '../components/Capacities';
import DigitalDna from '../components/DigitalDna';
import { UserInfo } from 'src/app/core/models/UserInfo.model';
import { useMutation } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Tools from '../components/Tools';

const cardVariants = {
  hidden: { opacity: 0, x: 500 },
  visible: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -500 },
};

const Onboarding: FunctionComponent<any> = () => {
  const [index, setIndex] = React.useState(0);
  const [userInfo, setUserInfo] = React.useState<UserInfo>({} as UserInfo);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (values: UserInfo) => {
      return api.patch(
        `${import.meta.env.VITE_API_URL}/accounts/accountinfo/`,
        values
      );
    },
  });

  const nextStep = (newUserInfo: UserInfo, lastStep: boolean = false) => {
    console.log(newUserInfo, lastStep);
    if (lastStep) {
      //delete newUserInfo.level;
      //delete newUserInfo.capacity;
      mutation.mutate(newUserInfo, {
        onSuccess: (data) => {
          toast.success('Tu perfil ha sido actualizado correctamente.');
        },
        onError: (error) => {
          toast.error('Something went wrong, please try again.', {
            position: toast.POSITION.BOTTOM_LEFT,
          });
        },
      });
      navigate('/home');
    }
    setUserInfo(newUserInfo);
    setIndex(index + 1);
  };
  const previousStep = () => {
    setIndex(index - 1);
  };

  const steps = [
    <Intro
      onClick={() => {
        setIndex(index + 1);
      }}
    />,
    <About userInfo={userInfo} onClick={nextStep} />,
    <ProfessionalsDetails
      userInfo={userInfo}
      nextStep={nextStep}
      previousStep={previousStep}
    />,
    <Tools
      userInfo={userInfo}
      nextStep={nextStep}
      previousStep={previousStep}
    />,
    /* <Capacities
    <Tools
      userInfo={userInfo}
      nextStep={nextStep}
      previousStep={previousStep}
    />,
    <DigitalDna
      userInfo={userInfo}
      nextStep={nextStep}
      previousStep={previousStep}
    />,*/
  ];

  return (
    <div>
      <div className="py-2 px-4 lg:px-8 lg:py-6">
        <a href="/">
          <img src={WikiLogo} width={100} alt="" />
        </a>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        exit="out"
        variants={cardVariants}
        transition={{ duration: 0.2 }}
        className="container mx-auto mt-36"
        key={index}
        children={steps[index]}
      ></motion.div>
    </div>
  );
};
export default Onboarding;

/*styleName: Display/3XL/Semibold;
font-family: Inter;
font-size: 72px;
font-weight: 600;
line-height: 90px;
letter-spacing: -0.02em;
text-align: center;

 */

import { motion } from 'framer-motion';
import styled from 'styled-components';

const SyledBackdrop = styled(motion.div).attrs({
  className:
    'fixed top-0 left-0 bg-black flex justify-center items-center rounded-md shadow-lg',
})`
  z-index: 9998;
  width: 100%;
  height: 100%;
  padding: 4rem;
  background-color: rgba(0, 0, 0, 0.7);
`;

const Backdrop = ({ children, onClick }: any) => {
  return (
    <SyledBackdrop
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </SyledBackdrop>
  );
};

export default Backdrop;

import { motion } from 'framer-motion';
import { FunctionComponent } from 'react';

interface WithAnimationProps {
  children: any;
}

const withAnimation: FunctionComponent<WithAnimationProps> = ({ children }) => {
  return (
    <motion.div
      key={location.pathname}
      initial="initialState"
      animate="animateState"
      exit="exitState"
      variants={{
        initialState: {
          opacity: 0,
          clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)',
          transition: { duration: 0.4 },
        },
        animateState: {
          opacity: 1,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          transition: { duration: 0.4, staggerChildren: 0.1 },
        },
        exitState: {
          opacity: 0,
          clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
          transition: { duration: 0.4 },
        },
      }}
      className="flex flex-col h-screen"
    >
      {children}
    </motion.div>
  );
};

export default withAnimation;

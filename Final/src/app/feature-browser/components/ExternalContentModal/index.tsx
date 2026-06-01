import { motion } from 'framer-motion';
import styled from 'styled-components';
import Backdrop from '../Backdrop';
import Button from 'src/app/ui/Button';

const StyledMotionDiv = styled(motion.div).attrs({
  className:
    'container relative bg-surface rounded-md shadow-lg flex flex-col items-start ',
})`
  position: absolute;
  padding: 3rem;
`;

const dropIn = {
  hidden: {
    y: '70vh',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.1,
      duration: 0.6,
    },
  },
  exit: {
    y: '100vh',
    opacity: 0,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 1,
    },
  },
};


const ExternalContentModal = (props: any) => {
  const { open, handleOpen, showCloseBtn = true, fileUrl } = props;

  if (open) {
    document.body.style.overflowY = 'hidden';
  } else {
    document.body.style.overflowY = 'auto';
  }

  return (
    <>
      {open && (
        <Backdrop>
          <StyledMotionDiv
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          > 
            {console.log(fileUrl)}
            <div className="w-full flex justify-center items-center">
              {fileUrl.includes('youtube') ? (
                <iframe
                  width="1100" 
                  height="600" 
                  src={fileUrl}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen={true}
                />
              ) : fileUrl.includes('spotify') ? (
                <iframe 
                  className="border-radius:12px" 
                  src={`${fileUrl}?utm_source=generator&theme=0`}
                  width="100%" 
                  height="400" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />              
              ): null}
            </div>
            {showCloseBtn && (
              <div className="w-full flex justify-end mt-10 print:hidden">
                <Button variant="danger" onClick={handleOpen}>
                  <span className="font-bold text-base">Close</span>
                </Button>
              </div>
            )}
          </StyledMotionDiv>
        </Backdrop>
      )}
    </>
  );
};

export default ExternalContentModal;
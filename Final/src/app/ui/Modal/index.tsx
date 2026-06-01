import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Backdrop from '../../feature-browser/components/Backdrop';
import Button from 'src/app/ui/Button';
import ReactToPrint from 'react-to-print';
import { IconButton } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const StyledMotionDiv = styled(motion.div).attrs({
  className:
    'container relative bg-surface rounded-md shadow-lg flex flex-col items-start ',
})`
  position: absolute;
  padding: 3rem;
`;

const PrintIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M14.1665 1.66666C14.6268 1.66666 14.9998 2.03976 14.9998 2.49999V5.83332H17.4998C17.9601 5.83332 18.3332 6.20642 18.3332 6.66666V15C18.3332 15.4602 17.9601 15.8333 17.4998 15.8333H14.9998V17.5C14.9998 17.9602 14.6268 18.3333 14.1665 18.3333H5.83317C5.37294 18.3333 4.99984 17.9602 4.99984 17.5V15.8333H2.49984C2.0396 15.8333 1.6665 15.4602 1.6665 15V6.66666C1.6665 6.20642 2.0396 5.83332 2.49984 5.83332H4.99984V2.49999C4.99984 2.03976 5.37294 1.66666 5.83317 1.66666H14.1665ZM13.3332 14.1667H6.6665V16.6667H13.3332V14.1667ZM16.6665 7.49999H3.33317V14.1667H4.99984V13.3333C4.99984 12.8731 5.37294 12.5 5.83317 12.5H14.1665C14.6268 12.5 14.9998 12.8731 14.9998 13.3333V14.1667H16.6665V7.49999ZM6.6665 8.33332V9.99999H4.1665V8.33332H6.6665ZM13.3332 3.33332H6.6665V5.83332H13.3332V3.33332Z"
      fill="white"
    />
  </svg>
);

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

const ModalContent = React.forwardRef((props: any, ref: any) => {
  const { children } = props;
  return <div ref={ref}>{children}</div>;
});

const Modal = (props: any) => {
  const navigate = useNavigate();
  const { open, handleOpen, showCloseBtn = false, children } = props;
  const componentRef = useRef();

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
            <div className="flex justify-between w-full">
              <ReactToPrint
                bodyClass="print-agreement"
                pageStyle="@page { size: auto;  margin: 25mm; } }"
                content={() => componentRef.current ?? null}
                trigger={() => (
                  <div className="mb-6 opacity-50">
                    <Button type="button" outline variant="secondary">
                      <PrintIcon />
                      <span className="mr-3 font-bold">Print</span>
                    </Button>
                  </div>
                )}
              />
              <IconButton
                className="rounded-full border-black/10 focus:ring-black/50 shadow-md"
                variant="outlined"
                color="blue-gray"
                onClick={handleOpen}
              >
                <XMarkIcon strokeWidth={2} className="h-5 w-5" />
              </IconButton>
            </div>

            <div className=" max-h-[70vh] w-full overflow-y-scroll">
              <ModalContent ref={componentRef}>{children}</ModalContent>
            </div>
            {showCloseBtn && (
              <div className="w-full flex justify-end mt-3 print:hidden">
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

export default Modal;

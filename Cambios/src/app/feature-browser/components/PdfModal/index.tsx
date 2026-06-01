import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'src/app/ui/Modal';
import { Spinner } from '@material-tailwind/react';
import { useQuery } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import axios from 'axios';

const PdfModal = (props: any) => {
  const navigate = useNavigate();
  const { open, handleOpen, fileUrl } = props;

  return (
    <Modal open={open} handleOpen={handleOpen} showCloseBtn={true}>
      <div className="h-32 flex justify-center">
        <iframe
          src={fileUrl}
          className="w-full h-[80vh]"
          title="PDF Viewer"
        ></iframe>
      </div>
    </Modal>
  );
};

export default PdfModal;

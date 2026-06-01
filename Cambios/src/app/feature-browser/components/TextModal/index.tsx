import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import Modal from 'src/app/ui/Modal';
import api from 'src/app/core/api/apiProvider';
import { Spinner } from '@material-tailwind/react';
import Markdown from 'react-markdown';

const StyledMotionDiv = styled(motion.div).attrs({
  className:
    'container bg-dark-600 rounded-md shadow-lg max-h-[80vh] flex flex-col items-start overflow-y-scroll',
})`
  position: absolute;
  padding: 3rem;
`;

const UseCase = (props: any, ref: any) => {
  const { useCase } = props;
  return (
    <div>
      <h2 className="mb-6 mt-8 text-3xl font-bold print:text-black">
        {useCase.json_header.use_case_name}
      </h2>
    </div>
  );
};

const TextModal = (props: any) => {
  const navigate = useNavigate();
  const { open, handleOpen, fileUrl } = props;
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const { data, isFetching } = useQuery({
    queryKey: ['useCasaData'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/assets/file-data/${fileUrl}`
      );
      setParagraphs(data.data.split('\n'));

      //

      data.data = '\n' + data.data;
      // regex to surround with ** for bold the word between a . and a : and it does not have . in the middle
      const regex = /(?<=\n\d{1,2}\.\s)(.*?):/g;
      const regex2 = /(?<=\t\d{1,2}\.\s)(.*?):/g;
      data.data = data.data.replace('\n2.1.', '\n\t1.');
      data.data = data.data.replace('\n2.2', '\n\t2.');
      data.data = data.data.replace('2..', '2.');
      data.data = data.data.replace(/•/g, '\t-');
      data.data = data.data.replace(regex, '**$1:**');
      data.data = data.data.replace(regex2, '**$1:**');
      return data;
    },
  });

  return (
    <Modal open={open} handleOpen={handleOpen} showCloseBtn={true}>
      {isFetching ? (
        <div className="h-32 flex justify-center">
          <Spinner className="h-24 w-24"></Spinner>
        </div>
      ) : (
        <Markdown className="print:text-black [&_ul]:!list-disc [&_ul]:!mx-4 [&_ul]:!px-4">
          {data.data}
        </Markdown>
      )}
    </Modal>
  );
};

export default TextModal;

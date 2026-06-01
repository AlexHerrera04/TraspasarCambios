import { Progress } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import BackButton from '../BackButton';
import { useQuery } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import { useState } from 'react';
import Chip from 'src/app/ui/Chip';
import { useNavigate } from 'react-router-dom';

interface Theme {
  id: number;
  name: string;
  selected?: boolean;
}

const DigitalDna = ({ nextStep, previousStep }: any) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <div className="lg:w-1/2">
        <BackButton onClick={previousStep} className="mb-6" />
        <Progress
          className="bg-gray-600 w-3/4 [&_div]:bg-primary-600 mb-4"
          value={100}
        />
        <div>
          <h3 className=" text-2xl mb-4">3/3</h3>
          <h2 className=" text-4xl">Creemos tu ADN Digital</h2>
        </div>
      </div>
      <div className="lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-16">
        <p className="block mb-4 text-lg text-gray-300">
          Te haremos algunas preguntas simples que nos permitirán ajustar mejor
          tu experiencia de aprendizaje a tu nivel de conocimiento en cada tema.
        </p>
        <p className="block mb-6 text-lg text-gray-300">¿Comenzamos?</p>

        <div className="flex gap-4">
          <Button
            onClick={() => {
              navigate('/diagnosticador/selector');
            }}
            primary
          >
            Completar ADN Digital
          </Button>
          <Button
            outline
            onClick={() => {
              navigate('/browser');
            }}
            variant="secondary"
          >
            Omitir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DigitalDna;

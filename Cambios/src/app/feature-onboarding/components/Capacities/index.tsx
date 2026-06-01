import { Progress, Spinner } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import BackButton from '../BackButton';
import { useQuery } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';
import { useState } from 'react';
import Chip from 'src/app/ui/Chip';

interface Theme {
  id: number;
  name: string;
  selected?: boolean;
}

const Capacities = ({ nextStep, previousStep }: any) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const { data, isFetching } = useQuery({
    queryKey: ['capacitiesList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/diagnoses/existing-themes`
      );
      setThemes(data);
      return data;
    },
  });

  const handleClick = () => {
    const selectedThemes = themes.filter((t) => t.selected);
    if (selectedThemes.length > 0) {
      localStorage.setItem(
        'themes',
        selectedThemes.map((t) => t.id).toString()
      );
    }
    nextStep();
  };

  const setActive = (chip: Theme) => {
    const i = themes.findIndex((theme: Theme) => theme.id === chip.id);
    const newThemes = [...themes];
    newThemes[i].selected = !newThemes[i].selected;
    setThemes(newThemes);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <div className="w-full lg:w-1/2 px-8">
        <BackButton onClick={previousStep} className="mb-6" />
        <Progress
          className="bg-gray-600 w-3/4 [&_div]:bg-primary-600 mb-4"
          value={75}
        />
        <div>
          <h3 className=" text-2xl mb-4">3/4</h3>
          <h2 className=" text-4xl">Capacidades y conocimientos</h2>
        </div>
      </div>
      <div className="w-full lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:px-16">
        <p className="block mb-2 text-sm text-gray-300">
          Selecciona tus areas de interés:
        </p>
        {isFetching || !data ? (
          <div className="my-4">
            <Spinner className=" h-16 w-16"></Spinner>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center items-start mb-4">
            {themes.map((item: Theme) => (
              <Chip key={item.id} item={item} setActive={setActive}></Chip>
            ))}
          </div>
        )}
        <Button onClick={handleClick} primary>
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default Capacities;

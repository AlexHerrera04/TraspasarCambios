import { Spinner } from '@material-tailwind/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'src/app/core/api/apiProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { Theme } from 'src/app/core/models/Theme.model';
import Button from 'src/app/ui/Button';
import Chip from 'src/app/ui/Chip';

const Selector: FunctionComponent<any> = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const navigate = useNavigate();
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

  const setActive = (chip: Theme) => {
    const i = themes.findIndex((theme: Theme) => theme.id === chip.id);
    const newThemes = [...themes];
    newThemes[i].selected = !newThemes[i].selected;
    setThemes(newThemes);
  };

  const handleClick = () => {
    const selectedThemes = themes.filter((t) => t.selected);
    if (selectedThemes.length > 0) {
      localStorage.setItem(
        'themes',
        selectedThemes.map((t) => t.id).toString()
      );
      navigate('/diagnosticador/questionare');
    } else {
      toast.error('Debese seleccionar al menos un item.');
    }
  };

  const content = (
    <div className="container mx-auto p-8">
      {isFetching || !data ? (
        <div className="flex justify-center py-44">
          <Spinner className="h-24 w-24"></Spinner>
        </div>
      ) : (
        <div>
          <h2 className="text-3xl text-center mb-10">
            Selecciona tus areas de interés:
          </h2>
          <div className="flex flex-wrap gap-2 justify-center items-start">
            {themes.map((item: Theme) => (
              <Chip key={item.id} item={item} setActive={setActive}></Chip>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button onClick={handleClick} primary>
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return withNavbar({ children: content });
};

export default Selector;

import { Input } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import everythingIcon from '../../../../assets/icons/everything.svg';
import defaultIcon from '../../../../assets/icons/bot-icon.svg';
import manufacturingIcon from '../../../../assets/icons/manufacturing.svg';
import wellnessIcon from '../../../../assets/icons/wellness.svg';
import marketingIcon from '../../../../assets/icons/marketing.svg';
import hrIcon from '../../../../assets/icons/hr.svg';
import businessIcon from '../../../../assets/icons/business-services.svg';
import technologyIcon from '../../../../assets/icons/technology.svg';
import { useSearchParams } from 'react-router-dom';
import { set } from 'lodash';

const filters = [
  {
    value: 'C',
    title: 'Comunicación',
  },
  {
    value: 'L',
    title: 'Liderazgo',
  },
  {
    value: 'P',
    title: 'Proyectos',
  },
  {
    value: 'N',
    title: 'Negociación',
  },
  {
    value: 'I',
    title: 'IT & PoCs',
  },
  {
    value: 'O',
    title: 'Coaching',
  },
];

const FilterButton = ({ active, onClick, children, value }: any) => {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between items-center cursor-pointer py-4 px-2 ${
        active ? 'border-b-2 border-white' : 'opacity-70'
      }`}
    >
      <div className="mb-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
        {value}
      </div>
      <h3 className="w-full overflow-hidden text-base text-center truncate">
        {children}
      </h3>
    </div>
  );
};

const SearchBar = ({
  handleSearch,
  handleFilter,
  activeFilter,
  searchTerm,
}: any) => {
  const [value, setValue] = useState('');
  let [searchParams, setSearchParams] = useSearchParams();

  const onChange = (event: any) => {
    setValue(event.target.value);
    handleSearch(event.target.value);
    setSearchParams({ search: event.target.value });
  };

  const goBack = () => {
    setValue('');
    handleSearch('');
    handleFilter('');
  };

  useEffect(() => {
    setValue(searchTerm);
  });

  return (
    <div className="flex flex-row-reverse items-center gap-5 sm:flex-row justify-between">
      <div className="flex items-center gap-4 sm:w-3/4 overflow-x-auto">
        <FilterButton
          onClick={goBack}
          image={everythingIcon}
          active={value === '' && activeFilter === ''}
          value="T"
        >
          Ver todo
        </FilterButton>
        {!value && (
          <div className="hidden lg:flex items-center gap-4">
            <div className="h-14 w-[1px] bg-white/20"></div>
            <div className="flex space-x-4 overflow-x-auto !scroll-p-0 pb-0">
              {filters.map((f: any, i: number) => (
                <FilterButton
                  key={i}
                  value={f.value}
                  active={f.value === activeFilter}
                  onClick={() => {
                    setSearchParams({ filter: f.value });
                    handleFilter(f.value);
                  }}
                >
                  {f.title}
                </FilterButton>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="w-full sm:w-1/4">
        <Input
          className="text-white"
          value={value}
          size="lg"
          label="Search..."
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;


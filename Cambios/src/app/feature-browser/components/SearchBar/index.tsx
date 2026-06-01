import { Input } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import everythingIcon from '../../../../assets/icons/everything.svg';
import { useSearchParams } from 'react-router-dom';

const CommunicationIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M8 10.5h8M8 7.5h5M7 18l-3 2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LeadershipIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-7 w-7"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M12 3.8l2.22 4.5 4.97.72-3.6 3.5.85 4.94L12 15.07l-4.44 2.39.85-4.94-3.6-3.5 4.97-.72L12 3.8Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProjectsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NegotiationIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M7 8l3 3m0 0-3 3m3-3H4m13-3-3 3m0 0 3 3m-3-3h6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TechnologyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M9 3v3m6-3v3m-9 3h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Zm3 4h.01M15 13h.01"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CoachingIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M3 9h2v6H3V9Zm4-2h2v10H7V7Zm8 0h2v10h-2V7Zm4 2h2v6h-2V9ZM9 11h6v2H9v-2Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const filters = [
  {
    value: 'C',
    title: 'Comunicación',
    icon: <CommunicationIcon />,
  },
  {
    value: 'L',
    title: 'Liderazgo',
    icon: <LeadershipIcon />,
  },
  {
    value: 'P',
    title: 'Proyectos',
    icon: <ProjectsIcon />,
  },
  {
    value: 'N',
    title: 'Negociación',
    icon: <NegotiationIcon />,
  },
  {
    value: 'I',
    title: 'IT & PoCs',
    icon: <TechnologyIcon />,
  },
  {
    value: 'O',
    title: 'Coaching',
    icon: <CoachingIcon />,
  },
];

const FilterButton = ({
  active,
  onClick,
  children,
  icon,
  isImage = false,
}: any) => {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer flex-col items-center justify-between px-2 py-4 ${
        active ? 'border-b-2 border-white' : 'opacity-70'
      }`}
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
        {isImage ? (
          <img src={icon} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <h3 className="w-full overflow-hidden truncate text-center text-base">
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
  const [, setSearchParams] = useSearchParams();

  const onChange = (event: any) => {
    setValue(event.target.value);
    handleSearch(event.target.value);
    setSearchParams({ search: event.target.value });
  };

  const clearFilters = () => {
    setValue('');
    handleSearch('');
    handleFilter('');
    setSearchParams({});
  };

  useEffect(() => {
    setValue(searchTerm);
  }, [searchTerm]);

  return (
    <div className="flex flex-row-reverse items-center justify-between gap-5 sm:flex-row">
      <div className="flex items-center gap-4 overflow-x-auto sm:w-3/4">
        <FilterButton
          onClick={clearFilters}
          icon={everythingIcon}
          isImage={true}
          active={value === '' && activeFilter === ''}
        >
          Limpiar filtros
        </FilterButton>

        {!value && (
          <div className="hidden items-center gap-4 lg:flex">
            <div className="h-14 w-[1px] bg-white/20"></div>
            <div className="flex space-x-4 overflow-x-auto !scroll-p-0 pb-0">
              {filters.map((filter) => (
                <FilterButton
                  key={filter.value}
                  icon={filter.icon}
                  active={filter.value === activeFilter}
                  onClick={() => {
                    setSearchParams({ filter: filter.value });
                    handleFilter(filter.value);
                  }}
                >
                  {filter.title}
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
import { Typography } from '@material-tailwind/react';
import classNames from 'classnames';
import { capitalize, filter, set } from 'lodash';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  elements,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import Button from 'src/app/ui/Button';
import Variants from 'src/app/ui/variants';
import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import SelectInput from 'src/app/ui/SelectInput';
import { BENCHMARK } from 'src/app/core/consts/benchmark';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import api from 'src/app/core/api/apiProvider';
import { useQuery } from '@tanstack/react-query';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export interface Capacity {
  aspect: string;
  value: number;
}

const APP_LANGUAGE_KEY = 'appLanguage';
const VALUE_TO_FILTER_CAPACITIES: number = 20;

const ProgressChart = ({ porcentage }: { porcentage: number }) => {
  const empty = 100 - porcentage;

  return (
    <svg width="80px" height="80px" viewBox="0 0 42 42" className="donut">
      <circle
        className="donut-ring"
        cx="21"
        cy="21"
        r="15.91549430918954"
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.10)"
        strokeWidth="4"
      ></circle>
      {porcentage > 0 && (
        <circle
          className="donut-segment"
          cx="21"
          cy="21"
          r="15.91549430918954"
          fill="transparent"
          stroke="#0069FF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${porcentage} ${empty}`}
          strokeDashoffset="0"
        ></circle>
      )}
    </svg>
  );
};

const StyledDot = styled.span`
  display: block;
  width: 13.33px;
  height: 13.33px;
  border-radius: 50%;
`;

const StyledCard = styled.div.attrs({
  className: 'bg-white/5',
})`
  display: flex;
  padding: 16px 24px;
  align-items: center;
  gap: 24px;
  flex: 1 0 0;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
`;

const CapacityCard = ({ capacity, isQuizCompleted }: any) => {
  const backgrounds = [
    'bg-gray-500',
    'bg-red-200',
    'bg-orange-300',
    'bg-yellow-400',
    'bg-lime-400',
    'bg-green-500',
    'bg-green-500',
  ];

  const level = Math.ceil(capacity?.value / 20);

  if (!isQuizCompleted) {
    return (
      <StyledCard>
        <div className="flex items-center">
          <div className="relative mr-4">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 tracking-tighter text-lg font-bold">
              0%
            </span>
            <ProgressChart porcentage={0}></ProgressChart>
          </div>
          <StyledDot className={backgrounds[0]} />

          <Typography
            variant="h5"
            className="ml-2 text-xl not-italic font-bold"
          >
            {capitalize(capacity.aspect)}
          </Typography>
        </div>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <div className="flex items-center">
        <div className="relative mr-4">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 tracking-tighter text-lg font-bold">
            {capacity.value}%
          </span>
          <ProgressChart porcentage={capacity.value}></ProgressChart>
        </div>
        <StyledDot className={backgrounds[level]} />

        <Typography variant="h5" className="ml-2 text-xl not-italic font-bold">
          {capitalize(capacity.aspect)}
        </Typography>
      </div>
    </StyledCard>
  );
};

const Capacities = (props: any) => {
  const { capacities, isFetching, isQuizCompleted } = props;
  const { userAccountInfo } = useUser();
  const navigate = useNavigate();
  const language = localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

  const copy =
    language === 'en'
      ? {
          myCapacities: 'My capacities',
          capacityGroup: 'Competency Group',
          selectOption: 'Select an option',
          scope: 'Scope',
          scopeAll: 'All',
          myKeyCompetencies: 'My key competencies',
          myComplementaryCompetencies: 'My complementary competencies',
          benchmark: 'Benchmark',
          noData: 'No data to display with the current filters',
          unlockPotential:
            'Unlock your full potential! Take our digital quiz to help us understand your needs and improve your skills.',
          assessmentPrompt:
            'Choose other competencies for which you want to complete the Assessment:',
          selectAssessment: 'Select an Assessment',
          competencies: 'Competencies:',
          level1: 'Level 1',
          level2: 'Level 2',
          level3: 'Level 3',
          level4: 'Level 4',
          level5: 'Level 5',
          crossLevel: 'Cross-Level (All)',
        }
      : {
          myCapacities: 'Mis competencias',
          capacityGroup: 'Grupo de Competencia',
          selectOption: 'Seleccionar una opción',
          scope: 'Alcance',
          scopeAll: 'Todas',
          myKeyCompetencies: 'Mis competencias clave',
          myComplementaryCompetencies: 'Mis competencias complementarias',
          benchmark: 'Benchmark',
          noData: 'No hay datos para mostrar con los filtros actuales',
          unlockPotential:
            '¡Desbloquea tu máximo potencial! Realiza nuestro quiz digital para ayudarnos a entender tus necesidades y mejorar tus habilidades.',
          assessmentPrompt:
            'Escoge otras competencias sobre las cuales quieras completar el Assessment:',
          selectAssessment: 'Selecciona un Assessment',
          competencies: 'Competencias:',
          level1: 'Nivel 1',
          level2: 'Nivel 2',
          level3: 'Nivel 3',
          level4: 'Nivel 4',
          level5: 'Nivel 5',
          crossLevel: 'Cross-Level (All)',
        };

  const [selectedRoles, setSelectedRoles] = React.useState<any>([]);
  const [selectedCapacities, setSelectedCapacities] = React.useState<any>([]);
  const [filteredCapacities, setFilteredCapacities] = React.useState<any>([]);
  const [selectedCapacityGroup, setSelectedCapacityGroup] =
    React.useState<any>([]);
  const [selectedScope, setSelectedScope] = React.useState<any>({
    label: copy.scopeAll,
    value: 'all',
  });

  console.log(selectedScope);

  const layerZeroCapacitiesQuery = useQuery({
    queryKey: ['layerZeroCapacities', 'list'],
    queryFn: async () => {
      try {
        const { data } = await api.get(
          `${import.meta.env.VITE_API_URL}/layerzero/capacities/`
        );
        return data;
      } catch (error) {
        return [];
      }
    },
    initialData: [],
    retry: 3,
    enabled: props.capacities?.length > 0,
  });

  const labels = capacities
    ? capacities.map((c: any) => c.capacity)
    : [...Array(5)];
  const values = capacities
    ? capacities.map((c: any) => c.value)
    : [...Array(5)];

  const capacityGroup = Array.from(
    new Set(
      capacities
        ?.filter((c: any) => c.value > VALUE_TO_FILTER_CAPACITIES)
        .map((c: any) => c.capacity_group)
    )
  ).map((t: any) => {
    return {
      label: t,
      value: t,
    };
  });

  const [data, setData] = React.useState<any>({
    labels: labels,
    datasets: [
      {
        label: copy.myCapacities,
        data: values,
        backgroundColor: 'rgba(255, 255, 255, 0.10)',
        borderColor: 'rgba(255, 255, 255, 0.80)',
        borderWidth: 3,
      },
    ],
  });

  const roles = [
    {
      label: copy.level1,
      value: 'Nivel 1',
    },
    {
      label: copy.level2,
      value: 'Nivel 2',
    },
    {
      label: copy.level3,
      value: 'Nivel 3',
    },
    {
      label: copy.level4,
      value: 'Nivel 4',
    },
    {
      label: copy.level5,
      value: 'Nivel 5',
    },
    {
      label: copy.crossLevel,
      value: 'Cross-Level (All)',
    },
  ];

  useEffect(() => {
    setSelectedRoles([]);
    if (props.capacities) {
      const filtered = props.capacities.filter(
        (capacity: any) => capacity.value > VALUE_TO_FILTER_CAPACITIES
      );
      setFilteredCapacities(props.filtered);
      drawChart(filtered, []);
    }
  }, [props, userAccountInfo]);

  const drawChart = (capacities: any[], roles: any[]) => {
    if (!capacities) return;
    const labels = capacities
      ? capacities.map((c: any) => c.capacity)
      : [...Array(5)];
    const values = capacities
      ? capacities.map((c: any) => c.value)
      : [...Array(5)];

    const datasets = [];
    datasets.push({
      label: copy.myCapacities,
      data: values,
      backgroundColor: 'rgba(255, 255, 255, 0.10)',
      borderColor: 'rgba(255, 255, 255, 0.80)',
      borderWidth: 3,
    });

    roles.forEach((role: any) => {
      const benchmark = BENCHMARK[role.value as keyof typeof BENCHMARK];
      const capacities = labels.map((c: any) => {
        const capacity = benchmark.find((b: any) => b.name === c);
        return {
          capacity: c,
          value: capacity ? capacity.value * 20 : 50 + Math.random() * 50,
        };
      });
      data.datasets.filter((d: any) => roles.includes(d.label));
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      const values = capacities.map((c: any) => c.value);
      datasets.push({
        label: role.label,
        data: values,
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.10)`,
        borderColor: `rgba(${r}, ${g}, ${b}, 0.80)`,
        borderWidth: 3,
      });
    });

    setData({
      labels: labels,
      datasets: datasets,
    });
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltips: {
        events: ['click'],
        onClick: (e: any) => {
          console.log(e);
        },
      },
    },
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: false,
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.20)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.20)',
        },
        pointLabels: {
          color: 'white',
        },
      },
    },
  };

  const handleFilterChange = (evt: any, type: string) => {
    const filters = {
      capacities: selectedCapacities.map((e: any) => e.value),
      roles: selectedRoles,
      capacityGroup: selectedCapacityGroup.map((e: any) => e.value),
      scope: selectedScope?.value,
    };

    console.log('cap', capacities);

    if (type === 'capacities') {
      setSelectedCapacities(evt);
      filters.capacities = evt.map((e: any) => e.value);
    } else if (type === 'roles') {
      setSelectedRoles(evt);
      filters.roles = evt;
    } else if (type === 'capacityGroup') {
      setSelectedCapacityGroup(evt);
      filters.capacityGroup = evt.map((e: any) => e.value);
    } else if (type === 'scope') {
      setSelectedScope(evt);
      filters.scope = evt?.value;
    }

    let filtered = capacities;
    const userKeyCompetencies = userAccountInfo?.capacity || [];

    if (filters.scope === 'my_competencies') {
      filtered = filtered.filter((capacity: any) =>
        userKeyCompetencies.includes(capacity.capacity)
      );
    }

    if (filters.scope === 'my_complementary_competencies') {
      filtered = filtered.filter(
        (capacity: any) =>
          !userKeyCompetencies.includes(capacity.capacity) &&
          capacity.value > VALUE_TO_FILTER_CAPACITIES
      );
    }

    if (filters.scope === 'all') {
      filtered = filtered.filter(
        (capacity: any) => capacity.value > VALUE_TO_FILTER_CAPACITIES
      );
    }

    filtered = filtered.filter((d: any) => {
      const capacityMatch =
        filters.capacities.length === 0 ||
        filters.capacities.some((v: any) => d.details[v] > 0);
      const capacityGroupMatch =
        filters.capacityGroup.length === 0 ||
        filters.capacityGroup.some((v: any) => d.capacity_group === v);
      return capacityMatch && capacityGroupMatch;
    });
    console.log('Filter change', filtered);
    setFilteredCapacities(filtered);
    drawChart(filtered, filters.roles);
  };

  const handleCapacitiesChange = (evt: any) =>
    handleFilterChange(evt, 'capacities');
  const handleRoleChange = (evt: any) => handleFilterChange(evt, 'roles');
  const handleCapacityGroupChange = (evt: any) =>
    handleFilterChange(evt, 'capacityGroup');
  const handleScopeChange = (evt: any) => handleFilterChange(evt, 'scope');

  const KeyCompetencies = ({ capacities }: any) => {
    if (!capacities) {
      return null;
    }

    const userCapacities = Array.from(
      new Set(
        layerZeroCapacitiesQuery.data
          .filter((item: any) => capacities.includes(item.name))
          .map((capacity: any) => capacity.capacity_group)
      )
    );

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 mt-20">
          {copy.myKeyCompetencies}
        </h2>
        <div className="bg-white/5 rounded-2xl p-8 w-full">
          <div className="flex flex-wrap gap-3 justify-center items-center">
            {[...userCapacities]
              .sort((a: any, b: any) => a.localeCompare(b))
              .map((item: any) => (
                <div key={item.id} className="relative group">
                  <div
                    className={`
                      absolute z-10 w-64 p-4 
                      bottom-full left-1/2 transform -translate-x-1/2
                      mb-2 text-sm bg-gray-900 rounded-lg shadow-lg
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200
                      pointer-events-none
                    `}
                  >
                    <div className="font-semibold mb-2">
                      {copy.competencies}
                    </div>
                    <ul className="list-disc list-inside">
                      {layerZeroCapacitiesQuery.data
                        .filter(
                          (cap: any) =>
                            cap.capacity_group === item &&
                            capacities.includes(cap.name)
                        )
                        .map((cap: any) => (
                          <li key={cap.id} className="text-gray-300">
                            {cap.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <button className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                    {item}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className="text-3xl not-italic font-bold">{copy.myCapacities}</h2>
      <div
        className={
          'my-5 flex justify-around gap-8 flex-wrap ' +
          (isQuizCompleted && isFetching ? 'animate-pulse' : '')
        }
      >
        {isQuizCompleted && (
          <div className="w-full flex flex-col md:flex-row items-center">
            <div className="p-5">
              <div className="mb-6 w-[250px]">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="username"
                >
                  {copy.capacityGroup}
                </label>

                <SelectInput
                  isMulti
                  id="roles"
                  name="roles"
                  size="lg"
                  value={selectedCapacityGroup}
                  onChange={handleCapacityGroupChange}
                  placeholder={copy.selectOption}
                  options={capacityGroup}
                ></SelectInput>
              </div>

              <div className="mb-6 w-[250px]">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="username"
                >
                  {copy.scope}
                </label>

                <SelectInput
                  id="alcance"
                  name="alcance"
                  size="lg"
                  value={selectedScope}
                  onChange={handleScopeChange}
                  placeholder={copy.selectOption}
                  options={[
                    { label: copy.scopeAll, value: 'all' },
                    {
                      label: copy.myKeyCompetencies,
                      value: 'my_competencies',
                    },
                    {
                      label: copy.myComplementaryCompetencies,
                      value: 'my_complementary_competencies',
                    },
                  ]}
                ></SelectInput>
              </div>

              <div className="mb-6 w-[250px]">
                <label
                  className="block mb-2 text-sm text-gray-300"
                  htmlFor="username"
                >
                  {copy.benchmark}
                </label>

                <SelectInput
                  isMulti
                  id="roles"
                  name="roles"
                  size="lg"
                  value={selectedRoles}
                  onChange={handleRoleChange}
                  placeholder={copy.selectOption}
                  options={roles}
                ></SelectInput>
              </div>
            </div>
            <div className="h-[600px] flex-grow flex justify-center">
              {isQuizCompleted &&
                data &&
                (data.labels.length === 0 ? (
                  <div className="h-[600px] flex items-center justify-center text-gray-400">
                    {copy.noData}
                  </div>
                ) : (
                  <Radar data={data} options={options} />
                ))}
            </div>

            <div className="p-5"></div>
          </div>
        )}
      </div>
      {!isQuizCompleted && (
        <div className="flex justify-around gap-8 flex-wrap mb-3 p-5 border border-tertiary bg-tertiary/30 rounded-lg">
          {copy.unlockPotential}
        </div>
      )}
      <div className="flex items-center justify-center gap-4 mt-8">
        <p className="text-base">{copy.assessmentPrompt}</p>
        <Button
          type="submit"
          chevron
          variant="primary"
          onClick={() => {
            navigate('./selector');
          }}
        >
          {copy.selectAssessment}
        </Button>
      </div>
      <KeyCompetencies capacities={userAccountInfo?.capacity} />
    </>
  );
};

export default Capacities;
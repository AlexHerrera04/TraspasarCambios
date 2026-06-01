import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';
import Button from 'src/app/ui/Button';
import NewsTicker from 'src/app/ui/NewsTicker';
import Goals from '../components/Goals';
import CompanyLearningRoutes from '../components/CompanyLearningRoutes';
import CardGrid from 'src/app/feature-browser/components/CardGrid';
import { useRef } from 'react';

const GOALS_TEXT = 'De metas cumplidas';

const DoughnutChart = (props: any) => {
  const { data } = props;

  return data ? (
    <svg width="150px" height="150px" viewBox="0 0 42 42" className="donut">
      <circle
        className="donut-hole"
        cx="21"
        cy="21"
        r="15.91549430918954"
        fill="transparent"
      ></circle>
      <circle
        className="donut-ring"
        cx="21"
        cy="21"
        r="15.91549430918954"
        fill="transparent"
        stroke="gray"
        strokeWidth="3"
      ></circle>

      {data.map((item: any, index: number) => (
        <circle
          key={index}
          className="donut-segment"
          cx="21"
          cy="21"
          r="15.91549430918954"
          fill="transparent"
          stroke={item.color}
          strokeWidth="6"
          strokeDasharray={`${item.value} ${100 - item.value}`}
          strokeDashoffset={item.offset}
        ></circle>
      ))}
    </svg>
  ) : null;
};

const DigitalADN = ({ query }: any) => {
  const navigate = useNavigate();

  const getCapacitiesComparison = () => {
    const capacities = query.data;

    if (capacities) {
      const prom = {
        operative:
          capacities.find((register: any) => register.aspect === 'operative')
            ?.value ?? 0,
        strategic:
          capacities.find((register: any) => register.aspect === 'strategic')
            ?.value ?? 0,
        tactic:
          capacities.find((register: any) => register.aspect === 'tactic')
            ?.value ?? 0,
      };

      const data = [
        {
          name: 'Operative',
          color: '#50C6DF',
          value:
            (prom.operative * 100) /
            (prom.operative + prom.strategic + prom.tactic),
          offset: 25,
        },
        {
          name: 'Strategic',
          color: '#EFD385',
          value:
            (prom.strategic * 100) /
            (prom.operative + prom.strategic + prom.tactic),
          offset: 0,
        },
        {
          name: 'Tactic',
          color: '#A78BFF',
          value:
            (prom.tactic * 100) /
            (prom.operative + prom.strategic + prom.tactic),
          offset: 0,
        },
      ];

      data.forEach((item, index, arr) => {
        if (index > 0) {
          item.offset = 100 - (100 - item.value) + arr[index - 1].offset;
          return item;
        }

        item.offset = 25;
        return item;
      });

      return data;
    }

    return null;
  };

  return query.isFetching ? (
    <div className="animate-pulse flex-grow rounded-xl bg-gray-800 p-7"></div>
  ) : (
    <div
      className="flex-grow rounded-xl bg-gray-800 p-7"
      onClick={() => {
        navigate('/diagnosticador');
      }}
    >
      <h2 className="text-xl font-semibold">ADN DIGITAL</h2>

      <div className="mt-6 flex items-center justify-center gap-5">
        <DoughnutChart data={getCapacitiesComparison()} />
        <ul>
          {getCapacitiesComparison()?.map((item: any, index: number) => (
            <li key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span>
                {item.value.toFixed(0)}% {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Card = ({ isFetching, value, text, goalsRef }: any) => {
  const navigate = useNavigate();

  return isFetching ? (
    <div className="animate-pulse flex-grow rounded-xl bg-gray-800 p-7"></div>
  ) : (
    <div className="flex flex-grow flex-col justify-around rounded-xl bg-gray-800 p-7">
      <div>
        <h2 className="text-5xl font-semibold">{value}</h2>
        <p className="mt-1 text-base font-medium">{text}</p>
      </div>

      <div className="mt-6 justify-self-end">
        <Button
          outline
          onClick={() => {
            if (text === GOALS_TEXT) {
              goalsRef.current?.scrollIntoView({ behavior: 'smooth' });
            } else if (text === 'Score') {
              navigate('/score-history');
            } else {
              navigate('/diagnosticador');
            }
          }}
        >
          <span className="text-base">Ver detalle</span>
        </Button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { userAccountInfo } = useUser();
  const goalsRef = useRef<HTMLDivElement>(null);

  const contentsQuery = useQuery({
    queryKey: ['contentsList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/recommendations/contents`
      );
      return data.slice(0, 4);
    },
  });

  const logQuery = useQuery({
    queryKey: ['logQuery'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/contents/interaction_content_history?type=View`
      );

      return data.slice(0, 4);
    },
  });

  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data } = await api.get(`${import.meta.env.VITE_API_URL}/goals`);
      return data;
    },
  });

  const capacitiesQuery = useQuery({
    queryKey: ['capacitiessList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/diagnoses/capacities-comparison`
      );
      return data;
    },
  });

  const pieChartQuery = useQuery({
    queryKey: ['pieChartList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/diagnoses/pie-chart`
      );
      return data;
    },
  });

  const getGeneralCapacitiesMean = () => {
    const capacities = capacitiesQuery.data;

    if (capacities) {
      const nonZeroCapacities = capacities.filter(
        (capacity: any) => capacity.value !== 0
      );

      if (nonZeroCapacities.length > 0) {
        const sum = nonZeroCapacities.reduce((acc: any, capacity: any) => {
          return acc + capacity.value;
        }, 0);

        return `${(sum / nonZeroCapacities.length).toFixed(0)}%`;
      }
    }

    return '0%';
  };

  const getGoalsProgress = () => {
    const goals = goalsQuery.data;

    if (goals && goals.length > 0) {
      const totalGoals = goals.length;
      const doneGoals = goals.filter(
        (goal: any) => goal.status === 'done'
      ).length;
      return `${((doneGoals * 100) / totalGoals).toFixed(0)}%`;
    }

    return '0%';
  };

  const dispatcherContent = (
    <div className="container mx-auto pb-10">
      <NewsTicker />

      <h2 className="my-10 text-4xl font-semibold">Inicio &gt; Mi Panel</h2>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[4fr_3fr_3fr_3fr]">
        <DigitalADN query={pieChartQuery} />
        <Card
          isFetching={capacitiesQuery.isFetching}
          value={getGeneralCapacitiesMean()}
          text="Promedio general de madurez"
        />
        <Card
          isFetching={goalsQuery.isFetching}
          value={getGoalsProgress()}
          text={GOALS_TEXT}
          goalsRef={goalsRef}
        />
        <Card
          isFetching={capacitiesQuery.isFetching}
          value={userAccountInfo?.total_score ?? 0}
          text="Score"
        />
      </div>

      <div ref={goalsRef}>
        <h2 className="mt-20 text-xl font-semibold">Mis Metas</h2>
        <Goals />
      </div>

      <div className="mt-20">
        <h2 className="text-xl font-semibold">Mis Rutas de Aprendizaje</h2>
        <div className="mt-4">
          <CompanyLearningRoutes />
        </div>
      </div>

      <div className="mt-20 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mi Historial</h2>
        <Button variant="primary" onClick={() => navigate('/history')}>
          Ver todo
        </Button>
      </div>

      <div className="mt-4">
        <CardGrid
          data={logQuery.data}
          isFetching={logQuery.isFetching}
        ></CardGrid>
      </div>

      <h2 className="mt-20 text-xl font-semibold">Enlaces más populares</h2>
      <div className="grid-sm grid grid-cols-1 md:grid-cols-2">
        <div className="flex-1 p-3">
          <div
            className="rounded-lg bg-primary-700 p-3 text-center text-sm font-bold hover:bg-primary-800"
            onClick={() => {
              navigate('/diagnosticador/selector');
            }}
          >
            Agrega capacidades de tu interés a tu ADN Digital
          </div>
        </div>

        <div className="flex-1 p-3">
          <div
            className="rounded-lg bg-primary-700 p-3 text-center text-sm font-bold hover:bg-primary-800"
            onClick={() => {
              navigate('/explorer');
            }}
          >
            Conoce los contenidos más valorados por otros usuarios
          </div>
        </div>

        <div className="flex-1 p-3">
          <div
            className="rounded-lg bg-primary-700 p-3 text-center text-sm font-bold hover:bg-primary-800"
            onClick={() => {
              navigate('/explorer?filter=Wellness');
            }}
          >
            Accede a nuevos cursos de Bienestar Personal
          </div>
        </div>

        <div className="flex-1 p-3">
          <Link
            target="_blank"
            to="https://docs.google.com/forms/d/e/1FAIpQLSeHRRNhHreKp9rEh1PRcIBr-FC-prAxFOWdkgP7XtiuHlDyOQ/viewform"
          >
            <div className="rounded-lg bg-primary-700 p-3 text-center text-sm font-bold hover:bg-primary-800">
              Quiero sumarme a co-crear Open KX
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-20 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Contenido para ti</h2>
        <Button variant="primary" onClick={() => navigate('/explorer')}>
          Ver todo
        </Button>
      </div>

      <div className="mt-4">
        <CardGrid
          data={contentsQuery.data}
          isFetching={contentsQuery.isFetching}
        ></CardGrid>
      </div>
    </div>
  );

  return withNavbar({ children: dispatcherContent });
};

export default Dashboard;
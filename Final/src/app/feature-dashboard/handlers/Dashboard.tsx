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

type DashboardLanguage = 'es' | 'en';
type CardType = 'default' | 'goals' | 'score';

const APP_LANGUAGE_KEY = 'appLanguage';

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

const DigitalADN = ({ query, copy }: any) => {
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
          name: copy.operative,
          color: '#50C6DF',
          value:
            (prom.operative * 100) /
            (prom.operative + prom.strategic + prom.tactic),
          offset: 25,
        },
        {
          name: copy.strategic,
          color: '#EFD385',
          value:
            (prom.strategic * 100) /
            (prom.operative + prom.strategic + prom.tactic),
          offset: 0,
        },
        {
          name: copy.tactic,
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
      <h2 className="text-xl font-semibold">{copy.digitalAdn}</h2>

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

const Card = ({
  isFetching,
  value,
  text,
  goalsRef,
  cardType = 'default',
  detailLabel,
}: any) => {
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
            if (cardType === 'goals') {
              goalsRef.current?.scrollIntoView({ behavior: 'smooth' });
            } else if (cardType === 'score') {
              navigate('/score-history');
            } else {
              navigate('/diagnosticador');
            }
          }}
        >
          <span className="text-base">{detailLabel}</span>
        </Button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const language: DashboardLanguage =
    localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

  const copy =
    language === 'en'
      ? {
<<<<<<< HEAD
          breadcrumb: 'My Dashboard',
=======
          breadcrumb: 'Home > My Dashboard',
>>>>>>> d6d4571f5834be47f96349f33022f04cbd3499f9
          digitalAdn: 'DIGITAL DNA',
          operative: 'Operative',
          strategic: 'Strategic',
          tactic: 'Tactic',
          avgMaturity: 'Average maturity level',
          goalsCompleted: 'Completed goals',
          score: 'Score',
          viewDetail: 'View detail',
          goals: 'My Goals',
          routes: 'My Learning Routes',
          history: 'My History',
          viewAll: 'View all',
          popularLinks: 'Most popular links',
          link1: 'Add capabilities of interest to your Digital DNA',
          link2: 'Discover the highest rated content from other users',
          link3: 'Access new Personal Wellbeing courses',
          link4: 'I want to help co-create Open KX',
          contentForYou: 'Content for you',
        }
      : {
<<<<<<< HEAD
          breadcrumb: 'Mi Panel',
=======
          breadcrumb: 'Inicio > Mi Panel',
>>>>>>> d6d4571f5834be47f96349f33022f04cbd3499f9
          digitalAdn: 'ADN DIGITAL',
          operative: 'Operative',
          strategic: 'Strategic',
          tactic: 'Tactic',
          avgMaturity: 'Promedio general de madurez',
          goalsCompleted: 'De metas cumplidas',
          score: 'Score',
          viewDetail: 'Ver detalle',
          goals: 'Mis Metas',
          routes: 'Mis Rutas de Aprendizaje',
          history: 'Mi Historial',
          viewAll: 'Ver todo',
          popularLinks: 'Enlaces más populares',
          link1: 'Agrega capacidades de tu interés a tu ADN Digital',
          link2: 'Conoce los contenidos más valorados por otros usuarios',
          link3: 'Accede a nuevos cursos de Bienestar Personal',
          link4: 'Quiero sumarme a co-crear Open KX',
          contentForYou: 'Contenido para ti',
        };

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

      <h2 className="my-10 text-4xl font-semibold">{copy.breadcrumb}</h2>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[4fr_3fr_3fr_3fr]">
        <DigitalADN query={pieChartQuery} copy={copy} />
        <Card
          isFetching={capacitiesQuery.isFetching}
          value={getGeneralCapacitiesMean()}
          text={copy.avgMaturity}
          detailLabel={copy.viewDetail}
        />
        <Card
          isFetching={goalsQuery.isFetching}
          value={getGoalsProgress()}
          text={copy.goalsCompleted}
          goalsRef={goalsRef}
          cardType="goals"
          detailLabel={copy.viewDetail}
        />
        <Card
          isFetching={capacitiesQuery.isFetching}
          value={userAccountInfo?.total_score ?? 0}
          text={copy.score}
          cardType="score"
          detailLabel={copy.viewDetail}
        />
      </div>

      <div ref={goalsRef}>
        <h2 className="mt-20 text-xl font-semibold">{copy.goals}</h2>
        <Goals />
      </div>

      <div className="mt-20">
        <h2 className="text-xl font-semibold">{copy.routes}</h2>
        <div className="mt-4">
          <CompanyLearningRoutes />
        </div>
      </div>

      <div className="mt-20 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{copy.history}</h2>
        <Button variant="primary" onClick={() => navigate('/history')}>
          {copy.viewAll}
        </Button>
      </div>

      <div className="mt-4">
        <CardGrid
          data={logQuery.data}
          isFetching={logQuery.isFetching}
        ></CardGrid>
      </div>

      <h2 className="mt-20 text-xl font-semibold">{copy.popularLinks}</h2>
      <div className="grid-sm grid grid-cols-1 md:grid-cols-2">
        <div className="flex-1 p-3">
          <div
            className="rounded-lg bg-primary-700 p-3 text-center text-sm font-bold hover:bg-primary-800"
            onClick={() => {
              navigate('/diagnosticador/selector');
            }}
          >
            {copy.link1}
          </div>
        </div>

        <div className="flex-1 p-3">
          <div
            className="rounded-lg bg-primary-700 p-3 text-center text-sm font-bold hover:bg-primary-800"
            onClick={() => {
              navigate('/explorer');
            }}
          >
            {copy.link2}
          </div>
        </div>

        <div className="flex-1 p-3">
          <div
            className="rounded-lg bg-primary-700 p-3 text-center text-sm font-bold hover:bg-primary-800"
            onClick={() => {
              navigate('/explorer?filter=Wellness');
            }}
          >
            {copy.link3}
          </div>
        </div>

        <div className="flex-1 p-3">
          <Link
            target="_blank"
            to="https://docs.google.com/forms/d/e/1FAIpQLSeHRRNhHreKp9rEh1PRcIBr-FC-prAxFOWdkgP7XtiuHlDyOQ/viewform"
          >
            <div className="rounded-lg bg-primary-700 p-3 text-center text-sm font-bold hover:bg-primary-800">
              {copy.link4}
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-20 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{copy.contentForYou}</h2>
        <Button variant="primary" onClick={() => navigate('/explorer')}>
          {copy.viewAll}
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
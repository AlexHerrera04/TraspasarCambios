import { FunctionComponent, useEffect, useState } from 'react';
import withNavbar from '../../core/handlers/withNavbar';
import styled from 'styled-components';
import { useUser } from '../../core/feature-user/provider/userProvider';
import Insights from '../components/Insights';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Actions from '../components/Actions';
import Capacities from '../components/Capacities';
import { Spinner } from '@material-tailwind/react';
import api from 'src/app/core/api/apiProvider';

interface NavigatorProps {}

const StyledHeader = styled.h2`
  font-size: 36px;
  font-style: normal;
  font-weight: 700;
  line-height: 133%;
  letter-spacing: -0.72px;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 5vh 0vw;
`;

function NavigatorTitle({ name }: { name?: string }) {
  return (
    <StyledTitleContainer>
      <div>
        <StyledHeader>Diagnosticador</StyledHeader>
      </div>
      <div className="flex gap-12">
        <p className="whitespace-no-wrap text-base not-italic font-medium text-white/60">
          Hola {name}, bienvenido. Aquí verás ideas elaboradas basadas en tus
          respuestas y áreas de enfoque.
        </p>
      </div>
    </StyledTitleContainer>
  );
}

const Navigator: FunctionComponent<NavigatorProps> = () => {
  const { userInfo } = useUser();
  const [isQuizCompleted, setQuizCompeted] = useState(false);
  const [generateInsight, setGenerateInsight] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    setGenerateInsight(queryParams.get('generateInsights') === 'true');
  }, []);

  const [surveysQuery] = useQueries({
    queries: [
      {
        queryKey: ['surveysList'],
        queryFn: async () => {
          const { data } = await api.get(
            `${import.meta.env.VITE_API_URL}/diagnoses/survey-theme-completion`
          );
          const quiz = data.find((quiz: any) => !!quiz.last_performed);
          if (quiz.last_performed) {
            setQuizCompeted(true);
          }
          return data;
        },
      },
    ],
  });

  const expertsQuery = useQuery({
    queryKey: ['expertsList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/diagnoses/recommend-experts`
      );
      return data;
    },
  });

  const contentsQuery = useQuery({
    queryKey: ['contentsList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/diagnoses/recommend-contents`
      );
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

  const navigate = useNavigate();

  const navigatorContent = (
    <div className="container mx-auto px-3 lg:px-0">
      <NavigatorTitle name={userInfo?.first_name} />
      <div className="flex flex-col">
        <div className="pb-12 border-b border-b-white/10">
          <Capacities
            capacities={capacitiesQuery.data}
            isFetching={capacitiesQuery.isFetching}
            isQuizCompleted={isQuizCompleted}
          ></Capacities>
        </div>
        {/**  <div className="py-12 border-b border-b-white/10">
          <Insights
            generatedInsightQuery={generatedInsightQuery}
            insightsListQuery={insightsListQuery}
            isQuizCompleted={isQuizCompleted}
          ></Insights>
        </div>
        <div className="py-12 border-b border-b-white/10">
          <Actions
            expertsQuery={expertsQuery}
            contentsQuery={contentsQuery}
            isQuizCompleted={isQuizCompleted}
          ></Actions>
        </div>*/}
      </div>
    </div>
  );

  const loadingContent = (
    <div className="container mx-auto">
      <div className="w-full p-6">
        <NavigatorTitle name={userInfo?.first_name} />
      </div>
      <div className="flex justify-center">
        <Spinner className="h-24 w-24"></Spinner>
      </div>
    </div>
  );

  if (surveysQuery.isFetching) return withNavbar({ children: loadingContent });

  return withNavbar({ children: navigatorContent });
};

export default Navigator;
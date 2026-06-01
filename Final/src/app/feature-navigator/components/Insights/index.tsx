import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'src/app/ui/Button';
import Modal from 'src/app/ui/Modal';
import styled from 'styled-components';
import InsightModal from '../InsightModal';

export interface InsightsProps {
  id?: number;
  insight_text: string;
  theme_name: string;
  created_at: string;
}

const StyledInsightCard = styled.div.attrs({
  className: 'bg-white/5',
})`
  margin: 40px 0 0 0;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.04);
`;

const InsightsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M9.97308 18H11V13H13V18H14.0269C14.1589 16.7984 14.7721 15.8065 15.7676 14.7226C15.8797 14.6006 16.5988 13.8564 16.6841 13.7501C17.5318 12.6931 18 11.385 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 11.3843 6.46774 12.6917 7.31462 13.7484C7.40004 13.855 8.12081 14.6012 8.23154 14.7218C9.22766 15.8064 9.84103 16.7984 9.97308 18ZM10 20V21H14V20H10ZM5.75395 14.9992C4.65645 13.6297 4 11.8915 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 11.8925 19.3428 13.6315 18.2443 15.0014C17.624 15.7748 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C8 17 6.37458 15.7736 5.75395 14.9992Z"
      fill="white"
    />
  </svg>
);

const InsightsContent = (props: {
  insights: InsightsProps;
  isNew: boolean;
  isQuizCompleted: boolean;
}) => {
  const { insights, isNew, isQuizCompleted } = props;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const navigate = useNavigate();

  let content;
  try {
    content = JSON.parse(insights.insight_text);
  } catch (e) {
    content = {
      opportunities_summary: insights.insight_text?.slice(0, 150),
    };
  }

  const shortList = content?.opportunities_summary.slice(0, 200) + '...';

  const date = new Date(insights.created_at)
    .toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    })
    .toUpperCase();

  return (
    <StyledInsightCard>
      {isQuizCompleted ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <InsightsIcon />
            {isNew && (
              <span className="border px-4 py-2 rounded-full border-white text-xs">
                NEW
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold mb-2">{insights.theme_name}</h2>
          <h3 className="text-xs tracking-wide text-white/60 font-bold">
            {date}
          </h3>
          <ul className="mb-4">
            <li className="text-base text-gray-600 mt-3">{shortList}</li>
          </ul>
          <Button type="button" outline onClick={handleOpen}>
            <span className="font-bold mx-3 text-base">Leer</span>
          </Button>
          <InsightModal
            open={open}
            handleOpen={handleOpen}
            insight={insights}
          ></InsightModal>
        </>
      ) : (
        <div className="flex flex-col items-start">
          <InsightsIcon />

          <p className="text-base my-4">
            ¡Desbloquea tu máximo potencial! Realiza nuestro quiz digital para
            ayudarnos a entender tus necesidades y mejorar tus habilidades.
          </p>
          <Button
            variant="secondary"
            chevron
            onClick={() => {
              navigate('./seelctor');
            }}
          >
            Selecciona un Quiz
          </Button>
        </div>
      )}
    </StyledInsightCard>
  );
};

const Insights = (props: any) => {
  const { insightsListQuery, generatedInsightQuery, isQuizCompleted } = props;

  const insigthsList = insightsListQuery.data
    ? generatedInsightQuery && generatedInsightQuery.isFetching
      ? insightsListQuery.data.slice(0, 2)
      : generatedInsightQuery.data?.length < 3
      ? insightsListQuery.data.slice(0, 3 - generatedInsightQuery.data.length)
      : insightsListQuery.data.slice(0, 3)
    : [];

  return (
    <div className="h-full flex flex-col justify-between">
      <h2 className="text-3xl not-italic font-bold">Insights</h2>
      <div className=" grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {generatedInsightQuery &&
        generatedInsightQuery.isFetching &&
        isQuizCompleted ? (
          <StyledInsightCard>
            <div className="w-full">
              <InsightsIcon />

              <div className="animate-pulse flex my-4 space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-400 rounded"></div>
                  <div className="h-4 bg-gray-400 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>
            <i></i>
          </StyledInsightCard>
        ) : (
          generatedInsightQuery &&
          generatedInsightQuery.data &&
          generatedInsightQuery.data.map(
            (insight: InsightsProps, index: number) => (
              <InsightsContent
                key={insight.id}
                insights={insight}
                isQuizCompleted={isQuizCompleted}
                isNew={true}
              ></InsightsContent>
            )
          )
        )}
        {insightsListQuery.isFetching && isQuizCompleted ? (
          <StyledInsightCard>
            <div className="w-full">
              <InsightsIcon />

              <div className="animate-pulse flex my-4 space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-400 rounded"></div>
                  <div className="h-4 bg-gray-400 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>
            <i></i>
          </StyledInsightCard>
        ) : (
          <>
            {insigthsList.map((insights: any, index: number) => (
              <InsightsContent
                key={insights.id}
                insights={insights}
                isQuizCompleted={isQuizCompleted}
                isNew={false}
              ></InsightsContent>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Insights;

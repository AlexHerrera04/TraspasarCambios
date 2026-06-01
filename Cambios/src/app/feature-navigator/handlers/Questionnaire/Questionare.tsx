import { FunctionComponent, useCallback, useState } from 'react';
import withNavbar from '../../../core/handlers/withNavbar';
import styled from 'styled-components';
import { useUser } from '../../../core/feature-user/provider/userProvider';
import { Wizard, WizardStep } from '../../../ui/Wizard';
import FormikOpinionScaleField from '../../../ui/OpinionScale/FormikOpinionScaleField';
import { useMutation, useQuery } from '@tanstack/react-query';
import { map } from 'lodash';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@material-tailwind/react';
import api from 'src/app/core/api/apiProvider';
import { number } from 'yup';
import Chip from 'src/app/ui/Chip';
import React from 'react';

interface QuestionareProps {}

const StyledHeader = styled.h2`
  font-size: 36px;
  color: #fff;
  font-weight: 700;
  line-height: 133%; /* 47.88px */
  margin-top: 1rem;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 5vh 0vw;
`;

function WikiInsightsTitle({ themes, active }: any) {
  const titles = themes.map((q: any, i: number) => ({
    name: q.theme_name,
    selected: i == active,
  }));
  return (
    <StyledTitleContainer>
      <div className="flex gap-2">
        {titles.map((title: any, index: number) => (
          <Chip key={index} solid item={title} setActive={() => {}}></Chip>
        ))}
      </div>

      <StyledHeader>{titles[active].name}</StyledHeader>
    </StyledTitleContainer>
  );
}

/**
 * The following function is going to map the questions array and return 3 questions per WizardStep page
 */
export function mapQuestions(questions: any) {
  const questionsPerPage = 99;
  const pages = Math.ceil(questions.length / questionsPerPage);
  const result = [];

  for (let i = 0; i < pages; i++) {
    result.push(
      questions.slice(i * questionsPerPage, (i + 1) * questionsPerPage)
    );
  }

  return result;
}

/**
 * The following function maps the questions array and returns a WizardStep component for each page
 */
export function mapWizardSteps(questions: any) {
  const questionsPerPage = mapQuestions(questions);

  function validateInput() {}

  return map(questionsPerPage, (questionArray, index) => {
    return (
      <WizardStep key={index}>
        <div className="w-full flex flex-col gap-4">
          {map(questionArray, (question: any) => {
            const name = `${question.question_id}`;

            return (
              <div
                key={question.question_id}
                className="w-full gap-3 flex flex-col"
              >
                <label
                  className="text-white text-xl font-semibold"
                  htmlFor={name}
                >
                  {question.position}. {question.statement}
                </label>
                <FormikOpinionScaleField
                  name={name}
                  opinionScaleOptions={{
                    labels: [
                      'Totalmente en desacuerdo',
                      'Totalmente de acuerdo',
                    ],
                    range: [1, 5],
                  }}
                />
              </div>
            );
          })}
        </div>
      </WizardStep>
    );
  });
}

export function QuestionareWizard({
  data: { questions, theme_name, theme_id },
  handleSubmit,
}: {
  data: any;
  handleSubmit: Function;
}) {
  const { userID } = useUser();
  const [isSubmitting, setSubmitting] = useState(false);

  const goal_id = localStorage.getItem('goal')

  questions = questions.map((q: any, i: number) => ({ ...q, position: i + 1 }));

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      await api.post(
        `${import.meta.env.VITE_API_URL}/diagnoses/upload-survey`,
        values
      );
      
      // Second API call - update goal status related to assestment
      await api.patch(
        `${import.meta.env.VITE_API_URL}/goals/update/${goal_id}/`,
        {
          status: 'done'
        }
      );
    },
  });

  const onSubmit = useCallback((values: any, bag: any) => {
    setSubmitting(true);

    const mappedValues = map(values, (value, key) => {
      return {
        question_id: parseInt(key),
        rating: value.numberValue,
      };
    });

    const valuesToUpload = {
      user: userID,
      theme: theme_id,
      answers: mappedValues,
    };

    mutation.mutate(valuesToUpload, {
      onSuccess: (data) => {
        toast.success('¡Encuesta completada exitosamente!', {
          position: toast.POSITION.BOTTOM_LEFT,
        });
        setSubmitting(false);
        handleSubmit();
      },
      onError: (error) => {
        toast.error('Hubo un error, por favor intenta de nuevo', {
          position: toast.POSITION.BOTTOM_LEFT,
        });
        setSubmitting(false);
      },
    });
  }, []);

  return (
    <Wizard initialValues={{}} onSubmit={onSubmit} isSubmitting={isSubmitting}>
      {mapWizardSteps(questions)}
    </Wizard>
  );
}

const Questionare: FunctionComponent<QuestionareProps> = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const { data, isFetching } = useQuery({
    queryKey: ['getQuestions'],
    queryFn: async () => {
      const themes = localStorage.getItem('themes');
      if (!themes) {
        navigate('/diagnosticador/selector');
      }
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/diagnoses/show-surveys/${themes}`
      );
      return data;
    },
  });

  const nextTheme = () => {
    setIndex((prevIndex) => {
      if (prevIndex < data.length - 1) {
        return prevIndex + 1;
      } else {
        navigate('/diagnosticador');
        return prevIndex;
      }
    });
  };

  const navigatorContent = (
    <div className="container mx-auto">
      {isFetching && (
        <div className="flex justify-center py-44">
          <Spinner className="h-24 w-24"></Spinner>
        </div>
      )}
      {!isFetching && data && (
        <>
          <div className="w-full p-6">
            <WikiInsightsTitle themes={data} active={index} />
          </div>

          <QuestionareWizard data={data[index]} handleSubmit={nextTheme} />
        </>
      )}
    </div>
  );

  return withNavbar({ children: navigatorContent });
};

export default Questionare;

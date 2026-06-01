import { Spinner } from '@material-tailwind/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';
import Question, { QuestionProps } from '../components/Question';
import { set } from 'lodash';
import Button from 'src/app/ui/Button';
import { toast } from 'react-toastify';

interface ScoreProps {
  score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
}

const Quiz: FunctionComponent<any> = () => {
  //get parameters from the URL
  const navigate = useNavigate();
  const { id } = useParams();
  const [questions, setQuestions] = useState<QuestionProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [score, setScore] = useState<ScoreProps>();

  const { data, isFetching } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/goals/quiz/${id}`
      );
      setQuizId(data.quiz_id);
      setQuestions(data.questions);
      return data;
    },
  });

  const handleOptionChange = (e: QuestionProps) => {
    setQuestions((prevQuestions) => {
      return prevQuestions.map((question) => {
        if (question.id === e.id) {
          return e;
        }
        return question;
      });
    });
  };

  const handleSubmit = async () => {
    const answers = questions
      .map((question) => {
        return {
          question_id: question.id,
          answer_id: question.options.find((option) => option.selected)?.id,
        };
      })
      .filter((answer) => answer.answer_id);

    if (answers.length === questions.length) {
      setIsLoading(true);
      const { data } = await api.post(
        `${import.meta.env.VITE_API_URL}/goals/quiz/submit/${quizId}/`,
        { answers }
      );
      setIsLoading(false);
      setScore(data);
    } else {
      toast.error('Debes responder a todas las preguntas.', {
        position: toast.POSITION.BOTTOM_LEFT,
      });
    }

    console.log('answers', answers);
  };

  const pageContent = (
    <div className="container mx-auto">
      {(isFetching || isLoading) && (
        <div className="flex justify-center py-44">
          <Spinner className="h-24 w-24"></Spinner>
        </div>
      )}
      {!isFetching && !isLoading && !score && data && (
        <>
          <div className="w-full p-6">
            <div className="space-y-4">
              {questions.length > 0 &&
                questions.map((question: any, index: number) => (
                  <Question
                    key={index}
                    index={index + 1}
                    question={question}
                    handleOptionChange={handleOptionChange}
                  ></Question>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                outline
                variant="primary"
                onClick={() => navigate('/home')}
              >
                Volver
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                Enviar respuestas
              </Button>
            </div>
          </div>
        </>
      )}

      {score && (
        <div className="flex justify-center py-44">
          <div className="flex flex-col items-center">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-200">
                ¡Gracias por completar la evaluación!
              </h1>
              <p className="text-xl text-gray-300">
                Tu puntuación es de{' '}
                <span className="font-semibold">{score.score}</span> puntos.
              </p>
              <p className="text-xl text-gray-300">
                {score.passed ? (
                  <span className="text-green-600">
                    Has superado la evaluación.
                  </span>
                ) : (
                  <span className="text-red-600">
                    No has superado la evaluación.
                  </span>
                )}
              </p>
              <p className="text-xl text-gray-300 mb-5">
                Has acertado{' '}
                <span className="font-semibold">{score.correct_answers}</span>{' '}
                de{' '}
                <span className="font-semibold">{score.total_questions}</span>{' '}
                preguntas.
              </p>

              <div className="mt-5">
                <Link to="/home">
                  <Button variant="primary">Volver al inicio</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return withNavbar({ children: pageContent });
};

export default Quiz;
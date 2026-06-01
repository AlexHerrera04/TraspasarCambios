import { useEffect, useState } from 'react';

export interface QuestionProps {
  id: string;
  statement: string;
  options: {
    id: string;
    text: string;
    selected?: boolean;
  }[];
}

export default function Question({
  question: q,
  index,
  total,
  handleOptionChange,
}: {
  question: QuestionProps;
  index: number;
  total?: number;
  handleOptionChange: Function;
}) {
  const [question, setQuestion] = useState<QuestionProps>(q);

  useEffect(() => {
    setQuestion(q);
  }, [q]);

  const handleOptionClick = (optionId: string) => {
    const updatedOptions = question.options.map((option) => {
      if (option.id === optionId) {
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });

    const updatedQuestion = { ...question, options: updatedOptions };
    setQuestion(updatedQuestion);
    handleOptionChange(updatedQuestion);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-gray-800 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-300">
            Pregunta {index}
            {total ? ` de ${total}` : ''}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-white">
            {question.statement}
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {question.options.map(
          (option: { id: string; text: string; selected?: boolean }) => {
            const isSelected = !!option.selected;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionClick(option.id)}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition sm:px-5 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-white/10 bg-gray-900 text-gray-200 hover:bg-white/5'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                    isSelected
                      ? 'border-primary-400 bg-primary-500/20'
                      : 'border-white/30 bg-transparent'
                  }`}
                >
                  <span
                    className={`block rounded-full bg-white transition-all ${
                      isSelected ? 'h-2.5 w-2.5' : 'h-0 w-0'
                    }`}
                  ></span>
                </span>

                <span className="text-sm font-medium leading-6">
                  {option.text}
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}
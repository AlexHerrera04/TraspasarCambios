import React from 'react';
import { Checkbox } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';

type AppLanguage = 'es' | 'en';

const Intro = ({
  onClick,
  language,
  onLanguageChange,
}: {
  onClick: () => void;
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
}) => {
  const copy =
    language === 'en'
      ? {
          greeting: 'Hey!',
          intro:
            "Hi! We're excited to have you here and help you manage and strengthen your skills.",
          description:
            "We want to tailor your learning experience to your needs. Let's get to know you a little better!",
          languageLabel: 'Select language',
          accept: 'I accept the',
          terms: 'terms and conditions',
          termsSuffix: 'of OpenKX.wiki',
          button: "Let's start",
        }
      : {
          greeting: '¡Hey!',
          intro:
            '¡Hola! Estamos emocionados de tenerte a bordo y ayudarte a gestionar y fortalecer tus competencias.',
          description:
            'Queremos adaptar tu experiencia de aprendizaje a tus necesidades. ¡Vamos a conocerte un poco más!',
          languageLabel: 'Seleccionar idioma',
          accept: 'Acepto los',
          terms: 'términos y condiciones',
          termsSuffix: 'de OpenKX.wiki',
          button: 'Comencemos',
        };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClick();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-8 w-full max-w-6xl px-4 lg:px-8">
        <p className="mb-3 text-center text-lg font-normal leading-8 text-white">
          {copy.languageLabel}
        </p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => onLanguageChange('es')}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              language === 'es'
                ? 'border-primary-500 bg-primary-600 text-white'
                : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            Español
          </button>

          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              language === 'en'
                ? 'border-primary-500 bg-primary-600 text-white'
                : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center lg:flex-row">
        <h1 className="text-center text-7xl font-semibold lg:w-1/2">
          {copy.greeting}
        </h1>

        <div className="border-tertiary px-16 py-8 text-lg font-normal leading-8 lg:w-1/2 lg:border-l">
          <p className="mb-4">{copy.intro}</p>
          <p className="mb-6">{copy.description}</p>

          <form onSubmit={handleSubmit}>
            <div>
              <Checkbox
                color="deep-purple"
                size={16}
                required
                label={
                  <div className="text-sm text-white/70">
                    {copy.accept}{' '}
                    <a
                      className="underline"
                      href="https://openkx.wiki/index.php/tyc/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {copy.terms}
                    </a>{' '}
                    {copy.termsSuffix}
                  </div>
                }
              />
            </div>

            <div className="mt-3">
              <Button type="submit" primary>
                {copy.button}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Intro;
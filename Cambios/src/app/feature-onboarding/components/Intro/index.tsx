import { Checkbox } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';

const Intro = ({ onClick }: any) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <h1 className="lg:w-1/2 text-7xl font-semibold text-center">¡Hey!</h1>
      <div className="lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-16">
        <p className="mb-4">
          ¡Hola! Estamos emocionados de tenerte a bordo y ayudarte a gestionar y fortalecer tus competencias.
        </p>
        <p className="mb-6">
          Queremos adaptar tu experiencia de aprendizaje a tus necesidades.
          ¡Vamos a conocerte un poco más!
        </p>

        <form onSubmit={onClick}>
          <div>
            <Checkbox
              color="deep-purple"
              size={16}
              required
              label={
                <div className="text-white/70 text-sm">
                  Acepto los{' '}
                  <a
                    className="underline"
                    href="https://openkx.wiki/index.php/tyc/ "
                    target="_blank"
                  >
                    términos y condiciones
                  </a>{' '}
                  de OpenKX.wiki
                </div>
              }
            />
          </div>

          <div className="mt-3">
            <Button type="submit" primary>
              Comencemos
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Intro;

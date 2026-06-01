import React from 'react';
import { Dialog } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';

interface Evaluator {
  name: string;
  lastname: string;
  position: string;
  area: string;
  email: string;
}

interface AddEvaluatorModalProps {
  open: boolean;
  onClose: () => void;
  currentEvaluator: Evaluator;
  onChangeEvaluator: (evaluator: Evaluator) => void;
  onConfirm: () => void;
}

export const AddEvaluatorModal: React.FC<AddEvaluatorModalProps> = ({
  open,
  onClose,
  currentEvaluator,
  onChangeEvaluator,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      handler={onClose}
      className="bg-gray-800 max-w-md"
    >
      <div className="p-6">
        <h3 className="text-xl text-white mb-4">Agregar Evaluador</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                maxLength={50}
                value={currentEvaluator.name}
                onChange={(e) =>
                  onChangeEvaluator({
                    ...currentEvaluator,
                    name: e.target.value,
                  })
                }
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-300">
                Apellido
              </label>
              <input
                type="text"
                maxLength={50}
                value={currentEvaluator.lastname}
                onChange={(e) =>
                  onChangeEvaluator({
                    ...currentEvaluator,
                    lastname: e.target.value,
                  })
                }
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Cargo o rol
            </label>
            <input
              type="text"
              maxLength={50}
              value={currentEvaluator.position}
              onChange={(e) =>
                onChangeEvaluator({
                  ...currentEvaluator,
                  position: e.target.value,
                })
              }
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Área u organización
            </label>
            <input
              type="text"
              maxLength={100}
              value={currentEvaluator.area}
              onChange={(e) =>
                onChangeEvaluator({
                  ...currentEvaluator,
                  area: e.target.value,
                })
              }
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Correo electrónico
            </label>
            <input
              type="email"
              value={currentEvaluator.email}
              onChange={(e) =>
                onChangeEvaluator({
                  ...currentEvaluator,
                  email: e.target.value,
                })
              }
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              required
              title="Por favor ingrese un correo electrónico válido (ejemplo: nombre@dominio.com)"
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={onClose} type="button" outline>
              Cancelar
            </Button>
            <Button onClick={onConfirm} type="button" primary>
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}; 
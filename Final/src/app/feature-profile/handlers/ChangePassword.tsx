import { Input } from '@material-tailwind/react';
import { FunctionComponent, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'src/app/core/api/apiProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';
import Button from 'src/app/ui/Button';

const ChangePassword: FunctionComponent<any> = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { userInfo, userAccountInfo } = useUser();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await api.post(
        `${import.meta.env.VITE_API_URL}/accounts/change-password/`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        }
      );

      toast.success('Contraseña cambiada correctamente');
    } catch (error: any) {
      toast.error(
        'Error al cambiar la contraseña ' + error?.response?.data?.error
      );
    }
  };

  const pageContent = (
    <div className="container mx-auto my-3">
      <h1 className="text-3xl font-bold text-white">Cambiar contraseña</h1>
      <div className="bg-gray-800 rounded-lg my-3 p-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-grow">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="mb-4">
                <label
                  htmlFor="oldPassword"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                {/* Increased margin bottom for button separation */}
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  Confirmar Contraseña Nueva
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <Button type="submit" variant="primary">
                Cambiar contraseña
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  return withNavbar({ children: pageContent });
};

export default ChangePassword;

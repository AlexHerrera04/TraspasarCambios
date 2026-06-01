import React, { useState } from 'react';
import { AccountForm } from './forms/AccountForm';
import { AccountInfoForm } from './forms/AccountInfoForm';
import withNavbar from '../../core/handlers/withNavbar';
import {
  useCreateAccount,
  useCreateAccountInfo,
} from '../services/userService';
import { useUser } from '../../core/feature-user/provider/userProvider';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CreateAccountFormData, CreateAccountResponse } from '../types/user';

const CreateUserFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [createdUsers, setCreatedUsers] = useState<any[]>([]);
  const { userInfo } = useUser();
  const navigate = useNavigate();
  const createAccount = useCreateAccount();
  const createAccountInfo = useCreateAccountInfo();

  const handleCreateAccount = async (accountData: CreateAccountFormData) => {
    try {
      console.log('Creating account with data:', accountData);
      const response = await createAccount.mutateAsync({
        ...accountData,
        organization: accountData.organization || userInfo?.group_id || ''
      });
      setCreatedUsers([...createdUsers, response]);
      setStep(2);
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Error al crear la cuenta');
    }
  };

  const handleCreateAccountInfo = async (data: any) => {
    try {
      if (!createdUsers.length) {
        toast.error('No hay usuario creado para agregar información');
        return;
      }

      console.log('Datos recibidos:', data);

      const infoData = {
        account: createdUsers[createdUsers.length - 1].id,
        type: 'expert' as const,
        public_name: data.public_name,
        organization_level_id: Number(data.organization_level_id),
        function: data.function.map(Number),
        level: data.level.map(Number),
        capacity: data.capacity.map(Number),
        profile: data.profile.map(Number),
        industry: data.industry.map(Number),
        business_driver: data.business_driver?.length ? data.business_driver.map(Number) : [],
        idiom: data.idiom?.length ? data.idiom.map(Number) : [],
        tool: data.tool?.length ? data.tool.map(Number) : [],
        theme: ['default_theme'],
        user_allowed_themes: ['default_theme']
      };

      console.log('Datos a enviar:', infoData);

      try {
        const response = await createAccountInfo.mutateAsync(infoData);
        console.log('Respuesta del servidor:', response);
        
        if (response) {
          toast.success('Usuario creado exitosamente');
          navigate('/admin');
        } else {
          throw new Error('No se recibió respuesta del servidor');
        }
      } catch (apiError: any) {
        console.error('Error en la API:', apiError);
        throw apiError;
      }

    } catch (error: any) {
      console.error('Error creando la información de cuenta:', error);
      toast.error(
        error.response?.data?.detail || 
        error.message || 
        'Error al crear la información de cuenta'
      );
    }
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      {step === 1 && (
        <AccountForm
          onSubmit={handleCreateAccount}
          onCancel={() => navigate('/admin')}
        />
      )}

      {step === 2 && createdUsers.length > 0 && (
        <AccountInfoForm
          userId={createdUsers[createdUsers.length - 1].id}
          onSubmit={handleCreateAccountInfo}
          onPrevious={() => setStep(1)}
          onCancel={() => navigate('/admin')}
          initialData={{
            first_name: createdUsers[createdUsers.length - 1].first_name,
            last_name: createdUsers[createdUsers.length - 1].last_name,
            public_name: `${createdUsers[createdUsers.length - 1].first_name} ${
              createdUsers[createdUsers.length - 1].last_name
            }`,
          }}
        />
      )}
    </div>
  );

  return withNavbar({ children: content });
};

export default CreateUserFlow;

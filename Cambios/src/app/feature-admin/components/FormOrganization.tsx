import React, { useState, useEffect } from 'react';
import withNavbar from '../../core/handlers/withNavbar';
import { useNavigate } from 'react-router-dom';
import { Progress, Spinner } from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import { SelectLine } from '../../ui/FormFields';
import {
  useCreateOrganizationLevel,
  usePotentialParents,
  getPotentialParents,
} from '../services/organizationService';
import { toast } from 'react-toastify';
import { OrganizationType } from '../types/organization';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  level_type: number;
  parent: number | null;
}

const FormOrganization: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    level_type: 2, // Volvemos a SUBGRUPO como valor inicial
    parent: null,
  });

  const [availableParents, setAvailableParents] = useState<OrganizationType[]>(
    []
  );

  // Efecto para cargar padres potenciales cuando cambia el tipo de nivel
  useEffect(() => {
    const loadPotentialParents = async () => {
      if (formData.level_type) {
        const parents = await getPotentialParents(Number(formData.level_type));
        setAvailableParents(parents);
      }
    };
    loadPotentialParents();
  }, [formData.level_type]);

  const createOrganizationLevel = useCreateOrganizationLevel();

  const levelTypeOptions = [
    { value: '2', label: 'Subgrupo' },
    { value: '3', label: 'Área' },
    { value: '4', label: 'Subárea' },
    { value: '5', label: 'Equipo' },
    { value: '6', label: 'Subequipo' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getParentOptions = () => {
    return availableParents
      .filter((parent) => {
        // Asegurarnos que level_type es un número
        const parentLevel =
          typeof parent.level_type === 'string'
            ? parseInt(parent.level_type)
            : parent.level_type;
        return parentLevel < formData.level_type;
      })
      .map((parent) => ({
        value: parent.id.toString(),
        label: `${parent.name} (${parent.level_type})`,
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parent) {
      toast.error('Debe seleccionar una organización superior');
      return;
    }

    try {
      setLoading(true);
      await createOrganizationLevel.mutateAsync({
        name: formData.name,
        level_type: formData.level_type,
        parent: formData.parent,
      });
      toast.success('Nivel organizacional creado exitosamente');
      navigate('/admin');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el nivel organizacional');
    } finally {
      setLoading(false);
    }
  };

  return withNavbar({
    children: (
      <div className="relative flex flex-col lg:flex-row items-start justify-center min-h-screen bg-gray-900 p-4 mx-auto max-w-7xl">
        <div className="w-full lg:w-1/2 px-8 mb-8 lg:mb-0">
          <Progress
            value={50}
            className="bg-gray-700 w-3/4 [&_div]:bg-primary-500 mb-6"
          />
          <h2 className="text-4xl font-bold text-white mb-4">
            Nuevo Nivel Organizacional
          </h2>
          <p className="text-gray-400">
            Complete los detalles del nuevo nivel organizacional
          </p>
        </div>

        <div className="w-full lg:w-1/2 text-lg font-normal leading-8 lg:border-l border-gray-700 py-8 px-8 lg:px-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Nivel Organizacional
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-colors"
                required
                placeholder="Nombre del nivel organizacional"
              />
            </div>

            {/* Tipo de Nivel */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Tipo de Nivel Organizacional
              </label>
              <SelectLine
                label=""
                name="level_type"
                value={formData.level_type.toString()}
                options={levelTypeOptions}
                handleChange={(e) => handleSelectChange('level_type', e)}
                handleBlur={() => {}}
                setFieldValue={handleSelectChange}
                errors={{}}
                touched={{}}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Organización Superior */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Organización Superior
              </label>
              <SelectLine
                label=""
                name="parent"
                value={formData.parent?.toString() || ''}
                options={getParentOptions()}
                handleChange={(value) => handleSelectChange('parent', value)}
                handleBlur={() => {}}
                setFieldValue={handleSelectChange}
                errors={{}}
                touched={{}}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Botones */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                onClick={() => navigate('/admin')}
                variant="secondary"
                className="w-[180px] h-[40px] text-sm font-medium"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                className="w-[180px] h-[40px] text-sm font-medium"
              >
                Guardar
              </Button>
            </div>
          </form>
        </div>
      </div>
    ),
  });
};

export default FormOrganization;

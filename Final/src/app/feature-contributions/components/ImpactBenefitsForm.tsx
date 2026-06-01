import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as Yup from 'yup';
import {
  Progress,
  Typography,
  Spinner,
  Dialog,
  IconButton  
} from '@material-tailwind/react';
import Button from 'src/app/ui/Button';
import { SelectLine } from 'src/app/ui/FormFields';
import { useNavigate } from 'react-router-dom';
import withNavbar from 'src/app/core/handlers/withNavbar';
import { toast } from 'react-toastify';
import { persistenceService } from '../services/persistenceService';
import { ImpactBenefitsForm as ImpactBenefitsFormType } from '../types';
import SelectInput from 'src/app/ui/SelectInput';
import { useQuery } from '@tanstack/react-query';
import api from 'src/app/core/api/apiProvider';




interface Benefit {
  benefit: string;
  unit: string;
  impact_value: string;
  metric: string;
  business_driver?: number;
}


const ImpactBenefitsForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showAddBenefitModal, setShowAddBenefitModal] = useState(false);
  const [showBusinessDrivertModal, setShowBusinessDriverModal] = useState(false);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [currentBenefit, setCurrentBenefit] = useState<Benefit>({
    benefit: '',
    unit: '',
    impact_value: '',
    metric: '',
    business_driver: undefined,
  });
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [benefitToDelete, setBenefitToDelete] = useState<number | null>(null);
  const { data: businessDriverData, isLoading: isLoadingBusinessDriver } = useQuery({
    queryKey: ['businessDrivers'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/layerone/businessdrivers/`
      );
      return data;
    },
  });
  const [selectedBusinessDriver, setSelectedBusinessDriver] = useState<any>(null);


  const formik = useFormik<ImpactBenefitsFormType>({
    initialValues: {
      business_problem: '',
      technical_approach: ''
    },
    validationSchema: Yup.object({
      business_problem: Yup.string().max(200, 'Máximo 200 caracteres'),
      technical_approach: Yup.string().max(200, 'Máximo 200 caracteres')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        persistenceService.saveStepData('impact', {
          ...values,
          benefits
        });
        navigate('/contributor/create/evidence');
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const savedData = persistenceService.getStepData('impact');
    if (savedData) {
      formik.setValues(savedData);
      if (savedData.benefits) {
        setBenefits(savedData.benefits);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formik.dirty) {
        persistenceService.saveStepData('impact', {
          ...formik.values,
          benefits
        });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formik.values, benefits]);

  const handleAddBenefit = () => {
    if (!currentBenefit.benefit.trim()) {
      toast.error('Por favor ingrese la Palanca de negocio');
      return;
    }
    if (!currentBenefit.metric.trim()) {
      toast.error('Por favor ingrese el KPI o métrica de éxito');
      return;
    }
    if (!currentBenefit.unit) {
      toast.error('Por favor seleccione una Unidad de medida');
      return;
    }
    if (!currentBenefit.impact_value) {
      toast.error('Por favor ingrese el Valor del impacto');
      return;
    }

    const newBenefits = [...benefits, currentBenefit];
    setBenefits(newBenefits);
    
    persistenceService.saveStepData('impact', {
      ...formik.values,
      benefits: newBenefits
    });

    resetCurrentBenefit();
    setShowAddBenefitModal(false);
    toast.success('Beneficio agregado exitosamente');
  };

  const handleDeleteClick = (index: number) => {
    setBenefitToDelete(index);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (benefitToDelete !== null) {
      const newBenefits = benefits.filter((_, index) => index !== benefitToDelete);
      setBenefits(newBenefits);
      
      persistenceService.saveStepData('impact', {
        ...formik.values,
        benefits: newBenefits
      });
    }
    setShowDeleteConfirmModal(false);
    setBenefitToDelete(null);
  };

  const unitOptions = [
    { value: 'percentage', label: 'Porcentaje' },
    { value: 'quantity', label: 'Cantidad' },
    { value: 'amount', label: 'Importe' },
  ];

  const getUnitLabel = (value: string) => {
    switch (value) {
      case 'percentage':
        return '%';
      case 'quantity':
        return '#';
      case 'amount':
        return '$';
      default:
        return value;
    }
  };

  const handleOpenBusinessDriverModal = () => {
    setShowAddBenefitModal(false);  // Cerrar el modal de agregar evidencia
    setShowBusinessDriverModal(true);    // Abrir el modal de competencias
  };

  const businessDriverOptions = businessDriverData?.map((driver: any) => ({
    value: driver.id,
    label: driver.name,
  })) || [];

  const handleBusinessDriverSelection = () => {
    if (selectedBusinessDriver) {
      setCurrentBenefit({
        ...currentBenefit,
        benefit: selectedBusinessDriver.label,
        business_driver: selectedBusinessDriver.value,
      });
    }
    setShowBusinessDriverModal(false);
    setShowAddBenefitModal(true);
  };

  const resetCurrentBenefit = () => {
    setCurrentBenefit({ 
      benefit: '', 
      unit: '', 
      impact_value: '', 
      metric: '',
      business_driver: undefined,
    });
  };

  const content = (
    <div className="min-h-screen bg-[#111827] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between">
          <div className="w-full lg:w-[66%] px-7 mb-11">
            <div className="relative mb-6">
              <Typography
                variant="h3"
                className="text-6xl mr-4 text-center mb-6 font-bold text-white"
              >
                2/4
              </Typography>
              <Progress
                value={50}
                className="bg-gray-600 w-full [&_div]:bg-primary-600"
              />
            </div>
            <h2 className="text-4xl text-white">Impacto y Beneficios</h2>
            <p className="text-gray-400 mb-4 mt-4">
              Define el valor que generó, o generará, el proyecto desde el punto de vista del negocio y la solución técnica.
            </p>
            <p className="text-gray-400 mb-2">
              <b>Problema o necesidad de negocio:</b>
              <p className="text-gray-400">
                Explica brevemente qué se busca resolver o mejorar (máx. 200 caracteres)
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Desafío o enfoque técnico:</b>
              <p className="text-gray-400">
                Describe el enfoque o reto principal desde tu área de conocimiento (máx. 200 caracteres).
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>Beneficio para la empresa:</b>
              <p className="text-gray-400">
                Selecciona el beneficio principal (ej. eficiencia, ahorro, innovación).
              </p>
            </p>
            <p className="text-gray-400 mb-2">
              <b>KPIs o métricas de éxito:</b>
              <p className="text-gray-400">
                Por cada beneficio, indica:
              </p>
              <ul className="list-disc pl-5 text-gray-400">
                <li>Tipo de beneficio (ej. Ahorro de costos)</li>
                <li>Unidad de medida (Porcentaje, Cantidad, Importe)</li>
                <li>Valor estimado (ej. 15%, $ 10.000, etc.)</li>
              </ul>
            </p>
          </div>
          <div className="w-full lg:w-[89%]  text-lg font-normal leading-8 lg:border-l border-tertiary py-8 px-8 lg:pl-12">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Problema o necesidad de negocios abordada
                </label>
                <textarea
                  {...formik.getFieldProps('business_problem')}
                  maxLength={200}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  rows={3}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Enfoque técnico de la solución aplicado
                </label>
                <textarea
                  {...formik.getFieldProps('technical_approach')}
                  maxLength={200}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300 self-end">
                    Beneficio para la empresa
                  </label>
                  <Button
                    onClick={() => setShowAddBenefitModal(true)}
                    type="button"
                    primary
                  >
                    Agregar Beneficio
                  </Button>
                </div>

                <div className=" rounded-lg overflow-hidden">
                  <table className="w-full text-white">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-3 text-left">Palanca de valor</th>
                        <th className="p-3 text-left">Métrica</th>
                        <th className="p-3 w-10 text-center">Impacto</th>
                        <th className="p-3 w-10 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benefits.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center bg-gray-600 text-gray-400 p-5"
                          >
                            No hay beneficios
                          </td>
                        </tr>
                      ) : (
                        benefits.map((benefit, index) => (
                          <tr
                            key={index}
                            className="border-t bg-gray-600 border-gray-600 text-base"
                          >
                            <td className="p-3">{benefit.benefit}</td>
                            <td className="p-3">{benefit.metric}</td>
                            <td className="p-3 text-center w-40">
                              {benefit.impact_value} {getUnitLabel(benefit.unit)}
                            </td>
                            <td className="p-3 pl-7 m-4 w-5">
                              <TrashIcon 
                                className="w-6 h-6 cursor-pointer hover:text-red-500" 
                                onClick={() => handleDeleteClick(index)}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between !mt-10">
                <Button
                  onClick={() => navigate('/contributor/create')}
                  type="button"
                  outline
                >
                  Volver
                </Button>
                <Button type="submit" disabled={loading} primary>
                  {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                  Siguiente
                </Button>
              </div>
            </form>
          </div>

          <Dialog
            open={showAddBenefitModal}
            handler={() => setShowAddBenefitModal(false)}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6">
              <h3 className="text-xl text-white mb-4">Agregar Beneficio</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={currentBenefit.benefit}
                    readOnly
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    placeholder="ej. Ahorro en costos, aumento de ventas"
                  />
                  <Button 
                    onClick={handleOpenBusinessDriverModal}
                    type="button"
                    primary
                  >
                    Seleccionar Palanca de negocio
                  </Button>
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    KPIs o métricas de éxito
                  </label>
                  <input
                    type="text"
                    value={currentBenefit.metric}
                    onChange={(e) =>
                      setCurrentBenefit({
                        ...currentBenefit,
                        metric: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    placeholder="ej. ROI, adopción, tiempo optimizado"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Unidad de medida
                  </label>
                  <SelectLine
                    label=""
                    name="unit"
                    value={currentBenefit.unit}
                    options={unitOptions}
                    handleChange={(option) => {
                      if (typeof option === 'string') {
                        setCurrentBenefit({
                          ...currentBenefit,
                          unit: option,
                        });
                      } else if (
                        option &&
                        typeof option === 'object' &&
                        'value' in option
                      ) {
                        setCurrentBenefit({
                          ...currentBenefit,
                          unit: option.value,
                        });
                      }
                    }}
                    handleBlur={() => {}}
                    setFieldValue={(name, value) => {
                      console.log('SetFieldValue called with:', name, value);
                      setCurrentBenefit({
                        ...currentBenefit,
                        [name]: value,
                      });
                    }}
                    errors={{}}
                    touched={{}}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Valor del impacto
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={currentBenefit.impact_value}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^(\d*\.?\d{0,2})?$/.test(value)) {
                          setCurrentBenefit({
                            ...currentBenefit,
                            impact_value: value,
                          });
                        }
                      }}
                      className="w-40 p-2 rounded-lg bg-gray-700 text-white border text-right border-gray-600"
                      placeholder="0.00"
                    />
                    <span className="ml-2 text-white text-lg">
                      {getUnitLabel(currentBenefit.unit)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    onClick={() => setShowAddBenefitModal(false)}
                    type="button"
                    outline
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddBenefit} type="button" primary>
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </Dialog>

          <Dialog
            open={showDeleteConfirmModal}
            handler={() => setShowDeleteConfirmModal(false)}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6">
              <h3 className="text-xl text-white mb-4">Confirmar eliminación</h3>
              <p className="text-gray-300 mb-6">
                ¿Está seguro que desea eliminar este beneficio?
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  type="button"
                  outline
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  type="button"
                  primary
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </Dialog>
          <Dialog
            open={showBusinessDrivertModal}
            handler={() => {
              setShowBusinessDriverModal(false);
              setShowAddBenefitModal(true);
            }}
            className="bg-gray-800 max-w-md"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Typography variant="h5" className="text-white">
                    Seleccionar Palanca de Negocio
                  </Typography>
                  <Typography variant="small" className="text-gray-400">
                    Seleccione la palanca de negocio
                  </Typography>
                </div>
                <IconButton
                  variant="text"
                  color="white"
                  onClick={() => {
                    setShowBusinessDriverModal(false);
                    setShowAddBenefitModal(true);
                  }}
                >
                  <XMarkIcon className="h-6 w-6" />
                </IconButton>
              </div>

              <div className="space-y-4">
                <SelectInput
                  label="Seleccionar palanca de negocio"
                  name="businessDriver"
                  isMulti={false}
                  value={selectedBusinessDriver}
                  options={businessDriverOptions}
                  onChange={(selectedOption: any) => {
                    setSelectedBusinessDriver(selectedOption);
                  }}
                  onBlur={() => {}}
                  error=""
                />
                <Typography variant="small" className="text-gray-400">
                  Selecciona una palanca de negocio de la lista.
                </Typography>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <Button
                  onClick={() => {
                    setShowBusinessDriverModal(false);
                    setShowAddBenefitModal(true);
                  }}
                  type="button"
                  outline
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleBusinessDriverSelection}
                  type="button"
                  primary
                  disabled={isLoadingBusinessDriver || !selectedBusinessDriver}
                >
                  {isLoadingBusinessDriver ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : null}
                  Confirmar Selección
                </Button>
              </div>
            </div>
          </Dialog>          
        </div>
      </div>
    </div>
  );

  return withNavbar({ children: content });
};

export default ImpactBenefitsForm;

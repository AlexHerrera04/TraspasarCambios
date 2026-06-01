import React from 'react';
import Select from 'react-select';
import { FormikErrors, FormikTouched } from 'formik';
import { CreateAccountInfoRequest, SelectOption } from '../feature-admin/types/user';

export interface SelectLineProps {
  label: string;
  name: string;
  value: any;
  options: SelectOption[];
  handleChange: (value: any) => void;
  handleBlur: () => void;
  setFieldValue: (field: string, value: any) => void;
  errors: any;
  touched: any;
  className?: string;
  containerClassName?: string;
  isMulti?: boolean
}

export const SelectLine: React.FC<SelectLineProps> = ({
  label,
  name,
  value,
  options,
  handleChange,
  handleBlur,
  setFieldValue,
  errors,
  touched,
  className,
  containerClassName,
}) => {
  // Convertir el error a string si es un array
  const error = errors?.[name as keyof CreateAccountInfoRequest];
  const errorMessage = Array.isArray(error) ? error[0] : error;
  const isTouched = touched?.[name as keyof CreateAccountInfoRequest];

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#374151',
      borderColor: error && isTouched ? '#EF4444' : '#4B5563',
      '&:hover': {
        borderColor: '#6B7280',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#374151',
      color: 'white',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#4B5563' : '#374151',
      color: 'white',
      '&:hover': {
        backgroundColor: '#4B5563',
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: '#4B5563',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'white',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: 'white',
      '&:hover': {
        backgroundColor: '#6B7280',
        color: 'white',
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white',
    }),
  };

  return (
    <div className={`mb-4 ${containerClassName || ''}`}>
      <label className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <Select
        name={name}
        value={options.find(option => option.value === value)}
        options={options}
        onChange={(selectedOption: any) => {
          const value = selectedOption.value;
          handleChange(value);
          setFieldValue(name, value);
        }}
        onBlur={handleBlur}
        styles={customStyles}
        className={`text-white ${className || ''}`}
        isMulti={false}
      />
      {isTouched && errorMessage && (
        <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
      )}
    </div>
  );
}; 
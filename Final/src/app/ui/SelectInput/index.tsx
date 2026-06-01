import { error } from 'console';
import React from 'react';
import Select from 'react-select';

const SelectInput = (props: any) => {
  return (
    <div style={{ marginBottom: '30px', width: '100%' }}>
      <Select
        {...props}
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        onChange={props.onChange}
        onBlur={props.onBlur}
        value={props.value}
        error={!!props.error}
        success={props.success}
        classNames={{
          input: () => {
            const className = '!text-gray-300';
            return className;
          },
          container: () => {
            const className = '!text-gray-300';
            return className;
          },
          valueContainer: () => '!text-gray-300',
          singleValue: () => '!text-gray-300',
          control: ({}) => {
            const className = `!p-0 !rounded-lg !bg-gray-700 !text-gray-300 p-3 !shadow-none ${
              props.error
                ? '!border-red-500'
                : '!border-tertiary focus:!border-tertiary '
            }`;
            return className;
          },
          placeholder: () => 'text-sm !text-gray-300',
          multiValueLabel: () => '!text-white  ',
          multiValue: () =>
            '!text-red-500 !bg-gray-600  !rounded-full !border !border-tertiary !text-sm overflow-hidden',
          option: ({ isSelected, isFocused }) =>            
            `${
              isSelected
                ? '!bg-blue-400 !text-white'
                : isFocused
                ? '!text-tertiary'
                : '!text-tertiary'
            }`,
          noOptionsMessage: () => '',
        }}
      />
      {props.error && (
        <div className="text-red-500 text-sm mb-4">
          {props.error.toString()}
        </div>
      )}
    </div>
  );
};

export default SelectInput;

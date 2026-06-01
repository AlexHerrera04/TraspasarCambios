import { Input, Textarea } from '@material-tailwind/react';
import { ErrorMessage } from 'formik';
import React from 'react';

const TextInput = ({ isText = false, mb = '30px', ...props }: any) => {
  if (!isText)
    return (
      <div style={{ marginBottom: mb, width: '100%' }}>
        <Input
          {...props}
          onChange={props.onChange}
          onBlur={props.onBlur}
          value={props.value}
          error={!!props.error}
          success={props.success}
        />

        {props.error && (
          <div className="text-red-500 text-sm mb-4">
            {props.error.toString()}
          </div>
        )}
      </div>
    );
  else
    return (
      <div style={{ marginBottom: '30px', width: '100%' }}>
        <Textarea
          {...props}
          onChange={props.onChange}
          onBlur={props.onBlur}
          value={props.value}
          error={!!props.error}
          success={props.success}
        />
        {props.error && (
          <div className="text-red-500 text-sm mb-4">
            {props.error.toString()}
          </div>
        )}
      </div>
    );
};

export default TextInput;

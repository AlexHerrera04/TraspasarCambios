import * as React from 'react';
import get from 'lodash/get';
import { Field } from 'formik';
import OpinionScale from './';

type Props = {
  name: string;
  opinionScaleOptions: {
    labels: string[];
    range: number[];
  };
};

const FormikOpinionScaleField = ({ name, opinionScaleOptions }: Props) => {
  if (!opinionScaleOptions) return null;

  const [opinionScaleMinLabel, opinionScaleMaxLabel] =
    opinionScaleOptions.labels;

  const [minValue, maxValue] = opinionScaleOptions.range;

  return (
    <Field name={name}>
      {({ field, form }: any) => {
        const error =
          form.submitCount || get(form.touched, field.name)
            ? get(form.errors, field.name)
            : null;

        const handleChange = (scale: any) => {
          form.setFieldValue(name, {
            numberValue: scale,
          });
        };

        return (
          <div className="flex gap-2">
            <OpinionScale
              maxLabel={opinionScaleMaxLabel}
              minLabel={opinionScaleMinLabel}
              max={maxValue}
              min={minValue}
              readOnly={false}
              onChange={handleChange}
              value={field.value}
            />
            {error ? <span>{error}</span> : null}
          </div>
        );
      }}
    </Field>
  );
};

export default FormikOpinionScaleField;

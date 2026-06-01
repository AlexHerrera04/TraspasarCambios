import * as React from 'react';
import map from 'lodash/map';
import styled from 'styled-components';
import Button from '../Button';
import Theme from '../theme';

export type OpinionScaleProps = {
  max: number;
  maxLabel?: string;
  min?: number;
  minLabel?: string;
  onChange: (numberValue: number) => void;
  readOnly?: boolean;
  requireComment?: boolean;
  step?: number;
  value: {
    numberValue: number;
  };
  vertical?: boolean;
};

const OptionsCommentContainer = styled.div`
  width: 100%;

  * > * {
    color: ${Theme.color.label};
  }
`;

interface OptionsContainerProps {
  $vertical?: boolean;
}

const OptionsContainer = styled.div<OptionsContainerProps>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: ${({ $vertical }: any) => ($vertical ? 'column' : 'row')};

  > button {
    margin: 0.3rem ${({ $vertical }: any) => ($vertical ? '0' : '0.5rem')};
  }

  & > :first-child {
    margin-left: 0;
  }

  & > :last-child {
    margin-right: 0;
  }
`;

interface OptionProps {
  $selected?: boolean;
  $vertical?: boolean;
}

const Option = styled.div<OptionProps>`
  border: 1px solid rgba(255, 255, 255, 0.06);
  background-color: ${({ $selected }) =>
    $selected ? '#916EFF' : 'transparent'};
  border-radius: 12px;
  min-width: ${({ $vertical }) => ($vertical ? 'unset' : '40px')};
  padding: 0.5rem;
  width: 100%;
  text-align: center;
  font-weight: 600;
  color: ${({ $selected }) =>
    $selected ? 'white' : 'rgba(255, 255, 255, 0.60)'};
  cursor: pointer;
  margin: 10px;

  &:hover {
    background-color: ${({ $selected }) =>
      $selected ? '#916EFF' : ' rgba(255, 255, 255, 0.04)'};
    color: #fff;
  }
`;

const LabelContainer = styled.div`
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  margin-top: unset;
`;

const Min = styled.span`
  color: white;
  font-size: inherit;
  margin-right: 0.75em;
`;

const Max = styled(Min)`
  margin-left: 0.75em;
  margin-right: 0;
`;

type OptionsProps = {
  min: number;
  max: number;
  step: number;
  labels: {
    minLabel: string;
    maxLabel: string;
  };
};

const optionsWithLabels = (options: any, labels: any) => {
  if (labels.minLabel) {
    options[0].title = `${options[0].value} - ${labels.minLabel}`;
  }

  if (labels.maxLabel) {
    const lastOptionIndex = options.length - 1;

    options[
      lastOptionIndex
    ].title = `${options[lastOptionIndex].value} - ${labels.maxLabel}`;
  }

  return options;
};

function getValues({ min, max, step, labels }: any) {
  const values = [];

  if (max > 10) max = 10;
  if (min > 1) min = 1;

  let count = min;
  while (count <= max) {
    values.push({
      title: count,
      value: count,
    });

    count += step;
  }

  if (labels) {
    return optionsWithLabels(values, labels);
  }

  return values;
}

const OpinionScale = ({
  max,
  maxLabel,
  min = 0,
  minLabel,
  onChange,
  readOnly = false,
  step = 1,
  value,
  vertical,
}: OpinionScaleProps) => {
  const [scale, setScale] = React.useState(value?.numberValue);

  const displayLabels = !vertical && (minLabel || maxLabel);

  const options = React.useMemo(
    () =>
      getValues({
        min,
        max,
        step,
        labels: vertical
          ? {
              minLabel,
              maxLabel,
            }
          : null,
      }),
    [min, max, step]
  );

  React.useEffect(() => {
    if (scale != null) {
      // Only fire onchange if scale is not null/undefined (so comment does not get set)
      onChange(scale);
    }
  }, [scale]);

  const onChangeOpinionScale = (value: any) => {
    setScale(value);
  };
  return (
    <div className="flex w-full">
      <OptionsCommentContainer>
        <OptionsContainer $vertical={vertical}>
          {map(options, (scaleOption) => (
            <Option
              key={scaleOption.value}
              onClick={() => onChangeOpinionScale(scaleOption.value)}
              $selected={scale === scaleOption.value}
              $vertical={vertical}
            >
              {scaleOption.title}
            </Option>
          ))}
        </OptionsContainer>
        {displayLabels && (
          <LabelContainer>
            <Min>{minLabel}</Min>
            <Max>{maxLabel}</Max>
          </LabelContainer>
        )}
      </OptionsCommentContainer>
    </div>
  );
};

export default OpinionScale;

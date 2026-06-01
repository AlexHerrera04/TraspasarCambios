import React, { ReactElement, useState } from 'react';
import { Form, Formik } from 'formik';
import Button from '../Button';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@material-tailwind/react';
import styled from 'styled-components';
import classNames from 'classnames';

const StepContainer = styled.div``;

const Wizard = ({ children, initialValues, onSubmit, isSubmitting }: any) => {
  const [stepNumber, setStepNumber] = useState(0);
  const steps = React.Children.toArray(children) as ReactElement[];
  const [snapshot, setSnapshot] = useState(initialValues);
  const navigate = useNavigate();

  const step = steps[stepNumber];
  const totalSteps = steps.length;
  const isLastStep = stepNumber === totalSteps - 1;

  const next = (values: any) => {
    setSnapshot(values);
    setStepNumber(Math.min(stepNumber + 1, totalSteps - 1));
  };

  const previous = (values: any) => {
    setSnapshot(values);
    setStepNumber(Math.max(stepNumber - 1, 0));
  };

  const handleSubmit = async (values: any, bag: any) => {
    if (step.props.onSubmit) {
      await step.props.onSubmit(values, bag);
    }
    if (isLastStep) {
      return onSubmit(values, bag);
    } else {
      bag.setTouched({});
      next(values);
    }
  };

  return (
    <Formik initialValues={snapshot} onSubmit={handleSubmit}>
      {(formik) => (
        <>
          <div className="">
            {/*<div className="flex justify-center text-6xl border-2 border-gray-300 rounded-xl p-6 bg-gray-100 col-span-1">
              <p className="text-label-alt">
              </p>
      </div>*/}
            <div className="flex justify-center mx-8 mb-8">
              <span className="rounded-full bg-white/5 px-8 py-4">
                {stepNumber + 1} of {totalSteps}
              </span>
            </div>
            <StepContainer className="flex justify-center rounded-xl p-14 bg-white/5">
              <Form className="w-full p-6 text-label-alt">{step}</Form>
            </StepContainer>
          </div>
          <div className="w-full p-6 flex flex-col">
            <div className="flex w-full gap-6 md:justify-between">
              <div>
                {stepNumber == 0 && (
                  <Button outline onClick={() => navigate('/diagnosticador')}>
                    Back
                  </Button>
                )}
                {stepNumber > 0 && (
                  <Button outline onClick={() => previous(formik.values)}>
                    Back
                  </Button>
                )}
              </div>
              <div>
                <Button
                  disabled={isSubmitting && formik.isValid}
                  primary
                  onClick={() =>
                    isLastStep ? formik.submitForm() : next(formik.values)
                  }
                >
                  {!isLastStep ? (
                    'Next'
                  ) : !isSubmitting ? (
                    'Submit'
                  ) : (
                    <>
                      <Spinner className="mr-3"></Spinner> Submitting
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Formik>
  );
};

const WizardStep = ({ children }: any) => children;

export { Wizard, WizardStep };

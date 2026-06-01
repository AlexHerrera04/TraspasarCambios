import * as React from 'react';
import styled, { css } from 'styled-components';
import { darken } from 'polished';

import { propsToColor, propsToBackgroundColor } from '../utils';

import Theme from '../theme';

import { ButtonVariants, type ButtonProps as Props } from './types';

const hoverColor = (color: string) => darken(0.12, color);

const Content = styled.div`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  position: relative;

  & > :not(:first-child) {
    margin-left: ${Theme.spacing.xsmall};
  }

  svg {
    display: block;
  }
`;

const DefaultHoverStyle = css`
  background-color: ${Theme.color.hover};
  border-color: ${Theme.color.primary};
  color: ${Theme.color.primary};
`;

const ActiveStyle = css`
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.2);
  position: relative;
  top: 1px;
`;

const OutlineStyle = css`
  background-color: transparent;
  border-color: ${(props: any) =>
    props.variant === ButtonVariants.DEFAULT
      ? Theme.color.border
      : propsToColor};

  &,
  &:hover,
  &:focus,
  &:active {
    color: ${propsToColor};
  }

  &:hover:not([disabled]) {
    ${(props: any) =>
      props.variant === ButtonVariants.DEFAULT
        ? css`
            color: ${Theme.color.black};
            background: ${Theme.color.brandPurpleDark};
            border-color: ${Theme.color.black2};
            div {
              color: ${Theme.color.black2};
            }
          `
        : css`
            border-color: ${Theme.color.brandPurpleExtraLight};
            background: ${Theme.color.brandPurpleDark};
          `}
  }

  &:active:not([disabled]) {
    ${ActiveStyle}
  }
`;

const PlainStyle = css`
  background-color: transparent;
  border-color: transparent;
  height: auto;
  padding: 0;

  &,
  &:hover,
  &:focus,
  &:active {
    outline: 0;
    color: ${(props: any) =>
      props.danger ? Theme.color.danger : Theme.color.primary};
  }

  &:hover:not([disabled]) {
    color: ${(props: any) =>
      hoverColor(props.danger ? Theme.color.danger : Theme.color.primary)};
  }

  ${/* sc-sel */ Content}:after {
    background-color: ${Theme.color.focusBackground};
    border-radius: 3px;
    bottom: -2px;
    content: '';
    display: block;
    left: -4px;
    position: absolute;
    right: -4px;
    top: -2px;
    opacity: 0;
    transition: all 0.2s linear;
  }

  &:focus {
    ${/* sc-sel */ Content}:after {
      opacity: 1;
    }
  }
`;

const DefaultStyle = css`
  background-color: ${Theme.color.white};
  border-color: ${Theme.color.border};

  &,
  &:hover,
  &:focus,
  &:active {
    color: ${Theme.color.text};
  }

  &:hover:not([disabled]) {
    ${DefaultHoverStyle}
  }

  &:active:not([disabled]) {
    ${ActiveStyle}
  }
`;

const SecondaryStyle = css`
  background-color: ${Theme.color.white};
  border-color: ${Theme.color.border};
  padding: 24px;

  div {
    color: ${Theme.color.text};
    font-weight: 700;
    font-size: 18px;
  }

  &,
  &:hover,
  &:focus,
  &:active {
    color: ${Theme.color.text};
  }

  &:hover:not([disabled]) {
    ${DefaultHoverStyle}
  }

  &:active:not([disabled]) {
    ${ActiveStyle}
  }
`;

const VariantStyle = css`
  background-color: ${propsToColor};
  border-color: ${propsToColor};

  &,
  &:hover,
  &:focus,
  &:active {
    color: ${Theme.color.white};
  }

  &:hover:not([disabled]) {
    background-color: ${(props: any) => hoverColor(propsToColor(props))};
  }

  &:active:not([disabled]) {
    ${ActiveStyle}
  }
`;

const propsToStyle = (props: Props) => {
  if (props.active) {
    return DefaultHoverStyle;
  }
  if (props.plain) {
    return PlainStyle;
  }
  if (props.outline) {
    return OutlineStyle;
  }
  if (props.variant === ButtonVariants.DEFAULT) {
    return DefaultStyle;
  }
  if (props.variant === ButtonVariants.SECONDARY) {
    return SecondaryStyle;
  }

  return VariantStyle;
};

export const StyledButton = styled.button<any>`
  align-items: center;
  border-radius: ${Theme.borderRadius.large};
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  display: inline-flex;
  font-family: ${Theme.fonts.headings};
  font-size: ${Theme.fontSize.small};
  height: 2.5rem;
  justify-content: center;
  padding: 0 ${Theme.spacing.small};
  position: relative;
  transition: all 0.2s linear;
  white-space: nowrap;

  ${propsToStyle}

  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  &[disabled] {
    cursor: not-allowed;
    opacity: ${Theme.opacity.disabled};
    pointer-events: none;
  }

  &,
  &:hover,
  &:focus,
  &:active {
    text-decoration: none;
  }

  div {
    font-weight: ${Theme.fontWeight.strong};
  }
`;

function propsToVariant(props: Props): any {
  if (props.danger) {
    return ButtonVariants.DANGER;
  }
  if (props.primary) {
    return ButtonVariants.PRIMARY;
  }
  if (props.variant) {
    return props.variant;
  }

  return ButtonVariants.DEFAULT;
}

const Chevron = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className="ml-1"
  >
    <path
      d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"
      fill="currentColor"
    />
  </svg>
);

export default function Button(props: Props): React.ReactElement {
  const {
    as: Component = 'button',
    children,
    disabled,
    loading,
    type,
    outline,
    primary,
  } = props;

  const defaultType =
    Component === 'button' // `type` defaults to `button` but only when rendering <button>
      ? 'button'
      : undefined;

  return (
    <StyledButton
      {...props}
      // Prevent outline from reaching html element and throwing an error
      outline={outline ? 'true' : null}
      primary={primary ? 'true' : null}
      as={Component}
      disabled={loading ? true : disabled}
      type={type ?? defaultType}
      variant={propsToVariant(props)}
      className={props.className}
    >
      <Content>
        {children} {props.chevron && <Chevron />}
      </Content>
    </StyledButton>
  );
}

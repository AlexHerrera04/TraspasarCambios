import * as React from 'react';

import { Variants } from '../variants';

export const ButtonVariants = {
  DANGER: Variants.DANGER,
  DEFAULT: Variants.DEFAULT,
  PRIMARY: Variants.PRIMARY,
  SECONDARY: Variants.SECONDARY
};

export type ButtonVariant = Lowercase<keyof typeof ButtonVariants>;

export type ButtonProps = {
  /** Set `as="a"` when a button needs to be a link.  Then you can pass `href="https://google.com"` as you would on an `<a>` tag. */
  as?: React.ElementType;
  /** The button text.  Example: "Click Me!" */
  children: React.ReactNode;
  /** Use to add additional styles to the button. */
  active?: boolean;
  /** Use danger buttons for actions that have potential negative consequences. */
  danger?: boolean;
  /** Disable the button to convey to the user an action cannot be taken. */
  disabled?: boolean;
  /** Makes the button expand to the full width of it's parent container. */
  fullWidth?: boolean;
  /** Adds a loading icon to convey to the user that their action was received and is awaiting a server response. */
  loading?: boolean;
  /** The action the button will perform on touch. */
  onClick?: Function;
  /** Displays the button with no background color and just a border outline.  Use to reduce the emphasis of an action. */
  outline?: boolean;
  /** Displays the button as a plain style */
  plain?: boolean;
  /** Displays the button as a primary action the user should take.  Use to convey to the user the next immediate action they should take. */
  primary?: boolean;
  /** Use `reset` to reset the form data.  Use `submit` as a way to submit form data to the server. */
  type?: 'button' | 'reset' | 'submit';
  /** Use to overwrite styles. */
  style?: any;
  /** Allows you to specify the styling variants, such as `primary`, `outline` etc.  */
  variant?: ButtonVariant;
  /** Use to pass a value to the button. */
  value?: string | number;
  /**Add cehvron to button**/
  chevron?: boolean;
  className?: string;
  size?: string;
};

export const Variants = {
  DANGER: 'danger',
  DEFAULT: 'default',
  MUTED: 'muted',
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  SECONDARY: 'secondary'
};

export default Variants;

export type Variant = keyof typeof Variants;

/**
 * Support 2 different syntaxes for convenience:
 * <Component danger />                      // for setting variant statically
 * <Component variant={Variants.DANGER} />   // easier for setting dynamically
 */

export type VariantProps = {
  danger?: boolean;
  info?: boolean;
  muted?: boolean;
  success?: boolean;
  warning?: boolean;
  secondary?: boolean;
  variant?: Variant;
};

import Theme from '../theme';
import { Variants } from '../variants';

export const Colors = {
  [Variants.DANGER]: Theme.color.danger,
  [Variants.DEFAULT]: Theme.color.text,
  [Variants.MUTED]: Theme.color.mutedText,
  [Variants.PRIMARY]: Theme.color.primary,
  [Variants.SUCCESS]: Theme.color.success,
  [Variants.WARNING]: Theme.color.warning,
};

export const ColorsLight = {
  [Variants.DANGER]: Theme.color.dangerLight,
  [Variants.DEFAULT]: Theme.color.background,
  [Variants.MUTED]: Theme.color.background,
  [Variants.PRIMARY]: Theme.color.primaryLight,
  [Variants.SUCCESS]: Theme.color.successLight,
  [Variants.WARNING]: Theme.color.warningLight,
};

export function variantToColor(variant: keyof typeof Variants): string {
  return Colors[variant || Variants.DEFAULT];
}

export default function propsToColor(props: any, extraProps?: any): string {
  const { danger, info, muted, success, variant, warning } = props;
  const { light } = extraProps || {};

  let colorVariant = variant;

  if (danger) {
    colorVariant = Variants.DANGER;
  } else if (warning) {
    colorVariant = Variants.WARNING;
  } else if (info) {
    colorVariant = Variants.PRIMARY;
  } else if (success) {
    colorVariant = Variants.SUCCESS;
  } else if (muted) {
    colorVariant = Variants.MUTED;
  }

  if (light) {
    return ColorsLight[colorVariant || Variants.DEFAULT];
  }

  return Colors[colorVariant || Variants.DEFAULT];
}

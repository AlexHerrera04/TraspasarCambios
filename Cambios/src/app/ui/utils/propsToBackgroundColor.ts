import Theme from '../theme';
import { Variants } from '../variants';
import type { VariantProps } from '../variants';

const BackgroundColors = {
  [Variants.DANGER]: Theme.color.dangerLight,
  [Variants.DEFAULT]: Theme.color.brandPurpleLight,
  [Variants.MUTED]: Theme.color.background,
  [Variants.PRIMARY]: Theme.color.brandPurpleLight,
  [Variants.SUCCESS]: Theme.color.successLight,
  [Variants.WARNING]: Theme.color.warningLight,
  [Variants.SECONDARY]: Theme.color.white
};

export default function propsToBackgroundColor({
  danger,
  info,
  muted,
  success,
  variant,
  warning,
  secondary
}: VariantProps): string {
  let colorVariant: any = variant;

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
  } else if (secondary) {
    colorVariant = Variants.SECONDARY
  }

  return BackgroundColors[colorVariant ?? 'DEFAULT'];
}

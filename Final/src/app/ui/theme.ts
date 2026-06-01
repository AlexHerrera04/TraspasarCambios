import { transparentize } from 'polished';

// WARNINGS:
// - DO NOT add new colors
// - Prefer to use use themeColors instead of colorTokens
const colorTokens = Object.freeze({
  white: '#FFF',
  black: '#000',
  black2: '#212121',
  grey1: '#62646A',
  grey2: '#909198',
  grey3: '#ACAFB2',
  grey4: '#475467',
  grey5: '#EFF1F4',
  grey6: '#F8F8F8',

  wikiLabelGrey: '#575757',

  brand: '#916EFF',
  brandGreenLight: '#A6E9CC',
  brandGreenExtraLight: '#F5FFFA',

  brandHunterGreen: '#51A580',
  brandHunterGreenLight: '#C2E0D3',
  brandHunterGreenExtraLight: '#EEF6F3',

  brandTeal: '#00B7C2',
  brandTealLight: '#A6E6EA',
  brandTealExtraLight: '#E6F8F9',

  brandOliveGreen: '#97C05C',
  brandOliveGreenLight: '#DBE9C6',
  brandOliveGreenExtraLight: '#F5F9EF',

  brandBlue: '#56A2F7',
  brandBlueLight: '#C4DFFC',
  brandBlueExtraLight: '#EFF6FF',

  brandNavyBlue: '#0D56D9',
  brandNavyBlueLight: '#8CAAE6',
  brandNavyBlueExtraLight: '#E8EFFB',


  brandPurpleDark: '#3A2C66',
  brandPurple: '#7458CC',
  brandPurpleLight: '#916EFF',
  brandPurpleExtraLight: '#916EFF',

  brandRed: '#EF4A5D',
  brandRedLight: '#FAC0C7',
  brandRedExtraLight: '#FEEDEF',

  brandPink: '#F5539E',
  brandPinkLight: '#FCC3DD',
  brandPinkExtraLight: '#FEEEF6',

  brandOrange: '#F9A72D',
  brandOrangeLight: '#FDE0B6',
  brandOrangeExtraLight: '#FDF9F1',

  brandYellow: '#F2DB27',
  brandYellowLight: '#FBF3B4',
  brandYellowExtraLight: '#FEFCEA',

  brandBrown: '#AC7F6D',
  brandBrownLight: '#E2D2CC',
  brandBrownExtraLight: '#F7F3F1',

  brandBurgundy: '#5D2E46',
  brandBurgundyExtraLight: '#EFEBED',
  brandBurgundyLight: '#CFC1C8',

  brandSteelBlue: '#6F97AE',
  brandSteelBlueLight: '#CDDBE3',
  brandSteelBlueExtraLight: '#F1F5F7',

  brandDenimBlue: '#7789AB',
  brandDenimBlueLight: '#D0D6E2',
  brandDenimBlueExtraLight: '#F2F4F7',

  yellow: '#FCC01E',
  brightYellowIconColor: '#C8B82C',
  blue: '#0000FF',
});

const themeColors = Object.freeze({
  //text
  text: colorTokens.black2,
  mutedText: colorTokens.grey2,
  label: colorTokens.wikiLabelGrey,

  //variants
  info: colorTokens.brandNavyBlue,
  primary: colorTokens.brandPurple,
  primaryBorder: colorTokens.brandPurpleLight,
  primaryLight: colorTokens.brandPurpleExtraLight,

  warning: colorTokens.brandOrange,
  warningBorder: colorTokens.brandOrangeLight,
  warningLight: colorTokens.brandYellowExtraLight,

  success: colorTokens.brand,
  successBorder: colorTokens.brandGreenLight,
  successLight: colorTokens.brandGreenExtraLight,

  danger: colorTokens.brandRed,
  dangerBorder: colorTokens.brandRedLight,
  dangerLight: colorTokens.brandRedExtraLight,

  //backgrounds
  subtleBackground: colorTokens.grey6,
  background: colorTokens.grey5,
  hover: colorTokens.brandBlueExtraLight,
  focusBackground: transparentize(0.95, colorTokens.black2),
  skeleton: transparentize(0.95, colorTokens.black2),

  //borders
  border: colorTokens.grey4,
  mutedBorder: colorTokens.grey4,
  boxshadow: transparentize(92, colorTokens.grey4),
  subtleBorder: colorTokens.grey5,
  hoverBorder: colorTokens.brandBlueLight,
});

const Theme = Object.freeze({
  borderRadius: {
    /** @property 1.75rem - 28px */
    large: '0.5rem',
    /** @property 0.5rem - 8px */
    regular: '0.5rem',
    /** @property 0.25rem - 4px */
    compact: '0.5rem',
  },
  color: {
    ...colorTokens,
    ...themeColors,
  },
  fontSize: {
    /** @property inherit */
    default: 'inherit',
    /** @property 16px */
    desktop: '16px',
    /** @property 3rem - 48px */
    h1: '3rem',
    /** @property 2.5rem - 40px */
    h2: '2.5rem',
    /** @property 2rem - 32px */
    h3: '2rem',
    /** @property 1.75rem - 28px */
    h4: '1.75rem',
    /** @property 1.5rem - 24px */
    h5: '1.5rem',
    /** @property 1.25rem - 20px */
    h6: '1.25rem',
    /** @property 1.125rem - 18px */
    large: '1.125rem',
    /** @property 1rem - 16px */
    regular: '1rem',
    /** @property 0.875rem - 14px */
    small: '0.875rem',
    /** @property 0.75rem - 12px */
    xsmall: '0.75rem',
    /** @deprecated @property 0.75rem */
    xs: '0.75rem',
    /** @deprecated @property 0.875rem */
    sm: '0.875rem',
    /** @deprecated @property 1.125rem */
    lg: '1.125rem',
  },
  fontWeight: {
    /** @property 600 */
    strong: 600,
    /** @property 500 */
    medium: 500,
    /** @property 400 - default */
    regular: 400,
    /** @property 300 */
    light: 300,
  },
  fonts: {
    /** @property 'proxima-nova, sans-serif' */
    normal: 'proxima-nova, sans-serif',
    /** @property 'proxima-nova, sans-serif' */
    headings: 'proxima-nova, sans-serif',
  },
  inputWidth: {
    /** @property 350px */
    desktop: '350px',
    /** @property 310px */
    mobile: '310px',
  },
  opacity: {
    /** @property 1.0 */
    normal: '1.0',
    /** @property 1.5 */
    disabled: '0.5',
  },
  spacing: {
    /** @property 1.5rem - 24px */
    regular: '1.5rem',
    /** @property 1rem - 16px */
    small: '1rem',
    /** @property 0.5rem - 8px */
    xsmall: '0.5rem',
    /** @property 0.25rem - 4px */
    xxsmall: '0.25rem',
    /** @property 3rem - 48px */
    large: '3rem',
    /** @property 6rem - 96px */
    xlarge: '6rem',
    /** @property 1rem - 16px @deprecated */
    compact: '1rem',
    /** @property 0.5rem - 8px @deprecated */
    short: '0.5rem',
    /** @property 0.25rem - 5px @deprecated */
    tiny: '0.25rem',
  },
  iconSize: {
    /** @property 1rem - 10px */
    xsmall: '0.5rem',
    /** @property 1rem - 16px */
    small: '1rem',
    /** @property 1rem - 32px */
    regular: '2rem',
    /** @property 1rem - 96px */
    large: '6rem',
  },
});

export default Theme;

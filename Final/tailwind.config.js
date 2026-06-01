const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

const withMT = require('@material-tailwind/react/utils/withMT');

module.exports = withMT({
  darkMode: 'class',
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    join(
      __dirname,
      '/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}'
    ),
    join(
      __dirname,
      '@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
    },
    colors: {
      label: {
        100: '#ADADAD',
        alt: '#575757',
      },
      light: {
        100: '#FDFDFC',
        200: '#FCFBFA',
        300: '#F6F5F4',
        400: '#EEEDEB',
        500: '#E4E2E0',
        600: '#C4B2A3',
        700: '#A48570',
        800: '#845C47',
        900: '#6D3E2B',
      },
      dark: {
        100: '#D0D1D0',
        200: '#B0B2B2',
        300: '#919393',
        400: '#717374',
        500: '#323436',
        600: '#222222',
        700: '#111114',
        800: '#0F0E11',
        900: '#0D0C0F',
      },
      gray: {
        25: '#FCFCFD',
        56: '#F9FAFB',
        100: '#F2F4F7',
        200: '#EAECF0',
        300: '#D0D5DD',
        400: '#98A2B3',
        500: '#667085',
        600: '#475467',
        700: '#344054',
        800: '#1D2939',
        900: '#101828',
      },
      primary: {
        100: '#F4F1FF',
        200: '#E9E2FF',
        300: '#D3C5FF',
        400: '#BDA8FF',
        500: '#A78BFF',
        600: '#916EFF',
        700: '#7458CC',
        800: '#574299',
        900: '#3A2C66',
      },
      secondary: {
        100: '#DAFFE8',
        200: '#B5FFD9',
        300: '#91FFD0',
        400: '#75FFD2',
        500: '#48FFD5',
        600: '#34DBC5',
        700: '#24B7B2',
        800: '#168C93',
        900: '#0D697A',
      },
      info: {
        100: '#E1E5FE',
        200: '#C4CAFE',
        300: '#A6AEFC',
        400: '#8F99FA',
        500: '#6A76F7',
        600: '#4D57D4',
        700: '#353DB1',
        800: '#21288F',
        900: '#141976',
      },
      tertiary: '#475467',
      active: '#BDA8FF',
      surface: '#101828',
      success: {
        100: '#E8FBD8',
        200: '#CDF7B2',
        300: '#A6E886',
        400: '#7ED263',
        500: '#4BB536',
        600: '#319B27',
        700: '#1C821B',
        800: '#116816',
        900: '#0A5615',
      },
      warning: {
        100: '#FEFBCE',
        200: '#FDF79D',
        300: '#FAF06C',
        400: '#F5E848',
        500: '#EFDC0E',
        600: '#CDBB0A',
        700: '#AC9B07',
        800: '#8A7B04',
        900: '#726502',
      },
      danger: {
        100: '#FFEBDA',
        200: '#FFD1B6',
        300: '#FFB191',
        400: '#FF9376',
        500: '#FF6249',
        600: '#DB3F35',
        700: '#B72427',
        800: '#931723',
        900: '#7A0E21',
      },
    },
    extend: {
      visibility: ['group-hover'],
      gridTemplateColumns: {
        sidebar: '300px auto',
        'sidebar-collapsed': '64px auto',
      },
    },
  },
  plugins: [],
});

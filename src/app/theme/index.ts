import { createTheme, responsiveFontSizes } from '@material-ui/core/styles'

import props from './props'
import overrides from './overrides'

const theme = createTheme({
  palette: {
    type: 'dark',
    primary: { main: '#444' },
    secondary: { main: '#424242' },
    background: {
      paper: 'rgb(37, 37, 37)',
      default: 'rgb(30, 30, 30)',
      activityBar: 'rgb(51, 51, 51)',
      titleBar: 'rgb(50, 50, 50)',
      sidebar: 'rgb(37, 37, 37)',
    },
    common: {
      black: 'rgb(30,30,30)',
      white: 'rgb(204,204,204)',
    },
    action: {
      hover: 'rgba(255, 255, 255, 0.1)',
    },
  },
  bgPixel: {
    backgroundColor: '#fff',
    backgroundImage: `
    linear-gradient(45deg, #ccc 25%, transparent 0, transparent 75%, #ccc 0),
    linear-gradient(45deg, #ccc 25%, transparent 0, transparent 75%, #ccc 0)`,
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 4px 4px',
    backgroundRepeat: 'repeat',
  },
  spacing: 4,
  typography: { fontSize: 13 },
  transitions: {
    create: () => 'none',
  },
  shape: { borderRadius: 0 },
  props,
  overrides,
})

export default responsiveFontSizes(theme)

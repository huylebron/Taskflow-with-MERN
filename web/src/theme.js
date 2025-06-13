import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'

// Create a theme instance.
const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  typography: {
    fontFamily: [
      'Inter',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    h4: {
      fontWeight: 600
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    },
    body1: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      lineHeight: 1.4
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.02em'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.03em'
    }
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0079bf',
          light: '#4fc3f7',
          dark: '#005a8b',
          contrastText: '#ffffff'
        },
        secondary: {
          main: '#6c757d',
          light: '#adb5bd',
          dark: '#495057',
          contrastText: '#ffffff'
        },
        success: {
          main: '#28a745',
          light: '#5cb85c',
          dark: '#1e7e34',
          contrastText: '#ffffff'
        },
        warning: {
          main: '#ffc107',
          light: '#ffeb3b',
          dark: '#f57c00',
          contrastText: '#000000'
        },
        error: {
          main: '#dc3545',
          light: '#f8d7da',
          dark: '#c82333',
          contrastText: '#ffffff'
        },
        text: {
          primary: 'rgba(0, 0, 0, 0.87)',
          secondary: 'rgba(0, 0, 0, 0.6)',
          disabled: 'rgba(0, 0, 0, 0.38)'
        },
        background: {
          default: '#fafafa',
          paper: '#ffffff'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#90caf9',
          light: '#bbdefb',
          dark: '#42a5f5',
          contrastText: '#000000'
        },
        secondary: {
          main: '#adb5bd',
          light: '#ced4da',
          dark: '#6c757d',
          contrastText: '#000000'
        },
        success: {
          main: '#4caf50',
          light: '#81c784',
          dark: '#388e3c',
          contrastText: '#000000'
        },
        warning: {
          main: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
          contrastText: '#000000'
        },
        error: {
          main: '#f44336',
          light: '#ef5350',
          dark: '#d32f2f',
          contrastText: '#ffffff'
        },
        text: {
          primary: 'rgba(255, 255, 255, 0.87)',
          secondary: 'rgba(255, 255, 255, 0.6)',
          disabled: 'rgba(255, 255, 255, 0.38)'
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e'
        }
      }
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@import': [
          'url(https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap)'
        ],
        body: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#dcdde1',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'white'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderWidth: '1px',
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '8px 16px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { 
            borderWidth: '1px',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)'
          },
          '&:active': {
            transform: 'translateY(0px)'
          }
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: 'rgba(0, 121, 191, 0.04)'
          }
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(0, 121, 191, 0.04)'
          }
        },
        startIcon: {
          marginRight: '6px'
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { 
          fontSize: '0.875rem',
          fontWeight: 500
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-body1': { 
            fontSize: '0.875rem',
            lineHeight: 1.5
          },
          '&.MuiTypography-body2': { 
            fontSize: '0.8125rem',
            lineHeight: 1.4
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: '8px',
          '& fieldset': { 
            borderWidth: '1.5px !important',
            borderColor: 'rgba(0, 0, 0, 0.23)'
          },
          '&:hover fieldset': { 
            borderWidth: '1.5px !important',
            borderColor: 'rgba(0, 0, 0, 0.4)'
          },
          '&.Mui-focused fieldset': { 
            borderWidth: '2px !important'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': {
            paddingBottom: '16px'
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: '6px',
          padding: '8px 12px'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '0.75rem'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }
      }
    }
  }
  // ...other properties
})

export default theme

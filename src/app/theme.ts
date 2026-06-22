'use client';

import { createTheme } from '@mui/material/styles';
import { UI } from './palette';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: UI.acc, dark: UI.accDark, light: UI.accText, contrastText: '#161616' },
    background: { default: UI.bg, paper: UI.surface },
    text: { primary: UI.text, secondary: UI.muted },
    divider: UI.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundColor: UI.surface, border: `1px solid ${UI.line}`, backgroundImage: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: UI.field },
      },
    },
  },
});

export default theme;

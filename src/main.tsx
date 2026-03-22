import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

import { ActionButton } from './index'

const theme = createTheme({
  direction: 'rtl',
  typography: {
    // Let the host app control fonts; this is only a fallback.
    fontFamily: 'system-ui, sans-serif'
  },
  palette: {
    mode: 'dark'
  }
})

function Playground() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          height: '100vh',
          width: '100vw',
          background:
            'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(96,165,250,0.12), transparent 45%), #061019',
          overflow: 'hidden'
        }}
      >
        <ActionButton
          yourRoleName="پزشک"
          playerNamesContent="علی، مریم، رضا"
          gameRoleNamesContent="پزشک، کارآگاه، پیش‌بین"
          onItemClick={(id) => {
            // eslint-disable-next-line no-console
            console.log('Menu item:', id)
          }}
        />
      </div>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>
)


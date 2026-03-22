import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'GodButtonActionButton',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'cjs' ? 'index.cjs' : 'index.js')
    },
    rollupOptions: {
      // Keep React/MUI external so the component can be installed in other apps.
      // Include JSX runtimes — if inlined, Rolldown embeds CJS that calls `require("react")` and breaks in browsers.
      external: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled'
      ]
    }
  }
})


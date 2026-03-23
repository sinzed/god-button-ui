import { Box } from '@mui/material'

import type { ActionButtonMenuItemId } from './types'

const iconSx = {
  width: 22,
  height: 22,
  flexShrink: 0,
  display: 'block',
  color: 'rgba(255,255,255,0.95)',
  opacity: 0.98
} as const

/**
 * Inline SVGs (no @mui/icons-material) so the package stays dependency-light.
 */
export function MenuItemIcon(props: { id: ActionButtonMenuItemId }) {
  const { id } = props

  switch (id) {
    case 'messages':
      return (
        <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={iconSx}>
          <path
            fill="currentColor"
            d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"
          />
        </Box>
      )
    case 'gameInfo':
      return (
        <Box
          component="svg"
          viewBox="0 0 24 24"
          aria-hidden
          sx={{ ...iconSx, color: '#fff', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.45))' }}
        >
          <path
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="8" r="1.3" fill="currentColor" />
          <path fill="currentColor" d="M11.1 10.5h1.8v6h-1.8z" />
        </Box>
      )
    case 'yourRole':
      return (
        <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={iconSx}>
          <path
            fill="currentColor"
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </Box>
      )
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}

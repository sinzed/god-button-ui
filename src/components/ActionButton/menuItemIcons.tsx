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
        <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={iconSx}>
          <path
            fill="currentColor"
            d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.5 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm5 8.5c0 2.49-2.01 4.5-4.5 4.5S5.5 18.99 5.5 16.5 7.51 12 10 12s4.5 2.01 4.5 4.5zm4.5-4.5c0 1.38-1.12 2.5-2.5 2.5S14 16.38 14 15s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5z"
          />
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

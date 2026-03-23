# god-button-action-button

Movable circular action button for mobile games (draggable) with an RTL “glass” menu built with MUI.

## Install

```bash
npm install god-button-action-button
```

## Requirements (peer dependencies)

This package expects the host app to provide:

- `react` (>= 18)
- `react-dom` (>= 18)
- `@mui/material` (>= 5)
- `@emotion/react` (>= 11)
- `@emotion/styled` (>= 11)

## Quick start

```tsx
import { ActionButton } from 'god-button-action-button'

export function GameUI() {
  return (
    <ActionButton
      yourRoleName="پزشک"
      onItemClick={(id) => {
        console.log(id) // "messages" | "gameInfo" | "yourRole"
      }}
    />
  )
}
```

For visual consistency (font + baseline) between your app and the component, wrap your app with your MUI theme and `CssBaseline`:

```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'IRANSansX, system-ui, sans-serif' // or your app font
  }
})

export function Root() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GameUI />
    </ThemeProvider>
  )
}
```

## What this component does

`ActionButton` renders a fixed-position draggable circle. It behaves like:

- Default state: bolt (action) icon
- Menu open: close icon
- “اطلاعات بازی” (game info) or “پیام ها” (messages) panel open: back icon
- Tapping back returns to the main 3-item menu

The menu opens toward the opposite side of the circle:

- circle is left of the screen center => menu expands to the right
- circle is right of the screen center => menu expands to the left

## Menu items

Three standalone menu buttons (top to bottom):

- `messages` — label: `پیام ها`
- `gameInfo` — label: `اطلاعات بازی`
- `yourRole` — label: `نقش شما {yourRoleName}` (default `yourRoleName` is `پزشک`)

Override any labels with the `labels` prop.

## Messages

If you pass `messages`, the component shows:

- An unread badge on the circle (based on message count since last “open”)
- A preview bubble for the latest message (for `messagePreviewDurationMs`, default `10000` ms)
- A scrollable “پیام ها” panel that lists messages newest-first

Message type:

```ts
{ id: string; body: string; at?: number } // `at` is a ms timestamp for display
```

## Game info panel

When “اطلاعات بازی” is opened, it renders a tall glass panel in the same anchored position and width as the menu stack (`menuWidth`).

You can customize:

- section headings with `gameInfoSectionLabels` (defaults: `نام بازیکنان`, `نام نقش های بازی`)
- section bodies with `playerNamesContent` and `gameRoleNamesContent`
- max panel height with `gameInfoPanelMaxHeight` (default `340`)

## Props (high level)

The full prop surface is typed in `ActionButtonProps` (`src/components/ActionButton/types.ts`), but these are the key ones:

- `yourRoleName?: string` (default `پزشک`)
- `onItemClick?: (id: 'messages' | 'gameInfo' | 'yourRole') => void`
- `messages?: ActionButtonMessage[]`
- `playerNamesContent?: React.ReactNode`
- `gameRoleNamesContent?: React.ReactNode`
- `labels?: Partial<Record<'messages' | 'gameInfo' | 'yourRole', string>>`
- `initialPosition?: { x: number; y: number }` (px from top-left)
- `homePosition?: { x: number; y: number }` (used after long-press snap-back)
- `menuWidth?: number` (px)
- `menuItemHeight?: number` (px)
- `menuGap?: number` (px)
- `gameInfoPanelMaxHeight?: number` (px)
- `messagePreviewDurationMs?: number`
- `accentGradient?: string` (CSS `background` for the circle)
- `menuSurfaceBackground?: string` (CSS `background` for the panels)

## RTL / accessibility notes

The component uses:

- `dir="rtl"` on its panels (and checks document direction to mirror the “back” arrow)
- `role="button"` and an `aria-label` on the draggable circle

If your app is not RTL, labels can still be customized, but the default UI text is Persian.

## Development

See:

- `DEVELOPMENT.md`
- `API.md`

## License

MIT

# API

Exports:

- `ActionButton` (React component)
- `DEFAULT_ACCENT_GRADIENT` (CSS `background` string)
- `DEFAULT_MENU_SURFACE_BACKGROUND` (CSS `background` string)
- Types:
  - `ActionButtonProps`
  - `ActionButtonMenuItemId` (`"messages" | "gameInfo" | "yourRole"`)
  - `ActionButtonMessage` (`{ id: string; body: string; at?: number }`)

## ActionButton

```tsx
import {
  ActionButton,
  DEFAULT_ACCENT_GRADIENT,
  DEFAULT_MENU_SURFACE_BACKGROUND,
} from 'god-button-action-button'
```

### Example: messages + preview

```tsx
import { ActionButton, type ActionButtonMessage } from 'god-button-action-button'

const messages: ActionButtonMessage[] = [
  { id: 'm1', body: 'سلام', at: Date.now() },
]

export function GameUI() {
  return (
    <ActionButton
      yourRoleName="پزشک"
      messages={messages}
      messagePreviewDurationMs={8000}
      onItemClick={(id) => console.log('clicked', id)}
      // Optional headings/contents:
      playerNamesContent="علی، مریم، رضا"
      gameRoleNamesContent="پزشک، کارآگاه، پیش‌بین"
    />
  )
}
```

### Custom labels

```tsx
<ActionButton
  labels={{
    messages: 'پیام ها',
    gameInfo: 'اطلاعات بازی',
    yourRole: 'نقش شما سرپرست',
  }}
/>;
```

## ActionButton constants

`DEFAULT_ACCENT_GRADIENT` and `DEFAULT_MENU_SURFACE_BACKGROUND` are provided so you can theme the component consistently across installs.


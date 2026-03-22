# god-button-action-button

Movable circular action button for mobile games (draggable) with an RTL glass, curved menu built with MUI.

## Install (after publishing)

```bash
npm i god-button-action-button
```

## Usage

```tsx
import { ActionButton } from 'god-button-action-button'

export function GameUI() {
  return (
    <ActionButton
      yourRoleName="پزشک"
      unreadEventsCount={3}
      onItemClick={(id) => {
        console.log(id)
      }}
    />
  )
}
```

## Menu items

Default Persian labels:

- `نقش شما: {yourRoleName}`
- `مشاهده ی نقش ها`
- `نام بازیکنان`
- `نتیجه ی استعلام ها`
- `رخداد ها` (shows a badge when `unreadEventsCount > 0`)

The menu opens to the side opposite the circle position:

- Circle on the left => menu expands to the right
- Circle on the right => menu expands to the left

## Development / playground

Run the local playground:

```bash
npm run dev
```

# god-button-ui

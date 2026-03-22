# god-button-action-button

Movable circular action button for mobile games (draggable) with an RTL menu of glass-style buttons built with MUI.

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
      onItemClick={(id) => {
        console.log(id)
      }}
    />
  )
}
```

## Menu items

Three standalone buttons (no outer panel). Default Persian labels:

- `اطلاعات بازی` (`gameInfo`)
- `پیام ها` (`messages`)
- `توانایی ها` (`abilities`)

Override copy with the `labels` prop if needed.

The menu opens to the side opposite the circle position:

- Circle on the left => menu expands to the right
- Circle on the right => menu expands to the left

## Development / playground

Run the local playground:

```bash
npm run dev
```

# god-button-ui

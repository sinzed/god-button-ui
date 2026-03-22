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
      yourRoleName="پزشک"
      onItemClick={(id) => {
        console.log(id)
      }}
    />
  )
}
```

## Menu items

Three standalone buttons (no outer panel), top to bottom:

- `پیام ها` (`messages`) — chat icon
- `اطلاعات بازی` (`gameInfo`) — game-controller icon
- `نقش شما {yourRoleName}` (`yourRole`) — person icon; default role is `پزشک` via `yourRoleName`

Override copy with the `labels` prop if needed.

With the **menu** open, the circle shows a **close** icon. With the **اطلاعات بازی** panel open, it shows a **back** icon; tapping returns to the main menu (the three buttons). Otherwise it shows the action (bolt) icon. Tapping «اطلاعات بازی» opens a **tall glass panel** in the **same position and width** as the menu stack (`menuWidth`), with **نام بازیکنان** and **نام نقش های بازی** inside (scrollable). Override headings with `gameInfoSectionLabels`, body with `playerNamesContent` / `gameRoleNamesContent`, and height cap with `gameInfoPanelMaxHeight` (default 340px).

The menu opens to the side opposite the circle position:

- Circle on the left => menu expands to the right
- Circle on the right => menu expands to the left

## Development / playground

Run the local playground:

```bash
npm run dev
```

# god-button-ui

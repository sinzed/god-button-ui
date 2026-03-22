import type React from 'react'

export type ActionButtonMenuItemId = 'messages' | 'gameInfo' | 'yourRole'

export type ActionButtonMenuItem = {
  id: ActionButtonMenuItemId
  label: string
}

export type ActionButtonProps = {
  /**
   * Role name shown in the bottom item: `نقش شما {yourRoleName}`.
   */
  yourRoleName?: string

  /**
   * Section headings inside the «اطلاعات بازی» panel (defaults: نام بازیکنان، نام نقش های بازی).
   */
  gameInfoSectionLabels?: {
    playerNames?: string
    roleNames?: string
  }

  /**
   * Body under «نام بازیکنان» in the game-info panel.
   */
  playerNamesContent?: React.ReactNode

  /**
   * Body under «نام نقش های بازی» in the game-info panel.
   */
  gameRoleNamesContent?: React.ReactNode

  /**
   * Called when a user taps a menu button.
   */
  onItemClick?: (id: ActionButtonMenuItemId) => void

  /**
   * Override default Persian labels.
   */
  labels?: Partial<Record<ActionButtonMenuItemId, string>>

  /**
   * Initial center position (px from top-left of the viewport).
   */
  initialPosition?: { x: number; y: number }

  /**
   * “Home” center position used when long-pressing the circle to snap back.
   * Defaults to the same value as `initialPosition`, or the built-in default (left side, ~30% from top).
   */
  homePosition?: { x: number; y: number }

  /**
   * Padding used when dragging to keep the circle inside the viewport.
   */
  dragBoundsPadding?: number

  /**
   * Circle diameter in px.
   */
  circleSize?: number

  /**
   * Menu button width in px.
   */
  menuWidth?: number

  /**
   * Menu button height in px.
   */
  menuItemHeight?: number

  /**
   * Vertical gap between menu buttons in px.
   */
  menuGap?: number

  /**
   * Max height of the «اطلاعات بازی» panel (same width as the menu). Taller than the button stack; content scrolls inside.
   */
  gameInfoPanelMaxHeight?: number

  /**
   * Optional CSS class applied to the root wrapper.
   */
  className?: string

  /**
   * Optional inline styles applied to the root wrapper.
   */
  style?: React.CSSProperties
}

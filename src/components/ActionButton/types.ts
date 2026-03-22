import type React from 'react'

export type ActionButtonMenuItemId = 'gameInfo' | 'messages' | 'abilities'

export type ActionButtonMenuItem = {
  id: ActionButtonMenuItemId
  label: string
}

export type ActionButtonProps = {
  /**
   * Called when a user taps a menu button.
   */
  onItemClick?: (id: ActionButtonMenuItemId) => void

  /**
   * Override default Persian labels (اطلاعات بازی، پیام ها، توانایی ها).
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
   * Optional CSS class applied to the root wrapper.
   */
  className?: string

  /**
   * Optional inline styles applied to the root wrapper.
   */
  style?: React.CSSProperties
}

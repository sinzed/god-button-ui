import type React from 'react'

export type ActionButtonMenuItemId =
  | 'yourRole'
  | 'viewRoles'
  | 'playerNames'
  | 'queryResults'
  | 'events'

export type ActionButtonMenuItem = {
  id: ActionButtonMenuItemId
  label: string
}

export type ActionButtonProps = {
  /**
   * Count of new notifications/events for the "رخداد ها" item.
   */
  unreadEventsCount?: number
  /**
   * Your role name shown in "نقش شما: {yourRoleName}".
   */
  yourRoleName?: string

  /**
   * Called when a user clicks a menu item.
   */
  onItemClick?: (id: ActionButtonMenuItemId) => void

  /**
   * Allows overriding the default Persian menu labels.
   */
  labels?: Partial<Record<ActionButtonMenuItemId, string>>

  /**
   * Initial center position (px from top-left of the viewport).
   */
  initialPosition?: { x: number; y: number }

  /**
   * Padding used when dragging to keep the circle inside the viewport.
   */
  dragBoundsPadding?: number

  /**
   * Circle diameter in px.
   */
  circleSize?: number

  /**
   * Menu width in px.
   */
  menuWidth?: number

  /**
   * Menu item height in px.
   */
  menuItemHeight?: number

  /**
   * Optional CSS class applied to the root wrapper.
   */
  className?: string

  /**
   * Optional inline styles applied to the root wrapper.
   */
  style?: React.CSSProperties
}


import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'

import type { ActionButtonMenuItemId, ActionButtonProps } from './types'

const MENU_ITEMS: ActionButtonMenuItemId[] = ['gameInfo', 'messages', 'abilities']

export function ActionButton(props: ActionButtonProps) {
  const {
    onItemClick,
    labels,
    initialPosition,
    homePosition: homePositionProp,
    dragBoundsPadding = 12,
    circleSize = 64,
    menuWidth = 230,
    menuItemHeight = 44,
    menuGap = 10,
    className,
    style
  } = props

  const iconGradientId = useId().replace(/:/g, '')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionStartRef = useRef({ x: 0, y: 0 })
  const pointerDownAtRef = useRef({ x: 0, y: 0, t: 0 })
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFiredRef = useRef(false)

  const defaultCenterPosition = () => {
    if (typeof window === 'undefined') {
      return { x: dragBoundsPadding + circleSize / 2, y: 0 }
    }
    // Default: left side, ~30% from top (center of the circle).
    return { x: dragBoundsPadding + circleSize / 2, y: window.innerHeight * 0.3 }
  }

  const resolvedHomePosition = useMemo(() => {
    if (homePositionProp) return { ...homePositionProp }
    if (initialPosition) return { ...initialPosition }
    if (typeof window === 'undefined') {
      return { x: dragBoundsPadding + circleSize / 2, y: 0 }
    }
    return { x: dragBoundsPadding + circleSize / 2, y: window.innerHeight * 0.3 }
  }, [homePositionProp, initialPosition, dragBoundsPadding, circleSize])

  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(() => {
    if (initialPosition) return { x: initialPosition.x, y: initialPosition.y }
    if (homePositionProp) return { x: homePositionProp.x, y: homePositionProp.y }
    return defaultCenterPosition()
  })

  // Menu expands toward the opposite side of the circle.
  const menuSide = useMemo<'left' | 'right'>(() => {
    if (typeof window === 'undefined') return 'right'
    return pos.x < window.innerWidth / 2 ? 'right' : 'left'
  }, [pos.x])

  const menuLabels = useMemo(() => {
    const base: Record<ActionButtonMenuItemId, string> = {
      gameInfo: 'اطلاعات بازی',
      messages: 'پیام ها',
      abilities: 'توانایی ها'
    }

    if (!labels) return base
    return { ...base, ...labels }
  }, [labels])

  const [menuCoords, setMenuCoords] = useState(() => {
    const gap = 10
    const y = pos.y - circleSize / 2
    const x = pos.x - menuWidth / 2
    return { x, y, gap }
  })

  const recomputeMenuCoords = () => {
    const gap = 10
    const yTopRaw = pos.y - circleSize / 2
    const xLeftRaw =
      menuSide === 'right' ? pos.x + circleSize / 2 + gap : pos.x - circleSize / 2 - gap - menuWidth

    // Keep menu stack inside the viewport (three buttons + gaps, no outer panel).
    const panelHeight = menuItemHeight * MENU_ITEMS.length + menuGap * (MENU_ITEMS.length - 1)
    const yTop = Math.min(Math.max(yTopRaw, dragBoundsPadding), window.innerHeight - dragBoundsPadding - panelHeight)
    const xLeft =
      menuSide === 'right'
        ? Math.min(Math.max(xLeftRaw, dragBoundsPadding), window.innerWidth - dragBoundsPadding - menuWidth)
        : Math.min(Math.max(xLeftRaw, dragBoundsPadding), window.innerWidth - dragBoundsPadding - menuWidth)

    setMenuCoords({ x: xLeft, y: yTop, gap })
  }

  useEffect(() => {
    recomputeMenuCoords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.x, pos.y, menuSide])

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return

    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el) return
      const target = e.target as Node | null
      if (target && el.contains(target)) return
      setOpen(false)
    }

    window.addEventListener('mousedown', onDown)
    window.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('touchstart', onDown)
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current != null) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }, [])

  const dragClamp = (next: { x: number; y: number }) => {
    const r = circleSize / 2
    const minX = dragBoundsPadding + r
    const maxX = window.innerWidth - dragBoundsPadding - r
    const minY = dragBoundsPadding + r
    const maxY = window.innerHeight - dragBoundsPadding - r
    return {
      x: Math.min(Math.max(next.x, minX), maxX),
      y: Math.min(Math.max(next.y, minY), maxY)
    }
  }

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const LONG_PRESS_MS = 500

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return
    pointerIdRef.current = e.pointerId
    draggingRef.current = false
    longPressFiredRef.current = false

    dragStartRef.current = { x: e.clientX, y: e.clientY }
    positionStartRef.current = pos
    pointerDownAtRef.current = { x: e.clientX, y: e.clientY, t: Date.now() }

    clearLongPressTimer()
    longPressTimerRef.current = setTimeout(() => {
      if (draggingRef.current) return
      longPressFiredRef.current = true
      setOpen(false)
      setPos(dragClamp({ x: resolvedHomePosition.x, y: resolvedHomePosition.y }))
    }, LONG_PRESS_MS)

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    if (!draggingRef.current) {
      // Consider it a drag after a small threshold.
      if (Math.hypot(dx, dy) > 6) {
        draggingRef.current = true
        clearLongPressTimer()
      }
    }
    const next = { x: positionStartRef.current.x + dx, y: positionStartRef.current.y + dy }
    setPos(dragClamp(next))
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return

    clearLongPressTimer()

    const { x: sx, y: sy, t } = pointerDownAtRef.current
    const dist = Math.hypot(e.clientX - sx, e.clientY - sy)
    const dt = Date.now() - t
    const wasDragging = draggingRef.current
    pointerIdRef.current = null
    draggingRef.current = false

    if (longPressFiredRef.current) {
      longPressFiredRef.current = false
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
      return
    }

    // Toggle only if it was effectively a click (not a drag).
    if (dist < 6 && dt < 400 && !wasDragging) {
      setOpen((v) => !v)
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    clearLongPressTimer()
    if (pointerIdRef.current !== e.pointerId) return
    pointerIdRef.current = null
    draggingRef.current = false
    longPressFiredRef.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  const onItem = (id: ActionButtonMenuItemId) => {
    onItemClick?.(id)
    setOpen(false)
  }

  const circleBg = 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))'
  const circleBorder = '1px solid rgba(255,255,255,0.25)'

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'fixed',
        zIndex: 1300,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        ...style
      }}
    >
      {/* Menu: standalone buttons only (no wrapping panel). */}
      {open ? (
        <Box
          dir="rtl"
          onPointerDown={(e) => {
            e.stopPropagation()
          }}
          sx={{
            position: 'fixed',
            top: menuCoords.y,
            left: menuCoords.x,
            width: `${menuWidth}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${menuGap}px`,
            transformOrigin: menuSide === 'right' ? 'left top' : 'right top'
          }}
        >
          {MENU_ITEMS.map((id) => {
            const label = menuLabels[id]
            return (
              <ButtonBase
                key={id}
                onClick={() => onItem(id)}
                sx={{
                  height: `${menuItemHeight}px`,
                  borderRadius: '18px',
                  paddingX: '14px',
                  justifyContent: 'flex-start',
                  backdropFilter: 'blur(12px)',
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.14)'
                  }
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    width: '100%',
                    textAlign: 'start'
                  }}
                >
                  {label}
                </Typography>
              </ButtonBase>
            )
          })}
        </Box>
      ) : null}

      {/* Draggable Circle */}
      <Box
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        sx={{
          position: 'fixed',
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          borderRadius: '50%',
          top: pos.y - circleSize / 2,
          left: pos.x - circleSize / 2,
          zIndex: 1301,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: draggingRef.current ? 'grabbing' : 'pointer',
          userSelect: 'none',
          touchAction: 'none',
          background: circleBg,
          border: circleBorder,
          boxShadow: '0 18px 60px rgba(0,0,0,0.45)'
        }}
      >
        <Box
          aria-hidden
          component="svg"
          viewBox="0 0 24 24"
          sx={{
            width: `${circleSize * 0.5}px`,
            height: `${circleSize * 0.5}px`,
            flexShrink: 0,
            display: 'block',
            color: '#fff',
            opacity: 0.96,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
            // Crisp edges on HiDPI
            shapeRendering: 'geometricPrecision'
          }}
        >
          <defs>
            <linearGradient id={iconGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#e8eef8" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#${iconGradientId})`}
            d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"
          />
        </Box>
      </Box>
    </div>
  )
}


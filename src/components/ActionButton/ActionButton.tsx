import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Box, ButtonBase, Paper, Typography } from '@mui/material'

import type { ActionButtonMenuItemId, ActionButtonProps } from './types'

const DEFAULT_YOUR_ROLE = 'پزشک'

export function ActionButton(props: ActionButtonProps) {
  const {
    unreadEventsCount = 0,
    yourRoleName = DEFAULT_YOUR_ROLE,
    onItemClick,
    labels,
    initialPosition,
    dragBoundsPadding = 12,
    circleSize = 64,
    menuWidth = 230,
    menuItemHeight = 44,
    className,
    style
  } = props

  const rootRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionStartRef = useRef({ x: 0, y: 0 })
  const pointerDownAtRef = useRef({ x: 0, y: 0, t: 0 })

  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(() => {
    if (initialPosition) return { x: initialPosition.x, y: initialPosition.y }

    // Default: left side, around middle of the screen.
    if (typeof window === 'undefined') {
      return { x: dragBoundsPadding + circleSize / 2, y: 0 }
    }
    return { x: dragBoundsPadding + circleSize / 2, y: window.innerHeight * 0.55 }
  })

  // Menu expands toward the opposite side of the circle.
  const menuSide = useMemo<'left' | 'right'>(() => {
    if (typeof window === 'undefined') return 'right'
    return pos.x < window.innerWidth / 2 ? 'right' : 'left'
  }, [pos.x])

  const menuLabels = useMemo(() => {
    const base: Record<ActionButtonMenuItemId, string> = {
      yourRole: `نقش شما: ${yourRoleName}`,
      viewRoles: 'مشاهده ی نقش ها',
      playerNames: 'نام بازیکنان',
      queryResults: 'نتیجه ی استعلام ها',
      events: 'رخداد ها'
    }

    if (!labels) return base
    return { ...base, ...labels }
  }, [labels, yourRoleName])

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

    // Keep panel inside the viewport.
    const panelHeight = 10 * 2 + 8 * 4 + menuItemHeight * 5
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

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return
    pointerIdRef.current = e.pointerId
    draggingRef.current = false

    dragStartRef.current = { x: e.clientX, y: e.clientY }
    positionStartRef.current = pos
    pointerDownAtRef.current = { x: e.clientX, y: e.clientY, t: Date.now() }

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
      if (Math.hypot(dx, dy) > 6) draggingRef.current = true
    }
    const next = { x: positionStartRef.current.x + dx, y: positionStartRef.current.y + dy }
    setPos(dragClamp(next))
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return

    const { x: sx, y: sy, t } = pointerDownAtRef.current
    const dist = Math.hypot(e.clientX - sx, e.clientY - sy)
    const dt = Date.now() - t
    const wasDragging = draggingRef.current
    pointerIdRef.current = null
    draggingRef.current = false

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

  const items: ActionButtonMenuItemId[] = ['yourRole', 'viewRoles', 'playerNames', 'queryResults', 'events']

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
      {/* Menu Panel */}
      {open ? (
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            top: menuCoords.y,
            left: menuCoords.x,
            width: `${menuWidth}px`,
            borderRadius: '26px',
            padding: '10px',
            backdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            transformOrigin: menuSide === 'right' ? 'left top' : 'right top'
          }}
          onPointerDown={(e) => {
            // Prevent outside-click closing while interacting with the menu.
            e.stopPropagation()
          }}
        >
          <Box
            dir="rtl"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {items.map((id) => {
              const label = menuLabels[id]
              const showBadge = id === 'events' && unreadEventsCount > 0

              const content = showBadge ? (
                <Badge
                  badgeContent={unreadEventsCount}
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: 2,
                      top: 2,
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {label}
                  </Typography>
                </Badge>
              ) : (
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {label}
                </Typography>
              )

              return (
                <ButtonBase
                  key={id}
                  onClick={() => onItem(id)}
                  sx={{
                    height: `${menuItemHeight}px`,
                    borderRadius: '18px',
                    paddingX: '14px',
                    justifyContent: 'flex-start',
                    background: 'rgba(0,0,0,0.10)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.10)'
                    }
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>{content}</Box>
                </ButtonBase>
              )
            })}
          </Box>
        </Paper>
      ) : null}

      {/* Draggable Circle */}
      <Box
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
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
          sx={{
            width: '44%',
            height: '44%',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.20)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>+</Typography>
        </Box>
      </Box>
    </div>
  )
}


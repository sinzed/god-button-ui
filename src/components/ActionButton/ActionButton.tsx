import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Box, ButtonBase, Divider, Paper, Typography, useTheme } from '@mui/material'

import { MenuItemIcon } from './menuItemIcons'
import type { ActionButtonMenuItemId, ActionButtonMessage, ActionButtonProps } from './types'

/** Top → bottom: پیام ها، اطلاعات بازی، نقش شما … */
const MENU_ITEMS: ActionButtonMenuItemId[] = ['messages', 'gameInfo', 'yourRole']

const DEFAULT_YOUR_ROLE = 'پزشک'

/** Default FAB: dark purple gradient */
export const DEFAULT_ACCENT_GRADIENT =
  'linear-gradient(155deg, #6d28d9 0%, #5b21b6 38%, #4c1d95 72%, #1e1b4b 100%)'

/** Default menu / game-info glass surfaces (pairs with {@link DEFAULT_ACCENT_GRADIENT}) */
export const DEFAULT_MENU_SURFACE_BACKGROUND =
  'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06)), linear-gradient(140deg, rgba(91,33,182,0.48), rgba(30,27,75,0.58))'

export function ActionButton(props: ActionButtonProps) {
  const {
    yourRoleName = DEFAULT_YOUR_ROLE,
    gameInfoSectionLabels,
    playerNamesContent,
    gameRoleNamesContent,
    onItemClick,
    labels,
    initialPosition,
    homePosition: homePositionProp,
    dragBoundsPadding = 12,
    circleSize = 64,
    menuWidth = 230,
    menuItemHeight = 44,
    menuGap = 10,
    gameInfoPanelMaxHeight = 340,
    messages: messagesProp,
    messagePreviewDurationMs = 10_000,
    accentGradient = DEFAULT_ACCENT_GRADIENT,
    menuSurfaceBackground = DEFAULT_MENU_SURFACE_BACKGROUND,
    className,
    style
  } = props

  const messages = messagesProp ?? []

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
  const [gameInfoPanelOpen, setGameInfoPanelOpen] = useState(false)
  const [messagesPanelOpen, setMessagesPanelOpen] = useState(false)
  const [lastReadCount, setLastReadCount] = useState(0)
  const [previewMessage, setPreviewMessage] = useState<ActionButtonMessage | null>(null)
  const messagesLenRef = useRef(0)
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
      messages: 'پیام ها',
      gameInfo: 'اطلاعات بازی',
      yourRole: `نقش شما ${yourRoleName}`
    }

    if (!labels) return base
    return { ...base, ...labels }
  }, [labels, yourRoleName])

  const gameInfoSections = useMemo(
    () => ({
      playerNames: gameInfoSectionLabels?.playerNames ?? 'نام بازیکنان',
      roleNames: gameInfoSectionLabels?.roleNames ?? 'نام نقش های بازی'
    }),
    [gameInfoSectionLabels]
  )

  const unreadCount = Math.max(0, messages.length - lastReadCount)

  useEffect(() => {
    if (messages.length === 0) {
      messagesLenRef.current = 0
      setLastReadCount(0)
      return
    }
    setLastReadCount((c) => Math.min(c, messages.length))
  }, [messages.length])

  useEffect(() => {
    if (messages.length === 0) {
      messagesLenRef.current = 0
      return
    }
    if (messages.length > messagesLenRef.current) {
      const latest = messages[messages.length - 1]
      setPreviewMessage(latest)
      if (previewTimerRef.current != null) {
        clearTimeout(previewTimerRef.current)
        previewTimerRef.current = null
      }
      previewTimerRef.current = setTimeout(() => {
        setPreviewMessage(null)
        previewTimerRef.current = null
      }, messagePreviewDurationMs)
    }
    messagesLenRef.current = messages.length
    return () => {
      if (previewTimerRef.current != null) {
        clearTimeout(previewTimerRef.current)
        previewTimerRef.current = null
      }
    }
  }, [messages, messagePreviewDurationMs])

  useEffect(() => {
    if (messagesPanelOpen) {
      setLastReadCount(messages.length)
    }
  }, [messages, messagesPanelOpen])

  /** action = bolt; close = menu open; back = game-info or messages panel (returns to menu). */
  const fabIconMode =
    gameInfoPanelOpen || messagesPanelOpen ? 'back' : open ? 'close' : 'action'

  const theme = useTheme()
  const rtlBackArrow =
    theme.direction === 'rtl' ||
    (typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl')

  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  )

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const resolvedGamePanelHeight = useMemo(
    () => Math.min(gameInfoPanelMaxHeight, Math.max(120, viewportHeight - dragBoundsPadding * 2)),
    [gameInfoPanelMaxHeight, viewportHeight, dragBoundsPadding]
  )

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

    const menuStackHeight = menuItemHeight * MENU_ITEMS.length + menuGap * (MENU_ITEMS.length - 1)
    // Same anchor as the menu: use taller vertical extent when a side panel is open.
    const stackHeight =
      gameInfoPanelOpen || messagesPanelOpen ? resolvedGamePanelHeight : menuStackHeight
    const yTop = Math.min(
      Math.max(yTopRaw, dragBoundsPadding),
      viewportHeight - dragBoundsPadding - stackHeight
    )
    const xLeft =
      menuSide === 'right'
        ? Math.min(Math.max(xLeftRaw, dragBoundsPadding), window.innerWidth - dragBoundsPadding - menuWidth)
        : Math.min(Math.max(xLeftRaw, dragBoundsPadding), window.innerWidth - dragBoundsPadding - menuWidth)

    setMenuCoords({ x: xLeft, y: yTop, gap })
  }

  useEffect(() => {
    recomputeMenuCoords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.x, pos.y, menuSide, gameInfoPanelOpen, messagesPanelOpen, viewportHeight, resolvedGamePanelHeight])

  // Close menu / side panels when clicking outside the root.
  useEffect(() => {
    if (!open && !gameInfoPanelOpen && !messagesPanelOpen) return

    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el) return
      const target = e.target as Node | null
      if (target && el.contains(target)) return
      setOpen(false)
      setGameInfoPanelOpen(false)
      setMessagesPanelOpen(false)
    }

    window.addEventListener('mousedown', onDown)
    window.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('touchstart', onDown)
    }
  }, [open, gameInfoPanelOpen, messagesPanelOpen])

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
      setGameInfoPanelOpen(false)
      setMessagesPanelOpen(false)
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
      if (gameInfoPanelOpen) {
        setGameInfoPanelOpen(false)
        setOpen(true)
      } else if (messagesPanelOpen) {
        setMessagesPanelOpen(false)
        setOpen(true)
      } else {
        setOpen((v) => !v)
      }
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
    if (id === 'gameInfo') {
      onItemClick?.(id)
      setMessagesPanelOpen(false)
      setGameInfoPanelOpen(true)
      setOpen(false)
      return
    }
    if (id === 'messages') {
      onItemClick?.(id)
      setGameInfoPanelOpen(false)
      setMessagesPanelOpen(true)
      setOpen(false)
      setLastReadCount(messages.length)
      setPreviewMessage(null)
      if (previewTimerRef.current != null) {
        clearTimeout(previewTimerRef.current)
        previewTimerRef.current = null
      }
      return
    }
    onItemClick?.(id)
    setOpen(false)
  }

  const circleBg = useMemo(
    () =>
      `linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05)), ${accentGradient}`,
    [accentGradient]
  )
  const circleBorder = '1px solid rgba(255,255,255,0.28)'

  const previewBubbleLayout = useMemo(() => {
    if (!previewMessage || typeof window === 'undefined') return null
    const w = Math.min(menuWidth + 24, 280)
    /** Keep preview to the north-east of FAB by default. */
    const gapFromFabX = 8
    const fabRight = pos.x + circleSize / 2
    const preferredLeft = fabRight + gapFromFabX
    const left = Math.min(
      Math.max(dragBoundsPadding, preferredLeft),
      window.innerWidth - dragBoundsPadding - w
    )
    /** Small gap between triangle tip and top edge of the FAB (px). */
    const gapAboveFab = 5
    const fabTop = pos.y - circleSize / 2
    // Anchor bubble stack from below so the tail sits right above the circle (no fake “reserved height” gap).
    const bottom = window.innerHeight - fabTop + gapAboveFab
    const maxBubbleHeight = Math.max(96, fabTop - dragBoundsPadding - gapAboveFab)
    return { left, width: w, bottom, maxBubbleHeight }
  }, [previewMessage, pos.x, pos.y, circleSize, menuWidth, dragBoundsPadding])

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
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
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
            zIndex: 1310,
            top: menuCoords.y,
            left: menuCoords.x,
            width: `${menuWidth}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${menuGap}px`,
            color: '#fff',
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
                  paddingX: '12px',
                  justifyContent: 'flex-start',
                  backdropFilter: 'blur(12px)',
                  background: menuSurfaceBackground,
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.22)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                  '&:hover': {
                    filter: 'brightness(1.08)'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '10px',
                    width: '100%',
                    flexDirection: 'row'
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'inherit',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      flex: 1,
                      minWidth: 0,
                      textAlign: 'start'
                    }}
                  >
                    {label}
                  </Typography>
                  {id === 'messages' && unreadCount > 0 ? (
                    <Box
                      component="span"
                      aria-label={String(unreadCount)}
                      sx={{
                        minWidth: 22,
                        height: 22,
                        px: 0.5,
                        borderRadius: '11px',
                        bgcolor: '#f43f5e',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        lineHeight: 1,
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Box>
                  ) : null}
                  <MenuItemIcon id={id} />
                </Box>
              </ButtonBase>
            )
          })}
        </Box>
      ) : null}

      {gameInfoPanelOpen ? (
          <Paper
            dir="rtl"
            elevation={0}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'fixed',
              zIndex: 1321,
              top: menuCoords.y,
              left: menuCoords.x,
              width: `${menuWidth}px`,
              height: `${resolvedGamePanelHeight}px`,
              maxHeight: `${resolvedGamePanelHeight}px`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: '22px',
              padding: '14px 14px 16px',
              backdropFilter: 'blur(12px)',
              background: menuSurfaceBackground,
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
              transformOrigin: menuSide === 'right' ? 'left top' : 'right top'
            }}
          >
            <Typography
              sx={{
                fontFamily: 'inherit',
                fontSize: '1.02rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '12px',
                flexShrink: 0
              }}
            >
              {menuLabels.gameInfo}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: 0,
                flex: 1,
                overflow: 'auto',
                pr: '2px'
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'inherit',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    opacity: 0.72,
                    marginBottom: '6px'
                  }}
                >
                  {gameInfoSections.playerNames}
                </Typography>
                <Typography sx={{ fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.45 }}>
                  {playerNamesContent ?? '—'}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'inherit',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    opacity: 0.72,
                    marginBottom: '6px'
                  }}
                >
                  {gameInfoSections.roleNames}
                </Typography>
                <Typography sx={{ fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.45 }}>
                  {gameRoleNamesContent ?? '—'}
                </Typography>
              </Box>
            </Box>
          </Paper>
      ) : null}

      {messagesPanelOpen ? (
        <Paper
          dir="rtl"
          elevation={0}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: 'fixed',
            zIndex: 1321,
            top: menuCoords.y,
            left: menuCoords.x,
            width: `${menuWidth}px`,
            height: `${resolvedGamePanelHeight}px`,
            maxHeight: `${resolvedGamePanelHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '22px',
            padding: '14px 14px 16px',
            backdropFilter: 'blur(12px)',
            background: menuSurfaceBackground,
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
            transformOrigin: menuSide === 'right' ? 'left top' : 'right top'
          }}
        >
          <Typography
            sx={{
              fontFamily: 'inherit',
              fontSize: '1.02rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '12px',
              flexShrink: 0
            }}
          >
            {menuLabels.messages}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              minHeight: 0,
              flex: 1,
              overflow: 'auto',
              pr: '2px'
            }}
          >
            {messages.length === 0 ? (
              <Typography sx={{ fontFamily: 'inherit', fontSize: '0.9rem', opacity: 0.75, py: 2, textAlign: 'center' }}>
                پیامی نیست
              </Typography>
            ) : (
              [...messages].reverse().map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    py: 1.25,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    '&:last-of-type': { borderBottom: 'none' }
                  }}
                >
                  {m.at != null ? (
                    <Typography
                      component="div"
                      sx={{
                        fontFamily: 'inherit',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        opacity: 0.65,
                        marginBottom: '4px'
                      }}
                    >
                      {new Date(m.at).toLocaleString()}
                    </Typography>
                  ) : null}
                  <Typography
                    sx={{
                      fontFamily: 'inherit',
                      fontSize: '0.93rem',
                      fontWeight: 600,
                      lineHeight: 1.45,
                      wordBreak: 'break-word'
                    }}
                  >
                    {m.body}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      ) : null}

      {previewMessage && !messagesPanelOpen && previewBubbleLayout ? (
        <Box
          dir="rtl"
          sx={{
            position: 'fixed',
            zIndex: 1328,
            left: previewBubbleLayout.left,
            bottom: previewBubbleLayout.bottom,
            width: previewBubbleLayout.width,
            maxHeight: previewBubbleLayout.maxBubbleHeight,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            pointerEvents: 'none'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: '10px 12px',
              borderRadius: '14px',
              backdropFilter: 'blur(12px)',
              background: menuSurfaceBackground,
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.28)',
              boxShadow: '0 14px 40px rgba(0,0,0,0.4)',
              position: 'relative',
              flexShrink: 1,
              minHeight: 0
            }}
          >
            <Typography
              sx={{
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                fontWeight: 650,
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word'
              }}
            >
              {previewMessage.body}
            </Typography>
          </Paper>
          <Box
            sx={{
              width: 0,
              height: 0,
              ml: '22px',
              flexShrink: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '9px solid rgba(255,255,255,0.14)',
              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.22))',
              mt: '-1px'
            }}
          />
        </Box>
      ) : null}

      {/* Draggable Circle */}
      <Box
        role="button"
        aria-label={
          fabIconMode === 'back' ? 'بازگشت به منو' : fabIconMode === 'close' ? 'بستن منو' : 'باز کردن منو'
        }
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
          zIndex: 1330,
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
        {unreadCount > 0 ? (
          <Box
            component="span"
            aria-label={String(unreadCount)}
            sx={{
              position: 'absolute',
              top: -2,
              right: -2,
              minWidth: 22,
              height: 22,
              px: 0.5,
              borderRadius: '11px',
              bgcolor: '#f43f5e',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Box>
        ) : null}
        {fabIconMode === 'back' ? (
          <Box
            aria-hidden
            component="svg"
            viewBox="0 0 24 24"
            sx={{
              width: `${circleSize * 0.48}px`,
              height: `${circleSize * 0.48}px`,
              flexShrink: 0,
              display: 'block',
              color: '#fff',
              opacity: 0.98,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
              shapeRendering: 'geometricPrecision',
              transform: rtlBackArrow ? 'scaleX(-1)' : 'none'
            }}
          >
            <path
              fill="currentColor"
              d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
            />
          </Box>
        ) : fabIconMode === 'close' ? (
          <Box
            aria-hidden
            component="svg"
            viewBox="0 0 24 24"
            sx={{
              width: `${circleSize * 0.46}px`,
              height: `${circleSize * 0.46}px`,
              flexShrink: 0,
              display: 'block',
              color: '#fff',
              opacity: 0.98,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
              shapeRendering: 'geometricPrecision'
            }}
          >
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
            />
          </Box>
        ) : (
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
        )}
      </Box>
    </div>
  )
}


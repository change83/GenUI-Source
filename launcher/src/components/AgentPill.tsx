import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BALL, GlassPill, type GlassTarget } from '../glass/GlassPill'
import { AudioMotionBridge, AudioReactive } from '../glass/liquidGlass.js'
import type { Route } from '../booking'
import type { Substitute } from '../fridge'
import type { Contact } from '../data'
import { dockPoint, type Referent } from '../reference'
import { BookingCard, type BookingView } from './BookingCard'
import { Avatar, HangUpButton } from './CallWindow'
import { FridgeCard, type FridgeView } from './FridgeCard'
import { IconCheck } from './Icons'

export type PillState = 'listening' | 'typing' | 'camera' | 'confirm' | 'caption' | 'calling' | 'booking' | 'fridge'

export interface ConfirmView {
  title: string
  question: string
  options: string[]
  multi: boolean
}

interface Props {
  state: PillState
  busy: boolean
  micOn: boolean
  input: string
  onInput: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  onTapBall: () => void
  awaitingConfirm: boolean
  confirm: ConfirmView | null
  onConfirm: (selected: string[]) => void
  caption: string
  onCaptionClick: () => void
  /** The card the user just mentioned; the pill flies over and docks on it. */
  referent: Referent | null
  /** Who is being dialled while the pill is in the calling state. */
  callee: Contact | null
  onHangUp: () => void
  /** The shop agent's reservation reply and what it is showing. */
  booking: BookingView | null
  onBookingView: (view: BookingView) => void
  onBookingHold: (held: boolean) => void
  onOrder: (summary: string) => void
  onGo: (route: Route) => void
  /** The fridge agent's answer to a cooking question. */
  fridge: FridgeView | null
  onFridgeView: (view: FridgeView) => void
  onPickSubstitute: (s: Substitute) => void
}

const BOTTOM = 40
const BACKDROP = '/bg-dusk.jpg'

function useViewport() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

let measureCtx: CanvasRenderingContext2D | null = null
function textWidth(text: string) {
  measureCtx ??= document.createElement('canvas').getContext('2d')
  if (!measureCtx) return text.length * 7.5
  measureCtx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  return measureCtx.measureText(text).width
}

interface Form {
  glass: GlassTarget & { width: number; height: number }
  inset: number
}

const BOOKING_HEIGHT: Record<BookingView, number> = { result: 224, compact: 144, menu: 376, directions: 364 }
const FRIDGE_HEIGHT: Record<FridgeView, number> = { check: 412, substitutes: 328, ordered: 144 }

function formFor(p: {
  state: PillState
  vw: number
  hover: boolean
  busy: boolean
  caption: string
  booking: BookingView | null
  fridge: FridgeView | null
}): Form {
  const fit = (w: number) => Math.min(w, p.vw - 48)
  switch (p.state) {
    case 'listening': {
      const s = p.hover ? 68 : 60
      const busy = p.busy ? { glow: 90, glowMix: 100, liquid: 26 } : {}
      return { glass: { ...BALL, width: s, height: s, radius: 30, ...busy }, inset: 0 }
    }
    case 'typing':
      return { glass: { ...BALL, width: fit(400), height: 60, radius: 30, glow: 0, liquid: 0 }, inset: 0 }
    case 'camera':
      return { glass: { ...BALL, width: 240, height: 240, radius: 32, liquid: 0, edge: 1 }, inset: 6 }
    case 'confirm':
      return { glass: { ...BALL, width: fit(432), height: 206, radius: 36, liquid: 0, edge: 1 }, inset: 6 }
    case 'caption': {
      const w = Math.max(180, Math.min(fit(640), Math.ceil(textWidth(p.caption)) + 56))
      return { glass: { ...BALL, width: w, height: 52, radius: 26, glow: 55, liquid: 0 }, inset: 0 }
    }
    case 'calling':
      return { glass: { ...BALL, width: fit(360), height: 224, radius: 36, liquid: 0, edge: 1 }, inset: 6 }
    case 'booking':
      return {
        glass: { ...BALL, width: fit(424), height: BOOKING_HEIGHT[p.booking ?? 'result'], radius: 36, liquid: 0, edge: 1 },
        inset: 6,
      }
    case 'fridge':
      return {
        glass: { ...BALL, width: fit(424), height: FRIDGE_HEIGHT[p.fridge ?? 'check'], radius: 36, liquid: 0, edge: 1 },
        inset: 6,
      }
  }
}

function Calling({ callee, onHangUp }: { callee: Contact; onHangUp: () => void }) {
  return (
    <div className="pill-calling">
      <span className="calling-title">Calling ...</span>
      <div className="calling-who">
        <span className="calling-ring" aria-hidden>
          <i />
          <i />
        </span>
        <Avatar contact={callee} size={72} />
      </div>
      <span className="calling-name">{callee.name}</span>
      <HangUpButton onClick={onHangUp} />
    </div>
  )
}

function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [live, setLive] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          setLive(true)
        }
      })
      .catch(() => setLive(false))
    const t1 = setTimeout(() => setLabel('Recognizing…'), 900)
    const t2 = setTimeout(() => setLabel('Sony WH-1000XM5'), 2200)
    return () => {
      cancelled = true
      clearTimeout(t1)
      clearTimeout(t2)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="pill-camera">
      <video ref={videoRef} autoPlay playsInline muted className={live ? 'is-live' : ''} />
      {!live && (
        <div className="camera-sim" aria-hidden>
          <div className="camera-sim-table" />
          <svg viewBox="0 0 200 160" className="camera-sim-object">
            <path d="M48 104 C 44 44, 84 22, 104 22 C 132 22, 160 50, 152 108" stroke="#2a2a2e" strokeWidth="11" fill="none" strokeLinecap="round" />
            <ellipse cx="56" cy="116" rx="22" ry="29" fill="#2f2f35" />
            <ellipse cx="60" cy="114" rx="13" ry="19" fill="#45454d" />
            <ellipse cx="146" cy="118" rx="23" ry="30" fill="#2f2f35" />
            <ellipse cx="142" cy="116" rx="14" ry="20" fill="#45454d" />
          </svg>
        </div>
      )}
      {label && (
        <span className={`camera-tag ${label.endsWith('…') ? 'is-pending' : ''}`} key={label}>
          <i />
          {label}
        </span>
      )}
    </div>
  )
}

function Confirm({ view, onConfirm }: { view: ConfirmView; onConfirm: (s: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(view.multi ? view.options.slice(0, 3) : [view.options[0]])
  const toggle = (o: string) => {
    if (!view.multi) return setSelected([o])
    setSelected(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o])
  }
  return (
    <div className="pill-confirm">
      <p className="confirm-q">{view.question}</p>
      <div className="confirm-options">
        {view.options.map((o) => (
          <button key={o} className={selected.includes(o) ? 'is-on' : ''} onClick={() => toggle(o)}>
            {selected.includes(o) && <IconCheck size={14} />}
            {o}
          </button>
        ))}
      </div>
      <div className="confirm-actions">
        <button className="btn-primary" disabled={selected.length === 0} onClick={() => onConfirm(selected)}>
          Confirm
        </button>
      </div>
    </div>
  )
}

export function AgentPill(props: Props) {
  const { state } = props
  const vw = useViewport()
  const [hover, setHover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const glassRef = useRef<GlassPill | null>(null)

  useEffect(() => {
    const glass = new GlassPill({
      canvas: canvasRef.current!,
      shell: shellRef.current!,
      wrap: wrapRef.current!,
      bottom: BOTTOM,
      backdrop: BACKDROP,
    })
    glassRef.current = glass
    return () => {
      glass.dispose()
      glassRef.current = null
    }
  }, [])

  const form = useMemo(
    () =>
      formFor({ state, vw, hover: hover && state === 'listening', busy: props.busy, caption: props.caption, booking: props.booking, fridge: props.fridge }),
    [state, vw, hover, props.busy, props.caption, props.booking, props.fridge],
  )
  const box = { width: form.glass.width - form.inset * 2, height: form.glass.height - form.inset * 2 }

  // Collapsing the reservation reply keeps its content; opening the menu or directions swaps it.
  const contentKey =
    state === 'booking'
      ? `booking-${props.booking === 'compact' ? 'result' : props.booking}`
      : state === 'fridge'
        ? `fridge-${props.fridge}`
        : state
  useLayoutEffect(() => {
    glassRef.current?.hideContent()
  }, [contentKey])

  useEffect(() => {
    glassRef.current?.setTarget(form.glass)
  }, [form])

  const { referent } = props
  useEffect(() => {
    glassRef.current?.setAnchor(referent ? (size) => dockPoint(referent, size) : null)
  }, [referent])

  // Live mic RMS → deformation amplitude + specular travel speed on the listening ball.
  // Silent / mic-off leave the ambient liquid-glass motion untouched.
  useEffect(() => {
    if (state !== 'listening' || !props.micOn) return
    const renderer = glassRef.current?.renderer ?? null
    if (!renderer) return
    const bridge = new AudioMotionBridge(renderer)
    bridge.setStrength(100)

    const params = new URLSearchParams(window.location.search)
    const sim = params.get('micSim')
    // ?micSim=0.8 (or bare ?micSim) drives the bridge without a real mic — for demos / headless.
    if (sim !== null) {
      const level = Math.max(0, Math.min(1, sim === '' ? 0.75 : Number(sim) || 0))
      let raf = 0
      const pulse = (now: number) => {
        const wobble = 0.12 * Math.sin(now / 280)
        bridge.setInput({ level: Math.max(0, Math.min(1, level + wobble)) }, true)
        raf = requestAnimationFrame(pulse)
      }
      raf = requestAnimationFrame(pulse)
      return () => {
        cancelAnimationFrame(raf)
        bridge.reset()
        bridge.dispose()
      }
    }

    // Levels only arrive while the analyser is running; silence maps to ambient 1x in the bridge.
    const audio = new AudioReactive((l) => bridge.setInput(l, true))
    audio.setSensitivity(153)
    void audio.startMicrophone()
    return () => {
      audio.dispose()
      bridge.reset()
      bridge.dispose()
    }
  }, [state, props.micOn])

  useEffect(() => {
    if (state !== 'typing') return
    const el = inputRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [state])

  const tappable = state === 'listening' || state === 'caption'

  return (
    <>
      <canvas ref={canvasRef} className="glass-canvas" aria-hidden />
      <div ref={wrapRef} className={`pill-wrap state-${state}`}>
        <div
          ref={shellRef}
          className={`pill-shell ${tappable ? 'is-tappable' : ''}`}
          role="region"
          aria-label="Agent"
          onClick={state === 'listening' ? props.onTapBall : state === 'caption' ? props.onCaptionClick : undefined}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {state === 'listening' && props.awaitingConfirm && <span className="pill-badge" />}

          {state === 'typing' && (
            <form
              className="pill-content pill-input"
              style={box}
              onSubmit={(e) => {
                e.preventDefault()
                props.onSubmit()
              }}
            >
              <input
                ref={inputRef}
                value={props.input}
                onChange={(e) => props.onInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && props.onCancel()}
                placeholder="Ask anything, or tell the agent what to do…"
                aria-label="Message"
              />
            </form>
          )}

          {state === 'camera' && (
            <div className="pill-content pill-card is-camera" style={box}>
              <Camera />
            </div>
          )}

          {state === 'confirm' && props.confirm && (
            <div className="pill-content pill-card" style={box}>
              <Confirm view={props.confirm} onConfirm={props.onConfirm} />
            </div>
          )}

          {state === 'calling' && props.callee && (
            <div className="pill-content pill-card" style={box}>
              <Calling callee={props.callee} onHangUp={props.onHangUp} />
            </div>
          )}

          {state === 'booking' && props.booking && (
            <div className="pill-content pill-card is-fluid">
              <BookingCard
                view={props.booking}
                size={box}
                onView={props.onBookingView}
                onHold={props.onBookingHold}
                onOrder={props.onOrder}
                onGo={props.onGo}
              />
            </div>
          )}

          {state === 'fridge' && props.fridge && (
            <div className="pill-content pill-card is-fluid">
              <FridgeCard view={props.fridge} size={box} onView={props.onFridgeView} onPick={props.onPickSubstitute} />
            </div>
          )}

          {state === 'caption' && (
            <div className="pill-content pill-caption" style={box}>
              <span key={props.caption}>{props.caption}</span>
            </div>
          )}
        </div>
        {state === 'listening' && props.busy && !props.awaitingConfirm && <span className="pill-spot" aria-hidden />}
      </div>
    </>
  )
}

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { AgentPill, type ConfirmView, type PillState } from './components/AgentPill'
import { Background } from './components/Background'
import type { BookingView } from './components/BookingCard'
import type { FridgeView } from './components/FridgeCard'
import { fridge as fridgeAgent, isCookingQuestion } from './fridge'
import { isBookingRequest, store } from './booking'
import { CallWindow } from './components/CallWindow'
import { isHangUp, parseCall } from './call'
import { FeedArea } from './components/FeedArea'
import {
  IconArchive,
  IconClose,
  IconGauge,
  IconPin,
  IconUser,
  IconVolume,
  IconVolumeOff,
} from './components/Icons'
import { OutputThumb } from './components/OutputThumb'
import { PinnedArea } from './components/PinnedArea'
import { ReferenceRipple } from './components/ReferenceRipple'
import { TaskDrawer, type FinishedTask, type RunningTask } from './components/TaskDrawer'
import { fallbackPlacement, measureFeed, placeFeed, type FeedSizes, type Placement } from './placement'
import { findReferent, sameReferent, type Referent } from './reference'
import { listenForSpeech } from './speech'
import { useTrailingCards } from './useTrailingCards'
import {
  archivedOutputs,
  backgroundTasks,
  finishedNotes,
  contacts,
  conversation,
  initialOutputs,
  initialWidgets,
  recommendedTasks,
  type Contact,
  type Output,
  type OutputKind,
  type RecommendedTask,
  type Widget,
} from './data'

interface Job {
  id: string
  title: string
  kind: OutputKind
  taskId: string | null
  progress: number
  confirm: ConfirmView | null
  confirmed: boolean
}

type Mode = 'auto' | 'typing' | 'camera'

const STEPS = ['Understanding your request', 'Searching sources', 'Analyzing findings', 'Drafting the deliverable', 'Polishing the result']
const CONFIRM_AT = 42
const GROUP_GAP = 60
// Typing settles for a moment before the pill moves; a spoken reference is held this long.
const TYPED_SETTLE_MS = 200
const SPOKEN_HOLD_MS = 5000
// Simulated ring time before the other side picks up.
const RING_MS = 3200
const UNKNOWN_NAME_SETTLE_MS = 700
// The reservation reply's actions fade if left alone; the short notice then returns to the ball.
const BOOKING_ACTIONS_MS = 6000
const BOOKING_NOTICE_MS = 4000
const FRIDGE_ORDERED_MS = 4000
// Cards from other agents wait for the end of the sentence; this long without new words also ends it.
const SENTENCE_SETTLE_MS = 1200

interface Call {
  contact: Contact
  phase: 'dialing' | 'connected'
  /** When the call connected, for the call clock. */
  since: number
  /** Where the calling card was when the call connected; the call window starts from there. */
  from: { left: number; top: number; width: number; height: number } | null
}

function confirmFor(kind: OutputKind, title: string): ConfirmView | null {
  if (kind === 'report')
    return {
      title,
      question: 'The report will compare these competitors. Any changes?',
      options: ['Sony WH-1000XM5', 'Bose QC Ultra', 'AirPods Max', 'Huawei FreeBuds Pro 4'],
      multi: true,
    }
  if (kind === 'web')
    return {
      title,
      question: 'Which visual style should the product page use?',
      options: ['Minimal', 'Dark tech', 'Vivid gradient'],
      multi: false,
    }
  return null
}

function guessKind(text: string): OutputKind {
  if (/web|page|site|landing|demo/i.test(text)) return 'web'
  if (/poster|image|banner|design/i.test(text)) return 'poster'
  return 'report'
}

function outputTitle(text: string) {
  const t = text.replace(/^(please\s+)?(generate|create|make|write|build)\s+(a|an|the)?\s*/i, '').replace(/[.。]$/, '')
  const s = t.charAt(0).toUpperCase() + t.slice(1)
  return s.length > 44 ? `${s.slice(0, 42)}…` : s
}

function speak(text: string) {
  const synth = window.speechSynthesis
  if (!synth) return
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  synth.speak(u)
}

export default function App() {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [outputs, setOutputs] = useState<Output[]>(initialOutputs)
  const [mode, setMode] = useState<Mode>('auto')
  const [input, setInput] = useState('')
  const [job, setJob] = useState<Job | null>(null)
  const [deferred, setDeferred] = useState(false)
  const [muted, setMuted] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [flash, setFlash] = useState<{ text: string; outputId?: string } | null>(null)
  const [preview, setPreview] = useState<Output | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [moving, setMoving] = useState(false)
  const groupRef = useRef<HTMLDivElement>(null)
  const [tasks, setTasks] = useState(recommendedTasks)
  const feedRef = useRef<HTMLElement>(null)
  const [place, setPlace] = useState<Placement>({ x: 0, y: 0, arrangement: 'wide' })
  const feedPos = useMemo(() => (pos ? { x: pos.x + place.x, y: pos.y + place.y } : null), [pos, place.x, place.y])
  useTrailingCards(groupRef, feedPos, '.feed > .card, .feed-row > .card')
  useEffect(() => {
    if (muted) window.speechSynthesis?.cancel()
  }, [muted])

  const awaitingConfirm = !!job && !!job.confirm && !job.confirmed && job.progress >= CONFIRM_AT
  const step = job ? STEPS[Math.min(STEPS.length - 1, Math.floor((job.progress / 100) * STEPS.length))] : ''
  const caption = flash?.text ?? (muted && job && !awaitingConfirm ? `${step}… ${Math.round(job.progress)}%` : '')

  // Phone call: dialling turns the pill into the calling card; once connected the call moves into
  // its own window and the pill goes back to being the ball.
  const [call, setCall] = useState<Call | null>(null)
  // Reservation with a shop's agent: the pill shows the shop's reply until it times out or is used.
  const [booking, setBooking] = useState<BookingView | null>(null)
  const bookingHeld = useRef(false)
  // Cooking questions go to the fridge's agent, which answers with what tonight's dish still needs.
  const [fridge, setFridge] = useState<FridgeView | null>(null)

  const pill: PillState =
    mode === 'typing'
      ? 'typing'
      : mode === 'camera'
        ? 'camera'
        : call?.phase === 'dialing'
          ? 'calling'
          : booking
            ? 'booking'
            : fridge
              ? 'fridge'
              : awaitingConfirm && !deferred
            ? 'confirm'
            : caption
              ? 'caption'
              : 'listening'

  /** Agent feedback is spoken; with the speaker off it becomes a one-line caption. */
  const announce = useCallback(
    (text: string, outputId?: string) => {
      if (muted) setFlash({ text, outputId })
      else speak(text)
    },
    [muted],
  )

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 5000)
    return () => clearTimeout(t)
  }, [flash])

  const startCall = useCallback((contact: Contact) => {
    setCall({ contact, phase: 'dialing', since: 0, from: null })
    setInput('')
    setMode('auto')
    setFlash(null)
  }, [])

  const endCall = useCallback(() => {
    setCall(null)
    announce('Call ended.')
  }, [announce])

  const openBooking = useCallback(() => {
    setBooking('result')
    setFridge(null)
    setInput('')
    setMode('auto')
    setFlash(null)
    if (!muted) speak(`${store.name} confirmed your seat for ${store.time}.`)
  }, [muted])

  const openFridge = useCallback(() => {
    setFridge('check')
    setBooking(null)
    setInput('')
    setMode('auto')
    setFlash(null)
    if (!muted) speak(fridgeAgent.message)
  }, [muted])

  useEffect(() => {
    if (fridge !== 'ordered') return
    const t = setTimeout(() => setFridge(null), FRIDGE_ORDERED_MS)
    return () => clearTimeout(t)
  }, [fridge])

  const holdBooking = useCallback((held: boolean) => {
    bookingHeld.current = held
  }, [])

  useEffect(() => {
    if (!booking) bookingHeld.current = false
    if (booking !== 'result' && booking !== 'compact') return
    let t = 0
    const lapse = () => {
      if (bookingHeld.current) t = window.setTimeout(lapse, 600)
      else setBooking(booking === 'result' ? 'compact' : null)
    }
    t = window.setTimeout(lapse, booking === 'result' ? BOOKING_ACTIONS_MS : BOOKING_NOTICE_MS)
    return () => clearTimeout(t)
  }, [booking])

  useEffect(() => {
    if (call?.phase !== 'dialing') return
    const t = setTimeout(() => {
      const r = document.querySelector('.pill-shell')?.getBoundingClientRect()
      const from = r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null
      setCall((c) => (c && c.phase === 'dialing' ? { ...c, phase: 'connected', since: Date.now(), from } : c))
    }, RING_MS)
    return () => clearTimeout(t)
  }, [call?.phase])

  // The speech listener lives across renders; it reads the current call through refs.
  const live = useRef({ call, startCall, endCall, booking, openBooking, fridge, openFridge })
  useEffect(() => {
    live.current = { call, startCall, endCall, booking, openBooking, fridge, openFridge }
  })
  const saidOnce = useRef(false)

  // Referring: when the user types or says words that are on screen, the pill flies to the card
  // that shows them and the card ripples. A reference belongs to the pill form it was made in,
  // so leaving the listening or typing form sends the pill home.
  const [reference, setReference] = useState<{ to: Referent; from: PillState } | null>(null)
  const referent = reference?.from === pill ? reference.to : null
  const refer = useCallback(
    (to: Referent | null, from: PillState) =>
      setReference((prev) => (to ? (prev?.from === from && sameReferent(prev.to, to) ? prev : { to, from }) : null)),
    [],
  )

  useEffect(() => {
    if (pill !== 'typing') return
    const t = setTimeout(() => refer(findReferent(input, true), 'typing'), TYPED_SETTLE_MS)
    return () => clearTimeout(t)
  }, [pill, input, refer])

  useEffect(() => {
    if (pill !== 'listening' || !micOn) return
    let hold = 0
    let dial = 0
    let settle = 0
    let pending = ''
    const heard = (text: string, final: boolean) => {
      const { call, startCall, endCall, booking, openBooking, fridge, openFridge } = live.current
      if (call && isHangUp(text)) return endCall()
      const request = call ? null : parseCall(text)
      clearTimeout(dial)
      if (request) {
        // An unknown name may still be mid-word in an interim result; wait for it to settle.
        if (request.known) startCall(request.contact)
        else dial = window.setTimeout(() => startCall(request.contact), UNKNOWN_NAME_SETTLE_MS)
        return
      }
      const open = booking || fridge ? null : isBookingRequest(text) ? openBooking : isCookingQuestion(text) ? openFridge : null
      if (open && !final && text === pending) return
      clearTimeout(settle)
      pending = open && !final ? text : ''
      if (open) {
        if (final) open()
        else settle = window.setTimeout(open, SENTENCE_SETTLE_MS)
        return
      }
      const next = findReferent(text)
      if (!next) return
      refer(next, 'listening')
      clearTimeout(hold)
      hold = window.setTimeout(() => refer(null, 'listening'), SPOKEN_HOLD_MS)
    }
    const params = new URLSearchParams(window.location.search)
    const stop = listenForSpeech(heard, params.get('lang') ?? 'en-US')
    // ?say=competitor stands in for a spoken phrase where there is no microphone or recognition service.
    // It is said once per page load, not every time the pill comes back to listening.
    const said = saidOnce.current ? null : params.get('say')
    const sim = said
      ? window.setTimeout(() => {
          saidOnce.current = true
          heard(said, true)
        }, 800)
      : 0
    return () => {
      stop()
      clearTimeout(hold)
      clearTimeout(dial)
      clearTimeout(settle)
      clearTimeout(sim)
    }
  }, [pill, micOn, refer])

  const startJob = useCallback(
    (title: string, kind: OutputKind, opts: { taskId?: string; ask?: boolean; progress?: number } = {}) => {
      setJob({
        id: `j-${Date.now()}`,
        title,
        kind,
        taskId: opts.taskId ?? null,
        progress: opts.progress ?? 0,
        confirm: opts.ask === false ? null : confirmFor(kind, title),
        confirmed: false,
      })
      setDeferred(false)
      setInput('')
      setMode('auto')
      setFlash(null)
      if (!muted) speak("On it. I'll let you know when it's ready.")
    },
    [muted],
  )

  // Job simulation: advances while the agent is not blocked on the user.
  useEffect(() => {
    if (!job || awaitingConfirm) return
    const t = setTimeout(() => {
      const progress = Math.min(100, job.progress + 1.1)
      if (progress < 100 || (job.confirm && !job.confirmed && progress >= CONFIRM_AT)) {
        setJob({ ...job, progress })
        return
      }
      const output: Output = {
        id: `o-${job.id}`,
        kind: job.kind,
        title: outputTitle(job.title),
        subtitle: job.kind === 'web' ? 'Web Demo' : job.kind === 'poster' ? 'PNG' : 'PDF File · 12 pages',
        createdAt: 'Just now',
        unread: true,
        fresh: true,
      }
      setOutputs((o) => [output, ...o])
      setJob(null)
      announce(`“${output.title}” is ready. Tap to view.`, output.id)
    }, 90)
    return () => clearTimeout(t)
  }, [job, awaitingConfirm, announce])

  // Any printable keystroke morphs the ball into the input bar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'Escape') {
        if (preview) return setPreview(null)
        if (pill === 'calling') return endCall()
        if (pill === 'booking') return setBooking(null)
        if (pill === 'fridge') return setFridge(null)
        setMode('auto')
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return
      if (pill === 'confirm' || pill === 'camera' || pill === 'calling') return
      if (pill === 'booking') {
        if (booking === 'menu' || booking === 'directions') return
        setBooking(null)
      }
      if (pill === 'fridge') {
        if (fridge === 'substitutes') return
        setFridge(null)
      }
      e.preventDefault()
      setInput((v) => (mode === 'typing' ? v + e.key : e.key))
      setMode('typing')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pill, mode, preview, endCall, booking, fridge])

  // Center the pinned + dynamic group once, then keep it on screen as the window changes.
  const clamp = useCallback((p: { x: number; y: number }) => {
    const pinned = groupRef.current?.firstElementChild as HTMLElement | null
    const w = pinned?.offsetWidth ?? 0
    const h = pinned?.offsetHeight ?? 0
    return {
      x: Math.max(8, Math.min(window.innerWidth - w - 8, p.x)),
      y: Math.max(8, Math.min(window.innerHeight - h - 8, p.y)),
    }
  }, [])

  // Where the feed would go if the pinned panel were at `p`; `fit` is null when it cannot fully fit on screen.
  const feedSizes = useRef<FeedSizes | null>(null)
  const placeAt = useCallback((p: { x: number; y: number }) => {
    const pinned = groupRef.current?.firstElementChild as HTMLElement | null
    if (!pinned || !feedRef.current) return null
    const rect = { x: p.x, y: p.y, w: pinned.offsetWidth, h: pinned.offsetHeight }
    const sizes = (feedSizes.current ??= measureFeed(feedRef.current))
    return {
      fit: placeFeed(rect, sizes, GROUP_GAP, window.innerWidth, window.innerHeight),
      fallback: () => fallbackPlacement(rect, sizes, GROUP_GAP, window.innerWidth, window.innerHeight),
    }
  }, [])

  // Moves the panel and re-places the feed in the same update, so the feed never leaves the screen.
  const posRef = useRef(pos)
  const moveTo = useCallback(
    (p: { x: number; y: number }) => {
      posRef.current = p
      setPos(p)
      const at = placeAt(p)
      if (!at) return
      const next = at.fit ?? at.fallback()
      setPlace((prev) =>
        prev.x === next.x && prev.y === next.y && prev.arrangement === next.arrangement ? prev : next,
      )
    },
    [placeAt],
  )

  useLayoutEffect(() => {
    const pinned = groupRef.current?.firstElementChild as HTMLElement | null
    if (!pinned || !feedRef.current || pos) return
    const feed = measureFeed(feedRef.current).wide
    const x = (window.innerWidth - (pinned.offsetWidth + GROUP_GAP + feed.w)) / 2
    const y = (window.innerHeight - Math.max(pinned.offsetHeight, feed.h)) / 2 - 40
    moveTo(clamp({ x, y }))
  }, [pos, clamp, moveTo])

  // New outputs, edit mode or added widgets change either side's size; re-place when that happens.
  useEffect(() => {
    const pinned = groupRef.current?.firstElementChild
    const feed = feedRef.current
    if (!pinned || !feed) return
    const ro = new ResizeObserver(() => {
      feedSizes.current = null
      if (posRef.current) moveTo(clamp(posRef.current))
    })
    ro.observe(pinned)
    ro.observe(feed)
    return () => ro.disconnect()
  }, [moveTo, clamp])

  useEffect(() => {
    const onResize = () => posRef.current && moveTo(clamp(posRef.current))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clamp, moveTo])

  const grab = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !pos) return
    const start = { x: e.clientX, y: e.clientY }
    const origin = { ...pos }
    let started = false
    const move = (ev: globalThis.PointerEvent) => {
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      if (!started && Math.hypot(dx, dy) < 4) return
      if (!started) {
        started = true
        setMoving(true)
      }
      ev.preventDefault()
      // Only move to spots where the feed still fits; otherwise slide along whichever axis allows it.
      const want = clamp({ x: origin.x + dx, y: origin.y + dy })
      const cur = posRef.current ?? origin
      const options = [want, { x: want.x, y: cur.y }, { x: cur.x, y: want.y }]
      const next = options.find((p) => placeAt(p)?.fit)
      if (next) moveTo(next)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      setMoving(false)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const openOutput = (o: Output) => {
    setOutputs((list) => list.map((x) => (x.id === o.id ? { ...x, unread: false } : x)))
    setPreview({ ...o, unread: false })
  }

  const pinnedOutputIds = new Set(widgets.filter((w) => w.kind === 'output').map((w) => w.outputId!))
  const togglePin = (o: Output) => {
    if (pinnedOutputIds.has(o.id)) setWidgets((ws) => ws.filter((w) => w.outputId !== o.id))
    else setWidgets((ws) => [...ws, { id: `w-out-${o.id}`, kind: 'output', size: 'small', outputId: o.id }])
  }

  const runTask = (t: RecommendedTask) => {
    setTasks((list) => list.filter((x) => x.id !== t.id))
    startJob(t.title, t.outputKind, { taskId: t.id })
  }

  const stepAt = (progress: number) => Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length))
  const runningTasks: RunningTask[] = [
    ...(job ? [{ id: job.id, title: outputTitle(job.title), steps: STEPS, step: stepAt(job.progress), progress: job.progress }] : []),
    ...backgroundTasks,
  ]
  const finishedTasks: FinishedTask[] = [
    ...[...outputs, ...archivedOutputs].map((o) => ({
      id: o.id,
      title: o.title,
      finishedAt: o.createdAt,
      output: { kind: o.kind, subtitle: o.subtitle, onOpen: () => openOutput(o) },
    })),
    ...finishedNotes,
  ]

  const demo: { state: PillState; label: string; run: () => void }[] = [
    {
      state: 'listening',
      label: 'Listening',
      run: () => {
        setMode('auto')
        setFlash(null)
        setDeferred(true)
        setMicOn(true)
      },
    },
    { state: 'typing', label: 'Keyboard', run: () => setMode('typing') },
    { state: 'camera', label: 'Camera', run: () => setMode('camera') },
    {
      state: 'confirm',
      label: 'Collaboration',
      run: () =>
        startJob(recommendedTasks[0].title, 'report', { taskId: recommendedTasks[0].id, progress: CONFIRM_AT - 2 }),
    },
    {
      state: 'caption',
      label: 'Caption',
      run: () => {
        setMode('auto')
        setMuted(true)
        setFlash({ text: "Your speaker is off, so I'll show my replies here." })
      },
    },
    { state: 'calling', label: 'Phone call', run: () => startCall(contacts[0]) },
    { state: 'booking', label: 'Reservation', run: openBooking },
    { state: 'fridge', label: 'Fridge', run: openFridge },
  ]

  return (
    <div className="app">
      <Background />

      <nav className="topbar glass-pill" aria-label="System">
        <button
          title={muted ? 'Speaker off — replies show as captions' : 'Speaker on'}
          className={muted ? 'is-off' : ''}
          onClick={() => setMuted(!muted)}
        >
          {muted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
        </button>
        <button title="Dashboard">
          <IconGauge size={20} />
        </button>
        <button title="Account">
          <IconUser size={20} />
        </button>
        <button title="Archive">
          <IconArchive size={20} />
        </button>
      </nav>

      <main className="stage">
        <div
          ref={groupRef}
          className={`group ${moving ? 'is-moving' : ''}`}
          style={{ left: pos?.x ?? 0, top: pos?.y ?? 0, visibility: pos ? 'visible' : 'hidden' }}
        >
          <PinnedArea widgets={widgets} outputs={outputs} onChange={setWidgets} onGrab={grab} dragging={moving} />
          <FeedArea
            ref={feedRef}
            arrangement={place.arrangement}
            style={{ left: place.x, top: place.y }}
            onOutputSettled={(id) => setOutputs((list) => list.map((o) => (o.id === id ? { ...o, fresh: false } : o)))}
            outputs={outputs}
            pinnedOutputIds={pinnedOutputIds}
            conversation={conversation}
            tasks={tasks}
            onOpenOutput={openOutput}
            onPinOutput={togglePin}
            onRunTask={runTask}
            onFollowUp={(q) => startJob(q, 'report', { ask: false })}
          />
        </div>
      </main>

      <ReferenceRipple target={referent?.el ?? null} onLost={() => setReference(null)} />

      {pill === 'camera' && <div className="dismiss-layer" onClick={() => setMode('auto')} aria-hidden />}
      {pill === 'booking' && (booking === 'menu' || booking === 'directions') && (
        <div className="dismiss-layer" onClick={() => setBooking(null)} aria-hidden />
      )}
      {pill === 'fridge' && <div className="dismiss-layer" onClick={() => setFridge(null)} aria-hidden />}

      <AgentPill
        state={pill}
        busy={!!job && !awaitingConfirm}
        micOn={micOn}
        input={input}
        onInput={setInput}
        onSubmit={() => {
          const text = input.trim()
          if (!text) return
          if (call && isHangUp(text)) {
            setInput('')
            setMode('auto')
            return endCall()
          }
          const request = call ? null : parseCall(text)
          if (request) startCall(request.contact)
          else if (isBookingRequest(text)) openBooking()
          else if (isCookingQuestion(text)) openFridge()
          else startJob(text, guessKind(text))
        }}
        onCancel={() => {
          setInput('')
          setMode('auto')
        }}
        onTapBall={() => {
          if (awaitingConfirm) return setDeferred(false)
          setMode('typing')
        }}
        awaitingConfirm={awaitingConfirm}
        confirm={job?.confirm ?? null}
        onConfirm={() => {
          setJob((j) => (j ? { ...j, confirmed: true } : j))
          announce('Got it, continuing.')
        }}
        caption={caption}
        onCaptionClick={() => {
          const o = outputs.find((x) => x.id === flash?.outputId)
          if (o) openOutput(o)
          setFlash(null)
        }}
        referent={referent}
        callee={call?.phase === 'dialing' ? call.contact : null}
        onHangUp={endCall}
        booking={booking}
        onBookingView={setBooking}
        onBookingHold={holdBooking}
        onOrder={(summary) => {
          setBooking(null)
          announce(`Pre-order sent to ${store.name}: ${summary}. It will be ready at ${store.time}.`)
        }}
        onGo={(route) => {
          setBooking(null)
          announce(`${route.label} directions to ${store.name} started, ${route.minutes} minutes.`)
        }}
        fridge={fridge}
        onFridgeView={setFridge}
        onPickSubstitute={(sub) => {
          setFridge(null)
          announce(
            sub.price
              ? `Ordered ${sub.name.toLowerCase()} for ${fridgeAgent.dish}.`
              : `Use ${sub.name.toLowerCase()} instead of mascarpone. You're all set for ${fridgeAgent.dish}.`,
          )
        }}
      />

      {call?.phase === 'connected' && (
        <CallWindow key={call.since} contact={call.contact} since={call.since} from={call.from} onHangUp={endCall} />
      )}

      <TaskDrawer running={runningTasks} finished={finishedTasks} />

      <aside className="demo-panel glass-pill" aria-label="Agent states demo">
        <span>Agent states</span>
        {demo.map((d) => (
          <button key={d.state} className={pill === d.state ? 'is-on' : ''} onClick={d.run}>
            {d.label}
          </button>
        ))}
      </aside>

      {preview && (
        <div className="preview-scrim" onClick={() => setPreview(null)}>
          <div className="preview" onClick={(e) => e.stopPropagation()}>
            <div className={`preview-art kind-${preview.kind}`}>
              <OutputThumb kind={preview.kind} />
            </div>
            <div className="preview-body">
              <span className="card-tag">
                {preview.createdAt} · {preview.subtitle}
              </span>
              <h2>{preview.title}</h2>
              <p>Generated by the agent from your project context. Pin it to keep it at hand.</p>
              <div className="preview-actions">
                <button className="btn-primary" onClick={() => togglePin(preview)}>
                  <IconPin size={18} />
                  {pinnedOutputIds.has(preview.id) ? 'Unpin' : 'Pin'}
                </button>
                <button className="btn-ghost" onClick={() => setPreview(null)}>
                  Close
                </button>
              </div>
            </div>
            <button className="preview-close" onClick={() => setPreview(null)} aria-label="Close">
              <IconClose size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

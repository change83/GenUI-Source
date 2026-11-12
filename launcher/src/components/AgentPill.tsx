import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BALL, GlassPill, type GlassTarget } from '../glass/GlassPill'
import { AudioMotionBridge, AudioReactive } from '../glass/liquidGlass.js'
import {
  IconCamera,
  IconCheck,
  IconClose,
  IconKeyboard,
  IconMic,
  IconSend,
} from './Icons'

export type PillState = 'idle' | 'listening' | 'typing' | 'working' | 'confirm' | 'camera' | 'done'

export interface JobView {
  title: string
  progress: number
  stepLabel: string
  agents: { name: string; active: boolean; done: boolean }[]
}

export interface ConfirmView {
  title: string
  question: string
  options: string[]
  multi: boolean
}

interface Props {
  state: PillState
  input: string
  onInput: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  onActivate: () => void
  onOpenCamera: () => void
  onStartListening: () => void
  onTranscriptDone: (text: string) => void
  job: JobView | null
  awaitingConfirm: boolean
  confirm: ConfirmView | null
  onConfirm: (selected: string[]) => void
  onDefer: () => void
  doneText: string
  onOpenDone: () => void
  cameraQuestion: string
  onCameraAction: (action: 'add' | 'close') => void
}

function useViewport() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

const transcriptScript = ['嗯…', '帮我看看', '帮我看看这副耳机', '帮我看看这副耳机是什么型号？']

function Orb({ size = 22, spinning = false }: { size?: number; spinning?: boolean }) {
  return <span className={`orb ${spinning ? 'is-spinning' : ''}`} style={{ width: size, height: size }} />
}

function Listening({ onDone }: { onDone: (t: string) => void }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (i >= transcriptScript.length) {
      const t = setTimeout(() => onDone(transcriptScript[transcriptScript.length - 1]), 700)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setI(i + 1), i === 0 ? 900 : 650)
    return () => clearTimeout(t)
  }, [i, onDone])
  return (
    <>
      <div className="pill-transcript" key="transcript">
        <span className="pill-transcript-label">正在聆听</span>
        {i === 0 ? <span className="muted">请说…</span> : transcriptScript[i - 1]}
        <span className="caret" />
      </div>
    </>
  )
}

function Camera({ question, onAction }: { question: string; onAction: (a: 'add' | 'close') => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [live, setLive] = useState(false)
  const [phase, setPhase] = useState<'scan' | 'found' | 'answer'>('scan')

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          setLive(true)
        }
      })
      .catch(() => setLive(false))
    const t1 = setTimeout(() => setPhase('found'), 1600)
    const t2 = setTimeout(() => setPhase('answer'), 2800)
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
      <div className="camera-top">
        <span className="camera-chip">
          <i className="dot is-live" />
          {question || '对准你想问的物品'}
        </span>
        <button className="camera-close" onClick={() => onAction('close')} aria-label="关闭取景框">
          <IconClose size={14} />
        </button>
      </div>
      <div className="camera-frame" aria-hidden>
        <i className="tl" />
        <i className="tr" />
        <i className="bl" />
        <i className="br" />
        {phase === 'scan' && <span className="camera-scanline" />}
      </div>
      {phase !== 'scan' && (
        <div className="camera-target">
          <span>{phase === 'found' ? '识别中…' : '头戴式耳机 · 98%'}</span>
        </div>
      )}
      {phase === 'answer' && (
        <div className="camera-answer">
          <div className="camera-answer-head">
            <Orb size={16} />
            <strong>Sony WH-1000XM5</strong>
            <span>参考价 ¥2,499</span>
          </div>
          <p>头戴式主动降噪耳机，30 小时续航，正是你在跟进的竞品之一。</p>
          <div className="camera-answer-actions">
            <button onClick={() => onAction('add')}>加入竞品分析</button>
            <button className="is-ghost" onClick={() => onAction('close')}>
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Confirm({
  view,
  onConfirm,
  onDefer,
}: {
  view: ConfirmView
  onConfirm: (s: string[]) => void
  onDefer: () => void
}) {
  const [selected, setSelected] = useState<string[]>(view.multi ? view.options.slice(0, 3) : [view.options[0]])
  const toggle = (o: string) => {
    if (!view.multi) return setSelected([o])
    setSelected(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o])
  }
  return (
    <div className="pill-confirm">
      <div className="confirm-head">
        <Orb size={20} />
        <div>
          <span className="confirm-eyebrow">需要你确认 · 任务已暂停</span>
          <strong>{view.title}</strong>
        </div>
      </div>
      <p className="confirm-q">{view.question}</p>
      <div className="confirm-options">
        {view.options.map((o) => (
          <button key={o} className={selected.includes(o) ? 'is-on' : ''} onClick={() => toggle(o)}>
            {selected.includes(o) && <IconCheck size={11} />}
            {o}
          </button>
        ))}
      </div>
      <div className="confirm-actions">
        <button className="btn-ghost" onClick={onDefer}>
          稍后处理
        </button>
        <button className="btn-primary" disabled={selected.length === 0} onClick={() => onConfirm(selected)}>
          确认并继续
        </button>
      </div>
    </div>
  )
}

const BOTTOM = 40
const BACKDROP = '/bg.jpg'

interface Form {
  glass: GlassTarget & { width: number; height: number }
  inset: number
}

function formFor(state: PillState, vw: number, hover: boolean): Form {
  const fit = (w: number) => Math.min(w, vw - 48)
  switch (state) {
    case 'idle': {
      const s = hover ? 68 : 60
      return { glass: { ...BALL, width: s, height: s, radius: 30 }, inset: 0 }
    }
    case 'listening':
      return { glass: { ...BALL, width: 112, height: 60, radius: 30, liquid: 30, glow: 92, glowMix: 100 }, inset: 0 }
    case 'typing':
      return { glass: { ...BALL, width: fit(680), height: 60, radius: 30, glow: 0, liquid: 0 }, inset: 0 }
    case 'working':
      return { glass: { ...BALL, width: fit(400), height: 60, radius: 30, glow: 70, liquid: 0 }, inset: 0 }
    case 'done':
      return {
        glass: { ...BALL, width: fit(352), height: 60, radius: 30, glow: 60, liquid: 0, hue1: 140, hue2: 168, hue3: 100 },
        inset: 0,
      }
    case 'confirm':
      return { glass: { ...BALL, width: fit(432), height: 256, radius: 36, liquid: 0, edge: 1 }, inset: 6 }
    case 'camera':
      return { glass: { ...BALL, width: fit(392), height: 352, radius: 32, liquid: 0, edge: 1 }, inset: 6 }
  }
}

export function AgentPill(props: Props) {
  const { state, job } = props
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

  const form = formFor(state, vw, hover && state === 'idle')
  const cw = form.glass.width - form.inset * 2
  const ch = form.glass.height - form.inset * 2

  useLayoutEffect(() => {
    glassRef.current?.hideContent()
  }, [state])

  useEffect(() => {
    glassRef.current?.setTarget(form.glass)
  })

  // Listening: the live microphone level drives the glass motion, like the
  // original agent ball. Without mic permission a soft synthetic voice stands in.
  useEffect(() => {
    if (state !== 'listening') return
    const bridge = new AudioMotionBridge(glassRef.current?.renderer ?? null)
    bridge.setStrength(100)
    let sim: ReturnType<typeof setInterval> | undefined
    const simulate = () => {
      if (sim) return
      let t = 0
      sim = setInterval(() => {
        t += 0.05
        const syllable = Math.max(0, Math.sin(t * 7)) * (0.6 + 0.4 * Math.sin(t * 1.3))
        bridge.setInput({ level: 0.15 + 0.45 * syllable }, true)
      }, 50)
    }
    const audio = new AudioReactive(
      (l) => bridge.setInput(l, true),
      (s) => s.type === 'error' && simulate(),
    )
    audio.setSensitivity(153)
    audio.startMicrophone()
    return () => {
      if (sim) clearInterval(sim)
      audio.dispose()
      bridge.dispose()
    }
  }, [state])

  useEffect(() => {
    if (state === 'typing') {
      const el = inputRef.current
      if (el) {
        el.focus()
        const n = el.value.length
        el.setSelectionRange(n, n)
      }
    }
  }, [state])

  const box = { width: cw, height: ch }

  return (
    <>
      <canvas ref={canvasRef} className="glass-canvas" aria-hidden />
      <div ref={wrapRef} className={`pill-wrap state-${state}`}>
        {state === 'listening' && <Listening onDone={props.onTranscriptDone} />}
        {state === 'idle' && <div className="pill-hint">点击说话 · 直接敲键盘输入</div>}

        <div
          ref={shellRef}
          className={`pill-shell ${state === 'idle' || state === 'listening' ? 'is-tappable' : ''}`}
          role="region"
          aria-label="Agent 状态"
          onClick={state === 'idle' || state === 'listening' ? props.onActivate : undefined}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {state === 'idle' && props.awaitingConfirm && <span className="pill-badge" />}

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
                placeholder="问点什么，或让 Agent 帮你完成一件事…"
                aria-label="输入指令"
              />
              <button type="button" className="pill-icon" onClick={props.onStartListening} title="语音输入">
                <IconMic size={17} />
              </button>
              <button type="button" className="pill-icon" onClick={props.onOpenCamera} title="拍照提问">
                <IconCamera size={17} />
              </button>
              <button type="submit" className="pill-send" disabled={!props.input.trim()} title="发送">
                <IconSend size={16} />
              </button>
            </form>
          )}

          {state === 'working' && job && (
            <div className="pill-content pill-working" style={box}>
              <div className="working-text">
                <strong>{job.title}</strong>
                <span>{job.stepLabel}</span>
              </div>
              <div className="working-agents">
                {job.agents.map((a) => (
                  <span
                    key={a.name}
                    className={`${a.active ? 'is-active' : ''} ${a.done ? 'is-done' : ''}`}
                    title={a.name}
                  >
                    {a.name.slice(0, 1)}
                  </span>
                ))}
              </div>
              <i className="working-track">
                <b style={{ width: `${job.progress}%` }} />
              </i>
            </div>
          )}

          {state === 'confirm' && props.confirm && (
            <div className="pill-content pill-card" style={box}>
              <Confirm view={props.confirm} onConfirm={props.onConfirm} onDefer={props.onDefer} />
            </div>
          )}

          {state === 'camera' && (
            <div className="pill-content pill-card is-camera" style={box}>
              <Camera question={props.cameraQuestion} onAction={props.onCameraAction} />
            </div>
          )}

          {state === 'done' && (
            <div className="pill-content pill-done" style={box}>
              <span className="done-check">
                <IconCheck size={15} />
              </span>
              <strong>{props.doneText}</strong>
              <button onClick={props.onOpenDone}>查看</button>
            </div>
          )}
        </div>

        {state === 'typing' && (
          <div className="pill-shortcuts">
            <span>
              <IconKeyboard size={12} /> Enter 发送
            </span>
            <span>Esc 收起</span>
          </div>
        )}
      </div>
    </>
  )
}

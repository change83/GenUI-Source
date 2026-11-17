import { useEffect, useRef, useState } from 'react'
import type { OutputKind } from '../data'
import { IconArrowUpRight, IconCheck } from './Icons'
import { OutputThumb } from './OutputThumb'

export interface RunningTask {
  id: string
  title: string
  steps: string[]
  step: number
  progress: number
}

export interface FinishedTask {
  id: string
  title: string
  finishedAt: string
  /** What it produced; without one, `result` says what was done. */
  output?: { kind: OutputKind; subtitle: string; onOpen: () => void }
  result?: string
}

const CLOSE_DELAY_MS = 260

function Running({ task }: { task: RunningTask }) {
  const step = Math.min(task.step, task.steps.length - 1)
  return (
    <article className="card drawer-card is-running">
      <header>
        <h3>{task.title}</h3>
        <span className="drawer-percent">{Math.round(task.progress)}%</span>
      </header>
      <p className="drawer-step">
        <i aria-hidden />
        <span>
          Step {step + 1} of {task.steps.length} · {task.steps[step]}
        </span>
      </p>
      <div className="drawer-bar" role="progressbar" aria-valuenow={Math.round(task.progress)} aria-valuemin={0} aria-valuemax={100}>
        <b style={{ width: `${task.progress}%` }} />
      </div>
    </article>
  )
}

function Finished({ task }: { task: FinishedTask }) {
  const { output } = task
  if (output)
    return (
      <article className={`card drawer-card is-done has-output kind-${output.kind}`} onClick={output.onOpen}>
        <div className="drawer-art" aria-label={output.kind === 'poster' ? task.title : undefined}>
          <OutputThumb kind={output.kind} />
        </div>
        {output.kind !== 'poster' && (
          <header>
            <h3>{task.title}</h3>
          </header>
        )}
        <p className="drawer-meta">
          {task.finishedAt} · {output.subtitle}
        </p>
      </article>
    )
  return (
    <article className="card drawer-card is-done">
      <header>
        <h3>{task.title}</h3>
      </header>
      <p className="drawer-result">{task.result}</p>
      <p className="drawer-meta">
        <IconCheck size={12} strokeWidth={2.4} />
        Done · {task.finishedAt}
      </p>
    </article>
  )
}

/** Running and finished tasks, revealed by pushing the pointer against the right screen edge. */
export function TaskDrawer({ running, finished }: { running: RunningTask[]; finished: FinishedTask[] }) {
  const [open, setOpen] = useState(false)
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (closing.current) clearTimeout(closing.current)
    setOpen(true)
  }
  const hide = () => {
    if (closing.current) clearTimeout(closing.current)
    closing.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Each child slides in a little after the one above it.
  const stagger = (i: number) => ({ ['--i' as string]: i })
  const finishedFrom = running.length + 3

  return (
    <>
      <div className="drawer-edge" onPointerEnter={show} aria-hidden />
      <aside
        className={`task-drawer ${open ? 'is-open' : ''}`}
        onPointerEnter={show}
        onPointerLeave={hide}
        aria-label="Tasks"
        aria-hidden={!open}
      >
        <button type="button" className="drawer-all" style={stagger(0)}>
          All tasks
          <IconArrowUpRight size={18} />
        </button>

        <h2 className="drawer-section" style={stagger(1)}>
          In progress <span>{running.length}</span>
        </h2>
        {running.map((t, i) => (
          <div key={t.id} className="drawer-item" style={stagger(i + 2)}>
            <Running task={t} />
          </div>
        ))}

        <h2 className="drawer-section" style={stagger(finishedFrom - 1)}>
          Completed <span>{finished.length}</span>
        </h2>
        {finished.map((t, i) => (
          <div key={t.id} className="drawer-item" style={stagger(finishedFrom + i)}>
            <Finished task={t} />
          </div>
        ))}
      </aside>
    </>
  )
}

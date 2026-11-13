import { useEffect, useRef, useState } from 'react'
import type { OutputKind } from '../data'
import { IconArrowUpRight } from './Icons'
import { OutputThumb } from './OutputThumb'

export interface DrawerTask {
  id: string
  title: string
  subtitle: string
  kind: OutputKind
  status: 'running' | 'done'
  progress?: number
  onOpen?: () => void
}

const CLOSE_DELAY_MS = 260

/** Running and finished tasks, revealed by pushing the pointer against the right screen edge. */
export function TaskDrawer({ tasks }: { tasks: DrawerTask[] }) {
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
        <button type="button" className="drawer-all" style={{ ['--i' as string]: 0 }}>
          All tasks
          <IconArrowUpRight size={18} />
        </button>
        {tasks.map((t, i) => (
          <article
            key={t.id}
            className={`card drawer-card kind-${t.kind} is-${t.status}`}
            style={{ ['--i' as string]: i + 1 }}
            onClick={t.onOpen}
          >
            <i className="drawer-dot" />
            {t.kind !== 'poster' && (
              <header>
                <h3>{t.title}</h3>
                <p>{t.subtitle}</p>
              </header>
            )}
            <div className="drawer-art">
              <OutputThumb kind={t.kind} />
            </div>
            {t.status === 'running' && (
              <div className="drawer-progress">
                <span>In progress</span>
                <span>{Math.round(t.progress ?? 0)}%</span>
                <b style={{ width: `${t.progress ?? 0}%` }} />
              </div>
            )}
          </article>
        ))}
      </aside>
    </>
  )
}

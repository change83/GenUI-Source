import { useEffect, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { widgetLibrary, type Output, type Widget } from '../data'
import { IconCheck, IconClose, IconEdit, IconPlus } from './Icons'
import { WidgetBody } from './Widgets'

interface Props {
  widgets: Widget[]
  outputs: Output[]
  onChange: (next: Widget[]) => void
  onGrab: (e: PointerEvent<HTMLElement>) => void
  dragging: boolean
}

export function PinnedArea({ widgets, outputs, onChange, onGrab, dragging }: Props) {
  const [editing, setEditing] = useState(false)
  const [library, setLibrary] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    if (!library) return
    const close = (e: globalThis.PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.widget-library, .widget-add')) setLibrary(null)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setLibrary(null)
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', esc)
    }
  }, [library])

  const toggleLibrary = (button: HTMLElement) => {
    if (library) return setLibrary(null)
    const r = button.getBoundingClientRect()
    const width = 220
    const height = 64 + widgetLibrary.length * 52
    const left = r.right + 12 + width <= window.innerWidth - 12 ? r.right + 12 : Math.max(12, r.left - 12 - width)
    const top = Math.max(12, Math.min(window.innerHeight - height - 12, r.top))
    setLibrary({ left, top })
  }
  const [dragId, setDragId] = useState<string | null>(null)

  const move = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const next = [...widgets]
    const from = next.findIndex((w) => w.id === fromId)
    const to = next.findIndex((w) => w.id === toId)
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const add = (kind: Widget['kind'], size: Widget['size']) => {
    onChange([...widgets, { id: `w-${kind}-${Date.now()}`, kind, size }])
    setLibrary(null)
  }

  return (
    <section
      className={`pinned glass-panel ${editing ? 'is-editing' : ''} ${dragging ? 'is-moving' : ''}`}
      aria-label="Pinned"
      onPointerDown={(e) => {
        if (editing) return
        if ((e.target as HTMLElement).closest('button, input, a, .widget-library')) return
        onGrab(e)
      }}
    >
      <button
        className="pinned-edit"
        onClick={() => {
          setEditing(!editing)
          setLibrary(null)
        }}
      >
        {editing ? <IconCheck size={18} /> : <IconEdit size={18} />}
        {editing ? 'Done' : 'Edit'}
      </button>

      <div className="pinned-grid">
        {widgets.map((w) => (
          <div
            key={w.id}
            className={`widget size-${w.size} ${dragId === w.id ? 'is-dragging' : ''}`}
            draggable={editing}
            onDragStart={() => setDragId(w.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => {
              e.preventDefault()
              if (dragId) move(dragId, w.id)
            }}
          >
            <WidgetBody widget={w} outputs={outputs} />
            {editing && (
              <button
                className="widget-remove"
                aria-label="Unpin"
                onClick={() => onChange(widgets.filter((x) => x.id !== w.id))}
              >
                <IconClose size={14} />
              </button>
            )}
          </div>
        ))}
        {(editing || widgets.length === 0) && (
          <button className="widget size-small widget-add" onClick={(e) => toggleLibrary(e.currentTarget)}>
            <IconPlus size={28} />
            <span>Add widget</span>
            <small>or pin an agent output here</small>
          </button>
        )}
      </div>

      {library &&
        createPortal(
          <div className="widget-library" style={library}>
            <div className="widget-library-title">Widgets</div>
            {widgetLibrary.map((item) => (
              <button key={item.kind} onClick={() => add(item.kind, item.size)}>
                <strong>{item.name}</strong>
                <span>{item.desc}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </section>
  )
}

import { useState } from 'react'
import { widgetLibrary, type Output, type Widget } from '../data'
import { IconCheck, IconClose, IconEdit, IconPlus } from './Icons'
import { WidgetBody } from './Widgets'

interface Props {
  widgets: Widget[]
  outputs: Output[]
  onChange: (next: Widget[]) => void
}

export function PinnedArea({ widgets, outputs, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
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
    setLibraryOpen(false)
  }

  return (
    <section className={`pinned glass-panel ${editing ? 'is-editing' : ''}`} aria-label="我的固定区">
      <div className="pinned-toolbar">
        <span className="pinned-label">我的固定区</span>
        <button
          className="pinned-edit"
          onClick={() => {
            setEditing(!editing)
            setLibraryOpen(false)
          }}
        >
          {editing ? <IconCheck size={13} /> : <IconEdit size={13} />}
          {editing ? '完成' : '编辑'}
        </button>
      </div>

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
                aria-label="取消固定"
                onClick={() => onChange(widgets.filter((x) => x.id !== w.id))}
              >
                <IconClose size={11} />
              </button>
            )}
          </div>
        ))}
        {(editing || widgets.length === 0) && (
          <button className="widget size-small widget-add" onClick={() => setLibraryOpen(!libraryOpen)}>
            <IconPlus size={22} />
            <span>添加组件</span>
            <small>或把 Agent 产出物固定到这里</small>
          </button>
        )}
      </div>

      {libraryOpen && (
        <div className="widget-library">
          <div className="widget-library-title">组件库</div>
          {widgetLibrary.map((item) => (
            <button key={item.kind} onClick={() => add(item.kind, item.size)}>
              <strong>{item.name}</strong>
              <span>{item.desc}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

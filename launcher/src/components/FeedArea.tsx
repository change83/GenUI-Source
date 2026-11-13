import { useState, type CSSProperties, type Ref } from 'react'
import type { Conversation, Output, RecommendedTask } from '../data'
import type { Arrangement } from '../placement'
import { IconArrowUpRight, IconChat, IconCheck, IconPin, IconSparkle } from './Icons'
import { OutputThumb } from './OutputThumb'

interface Props {
  ref?: Ref<HTMLElement>
  arrangement: Arrangement
  style?: CSSProperties
  outputs: Output[]
  pinnedOutputIds: Set<string>
  conversation: Conversation
  tasks: RecommendedTask[]
  onOpenOutput: (o: Output) => void
  onPinOutput: (o: Output) => void
  onRunTask: (t: RecommendedTask) => void
  onFollowUp: (q: string) => void
  onOutputSettled: (id: string) => void
}

export function FeedArea({
  ref,
  arrangement,
  style,
  outputs,
  pinnedOutputIds,
  conversation,
  tasks,
  onOpenOutput,
  onPinOutput,
  onRunTask,
  onFollowUp,
  onOutputSettled,
}: Props) {
  const [launching, setLaunching] = useState<Set<string>>(new Set())

  // Glow ring, then the card collapses into an orb that drops into the agent ball; the task then runs in the background.
  const launch = async (t: RecommendedTask, card: HTMLElement) => {
    if (launching.has(t.id)) return
    setLaunching((s) => new Set(s).add(t.id))
    await new Promise((r) => setTimeout(r, 720))
    const r = card.getBoundingClientRect()
    const ball = document.querySelector('.pill-shell')?.getBoundingClientRect()
    const d = 60
    const ix = (r.width - d) / 2
    const iy = (r.height - d) / 2
    const dx = ball ? ball.left + ball.width / 2 - (r.left + r.width / 2) : 0
    const dy = ball ? ball.top + ball.height / 2 - (r.top + r.height / 2) : 200
    const collapse = { duration: 420, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' } as const
    card.querySelector('.task-orb')?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1 }], collapse)
    await card.animate(
      [{ clipPath: 'inset(0px round 22px)' }, { clipPath: `inset(${iy}px ${ix}px round ${d / 2}px)` }],
      collapse,
    ).finished
    await card.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 },
      ],
      { duration: 560, easing: 'cubic-bezier(0.55, 0, 0.75, 0.4)', fill: 'forwards', composite: 'add' },
    ).finished
    onRunTask(t)
  }

  return (
    <section ref={ref} className={`feed ${arrangement === 'wide' ? '' : `is-${arrangement}`}`} style={style} aria-label="Agent feed">
      <div className="feed-row">
        {outputs.map((o) => {
          const pinned = pinnedOutputIds.has(o.id)
          return (
            <article
              key={o.id}
              className={`card output-card kind-${o.kind} ${o.fresh ? 'is-fresh' : ''}`}
              onClick={() => onOpenOutput(o)}
              onAnimationEnd={(e) => o.fresh && e.target === e.currentTarget && onOutputSettled(o.id)}
            >
              <div className="output-art">
                <OutputThumb kind={o.kind} />
              </div>
              {o.kind !== 'poster' && <div className="output-title">{o.title}</div>}
              <div className="output-foot">
                <span className="card-tag">
                  {o.unread && <i className="dot" />}
                  {o.unread ? 'New' : 'Recent'}
                </span>
                <button
                  className={`icon-btn ${pinned ? 'is-on' : ''}`}
                  title={pinned ? 'Pinned' : 'Pin to the left'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPinOutput(o)
                  }}
                >
                  {pinned ? <IconCheck size={12} /> : <IconPin size={12} />}
                </button>
              </div>
            </article>
          )
        })}

        <article className="card convo-card">
          <header>
            <IconChat size={15} />
            <h3>{conversation.title}</h3>
          </header>
          <div className="convo-list">
            {conversation.followUps.map((q) => (
              <button key={q} onClick={() => onFollowUp(q)}>
                <span>{q}</span>
                <IconArrowUpRight size={13} />
              </button>
            ))}
          </div>
          <span className="card-tag is-floating">
            <i className="dot is-live" />
            In conversation
          </span>
        </article>
      </div>

      {tasks.map((t) => (
        <article
          key={t.id}
          className={`card task-card ${launching.has(t.id) ? 'is-launching' : ''}`}
          onClick={(e) => launch(t, e.currentTarget)}
        >
          <IconSparkle size={16} className="task-icon" />
          <div className="task-body">
            <p>{t.title}</p>
            <span>{t.deliverable}</span>
          </div>
          <button type="button" className="task-run">
            Run
          </button>
          <span className="task-orb" aria-hidden />
        </article>
      ))}
    </section>
  )
}

import { useState, type CSSProperties, type Ref } from 'react'
import type { Conversation, Output, RecommendedTask } from '../data'
import type { Arrangement } from '../placement'
import { IconArrowUpRight, IconChat, IconCheck, IconPin, IconSparkle } from './Icons'
import { launchIntoBall } from '../glass/GlassLauncher'
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

  // The card gets the agent glass rim, collapses into a glass ball and drops into the agent ball;
  // the task then runs in the background.
  const launch = async (t: RecommendedTask, card: HTMLElement) => {
    if (launching.has(t.id)) return
    setLaunching((s) => new Set(s).add(t.id))
    const ball = document.querySelector('.pill-shell')?.getBoundingClientRect()
    const target = ball
      ? { x: ball.left + ball.width / 2, y: ball.top + ball.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight - 70 }
    await launchIntoBall(card, target)
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
        </article>
      ))}
    </section>
  )
}

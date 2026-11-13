import { useLayoutEffect, useRef, useState, type CSSProperties, type Ref } from 'react'
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
  const local = useRef<HTMLElement | null>(null)
  const setRef = (el: HTMLElement | null) => {
    local.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }

  // FLIP: when cards come or go, the ones that stay glide from their old layout slot to the new one.
  const slots = useRef(new Map<string, { x: number; y: number }>())
  useLayoutEffect(() => {
    const feed = local.current
    if (!feed) return
    const next = new Map<string, { x: number; y: number }>()
    for (const el of feed.querySelectorAll<HTMLElement>('[data-flip]')) {
      const key = el.dataset.flip!
      const at = { x: el.offsetLeft, y: el.offsetTop }
      next.set(key, at)
      const was = slots.current.get(key)
      if (!was || (was.x === at.x && was.y === at.y)) continue
      el.animate([{ transform: `translate(${was.x - at.x}px, ${was.y - at.y}px)` }, { transform: 'none' }], {
        duration: 560,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        composite: 'add',
      })
    }
    slots.current = next
  })

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
    <section ref={setRef} className={`feed ${arrangement === 'wide' ? '' : `is-${arrangement}`}`} style={style} aria-label="Agent feed">
      <div className="feed-row">
        {outputs.map((o) => {
          const pinned = pinnedOutputIds.has(o.id)
          return (
            <article
              key={o.id}
              data-flip={o.id}
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
                  {pinned ? <IconCheck size={16} /> : <IconPin size={16} />}
                </button>
              </div>
            </article>
          )
        })}

        <article className="card convo-card" data-flip="convo">
          <header>
            <IconChat size={20} />
            <h3>{conversation.title}</h3>
          </header>
          <div className="convo-list">
            {conversation.followUps.map((q) => (
              <button key={q} onClick={() => onFollowUp(q)}>
                <span>{q}</span>
                <IconArrowUpRight size={16} />
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
          data-flip={t.id}
          className={`card task-card ${launching.has(t.id) ? 'is-launching' : ''}`}
          onClick={(e) => launch(t, e.currentTarget)}
        >
          <IconSparkle size={20} className="task-icon" />
          <div className="task-body">
            <p>{t.title}</p>
            <span>{t.deliverable}</span>
          </div>
          <button type="button" className="task-run">
            {launching.has(t.id) ? 'In progress' : 'Run'}
          </button>
        </article>
      ))}
    </section>
  )
}

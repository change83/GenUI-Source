import type { Conversation, Output, RecommendedTask } from '../data'
import { IconArrowUpRight, IconChat, IconCheck, IconPin, IconSparkle } from './Icons'
import { OutputThumb } from './OutputThumb'

interface Props {
  outputs: Output[]
  pinnedOutputIds: Set<string>
  conversation: Conversation
  tasks: RecommendedTask[]
  runningTaskId: string | null
  onOpenOutput: (o: Output) => void
  onPinOutput: (o: Output) => void
  onRunTask: (t: RecommendedTask) => void
  onFollowUp: (q: string) => void
}

export function FeedArea({
  outputs,
  pinnedOutputIds,
  conversation,
  tasks,
  runningTaskId,
  onOpenOutput,
  onPinOutput,
  onRunTask,
  onFollowUp,
}: Props) {
  return (
    <section className="feed" aria-label="Agent feed">
      <div className="feed-row">
        {outputs.map((o) => {
          const pinned = pinnedOutputIds.has(o.id)
          return (
            <article
              key={o.id}
              className={`card output-card kind-${o.kind} ${o.fresh ? 'is-fresh' : ''}`}
              onClick={() => onOpenOutput(o)}
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

      {tasks.map((t) => {
        const running = runningTaskId === t.id
        return (
          <article
            key={t.id}
            className={`card task-card ${running ? 'is-running' : ''}`}
            onClick={() => !running && onRunTask(t)}
          >
            <IconSparkle size={16} className="task-icon" />
            <div className="task-body">
              <p>{t.title}</p>
              <span>{t.deliverable}</span>
            </div>
            <span className="task-cta">{running ? 'Running…' : 'Run with agent'}</span>
            <span className="card-tag is-floating">Suggested</span>
          </article>
        )
      })}
    </section>
  )
}

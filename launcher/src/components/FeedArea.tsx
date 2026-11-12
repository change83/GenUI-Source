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
  const unread = outputs.filter((o) => o.unread)
  const featured = unread[0] ?? outputs[0]
  const pinned = featured ? pinnedOutputIds.has(featured.id) : false

  return (
    <section className="feed" aria-label="Agent feed">
      <div className="feed-row">
        {featured && (
          <article
            key={featured.id}
            className={`card output-card kind-${featured.kind} ${featured.unread ? 'is-unread' : ''}`}
            onClick={() => onOpenOutput(featured)}
          >
            <div className="output-art">
              <OutputThumb kind={featured.kind} />
            </div>
            {featured.kind !== 'poster' && <div className="output-title">{featured.title}</div>}
            <div className="output-foot">
              <span className="card-tag">
                {featured.unread && <i className="dot" />}
                {featured.unread ? (unread.length > 1 ? `${unread.length} new` : 'New') : 'Recent'}
              </span>
              <button
                className={`icon-btn ${pinned ? 'is-on' : ''}`}
                title={pinned ? 'Pinned' : 'Pin to the left'}
                onClick={(e) => {
                  e.stopPropagation()
                  onPinOutput(featured)
                }}
              >
                {pinned ? <IconCheck size={12} /> : <IconPin size={12} />}
              </button>
            </div>
            {unread.length > 1 && <div className="output-stack" aria-hidden />}
          </article>
        )}

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

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
    <section className="feed" aria-label="Agent 动态">
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
            <div className="output-title">{featured.title}</div>
            <div className="output-foot">
              <span className="card-tag">
                {featured.unread && <i className="dot" />}
                {featured.unread ? (unread.length > 1 ? `${unread.length} 个新产出` : '新产出') : '最近产出'}
              </span>
              <button
                className={`icon-btn ${pinned ? 'is-on' : ''}`}
                title={pinned ? '已固定到左侧' : '固定到左侧'}
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
            对话进行中
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
            <span className="task-cta">{running ? '执行中…' : '让 Agent 执行'}</span>
            <span className="card-tag is-floating">推荐任务</span>
          </article>
        )
      })}
    </section>
  )
}

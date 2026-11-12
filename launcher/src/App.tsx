import { useCallback, useEffect, useRef, useState } from 'react'
import { AgentPill, type ConfirmView, type PillState } from './components/AgentPill'
import { Background } from './components/Background'
import { FeedArea } from './components/FeedArea'
import { IconArchive, IconClose, IconGauge, IconPin, IconUser } from './components/Icons'
import { OutputThumb } from './components/OutputThumb'
import { PinnedArea } from './components/PinnedArea'
import {
  conversation,
  initialOutputs,
  initialWidgets,
  recommendedTasks,
  type Output,
  type OutputKind,
  type RecommendedTask,
  type Widget,
} from './data'

interface Job {
  id: string
  title: string
  kind: OutputKind
  taskId: string | null
  progress: number
  confirm: ConfirmView | null
  confirmed: boolean
}

const AGENTS = ['检索 Agent', '分析 Agent', '设计 Agent', '校对 Agent']
const STEPS = ['理解需求', '检索资料', '分析整理', '生成产出', '校对润色']
const CONFIRM_AT = 42

function confirmFor(kind: OutputKind, title: string): ConfirmView | null {
  if (kind === 'report')
    return {
      title,
      question: '报告将对比以下竞品，是否需要调整？',
      options: ['Sony WH-1000XM5', 'Bose QC Ultra', 'AirPods Max', '华为 FreeBuds Pro 4'],
      multi: true,
    }
  if (kind === 'web')
    return {
      title,
      question: '产品介绍页使用哪种视觉风格？',
      options: ['极简留白', '科技暗色', '活力渐变'],
      multi: false,
    }
  return null
}

function guessKind(text: string): OutputKind {
  if (/网页|网站|页面|web|demo/i.test(text)) return 'web'
  if (/海报|图片|设计|poster/i.test(text)) return 'poster'
  return 'report'
}

export default function App() {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [outputs, setOutputs] = useState<Output[]>(initialOutputs)
  const [pill, setPill] = useState<PillState>('idle')
  const [input, setInput] = useState('')
  const [job, setJob] = useState<Job | null>(null)
  const [doneOutput, setDoneOutput] = useState<Output | null>(null)
  const [preview, setPreview] = useState<Output | null>(null)
  const [cameraQuestion, setCameraQuestion] = useState('')
  const pillRef = useRef(pill)
  useEffect(() => {
    pillRef.current = pill
  }, [pill])

  const awaitingConfirm = !!job && !!job.confirm && !job.confirmed && job.progress >= CONFIRM_AT

  const restState = useCallback((): PillState => {
    if (job && !awaitingConfirm) return 'working'
    return 'idle'
  }, [job, awaitingConfirm])

  const startJob = useCallback(
    (title: string, kind: OutputKind, opts: { taskId?: string; ask?: boolean; progress?: number } = {}) => {
      setJob({
        id: `j-${Date.now()}`,
        title,
        kind,
        taskId: opts.taskId ?? null,
        progress: opts.progress ?? 0,
        confirm: opts.ask === false ? null : confirmFor(kind, title),
        confirmed: false,
      })
      setInput('')
      setPill('working')
    },
    [],
  )

  // Job simulation: advances while the agent is not blocked on the user.
  useEffect(() => {
    if (!job || awaitingConfirm) return
    const t = setTimeout(() => {
      const progress = Math.min(100, job.progress + 1.1)
      if (job.confirm && !job.confirmed && progress >= CONFIRM_AT) {
        setJob({ ...job, progress })
        if (pillRef.current === 'working') setPill('confirm')
        return
      }
      if (progress < 100) {
        setJob({ ...job, progress })
        return
      }
      const output: Output = {
        id: `o-${job.id}`,
        kind: job.kind,
        title: job.title.replace(/^(帮我|请|生成一份|生成一个|生成)/, '').slice(0, 22),
        subtitle: job.kind === 'web' ? 'Web Demo' : job.kind === 'poster' ? 'PNG' : 'PDF 文件 · 12 页',
        createdAt: '刚刚',
        unread: true,
      }
      setOutputs((o) => [output, ...o])
      setDoneOutput(output)
      setJob(null)
      if (pillRef.current === 'working' || pillRef.current === 'idle') setPill('done')
    }, 90)
    return () => clearTimeout(t)
  }, [job, awaitingConfirm])

  useEffect(() => {
    if (pill !== 'done') return
    const t = setTimeout(() => setPill('idle'), 6000)
    return () => clearTimeout(t)
  }, [pill])

  // Any printable keystroke morphs the pill into the input bar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'Escape') {
        if (preview) return setPreview(null)
        if (pill === 'typing' || pill === 'listening' || pill === 'camera') setPill(restState())
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return
      if (pill === 'confirm' || pill === 'camera') return
      e.preventDefault()
      // Keys pressed mid-morph, before the input takes focus, must not be dropped.
      setInput((v) => (pill === 'typing' ? v + e.key : e.key))
      setPill('typing')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pill, preview, restState])

  const openOutput = (o: Output) => {
    setOutputs((list) => list.map((x) => (x.id === o.id ? { ...x, unread: false } : x)))
    setPreview({ ...o, unread: false })
  }

  const pinnedOutputIds = new Set(widgets.filter((w) => w.kind === 'output').map((w) => w.outputId!))
  const togglePin = (o: Output) => {
    if (pinnedOutputIds.has(o.id)) setWidgets((ws) => ws.filter((w) => w.outputId !== o.id))
    else setWidgets((ws) => [...ws, { id: `w-out-${o.id}`, kind: 'output', size: 'small', outputId: o.id }])
  }

  const runTask = (t: RecommendedTask) => startJob(t.title, t.outputKind, { taskId: t.id })

  const handleTranscriptDone = useCallback((text: string) => {
    setCameraQuestion(text)
    setPill('camera')
  }, [])

  const stepIndex = job ? Math.min(STEPS.length - 1, Math.floor((job.progress / 100) * STEPS.length)) : 0
  const activeAgent = job ? Math.min(AGENTS.length - 1, Math.floor((job.progress / 100) * AGENTS.length)) : 0
  const jobView = job && {
    title: job.title,
    progress: job.progress,
    stepLabel: `${AGENTS[activeAgent].replace(' Agent', '')}协作中 · ${STEPS[stepIndex]} ${stepIndex + 1}/${STEPS.length}`,
    agents: AGENTS.map((name, i) => ({ name, active: i === activeAgent, done: i < activeAgent })),
  }

  const demo: { state: PillState; label: string; run: () => void }[] = [
    { state: 'idle', label: '待机', run: () => setPill('idle') },
    { state: 'listening', label: '聆听', run: () => setPill('listening') },
    { state: 'typing', label: '输入', run: () => setPill('typing') },
    {
      state: 'working',
      label: '执行 · 协作',
      run: () => startJob('整理智能耳机用户访谈要点', 'report', { ask: false }),
    },
    {
      state: 'confirm',
      label: '确认通知',
      run: () => startJob(recommendedTasks[0].title, 'report', { taskId: recommendedTasks[0].id, progress: CONFIRM_AT - 2 }),
    },
    {
      state: 'camera',
      label: '取景框',
      run: () => {
        setCameraQuestion('这副耳机是什么型号？')
        setPill('camera')
      },
    },
    {
      state: 'done',
      label: '结果反馈',
      run: () => startJob('耳机节日海报 · 第二版', 'poster', { ask: false, progress: 98 }),
    },
  ]

  return (
    <div className="app">
      <Background />

      <nav className="topbar glass-pill" aria-label="系统">
        <button title="仪表盘">
          <IconGauge size={15} />
        </button>
        <button title="账户">
          <IconUser size={15} />
        </button>
        <button title="归档">
          <IconArchive size={15} />
        </button>
      </nav>

      <main className={`stage ${pill === 'confirm' || pill === 'camera' ? 'is-dimmed' : ''}`}>
        <PinnedArea widgets={widgets} outputs={outputs} onChange={setWidgets} />
        <FeedArea
          outputs={outputs}
          pinnedOutputIds={pinnedOutputIds}
          conversation={conversation}
          tasks={recommendedTasks}
          runningTaskId={job?.taskId ?? null}
          onOpenOutput={openOutput}
          onPinOutput={togglePin}
          onRunTask={runTask}
          onFollowUp={(q) => startJob(q, 'report', { ask: false })}
        />
      </main>

      <AgentPill
        state={pill}
        input={input}
        onInput={setInput}
        onSubmit={() => input.trim() && startJob(input.trim(), guessKind(input))}
        onCancel={() => {
          setInput('')
          setPill(restState())
        }}
        onActivate={() => {
          if (pill === 'listening') return setPill(restState())
          if (awaitingConfirm) return setPill('confirm')
          setPill('listening')
        }}
        onOpenCamera={() => {
          setCameraQuestion(input.trim())
          setInput('')
          setPill('camera')
        }}
        onStartListening={() => setPill('listening')}
        onTranscriptDone={handleTranscriptDone}
        job={jobView}
        awaitingConfirm={awaitingConfirm}
        confirm={job?.confirm ?? null}
        onConfirm={() => {
          setJob((j) => (j ? { ...j, confirmed: true } : j))
          setPill('working')
        }}
        onDefer={() => setPill('idle')}
        doneText={doneOutput ? `「${doneOutput.title}」已生成` : '任务已完成'}
        onOpenDone={() => {
          if (doneOutput) openOutput(doneOutput)
          setPill('idle')
        }}
        cameraQuestion={cameraQuestion}
        onCameraAction={(a) => {
          if (a === 'add') startJob('将 Sony WH-1000XM5 加入竞品分析', 'report', { ask: false })
          else setPill(restState())
        }}
      />

      <aside className="demo-panel glass-pill" aria-label="原型状态演示">
        <span>药丸状态</span>
        {demo.map((d) => (
          <button key={d.state} className={pill === d.state ? 'is-on' : ''} onClick={d.run}>
            {d.label}
          </button>
        ))}
      </aside>

      {preview && (
        <div className="preview-scrim" onClick={() => setPreview(null)}>
          <div className="preview" onClick={(e) => e.stopPropagation()}>
            <div className={`preview-art kind-${preview.kind}`}>
              <OutputThumb kind={preview.kind} />
            </div>
            <div className="preview-body">
              <span className="card-tag">{preview.createdAt}生成 · {preview.subtitle}</span>
              <h2>{preview.title}</h2>
              <p>由 Agent 根据你的项目上下文生成。可以固定到左侧，方便随时查看。</p>
              <div className="preview-actions">
                <button className="btn-primary" onClick={() => togglePin(preview)}>
                  <IconPin size={14} />
                  {pinnedOutputIds.has(preview.id) ? '取消固定' : '固定到左侧'}
                </button>
                <button className="btn-ghost" onClick={() => setPreview(null)}>
                  关闭
                </button>
              </div>
            </div>
            <button className="preview-close" onClick={() => setPreview(null)} aria-label="关闭">
              <IconClose size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

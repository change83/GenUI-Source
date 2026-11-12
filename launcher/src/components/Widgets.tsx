import { useMemo, useState } from 'react'
import type { Output, Widget } from '../data'
import {
  IconChevronDown,
  IconFile,
  IconFolder,
  IconGlobe,
  IconMore,
  IconNews,
  IconRun,
  IconSun,
} from './Icons'
import { OutputThumb } from './OutputThumb'

const days = [9, 10, 11, 12, 13, 14, 15]
const hours = ['08:30', '09:00', '10:00', '11:00', '11:30', '12:30', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

const events: Record<number, { title: string; time: string; place: string; start: number; span: number; tone: 'rose' | 'violet' }[]> = {
  10: [
    { title: 'Breakfast', time: '8:30-9:30', place: 'home', start: 0, span: 1.6, tone: 'rose' },
    { title: 'Lunch with Emilia', time: '11:30-12:30', place: 'Taste Korea', start: 4, span: 1.6, tone: 'violet' },
    { title: 'Daily UI', time: '12:30-15:00', place: 'Taste Korea', start: 5.7, span: 2.6, tone: 'rose' },
    { title: 'Yoga course', time: '19:00-20:30', place: 'home', start: 12, span: 1.7, tone: 'rose' },
  ],
  11: [
    { title: 'PRD review', time: '10:00-11:30', place: 'Room 3F', start: 2, span: 2, tone: 'violet' },
    { title: 'Competitor sync', time: '14:00-15:00', place: 'Online', start: 7, span: 1.6, tone: 'rose' },
  ],
}

function CalendarWidget() {
  const [day, setDay] = useState(10)
  const list = events[day] ?? []
  const rowH = 26
  return (
    <div className="w-calendar">
      <div className="w-cal-head">
        <span className="w-title">June</span>
        <button className="link-btn">Add</button>
      </div>
      <div className="w-cal-days">
        {days.map((d) => (
          <button key={d} className={d === day ? 'is-active' : ''} onClick={() => setDay(d)}>
            {d}
          </button>
        ))}
      </div>
      <div className="w-cal-timeline">
        <div className="w-cal-hours">
          {hours.map((h) => (
            <span key={h} style={{ height: rowH }}>
              {h}
            </span>
          ))}
        </div>
        <div className="w-cal-events" style={{ height: hours.length * rowH }}>
          {list.length === 0 && <div className="w-cal-empty">Nothing scheduled</div>}
          {list.map((e) => (
            <div
              key={e.title}
              className={`w-cal-event tone-${e.tone}`}
              style={{ top: e.start * rowH + 4, height: e.span * rowH - 4 }}
            >
              <strong>{e.title}</strong>
              <span>
                {e.time}
                <em>{e.place}</em>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const candles = [
  { o: 8.1, c: 8.9, h: 9.2, l: 7.9 },
  { o: 8.6, c: 7.6, h: 8.8, l: 7.2 },
  { o: 7.4, c: 8.4, h: 8.6, l: 7.1 },
  { o: 8.2, c: 9.3, h: 9.6, l: 8.0 },
  { o: 9.1, c: 7.8, h: 9.3, l: 7.4 },
  { o: 7.9, c: 8.8, h: 9.0, l: 7.6 },
  { o: 8.7, c: 9.6, h: 9.9, l: 8.5 },
  { o: 9.4, c: 8.4, h: 9.6, l: 8.1 },
  { o: 8.5, c: 9.0, h: 9.3, l: 8.2 },
  { o: 9.1, c: 9.9, h: 10.1, l: 8.9 },
]

function StockWidget() {
  const [range, setRange] = useState<'Month' | 'Week'>('Month')
  const w = 128
  const h = 92
  const min = 6.8
  const max = 10.3
  const y = (v: number) => h - ((v - min) / (max - min)) * h
  return (
    <div className="w-stock">
      <div className="w-stock-head">
        <span className="w-stock-value">
          $112,340<small>.00</small>
        </span>
        <button className="chip-btn" onClick={() => setRange(range === 'Month' ? 'Week' : 'Month')}>
          {range}
          <IconChevronDown size={10} />
        </button>
      </div>
      <div className="w-stock-chart">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {[7, 8, 9, 10].map((v) => (
            <line key={v} x1={0} x2={w} y1={y(v)} y2={y(v)} stroke="#eceae7" strokeDasharray="2 3" />
          ))}
          {candles.map((c, i) => {
            const x = 6 + i * 12.4
            const up = c.c >= c.o
            const color = up ? '#3fb36b' : '#f2707a'
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1.2} />
                <rect
                  x={x - 2.5}
                  width={5}
                  y={y(Math.max(c.o, c.c))}
                  height={Math.max(2, Math.abs(y(c.o) - y(c.c)))}
                  rx={1.5}
                  fill={color}
                />
              </g>
            )
          })}
        </svg>
        <div className="w-stock-axis">
          <span>$10k</span>
          <span className="is-tag">$9,000</span>
          <span>$8k</span>
          <span>$7k</span>
        </div>
      </div>
      <div className="w-stock-x">
        <span>Dec 22</span>
        <span>Dec 23</span>
        <span>Dec 24</span>
        <span>Dec 25</span>
      </div>
    </div>
  )
}

function RunningWidget() {
  const done = useMemo(() => new Set([0, 1, 3, 5, 6, 7, 9, 12, 15, 17, 21, 22, 25]), [])
  return (
    <div className="w-running">
      <div className="w-run-head">
        <span className="w-run-icon">
          <IconRun size={16} />
        </span>
        <div>
          <div className="w-title-s">Running Activity</div>
          <div className="w-meta">1-28, February 2026</div>
        </div>
        <IconMore size={14} className="w-more" />
      </div>
      <div className="w-run-total">
        182,75 <small>km</small>
      </div>
      <div className="w-run-dots">
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} className={done.has(i) ? 'is-done' : ''}>
            {done.has(i) && <IconRun size={7} />}
          </span>
        ))}
      </div>
    </div>
  )
}

function WeatherWidget() {
  return (
    <div className="w-weather">
      <div className="w-meta">San Francisco</div>
      <IconSun size={34} className="w-weather-icon" />
      <div className="w-weather-temp">72°</div>
      <div className="w-meta">Partly cloudy · 64° / 79°</div>
    </div>
  )
}

function ProjectWidget() {
  const steps = [
    { name: 'Research', v: 100 },
    { name: 'PRD writing', v: 72 },
    { name: 'Competitor analysis', v: 40 },
  ]
  return (
    <div className="w-project">
      <div className="w-run-head">
        <span className="w-run-icon is-blue">
          <IconFolder size={15} />
        </span>
        <div>
          <div className="w-title-s">Smart Headphones</div>
          <div className="w-meta">Due June 30</div>
        </div>
      </div>
      {steps.map((s) => (
        <div key={s.name} className="w-progress">
          <div>
            <span>{s.name}</span>
            <span>{s.v}%</span>
          </div>
          <i>
            <b style={{ width: `${s.v}%` }} />
          </i>
        </div>
      ))}
    </div>
  )
}

function NewsWidget() {
  const items = [
    { tag: 'Market', text: 'Global TWS shipments up 11% YoY in Q2 2026' },
    { tag: 'Rival', text: 'Sony ships a new ANC chip with 30% longer battery' },
    { tag: 'Tech', text: 'Open-ear designs are the new sports trend' },
  ]
  return (
    <div className="w-news">
      <div className="w-run-head">
        <span className="w-run-icon is-amber">
          <IconNews size={15} />
        </span>
        <div className="w-title-s">Following</div>
      </div>
      {items.map((n) => (
        <div key={n.text} className="w-news-item">
          <em>{n.tag}</em>
          <span>{n.text}</span>
        </div>
      ))}
    </div>
  )
}

function OutputWidget({ output }: { output?: Output }) {
  if (!output) return null
  const Icon = output.kind === 'web' ? IconGlobe : IconFile
  return (
    <div className="w-output">
      <OutputThumb kind={output.kind} />
      <div className="w-output-meta">
        <Icon size={12} />
        <span>{output.title}</span>
      </div>
    </div>
  )
}

export function WidgetBody({ widget, outputs }: { widget: Widget; outputs: Output[] }) {
  switch (widget.kind) {
    case 'calendar':
      return <CalendarWidget />
    case 'stock':
      return <StockWidget />
    case 'running':
      return <RunningWidget />
    case 'weather':
      return <WeatherWidget />
    case 'project':
      return <ProjectWidget />
    case 'news':
      return <NewsWidget />
    case 'output':
      return <OutputWidget output={outputs.find((o) => o.id === widget.outputId)} />
  }
}

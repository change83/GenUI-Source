import { useState } from 'react'
import { price, store, type Route } from '../booking'
import { IconChevronLeft, IconMinus, IconNavigate, IconPlus } from './Icons'

export type BookingView = 'result' | 'compact' | 'menu' | 'directions'

export function BluebirdLogo({ size = 60 }: { size?: number }) {
  return (
    <span className="bluebird-logo" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 64 64" width={size * 0.76} height={size * 0.76}>
        <path
          fill="#1f5fc4"
          d="M10 44c5-1 9-4 12-8 4-6 9-11 17-12 1-5 5-9 10-9 4 0 6 2 7 5l5 1-5 3c0 9-5 17-14 21-6 3-13 3-19 1l-10 7 3-8z"
        />
        <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" d="M27 37c5-1 10-4 13-8" />
        <circle cx="51" cy="20" r="1.9" fill="#fff" />
        <path stroke="#1f5fc4" strokeWidth="2.2" strokeLinecap="round" d="M34 49l-1 6M39 48l1 6" />
      </svg>
    </span>
  )
}

function Header({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  return (
    <div className="booking-head">
      <button className="booking-back" onClick={onBack} aria-label="Back">
        <IconChevronLeft size={18} />
      </button>
      <div>
        <strong>{title}</strong>
        <span>{sub}</span>
      </div>
    </div>
  )
}

function Menu({ onBack, onOrder }: { onBack: () => void; onOrder: (summary: string) => void }) {
  const [qty, setQty] = useState<Record<string, number>>({})
  const set = (id: string, d: number) => setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + d) }))
  const count = Object.values(qty).reduce((a, b) => a + b, 0)
  const total = store.menu.reduce((sum, m) => sum + (qty[m.id] ?? 0) * m.price, 0)
  return (
    <>
      <Header title="Ordering Menu" sub={`${store.name} · ready at ${store.time}`} onBack={onBack} />
      <ul className="booking-menu">
        {store.menu.map((m) => {
          const n = qty[m.id] ?? 0
          return (
            <li key={m.id}>
              <i className="booking-thumb" style={{ background: m.tint }} aria-hidden />
              <div>
                <strong>{m.name}</strong>
                <span>{m.note}</span>
              </div>
              <em>{price(m.price)}</em>
              <div className={`booking-stepper ${n ? 'is-on' : ''}`}>
                {n > 0 && (
                  <>
                    <button onClick={() => set(m.id, -1)} aria-label={`One less ${m.name}`}>
                      <IconMinus size={14} />
                    </button>
                    <b>{n}</b>
                  </>
                )}
                <button onClick={() => set(m.id, 1)} aria-label={`Add ${m.name}`}>
                  <IconPlus size={14} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <button
        className="booking-btn is-primary"
        disabled={!count}
        onClick={() => onOrder(`${count} item${count > 1 ? 's' : ''}, ${price(total)}`)}
      >
        {count ? `Pre-order ${count} item${count > 1 ? 's' : ''} · ${price(total)}` : 'Add items to pre-order'}
      </button>
    </>
  )
}

function RouteMap({ mode }: { mode: Route['mode'] }) {
  const path = mode === 'drive' ? 'M46 132 H150 V58 H300 V44 H332' : 'M46 132 H118 L178 74 H262 L300 44 H332'
  return (
    <svg className="booking-map" viewBox="0 0 388 168" role="img" aria-label={`Route to ${store.name}`}>
      <rect width="388" height="168" fill="#eef0ec" />
      <path d="M0 150 C 90 136, 170 168, 260 146 S 360 120, 388 128 V168 H0z" fill="#cfe3f4" />
      <rect x="196" y="92" width="84" height="40" rx="8" fill="#d5e8c8" />
      <rect x="30" y="20" width="64" height="40" rx="6" fill="#e2e4e0" />
      <rect x="318" y="76" width="50" height="34" rx="6" fill="#e2e4e0" />
      <g stroke="#fff" strokeWidth="10" strokeLinecap="round" fill="none">
        <path d="M0 132 H388M150 0 V168M0 58 H388M300 0 V140M118 132 L178 74 H262 L300 44" />
      </g>
      <path d={path} fill="none" stroke="#9b40dc" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={mode === 'walk' ? '1 8' : undefined} />
      <circle cx="46" cy="132" r="9" fill="#fff" />
      <circle cx="46" cy="132" r="5.5" fill="#3b82f6" />
      <g transform="translate(332 44)">
        <path d="M0 0 C -12 -12, -12 -30, 0 -30 S 12 -12, 0 0z" fill="#1f5fc4" />
        <circle cy="-19" r="5" fill="#fff" />
      </g>
      <text x="58" y="122" className="booking-map-label">You</text>
      <text x="318" y="30" textAnchor="end" className="booking-map-label">
        {store.name}
      </text>
    </svg>
  )
}

function Directions({ onBack, onGo }: { onBack: () => void; onGo: (route: Route) => void }) {
  const [mode, setMode] = useState<Route['mode']>('walk')
  const route = store.routes.find((r) => r.mode === mode) ?? store.routes[0]
  return (
    <>
      <Header title="Directions" sub={`${store.name} · ${store.address}`} onBack={onBack} />
      <RouteMap mode={mode} />
      <div className="booking-modes" role="radiogroup" aria-label="Travel mode">
        {store.routes.map((r) => (
          <button key={r.mode} role="radio" aria-checked={r.mode === mode} className={r.mode === mode ? 'is-on' : ''} onClick={() => setMode(r.mode)}>
            {r.label} · {r.minutes} min
          </button>
        ))}
        <span>{route.distance}</span>
      </div>
      <button className="booking-btn is-primary" onClick={() => onGo(route)}>
        <IconNavigate size={16} />
        Start navigation · {route.minutes} min
      </button>
    </>
  )
}

/**
 * The shop agent's reply to a reservation. The actions fade away when left alone; choosing one
 * grows the card into that content.
 */
export function BookingCard(props: {
  view: BookingView
  size: { width: number; height: number }
  onView: (view: BookingView) => void
  onHold: (held: boolean) => void
  onOrder: (summary: string) => void
  onGo: (route: Route) => void
}) {
  const { view } = props
  const back = () => props.onView('result')
  return (
    <div
      className={`pill-booking is-${view}`}
      style={props.size}
      onPointerEnter={() => props.onHold(true)}
      onPointerLeave={() => props.onHold(false)}
    >
      {view === 'menu' ? (
        <Menu onBack={back} onOrder={props.onOrder} />
      ) : view === 'directions' ? (
        <Directions onBack={back} onGo={props.onGo} />
      ) : (
        <>
          <strong className="booking-title">{store.name}</strong>
          <div className="booking-reply">
            <BluebirdLogo />
            <p>{store.message}</p>
          </div>
          <div className="booking-actions" aria-hidden={view === 'compact'}>
            <button className="booking-btn is-primary" tabIndex={view === 'compact' ? -1 : 0} onClick={() => props.onView('menu')}>
              Ordering Menu
            </button>
            <button className="booking-btn" tabIndex={view === 'compact' ? -1 : 0} onClick={() => props.onView('directions')}>
              Directions
            </button>
          </div>
        </>
      )}
    </div>
  )
}

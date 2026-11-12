import type { OutputKind } from '../data'

function Headphones() {
  return (
    <svg viewBox="0 0 200 200" className="thumb-headphones" aria-hidden>
      <defs>
        <linearGradient id="hp-band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6efe6" />
          <stop offset="1" stopColor="#cdbfae" />
        </linearGradient>
        <radialGradient id="hp-cup" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fbf6ef" />
          <stop offset="0.6" stopColor="#e2d6c6" />
          <stop offset="1" stopColor="#b9a893" />
        </radialGradient>
        <radialGradient id="hp-pad" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#d9cbb8" />
          <stop offset="1" stopColor="#a8957f" />
        </radialGradient>
        <filter id="hp-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#6b3a2a" floodOpacity="0.28" />
        </filter>
      </defs>
      <path d="M-10 170 C 40 120, 90 180, 210 120 L 210 210 L -10 210 Z" fill="#d8352f" opacity="0.9" />
      <path d="M-10 182 C 50 140, 110 196, 210 140" stroke="#f05b4e" strokeWidth="6" fill="none" opacity="0.7" />
      <g filter="url(#hp-shadow)">
        <path
          d="M52 118 C 46 54, 92 28, 120 30 C 156 32, 178 66, 168 122"
          stroke="url(#hp-band)"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M60 104 C 60 60, 96 42, 120 42" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="62" cy="134" rx="30" ry="38" fill="url(#hp-cup)" transform="rotate(-12 62 134)" />
        <ellipse cx="68" cy="132" rx="20" ry="28" fill="url(#hp-pad)" transform="rotate(-12 68 132)" opacity="0.6" />
        <ellipse cx="150" cy="138" rx="32" ry="40" fill="url(#hp-cup)" transform="rotate(10 150 138)" />
        <ellipse cx="146" cy="136" rx="24" ry="31" fill="url(#hp-pad)" transform="rotate(10 146 136)" />
        <ellipse cx="146" cy="136" rx="13" ry="18" fill="#8c7a66" opacity="0.35" transform="rotate(10 146 136)" />
      </g>
      <g fill="#c22e2a">
        <circle cx="176" cy="18" r="3" />
        <circle cx="186" cy="12" r="2.2" />
        <path d="M168 26 l 22 -18" stroke="#7a2a22" strokeWidth="1.4" />
      </g>
    </svg>
  )
}

function Report() {
  return (
    <div className="thumb-report">
      <div className="thumb-doc">
        <i className="l1" />
        <i className="l2" />
        <div className="thumb-bars">
          {[46, 70, 34, 88, 58].map((h, i) => (
            <b key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
        <i className="l3" />
        <i className="l2" />
      </div>
      <span className="thumb-badge">PDF</span>
    </div>
  )
}

function Web() {
  return (
    <div className="thumb-web">
      <div className="thumb-browser">
        <div className="thumb-browser-bar">
          <i />
          <i />
          <i />
        </div>
        <div className="thumb-browser-hero">
          <div>
            <i className="l1" />
            <i className="l2" />
            <b />
          </div>
          <span className="thumb-browser-orb" />
        </div>
      </div>
      <span className="thumb-badge is-blue">WEB</span>
    </div>
  )
}

export function OutputThumb({ kind }: { kind: OutputKind }) {
  if (kind === 'poster') return <Headphones />
  if (kind === 'report') return <Report />
  return <Web />
}

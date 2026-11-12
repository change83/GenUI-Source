import type { OutputKind } from '../data'

function Poster() {
  return <img className="thumb-poster" src="/poster.png" alt="" draggable={false} />
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
  if (kind === 'poster') return <Poster />
  if (kind === 'report') return <Report />
  return <Web />
}

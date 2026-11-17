import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { initials } from '../call'
import type { Contact } from '../data'
import { IconHangUp } from './Icons'

type Box = { left: number; top: number; width: number; height: number }

const DOCK = { left: 24, top: 24 }
const FLY_MS = 760
const CLOSE_MS = 220

export function Avatar({ contact, size }: { contact: Contact; size: number }) {
  return contact.avatar ? (
    <img className="call-avatar" src={contact.avatar} alt="" width={size} height={size} />
  ) : (
    <span className="call-avatar is-initials" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(contact.name)}
    </span>
  )
}

export function HangUpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="call-hangup"
      aria-label="Hang up"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <IconHangUp size={22} />
    </button>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

function Clock({ since }: { since: number }) {
  const [now, setNow] = useState(since)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((now - since) / 1000))
  return (
    <span className="call-clock">
      {pad(Math.floor(s / 60))} : {pad(s % 60)}
    </span>
  )
}

/** The user's own camera in the corner, with a still standing in when there is no camera. */
function SelfView() {
  const ref = useRef<HTMLVideoElement>(null)
  const [live, setLive] = useState(false)
  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        if (ref.current) {
          ref.current.srcObject = s
          setLive(true)
        }
      })
      .catch(() => setLive(false))
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])
  return (
    <div className="call-self">
      <img src="/call-self.jpg" alt="" />
      <video ref={ref} autoPlay playsInline muted className={live ? 'is-live' : ''} />
    </div>
  )
}

/**
 * The connected call. It starts exactly over the calling card the agent pill had become, then
 * splits off and floats to the top-left corner of the desktop while the pill shrinks back into
 * the ball.
 */
export function CallWindow({
  contact,
  since,
  from,
  onHangUp,
}: {
  contact: Contact
  since: number
  from: Box | null
  onHangUp: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Only the starting point; later renders must not replay the flight.
  const start = useRef(from)
  const [closing, setClosing] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    const from = start.current
    if (!el || !from) return
    const to = { left: DOCK.left, top: DOCK.top, width: el.offsetWidth, height: el.offsetHeight }
    const px = (b: Box) => ({ left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px` })
    // A slight overshoot past the corner, then it settles: the window is thrown off the ball.
    const flight = [
      el.animate([{ ...px(from), borderRadius: '36px' }, { ...px(to), borderRadius: '28px' }], {
        duration: FLY_MS,
        easing: 'cubic-bezier(0.3, 1.25, 0.5, 1)',
      }),
      el.querySelector('.call-panel')?.animate([{ opacity: 0.4, filter: 'blur(4px)' }, { opacity: 1, filter: 'none' }], {
        duration: FLY_MS * 0.6,
        easing: 'ease-out',
      }),
    ]
    // The docked size is measured above, so a re-run must not see this flight still applied.
    return () => flight.forEach((a) => a?.cancel())
  }, [])

  const hangUp = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onHangUp, CLOSE_MS)
  }

  return (
    <div ref={ref} className={`call-window ${closing ? 'is-closing' : ''}`} style={DOCK} role="dialog" aria-label={`Call with ${contact.name}`}>
      <div className="call-panel">
        <Clock since={since} />
        <div className="call-video">
          {contact.video ? (
            <img className="call-remote" src={contact.video} alt={contact.name} />
          ) : (
            <div className="call-remote is-audio">
              <Avatar contact={contact} size={84} />
              <span>{contact.name}</span>
            </div>
          )}
          <SelfView />
        </div>
        <HangUpButton onClick={hangUp} />
      </div>
    </div>
  )
}

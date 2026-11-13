import { BALL, toDataUrl } from './GlassPill'
import { GlassRenderer } from './liquidGlass.js'

type Pt = { x: number; y: number }

const BACKDROP = '/bg-dusk.jpg'
const BALL_SIZE = 30
const GLOW_MS = 900
// The rim band sits just outside the card, like the collaboration card's 6px glass edge.
const RIM = 6
const FADE_MS = 160

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Plays the task-launch sequence on its own liquid-glass pane, using the same renderer and
 * material as the agent ball:
 * 1. A 6px edge-glow band (as on the collaboration card) wraps the outside of the card.
 * 2. The card fades and the pane springs, with overshoot, into a ball.
 * 3. The ball flies along an arc into the agent ball, stretching along its velocity.
 * Resolves when the ball has merged; falls back to a plain fade when WebGL is unavailable.
 */
export async function launchIntoBall(card: HTMLElement, target: Pt, radius = 22): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.className = 'launch-canvas'
  document.body.appendChild(canvas)

  let glass: GlassRenderer
  try {
    glass = new GlassRenderer(canvas)
    glass.setQuality('auto')
    glass.setParams(BALL)
    await glass.setBackgroundImage(await toDataUrl(BACKDROP))
  } catch {
    canvas.remove()
    card.style.transition = `opacity ${FADE_MS}ms`
    card.style.opacity = '0'
    await wait(FADE_MS)
    return
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const r = card.getBoundingClientRect()
  const start = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  const place = (p: Pt) => glass.setPosition({ x: p.x / vw, y: p.y / vh })

  glass.setParams({ width: r.width + RIM * 2, height: r.height + RIM * 2, radius: radius + RIM, liquid: 0 })
  glass.setPresentation({ edgeGlowOnly: 1 })
  glass.setHollow(RIM)
  place(start)
  requestAnimationFrame(() => canvas.classList.add('is-visible'))
  await wait(GLOW_MS)

  card.style.transition = `opacity ${FADE_MS}ms`
  card.style.opacity = '0'
  glass.setHollow(0)

  // Under-damped springs give the collapse and landing their bounce.
  const size = { w: r.width + RIM * 2, h: r.height + RIM * 2, rad: radius + RIM, vw: 0, vh: 0, vr: 0 }
  let edge = 1
  let flight = 0
  let flightV = 0
  let flying = false
  let elapsed = 0
  let prev = start
  const control = {
    x: (start.x + target.x) / 2 + (target.x - start.x) * 0.15,
    y: Math.min(start.y, target.y) - Math.max(60, Math.abs(target.y - start.y) * 0.35),
  }
  const along = (t: number): Pt => {
    const u = 1 - t
    return {
      x: u * u * start.x + 2 * u * t * control.x + t * t * target.x,
      y: u * u * start.y + 2 * u * t * control.y + t * t * target.y,
    }
  }

  await new Promise<void>((resolve) => {
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000)
      last = now
      elapsed += dt

      const spring = (value: number, velocity: number, to: number, k: number, c: number) => {
        const v = velocity + (k * (to - value) - c * velocity) * dt
        return [value + v * dt, v]
      }
      ;[size.w, size.vw] = spring(size.w, size.vw, BALL_SIZE, 170, 13)
      ;[size.h, size.vh] = spring(size.h, size.vh, BALL_SIZE, 170, 13)
      ;[size.rad, size.vr] = spring(size.rad, size.vr, BALL_SIZE / 2, 170, 13)
      edge += (0 - edge) * (1 - Math.exp(-dt * 8))

      if (!flying && elapsed > 0.38) flying = true
      if (flying) [flight, flightV] = spring(flight, flightV, 1, 46, 9.5)
      const t = Math.min(1.06, flight)
      const pos = along(t)
      const vx = (pos.x - prev.x) / Math.max(dt, 0.001)
      const vy = (pos.y - prev.y) / Math.max(dt, 0.001)
      prev = pos
      const speed = Math.hypot(vx, vy)
      const stretch = Math.min(0.32, speed / 4200)
      const ux = speed > 1 ? Math.abs(vx) / speed : 0
      const uy = speed > 1 ? Math.abs(vy) / speed : 0
      const sx = 1 + stretch * ux - stretch * 0.5 * uy
      const sy = 1 + stretch * uy - stretch * 0.5 * ux

      glass.setParams({ width: size.w * sx, height: size.h * sy, radius: size.rad * Math.min(sx, sy) })
      glass.setPresentation({ edgeGlowOnly: edge })
      glass.setTransientMotion({ x: vx, y: vy, amount: Math.min(0.9, speed / 2600) })
      place(pos)

      const arrived = flying && Math.abs(1 - flight) < 0.02 && Math.abs(flightV) < 0.25
      if (arrived || elapsed > 2.4) {
        canvas.classList.remove('is-visible')
        resolve()
        return
      }
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })

  await wait(FADE_MS)
  glass.dispose()
  canvas.remove()
}

import { useEffect, useLayoutEffect, useMemo, type RefObject } from 'react'

type Pt = { x: number; y: number }
type Sample = Pt & { t: number }
type Follower = Pt & { vx: number; vy: number; delay: number }

const BASE_DELAY = 200
const STEP_DELAY = 100
// Critically damped spring: starts and stops at zero velocity, so each card eases in and out.
const OMEGA = 5

function createTrailer(selector: string) {
  let history: Sample[] = []
  let followers = new Map<HTMLElement, Follower>()
  let frame = 0
  let last = 0

  const sampleAt = (t: number): Pt => {
    for (let i = history.length - 1; i >= 0; i--) if (history[i].t <= t) return history[i]
    return history[0]
  }

  const rank = (group: HTMLElement, from: Pt) => {
    const anchor = (group.firstElementChild as HTMLElement).getBoundingClientRect()
    const ax = anchor.left + anchor.width / 2
    const ay = anchor.top + anchor.height / 2
    const cards = [...group.querySelectorAll<HTMLElement>(selector)].map((el) => {
      const r = el.getBoundingClientRect()
      return { el, d: Math.hypot(r.left + r.width / 2 - ax, r.top + r.height / 2 - ay) }
    })
    cards.sort((a, b) => a.d - b.d)
    followers = new Map(cards.map(({ el }, i) => [el, { ...from, vx: 0, vy: 0, delay: BASE_DELAY + i * STEP_DELAY }]))
  }

  const step = (now: number) => {
    const head = history[history.length - 1]
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    let busy = false
    let maxDelay = 0
    for (const [el, f] of followers) {
      maxDelay = Math.max(maxDelay, f.delay)
      const target = sampleAt(now - f.delay)
      f.vx += (OMEGA * OMEGA * (target.x - f.x) - 2 * OMEGA * f.vx) * dt
      f.vy += (OMEGA * OMEGA * (target.y - f.y) - 2 * OMEGA * f.vy) * dt
      f.x += f.vx * dt
      f.y += f.vy * dt
      const ox = f.x - head.x
      const oy = f.y - head.y
      if (Math.abs(ox) > 0.3 || Math.abs(oy) > 0.3 || Math.hypot(f.vx, f.vy) > 2) busy = true
      el.style.translate = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`
    }
    if (busy || now - head.t < maxDelay) {
      const cutoff = now - maxDelay - 200
      while (history.length > 1 && history[1].t < cutoff) history.shift()
      frame = requestAnimationFrame(step)
      return
    }
    for (const el of followers.keys()) el.style.translate = ''
    history = [head]
    frame = 0
  }

  return {
    move(group: HTMLElement, pos: Pt) {
      const now = performance.now()
      if (history.length === 0) {
        history.push({ ...pos, t: now })
        return
      }
      if (!frame) {
        const prev = history[history.length - 1]
        history[history.length - 1] = { ...prev, t: now - 1 }
        rank(group, prev)
      }
      history.push({ ...pos, t: now })
      cancelAnimationFrame(frame)
      last = now
      step(now)
    },
    stop() {
      cancelAnimationFrame(frame)
    },
  }
}

/**
 * Cards matching `selector` inside the group lag behind group moves: each replays the group
 * position from `BASE_DELAY` ms ago, plus `STEP_DELAY` ms per rank of distance from the anchor
 * (the group's first child), then springs toward it.
 */
export function useTrailingCards(groupRef: RefObject<HTMLElement | null>, pos: Pt | null, selector: string) {
  const trailer = useMemo(() => createTrailer(selector), [selector])

  useLayoutEffect(() => {
    if (pos && groupRef.current) trailer.move(groupRef.current, pos)
  }, [pos, trailer, groupRef])

  useEffect(() => () => trailer.stop(), [trailer])
}

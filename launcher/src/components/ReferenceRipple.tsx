import { useEffect, useRef, useState } from 'react'

const FADE_MS = 360

/**
 * Rings that spread outward from the edge of the card the user just mentioned. The overlay is
 * fixed and re-measured every frame, so it stays on a card that is dragged or reflowed, and it
 * can spill past cards that clip their own content.
 */
export function ReferenceRipple({ target, onLost }: { target: HTMLElement | null; onLost: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const lost = useRef(onLost)
  // Outlives `target` by one fade so the rings dissolve instead of vanishing.
  const [shown, setShown] = useState(target)
  if (target && target !== shown) setShown(target)

  useEffect(() => {
    lost.current = onLost
  }, [onLost])

  useEffect(() => {
    if (target) return
    const t = setTimeout(() => setShown(null), FADE_MS)
    return () => clearTimeout(t)
  }, [target])

  useEffect(() => {
    const el = box.current
    if (!shown || !el) return
    el.style.setProperty('--r', getComputedStyle(shown).borderTopLeftRadius || '22px')
    let raf = 0
    const track = () => {
      if (!shown.isConnected) return lost.current()
      const r = shown.getBoundingClientRect()
      el.style.transform = `translate(${r.left}px, ${r.top}px)`
      el.style.width = `${r.width}px`
      el.style.height = `${r.height}px`
      raf = requestAnimationFrame(track)
    }
    track()
    return () => cancelAnimationFrame(raf)
  }, [shown])

  if (!shown) return null
  return (
    <div ref={box} className={`ref-ripple ${target === shown ? '' : 'is-leaving'}`} aria-hidden>
      <i />
      <i />
      <i />
    </div>
  )
}

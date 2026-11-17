export type Arrangement = 'wide' | 'compact' | 'strip'
export const ARRANGEMENTS: Arrangement[] = ['wide', 'compact', 'strip']
export type Size = { w: number; h: number }
export type FeedSizes = Record<Arrangement, Size>
type Rect = { x: number; y: number; w: number; h: number }

/** Feed position relative to the pinned panel's top-left corner, plus the card arrangement to use. */
export interface Placement {
  x: number
  y: number
  arrangement: Arrangement
}

const MARGIN = 16

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/**
 * Finds where the feed can sit next to the pinned panel without leaving the viewport, or null.
 * Preference: wide, then compact (narrow column), then strip (one short row); for each,
 * right, left, below, then above the panel.
 * Beside the panel it is top-aligned, falling back to bottom-aligned, then shifted just enough
 * to fit; above or below it is left-aligned, falling back to right-aligned, then shifted.
 */
export function placeFeed(p: Rect, sizes: FeedSizes, gap: number, vw: number, vh: number): Placement | null {
  const fitsX = (x: number, w: number) => x >= MARGIN && x + w <= vw - MARGIN
  const fitsY = (y: number, h: number) => y >= MARGIN && y + h <= vh - MARGIN

  const beside = (side: 'right' | 'left', { w, h }: Size) => {
    const x = side === 'right' ? p.x + p.w + gap : p.x - gap - w
    if (!fitsX(x, w) || h > vh - 2 * MARGIN) return null
    let y = p.y
    if (!fitsY(y, h)) y = p.y + p.h - h
    return { x, y: clamp(y, MARGIN, vh - MARGIN - h) }
  }

  const stacked = (side: 'below' | 'above', { w, h }: Size) => {
    const y = side === 'below' ? p.y + p.h + gap : p.y - gap - h
    if (!fitsY(y, h) || w > vw - 2 * MARGIN) return null
    let x = p.x
    if (!fitsX(x, w)) x = p.x + p.w - w
    return { x: clamp(x, MARGIN, vw - MARGIN - w), y }
  }

  for (const arrangement of ARRANGEMENTS) {
    const size = sizes[arrangement]
    const spot =
      beside('right', size) ?? beside('left', size) ?? stacked('below', size) ?? stacked('above', size)
    if (spot) return { x: spot.x - p.x, y: spot.y - p.y, arrangement }
  }
  return null
}

/** Last resort when the window is too small for any arrangement: keep as much on screen as possible. */
export function fallbackPlacement(p: Rect, sizes: FeedSizes, gap: number, vw: number, vh: number): Placement {
  const { w, h } = sizes.compact
  return {
    x: clamp(p.x + p.w + gap, MARGIN, Math.max(MARGIN, vw - MARGIN - w)) - p.x,
    y: clamp(p.y, MARGIN, Math.max(MARGIN, vh - MARGIN - h)) - p.y,
    arrangement: 'compact',
  }
}

/** Measures the feed in both arrangements on an off-screen, animation-free copy. */
export function measureFeed(feed: HTMLElement): FeedSizes {
  const probe = (arrangement: Arrangement): Size => {
    const copy = feed.cloneNode(true) as HTMLElement
    copy.classList.toggle('is-compact', arrangement === 'compact')
    copy.classList.toggle('is-strip', arrangement === 'strip')
    copy.classList.add('is-measuring')
    copy.style.left = '-10000px'
    copy.style.top = '0px'
    copy.querySelectorAll<HTMLElement>('[style]').forEach((el) => (el.style.translate = ''))
    feed.parentElement!.appendChild(copy)
    const row = copy.querySelector<HTMLElement>('.feed-row')
    const size = { w: Math.max(copy.offsetWidth, row?.scrollWidth ?? 0), h: copy.offsetHeight }
    copy.remove()
    return size
  }
  return { wide: probe('wide'), compact: probe('compact'), strip: probe('strip') }
}

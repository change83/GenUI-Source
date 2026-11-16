/**
 * Referring: finds the on-screen card or widget that the user's spoken or typed words point at,
 * and where the agent pill should dock on it.
 */

export interface Referent {
  /** The card or widget whose text was mentioned. */
  el: HTMLElement
  /** Where the matched word is rendered; null when the text is only a label for an image. */
  node: Text | null
  start: number
  end: number
}

type Pt = { x: number; y: number }

const SCOPE = '.feed .card, .pinned .widget:not(.widget-add)'
const WORD = /[\p{L}\p{N}]+/gu
const CJK = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/
const STOP = new Set(
  (
    'the and for with from into onto about that this these those there here what which who whom whose when where why how ' +
    'you your yours mine our ours his her hers its their them they she him are was were been being have has had does did ' +
    'can could will would shall should may might must not but any all some more most much many very just also than then ' +
    'too out off over under again please show open tell see look let get got give want need like know think say said ' +
    'make made take one two'
  ).split(' '),
)

const VISIBLE = {
  checkOpacity: true,
  checkVisibilityCSS: true,
  opacityProperty: true,
  visibilityProperty: true,
} as CheckVisibilityOptions

interface Word {
  text: string
  node: Text | null
  start: number
  end: number
}

function wordsOf(el: HTMLElement): Word[] {
  const out: Word[] = []
  // Text that is on screen as artwork rather than DOM text (a poster's title).
  for (const m of (el.dataset.ref ?? '').matchAll(WORD)) out.push({ text: m[0].toLowerCase(), node: null, start: 0, end: 0 })
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text
    const parent = node.parentElement
    if (!parent || parent.checkVisibility?.(VISIBLE) === false) continue
    for (const m of node.data.matchAll(WORD)) {
      out.push({ text: m[0].toLowerCase(), node, start: m.index, end: m.index + m[0].length })
    }
  }
  return out
}

/** Optimal string alignment distance, abandoned once it exceeds `max`. */
function editDistance(a: string, b: string, max: number): number {
  let prev2: number[] = []
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1)
      row.push(v)
      best = Math.min(best, v)
    }
    if (best > max) return max + 1
    prev2 = prev
    prev = row
  }
  return prev[b.length]
}

/** 4 = same word, 3 = inflection of it, 2 = still being typed, 1 = misspelling, 0 = unrelated. */
function quality(token: string, word: string, partial: boolean): number {
  if (token === word) return 4
  if (CJK.test(token) || CJK.test(word)) {
    return (word.length >= 2 && token.includes(word)) || (token.length >= 2 && word.includes(token)) ? 3 : 0
  }
  const [short, long] = token.length <= word.length ? [token, word] : [word, token]
  if (short.length >= 4 && long.length - short.length <= 3 && long.startsWith(short)) return 3
  if (partial && token.length >= 4 && word.startsWith(token)) return 2
  if (token.length >= 5 && token[0] === word[0] && Math.abs(token.length - word.length) <= 2) {
    const max = token.length >= 8 ? 2 : 1
    if (editDistance(token, word, max) <= max) return 1
  }
  return 0
}

function score(token: { text: string; partial: boolean }, words: Word[]) {
  let best = 0
  let count = 0
  let at: Word | null = null
  for (const w of words) {
    const q = quality(token.text, w.text, token.partial)
    if (!q) continue
    count++
    if (q > best) {
      best = q
      at = w
    }
  }
  return at ? { value: best * 100 + Math.min(count, 9), at } : null
}

/**
 * The element the utterance refers to: the latest word that appears on screen decides, and the
 * two words before it break ties ("analysis report" prefers the card that has both).
 * `typing` lets the word under the caret match as a prefix.
 */
export function findReferent(utterance: string, typing = false): Referent | null {
  const raw = [...utterance.toLowerCase().matchAll(WORD)].map((m) => m[0])
  const open = typing && /[\p{L}\p{N}]$/u.test(utterance)
  const tokens = raw
    .map((text, i) => ({ text, partial: open && i === raw.length - 1 }))
    .filter((t) => (CJK.test(t.text) ? t.text.length >= 2 : t.text.length >= 3) && !STOP.has(t.text))
  if (tokens.length === 0) return null

  const candidates = [...document.querySelectorAll<HTMLElement>(SCOPE)].map((el) => ({ el, words: wordsOf(el) }))
  for (let i = tokens.length - 1; i >= 0; i--) {
    let top: { total: number; el: HTMLElement; at: Word } | null = null
    for (const c of candidates) {
      const s = score(tokens[i], c.words)
      if (!s) continue
      let total = s.value
      for (let j = Math.max(0, i - 2); j < i; j++) total += (score(tokens[j], c.words)?.value ?? 0) / 2
      if (!top || total > top.total) top = { total, el: c.el, at: s.at }
    }
    if (top) return { el: top.el, node: top.at.node, start: top.at.start, end: top.at.end }
  }
  return null
}

export function sameReferent(a: Referent | null, b: Referent | null) {
  return a === b || (!!a && !!b && a.el === b.el && a.node === b.node && a.start === b.start)
}

function textRect(ref: Referent): DOMRect | null {
  if (!ref.node?.isConnected || ref.end > ref.node.length) return null
  const range = document.createRange()
  range.setStart(ref.node, ref.start)
  range.setEnd(ref.node, ref.end)
  const r = range.getBoundingClientRect()
  return r.width > 0 && r.height > 0 ? r : null
}

const clamp = (v: number, lo: number, hi: number) => (hi < lo ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)))

/** How far the ball overlaps the card it perches on, and the gap a wide pill keeps from it. */
const PERCH = 16
const GAP = 10
const MARGIN = 8

/**
 * Centre for a pill of `size` docked on the referenced card: on the card edge nearest the
 * mentioned word, level with that word. The ball perches on the rim; a wide pill (the text
 * field) sits just outside the top or bottom edge so it never covers what it points at.
 */
export function dockPoint(ref: Referent, size: { width: number; height: number }): Pt | null {
  if (!ref.el.isConnected) return null
  const card = ref.el.getBoundingClientRect()
  if (card.width === 0 || card.height === 0) return null
  const text = textRect(ref)
  const tx = text ? text.left + text.width / 2 : card.left + card.width / 2
  // Artwork has no text position; its top edge is where the layout usually has free space.
  const ty = text ? text.top + text.height / 2 : card.top
  const compact = size.width <= 120
  const hw = size.width / 2
  const hh = size.height / 2

  const out = compact ? hh - PERCH : hh + GAP
  const sides: { d: number; at: Pt }[] = [
    { d: ty - card.top, at: { x: clamp(tx, card.left + hw, card.right - hw), y: card.top - out } },
    { d: card.bottom - ty, at: { x: clamp(tx, card.left + hw, card.right - hw), y: card.bottom + out } },
  ]
  if (compact) {
    sides.push(
      { d: tx - card.left, at: { x: card.left - (hw - PERCH), y: clamp(ty, card.top + hh, card.bottom - hh) } },
      { d: card.right - tx, at: { x: card.right + (hw - PERCH), y: clamp(ty, card.top + hh, card.bottom - hh) } },
    )
  }
  const { at } = sides.reduce((a, b) => (b.d < a.d ? b : a))
  return {
    x: clamp(at.x, MARGIN + hw, window.innerWidth - MARGIN - hw),
    y: clamp(at.y, MARGIN + hh, window.innerHeight - MARGIN - hh),
  }
}

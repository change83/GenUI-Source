import { contacts, type Contact } from './data'

const EN_CALL = /\b(?:video\s+call|facetime|call|phone|ring|dial)\s+(?:up\s+)?(.+?)(?:\s+(?:now|please|for me|right now))?[\s.!?。！？]*$/iu
const ZH_GIVE = /给(.+?)(?:打|拨)(?:个|一个|一下|一通)?(?:视频)?电话/u
const ZH_CALL = /(?:打(?:个|一个)?(?:视频)?电话|视频通话|拨打|呼叫)(?:给)?(.+?)[\s。！？!?]*$/u
const HANG_UP = /\b(?:hang\s*up|end\s+(?:the\s+)?call|stop\s+(?:the\s+)?call)\b|挂断|挂掉|挂了|结束通话/iu

/** A request to call someone, or null. `known` is false for a name that is not in the contacts. */
export function parseCall(text: string): { contact: Contact; known: boolean } | null {
  const said = text.trim()
  const match = said.match(ZH_GIVE) ?? said.match(ZH_CALL) ?? said.match(EN_CALL)
  const raw = match?.[1]
    ?.replace(/^(?:a|an|the)\s+/i, '')
    .replace(/^(?:请|帮我|给)/u, '')
    .trim()
  if (!raw || raw.length > 24) return null
  const key = raw.toLowerCase()
  const known = contacts.find((c) => c.aliases.includes(key) || c.name.toLowerCase() === key)
  if (known) return { contact: known, known: true }
  // "call it a day", "call back": not a person.
  if (/^(?:it|that|this|back|me|off|out|in|again|now)\b/i.test(key)) return null
  const name = /[\u3400-\u9fff]/u.test(raw) ? raw : raw.replace(/\b\p{L}/gu, (c) => c.toUpperCase())
  return { contact: { id: `c-${key}`, name, aliases: [key] }, known: false }
}

export function isHangUp(text: string) {
  return HANG_UP.test(text)
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return /[\u3400-\u9fff]/u.test(name) ? name.trim().slice(-1) : parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

interface RecognitionResult {
  readonly length: number
  [index: number]: { transcript: string }
}

interface RecognitionEvent {
  resultIndex: number
  results: { readonly length: number; [index: number]: RecognitionResult }
}

interface Recognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}

const MAX_FAILURES = 3

/**
 * Streams what the user is saying, phrase by phrase (interim results included), using the
 * browser's speech recognition. Returns a function that stops listening. Does nothing where
 * the API is missing; gives up after repeated errors (no permission, or no route to the
 * recognition service) rather than retrying forever.
 */
export function listenForSpeech(onText: (text: string) => void, lang = 'en-US'): () => void {
  const scope = window as unknown as Record<string, (new () => Recognition) | undefined>
  const Ctor = scope.SpeechRecognition ?? scope.webkitSpeechRecognition
  if (!Ctor) return () => {}

  let stopped = false
  let failures = 0
  let retry = 0
  const rec = new Ctor()
  rec.continuous = true
  rec.interimResults = true
  rec.lang = lang
  rec.onresult = (e) => {
    failures = 0
    // The agent's own spoken replies come back through the microphone; they are not the user.
    if (window.speechSynthesis?.speaking) return
    let text = ''
    for (let i = e.resultIndex; i < e.results.length; i++) text += `${e.results[i][0].transcript} `
    if (text.trim()) onText(text)
  }
  rec.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return
    failures = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? MAX_FAILURES : failures + 1
  }
  // Recognition ends by itself after a pause; keep it running while the agent listens.
  rec.onend = () => {
    if (stopped || failures >= MAX_FAILURES) return
    retry = window.setTimeout(start, 300)
  }
  const start = () => {
    try {
      rec.start()
    } catch {
      failures++
    }
  }
  start()

  return () => {
    stopped = true
    clearTimeout(retry)
    rec.onresult = rec.onerror = rec.onend = null
    try {
      rec.abort()
    } catch {
      /* already stopped */
    }
  }
}

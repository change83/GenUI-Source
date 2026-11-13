import { GlassRenderer, type GlassParams } from './liquidGlass.js'

// Base material from the agent-ball settings in liquid-glass.html.
export const BALL: GlassParams = {
  width: 60,
  height: 60,
  radius: 30,
  blur: 20,
  highlight: 64,
  reflection: 65,
  refraction: 70,
  opacity: 50,
  dispersion: 80,
  glow: 44,
  liquid: 20,
  speed: 80,
  hue1: 281,
  hue2: 24,
  hue3: 251,
  glowBlend: 'normal',
  glowMix: 91,
  deformationMode: 'spherical',
}

export type GlassTarget = Partial<Omit<GlassParams, 'glowBlend' | 'deformationMode'>> & {
  /** 1 = only the exposed rim glows, used when opaque content covers the pane. */
  edge?: number
}

type NumKey = Exclude<keyof GlassParams, 'glowBlend' | 'deformationMode'>
const SPRING_KEYS: NumKey[] = ['width', 'height', 'radius', 'glow', 'liquid', 'hue1', 'hue2', 'hue3', 'glowMix']

interface Options {
  canvas: HTMLCanvasElement
  shell: HTMLElement
  wrap: HTMLElement
  bottom: number
  /** Same image as the CSS page background (centered cover), so refraction lines up. */
  backdrop: string
}

// The renderer only accepts data URLs for background images; cached so extra panes start instantly.
const dataUrls = new Map<string, Promise<string>>()
export function toDataUrl(url: string): Promise<string> {
  let cached = dataUrls.get(url)
  if (!cached) {
    cached = readDataUrl(url)
    dataUrls.set(url, cached)
  }
  return cached
}

async function readDataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export class GlassPill {
  readonly renderer: GlassRenderer | null
  private shell: HTMLElement
  private wrap: HTMLElement
  private bottom: number
  private current: Record<NumKey, number>
  private to: Record<NumKey, number>
  private from: Record<NumKey, number>
  private velocity: Partial<Record<NumKey, number>> = {}
  private edge = 0
  private edgeTo = 0
  private elapsed = 0
  private morphing = false
  private error = 0
  private motion = 0
  private content = 1
  private raf: number | null = null
  private last: number | null = null
  private disposed = false

  constructor({ canvas, shell, wrap, bottom, backdrop }: Options) {
    this.shell = shell
    this.wrap = wrap
    this.bottom = bottom
    const start = Object.fromEntries(SPRING_KEYS.map((k) => [k, BALL[k] as number])) as Record<NumKey, number>
    this.current = { ...start }
    this.to = { ...start }
    this.from = { ...start }

    let renderer: GlassRenderer | null = null
    try {
      renderer = new GlassRenderer(canvas)
      renderer.setParams(BALL)
      renderer.setQuality('auto')
      const r = renderer
      toDataUrl(backdrop)
        .then((data) => !this.disposed && r.setBackgroundImage(data))
        .catch(() => {})
    } catch {
      renderer = null
    }
    this.renderer = renderer
    wrap.classList.toggle('has-glass', !!renderer)
    wrap.classList.toggle('no-glass', !renderer)
    window.addEventListener('resize', this.onResize)
    this.layout()
  }

  private onResize = () => this.layout()

  setTarget(target: GlassTarget) {
    if (this.disposed) return
    const next = { ...this.to }
    for (const k of SPRING_KEYS) if (typeof target[k] === 'number') next[k] = target[k] as number
    const edgeTo = target.edge ?? 0
    const changed = SPRING_KEYS.some((k) => next[k] !== this.to[k]) || edgeTo !== this.edgeTo
    if (!changed) return
    this.from = { ...this.current }
    this.to = next
    this.edgeTo = edgeTo
    this.elapsed = 0
    this.morphing = true
    this.schedule()
  }

  /** Called when the content inside the pane is swapped, so it fades in as the shape settles. */
  hideContent() {
    this.content = 0
    this.applyContent()
    this.schedule()
  }

  private schedule() {
    if (this.raf === null && !this.disposed) this.raf = requestAnimationFrame((t) => this.tick(t))
  }

  private tick(now: number) {
    this.raf = null
    if (this.disposed) return
    const dt = this.last === null ? 1 / 60 : Math.min(0.04, Math.max(0.001, (now - this.last) / 1000))
    this.last = now

    if (this.morphing) {
      this.elapsed += dt
      const steps = Math.max(1, Math.ceil(dt / 0.006))
      const step = dt / steps
      let error = 0
      let motion = 0
      for (const key of SPRING_KEYS) {
        let value = this.current[key]
        let v = this.velocity[key] ?? 0
        const dimension = key === 'width' || key === 'height'
        const k = key === 'height' ? 118 : dimension ? 100 : 132
        const damping = dimension ? 15.5 : 23
        for (let i = 0; i < steps; i++) {
          v += (k * (this.to[key] - value) - damping * v) * step
          value += v * step
        }
        const min = dimension ? 10 : 0
        if (value < min) {
          value = min
          v = 0
        }
        this.current[key] = value
        this.velocity[key] = v
        const unit = Math.max(1, Math.abs(this.to[key]), Math.abs(this.from[key]))
        error = Math.max(error, Math.abs(this.to[key] - value) / unit)
        motion = Math.max(motion, Math.abs(v) / unit)
      }
      this.edge += (this.edgeTo - this.edge) * (1 - Math.exp(-dt * 10))
      this.error = error
      this.motion = motion
      if ((error < 0.00025 && motion < 0.004) || this.elapsed >= 1.8) {
        this.current = { ...this.to }
        this.velocity = {}
        this.edge = this.edgeTo
        this.morphing = false
        this.error = 0
        this.motion = 0
      }
      this.renderer?.setParams(this.current)
      this.renderer?.setPresentation({ edgeGlowOnly: this.edge })
      this.renderer?.setMorphMotion({ amount: this.morphing ? Math.min(0.1, motion * 0.035) : 0, x: 1, y: 0 })
    }

    const settled = this.morphing ? Math.max(0, Math.min(1, 1 - Math.max(this.error / 0.22, this.motion / 2.4))) : 1
    const before = this.content
    this.content += (settled - this.content) * (1 - Math.exp(-dt * (settled < this.content ? 24 : 13)))
    if (Math.abs(this.content - settled) < 0.001) this.content = settled
    const contentMoving = this.content !== before && this.content !== settled

    this.layout()
    if (this.morphing || contentMoving || this.content < 1) this.schedule()
    else this.last = null
  }

  private applyContent() {
    this.wrap.style.setProperty('--content', this.content.toFixed(3))
  }

  private layout() {
    const { width, height, radius } = this.current
    const r = Math.min(radius, width / 2, height / 2)
    this.shell.style.width = `${width}px`
    this.shell.style.height = `${height}px`
    this.shell.style.borderRadius = `${r}px`
    this.applyContent()
    if (this.renderer) {
      const vh = window.innerHeight
      this.renderer.setPosition({ x: 0.5, y: (vh - this.bottom - height / 2) / vh })
    }
  }

  dispose() {
    this.disposed = true
    if (this.raf !== null) cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    this.renderer?.dispose()
  }
}

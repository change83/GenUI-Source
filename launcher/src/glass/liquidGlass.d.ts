export interface GlassParams {
  width: number
  height: number
  radius: number
  blur: number
  highlight: number
  reflection: number
  refraction: number
  opacity: number
  dispersion: number
  glow: number
  liquid: number
  speed: number
  hue1: number
  hue2: number
  hue3: number
  glowBlend: 'overlay' | 'screen' | 'add' | 'soft-light' | 'normal'
  glowMix: number
  deformationMode: 'liquid' | 'spherical' | 'adhesive'
}

export const DEFAULTS: GlassParams

export class GlassRenderer {
  constructor(canvas: HTMLCanvasElement, onStatus?: (s: { type: string; message: string }) => void)
  params: GlassParams
  setParams(partial: Partial<GlassParams>): void
  setPosition(p: { x?: number; y?: number }): { x: number; y: number }
  setMorphMotion(m: { x?: number; y?: number; amount?: number }): void
  setPresentation(p: { edgeGlowOnly?: number }): void
  /** Keep only an outer band this many CSS pixels deep; 0 renders the full pane. */
  setHollow(px: number): void
  setTransientMotion(m: { x?: number; y?: number; amount?: number; tailPolarity?: number }): void
  setBackgroundImage(dataUrl: string | null): Promise<boolean>
  setPlaying(playing: boolean): void
  setQuality(q: 'auto' | 'high' | 'low'): void
  setMotionResponse(m: { speedMultiplier?: number; amplitudeMultiplier?: number }): void
  renderOnce(): void
  dispose(): void
}

export interface AudioLevels {
  level: number
  bass: number
  beat: number
  treble: number
}

export class AudioReactive {
  constructor(onLevel?: (l: AudioLevels) => void, onStatus?: (s: { type: string; message: string }) => void)
  readonly active: boolean
  setSensitivity(v: number): void
  startMicrophone(): Promise<void>
  stop(notify?: boolean): void
  dispose(): void
}

export class AudioMotionBridge {
  constructor(renderer: GlassRenderer | null, onState?: (s: { energy: number }) => void)
  setInput(levels: Partial<AudioLevels>, active: boolean): void
  setStrength(v: number): void
  reset(): void
  dispose(): void
}

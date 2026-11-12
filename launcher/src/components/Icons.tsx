import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const base = (size = 16): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

export const IconGauge = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 21a9 9 0 1 1 9-9" />
    <path d="M12 12l4-4" />
    <path d="M21 12h-2M12 3v2" />
  </svg>
)
export const IconUser = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
)
export const IconArchive = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="4" width="18" height="5" rx="1.5" />
    <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
    <path d="M10 13h4" />
  </svg>
)
export const IconArrowUpRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
)
export const IconSparkle = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z" />
  </svg>
)
export const IconChat = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth={2.6} />
  </svg>
)
export const IconMic = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
)
export const IconCamera = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
)
export const IconSend = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
)
export const IconClose = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
export const IconCheck = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)
export const IconPin = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5zM12 14v6" />
  </svg>
)
export const IconPlus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const IconEdit = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
  </svg>
)
export const IconMore = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth={3} />
  </svg>
)
export const IconChevronDown = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)
export const IconRun = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="15" cy="4.5" r="1.8" fill="currentColor" stroke="none" />
    <path d="M7 21l3-5 3 2 1-5 3 3h3M10.5 9l3-1.5 1.5 2.5M6 12l2.5-3h3" />
  </svg>
)
export const IconFile = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
)
export const IconGlobe = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" />
  </svg>
)
export const IconKeyboard = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
  </svg>
)
export const IconSun = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
export const IconFolder = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
)
export const IconNews = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 8h10M7 12h10M7 16h6" />
  </svg>
)
export const IconBolt = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" />
  </svg>
)

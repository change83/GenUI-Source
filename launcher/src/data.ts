export type WidgetKind = 'calendar' | 'stock' | 'running' | 'weather' | 'project' | 'news' | 'output'
export type WidgetSize = 'tall' | 'small' | 'wide'

export interface Widget {
  id: string
  kind: WidgetKind
  size: WidgetSize
  title?: string
  outputId?: string
}

export type OutputKind = 'poster' | 'report' | 'web'

export interface Output {
  id: string
  kind: OutputKind
  title: string
  subtitle: string
  createdAt: string
  unread: boolean
  fresh?: boolean
}

export interface RecommendedTask {
  id: string
  title: string
  deliverable: string
  outputKind: OutputKind
}

export interface Conversation {
  id: string
  title: string
  followUps: string[]
}

export const initialWidgets: Widget[] = [
  { id: 'w-cal', kind: 'calendar', size: 'tall' },
  { id: 'w-stock', kind: 'stock', size: 'small' },
  { id: 'w-run', kind: 'running', size: 'small' },
]

export const widgetLibrary: { kind: WidgetKind; size: WidgetSize; name: string; desc: string }[] = [
  { kind: 'calendar', size: 'tall', name: 'Calendar', desc: "Today's schedule and meetings" },
  { kind: 'stock', size: 'small', name: 'Portfolio', desc: 'Candlestick chart you follow' },
  { kind: 'running', size: 'small', name: 'Running', desc: 'Monthly activity streak' },
  { kind: 'weather', size: 'small', name: 'Weather', desc: 'Live weather where you are' },
  { kind: 'project', size: 'small', name: 'Project', desc: 'Smart headphones PRD progress' },
  { kind: 'news', size: 'wide', name: 'Following', desc: 'Industry news picked by the agent' },
]

export const initialOutputs: Output[] = [
  {
    id: 'o-poster',
    kind: 'poster',
    title: 'Headphones Festival Poster Design',
    subtitle: '3 posters · PNG',
    createdAt: '10 min ago',
    unread: true,
  },
]

export const conversation: Conversation = {
  id: 'c-wearable',
  title: 'Competitor Analysis for Wearable Products',
  followUps: [
    'Analysis of the top 3 competitors in overseas sales',
    'Comparison of product function dimension matrix',
    'In-depth analysis of competitor consumer groups',
  ],
}

export const recommendedTasks: RecommendedTask[] = [
  {
    id: 't-report',
    title: 'Generate a Competitor Analysis Report for Project Discussions.',
    deliverable: 'PDF File',
    outputKind: 'report',
  },
  {
    id: 't-web',
    title: 'Generate a product introduction web based on the PRD of smart headphones.',
    deliverable: 'Web Demo',
    outputKind: 'web',
  },
]

export interface Contact {
  id: string
  name: string
  /** Lowercase words the user may call them by, in English or Chinese. */
  aliases: string[]
  avatar?: string
  /** Stand-in for their camera once the call connects. */
  video?: string
}

export const contacts: Contact[] = [
  {
    id: 'mom',
    name: 'Mom',
    aliases: ['mom', 'mum', 'mommy', 'mother', 'mama', 'my mom', 'my mother', '妈妈', '妈', '老妈', '母亲', '我妈', '我妈妈'],
    avatar: '/call-mom-avatar.png',
    video: '/call-mom.jpg',
  },
]

export interface BackgroundTask {
  id: string
  title: string
  steps: string[]
  /** Index into steps of the step being worked on. */
  step: number
  progress: number
}

/** Background work the agent already has going, shown in the edge task drawer. */
export const backgroundTasks: BackgroundTask[] = [
  {
    id: 'bg-product-hunt',
    title: 'Product Hunt: 5 latest electronic products',
    steps: ['Collecting launches', 'Reading user reviews', 'Comparing specs and pricing', 'Writing the summary'],
    step: 2,
    progress: 64,
  },
  {
    id: 'bg-sales',
    title: 'Weekly sales dashboard',
    steps: ['Pulling CRM data', 'Cleaning duplicate deals', 'Building charts'],
    step: 1,
    progress: 38,
  },
  {
    id: 'bg-translate',
    title: 'Translate the headset PRD into Japanese',
    steps: ['Extracting terms', 'Translating sections', 'Reviewing terminology'],
    step: 1,
    progress: 22,
  },
]

/** Finished work with nothing to open: the drawer states what was done. */
export const finishedNotes: { id: string; title: string; result: string; finishedAt: string }[] = [
  {
    id: 'n-meeting',
    title: 'Schedule the design review',
    result: 'Booked Room 4B for Thursday 2–3 p.m. and sent invites to 6 people; 5 accepted.',
    finishedAt: '1 h ago',
  },
  {
    id: 'n-inbox',
    title: 'Clean up the inbox',
    result: 'Archived 42 newsletters and flagged 3 emails from suppliers that need a reply today.',
    finishedAt: '3 h ago',
  },
  {
    id: 'n-flight',
    title: 'Check in for the Tokyo flight',
    result: 'Checked in for NH 920 on Friday, seat 23A. The boarding pass is in your wallet.',
    finishedAt: 'Yesterday',
  },
]

export const archivedOutputs: Output[] = [
  {
    id: 'o-prd',
    kind: 'report',
    title: 'Smart Headset PRD v1114',
    subtitle: 'PDF File · 18 pages',
    createdAt: 'Yesterday',
    unread: false,
  },
]

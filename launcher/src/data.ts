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

/** Background work the agent already has going, shown in the edge task drawer. */
export const backgroundTasks: { id: string; title: string; subtitle: string; kind: OutputKind; progress: number }[] = [
  {
    id: 'bg-product-hunt',
    title: 'Product Hunt',
    subtitle: '5 of the latest electronic products analysis',
    kind: 'report',
    progress: 64,
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

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
  { kind: 'calendar', size: 'tall', name: '日程', desc: '今日安排与会议' },
  { kind: 'stock', size: 'small', name: '资产走势', desc: '关注的行情 K 线' },
  { kind: 'running', size: 'small', name: '跑步记录', desc: '本月运动打卡' },
  { kind: 'weather', size: 'small', name: '天气', desc: '所在城市实时天气' },
  { kind: 'project', size: 'small', name: '项目追踪', desc: '智能耳机 PRD 进度' },
  { kind: 'news', size: 'wide', name: '关注资讯', desc: 'Agent 为你筛选的行业动态' },
]

export const initialOutputs: Output[] = [
  {
    id: 'o-poster',
    kind: 'poster',
    title: '耳机节日海报设计',
    subtitle: '3 张海报 · PNG',
    createdAt: '10 分钟前',
    unread: true,
  },
]

export const conversation: Conversation = {
  id: 'c-wearable',
  title: '可穿戴产品竞品分析',
  followUps: ['海外市场 Top 3 竞品销量分析', '产品功能维度对比矩阵', '竞品用户群体深度画像'],
}

export const recommendedTasks: RecommendedTask[] = [
  {
    id: 't-report',
    title: '生成一份竞品分析报告，用于项目讨论',
    deliverable: 'PDF 文件',
    outputKind: 'report',
  },
  {
    id: 't-web',
    title: '基于智能耳机 PRD，生成一个产品介绍网页',
    deliverable: 'Web Demo',
    outputKind: 'web',
  },
]

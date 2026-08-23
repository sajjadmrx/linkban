export type ReminderPreset = 30 | 60 | 120 | 180 | 360 | 720 | 1440 | 'custom'

export interface SavedLink {
  id: string
  url: string
  title: string
  domain: string
  faviconUrl?: string
  createdAt: number
  reminderInterval: number
  nextReminderAt: number
  isPaused: boolean
  isDone?: boolean
  doneAt?: number
  notificationId: number
  notes?: string
}

export type ThemeMode = 'system' | 'light' | 'dark'
export type Language = 'en' | 'fa'

export interface AppSettings {
  defaultInterval: number
  notificationsEnabled: boolean
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  theme: ThemeMode
  language: Language
  hapticsEnabled: boolean
}

export type LinkFilter = 'active' | 'all' | 'paused' | 'done'

export interface WidgetPayload {
  links: Array<{
    id: string
    title: string
    domain: string
    url: string
    nextReminderAt: number
    reminderInterval: number
    isPaused: boolean
  }>
  updatedAt: number
}

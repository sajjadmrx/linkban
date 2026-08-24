export type ReminderPreset = 0 | 30 | 60 | 120 | 180 | 360 | 720 | 1440 | 'custom'

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
  isSecret?: boolean
  openCount?: number
  lastOpenedAt?: number
}

export type ThemeMode = 'system' | 'light' | 'dark'
export type Language = 'en' | 'fa'
export type AppTab = 'queue' | 'history' | 'stats'

export interface AppSettings {
  defaultInterval: number
  notificationsEnabled: boolean
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  theme: ThemeMode
  language: Language
  hapticsEnabled: boolean
  secretPasscode?: string
  secretBiometricsEnabled?: boolean
}

export type LinkFilter = 'active' | 'all' | 'paused' | 'done' | 'secret'

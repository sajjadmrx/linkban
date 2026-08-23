import { Preferences } from '@capacitor/preferences'
import type { SavedLink, AppSettings } from '@/types/link'

const LINKS_STORAGE_KEY = 'revisit_saved_links'
const SETTINGS_STORAGE_KEY = 'revisit_settings'

const getInitialDeviceLanguage = (): 'en' | 'fa' => {
  try {
    const lang = (navigator.language || navigator.languages?.[0] || '').toLowerCase()
    return lang.startsWith('fa') ? 'fa' : 'en'
  } catch {
    return 'en'
  }
}

export const defaultSettings: AppSettings = {
  defaultInterval: 120,
  notificationsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  theme: 'system',
  language: getInitialDeviceLanguage(),
  hapticsEnabled: true,
}

export const storageService = {
  async getLinks(): Promise<SavedLink[]> {
    try {
      const { value } = await Preferences.get({ key: LINKS_STORAGE_KEY })
      if (!value) return []
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      const fallback = localStorage.getItem(LINKS_STORAGE_KEY)
      return fallback ? JSON.parse(fallback) : []
    }
  },

  async saveLinks(links: SavedLink[]): Promise<void> {
    const json = JSON.stringify(links)
    try {
      await Preferences.set({ key: LINKS_STORAGE_KEY, value: json })
    } catch {
      localStorage.setItem(LINKS_STORAGE_KEY, json)
    }
  },

  async addLink(link: SavedLink): Promise<SavedLink[]> {
    const current = await this.getLinks()
    const updated = [link, ...current.filter((item) => item.id !== link.id)]
    await this.saveLinks(updated)
    return updated
  },

  async updateLink(updatedLink: SavedLink): Promise<SavedLink[]> {
    const current = await this.getLinks()
    const updated = current.map((item) => (item.id === updatedLink.id ? updatedLink : item))
    await this.saveLinks(updated)
    return updated
  },

  async deleteLink(id: string): Promise<SavedLink[]> {
    const current = await this.getLinks()
    const updated = current.filter((item) => item.id !== id)
    await this.saveLinks(updated)
    return updated
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const { value } = await Preferences.get({ key: SETTINGS_STORAGE_KEY })
      if (!value) return defaultSettings
      return { ...defaultSettings, ...JSON.parse(value) }
    } catch {
      const fallback = localStorage.getItem(SETTINGS_STORAGE_KEY)
      return fallback ? { ...defaultSettings, ...JSON.parse(fallback) } : defaultSettings
    }
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    const json = JSON.stringify(settings)
    try {
      await Preferences.set({ key: SETTINGS_STORAGE_KEY, value: json })
    } catch {
      localStorage.setItem(SETTINGS_STORAGE_KEY, json)
    }
    return settings
  },

  async clearAll(): Promise<void> {
    try {
      await Preferences.remove({ key: LINKS_STORAGE_KEY })
    } catch {
      localStorage.removeItem(LINKS_STORAGE_KEY)
    }
  },

  async exportBackup(): Promise<string> {
    const links = await this.getLinks()
    const settings = await this.getSettings()
    return JSON.stringify({
      version: 1,
      exportedAt: Date.now(),
      links,
      settings,
    }, null, 2)
  },

  async importBackup(jsonString: string): Promise<{ links: SavedLink[]; settings: AppSettings }> {
    const parsed = JSON.parse(jsonString)
    if (!parsed || !Array.isArray(parsed.links)) {
      throw new Error('Invalid backup format')
    }
    await this.saveLinks(parsed.links)
    if (parsed.settings) {
      await this.saveSettings(parsed.settings)
    }
    return {
      links: parsed.links,
      settings: parsed.settings || defaultSettings,
    }
  }
}

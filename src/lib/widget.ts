import { registerPlugin } from '@capacitor/core'
import type { SavedLink, WidgetPayload } from '@/types/link'

interface WidgetBridgePlugin {
  updateWidgetData(options: { data: string }): Promise<{ success: boolean }>
  reloadWidgets(): Promise<{ success: boolean }>
  getSharedLink(): Promise<{ url: string | null }>
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge')

export const widgetService = {
  async getSharedLink(): Promise<string | null> {
    try {
      if (WidgetBridge && typeof WidgetBridge.getSharedLink === 'function') {
        const res = await WidgetBridge.getSharedLink()
        return res.url || null
      }
    } catch {}
    return null
  },

  async syncWidgetData(links: SavedLink[]): Promise<void> {
    const activeLinks = links
      .filter((l) => !l.isPaused && !l.isDone)
      .sort((a, b) => a.nextReminderAt - b.nextReminderAt)
      .slice(0, 10)

    const payload: WidgetPayload = {
      links: activeLinks.map((l) => ({
        id: l.id,
        title: l.title,
        domain: l.domain,
        url: l.url,
        nextReminderAt: l.nextReminderAt,
        reminderInterval: l.reminderInterval,
        isPaused: l.isPaused,
      })),
      updatedAt: Date.now(),
    }

    const jsonString = JSON.stringify(payload)

    try {
      if (WidgetBridge && typeof WidgetBridge.updateWidgetData === 'function') {
        await WidgetBridge.updateWidgetData({ data: jsonString })
        await WidgetBridge.reloadWidgets()
      }
    } catch {
      try {
        localStorage.setItem('revisit_widget_cache', jsonString)
      } catch {}
    }
  }
}

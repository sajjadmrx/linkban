import { LocalNotifications } from '@capacitor/local-notifications'
import { Browser } from '@capacitor/browser'
import type { SavedLink, AppSettings } from '@/types/link'

export function computeNextReminderTime(intervalMinutes: number, fromTimestamp: number = Date.now(), settings?: AppSettings): number {
  if (intervalMinutes <= 0) {
    return 0
  }

  let targetTime = fromTimestamp + intervalMinutes * 60 * 1000

  if (settings?.quietHoursEnabled && settings.quietHoursStart && settings.quietHoursEnd) {
    const targetDate = new Date(targetTime)
    const [startH, startM] = settings.quietHoursStart.split(':').map(Number)
    const [endH, endM] = settings.quietHoursEnd.split(':').map(Number)

    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const currentTargetMinutes = targetDate.getHours() * 60 + targetDate.getMinutes()

    let inQuietHours = false
    if (startMinutes < endMinutes) {
      inQuietHours = currentTargetMinutes >= startMinutes && currentTargetMinutes < endMinutes
    } else {
      inQuietHours = currentTargetMinutes >= startMinutes || currentTargetMinutes < endMinutes
    }

    if (inQuietHours) {
      const nextActiveDate = new Date(targetTime)
      if (currentTargetMinutes >= startMinutes) {
        nextActiveDate.setDate(nextActiveDate.getDate() + 1)
      }
      nextActiveDate.setHours(endH, endM, 0, 0)
      targetTime = nextActiveDate.getTime()
    }
  }

  return targetTime
}

export function generateNotificationId(): number {
  return Math.floor(Math.random() * 2147483647)
}

export const notificationService = {
  async checkPermissions(): Promise<boolean> {
    try {
      const status = await LocalNotifications.checkPermissions()
      return status.display === 'granted'
    } catch {
      return false
    }
  },

  async requestPermissions(): Promise<boolean> {
    try {
      const status = await LocalNotifications.requestPermissions()
      return status.display === 'granted'
    } catch {
      return false
    }
  },

  async registerActionTypes(): Promise<void> {
    try {
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'REVISIT_LINK_ACTION',
            actions: [
              {
                id: 'OPEN_LINK',
                title: 'Open link',
              },
              {
                id: 'SNOOZE_1H',
                title: 'Snooze 1h',
              }
            ]
          }
        ]
      })
    } catch {}
  },

  async scheduleReminder(link: SavedLink, reminderAt: number): Promise<void> {
    try {
      await this.cancelReminder(link.notificationId)

      if (link.isPaused || link.isDone || link.reminderInterval <= 0 || reminderAt <= 0) {
        return
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: link.notificationId,
            title: `Time to revisit: ${link.domain}`,
            body: link.title || link.url,
            schedule: { at: new Date(reminderAt) },
            actionTypeId: 'REVISIT_LINK_ACTION',
            extra: {
              linkId: link.id,
              url: link.url,
              interval: link.reminderInterval,
            },
            smallIcon: 'ic_stat_revisit',
            iconColor: '#2563EB',
          }
        ]
      })
    } catch {}
  },

  async cancelReminder(notificationId: number): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      })
    } catch {}
  },

  async openLinkInBrowser(url: string): Promise<void> {
    try {
      await Browser.open({ url })
    } catch {
      window.open(url, '_blank')
    }
  },

  setupListeners(onSnooze?: (linkId: string, minutes: number) => void): void {
    try {
      LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
        const actionId = notification.actionId
        const extra = notification.notification.extra

        if (actionId === 'OPEN_LINK' || actionId === 'tap') {
          if (extra?.url) {
            await this.openLinkInBrowser(extra.url)
          }
        } else if (actionId === 'SNOOZE_1H') {
          if (extra?.linkId && onSnooze) {
            onSnooze(extra.linkId, 60)
          }
        }
      })
    } catch {}
  }
}

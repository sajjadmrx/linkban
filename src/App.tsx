import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { LinkList } from '@/components/links/LinkList'
import { HistoryView } from '@/components/history/HistoryView'
import { StatsView } from '@/components/stats/StatsView'
import { AddLinkSheet } from '@/components/links/AddLinkSheet'
import { LinkActionsSheet } from '@/components/links/LinkActionsSheet'
import { SettingsSheet } from '@/components/settings/SettingsSheet'
import { SecretAuthModal } from '@/components/secret/SecretAuthModal'
import { I18nProvider, useI18n } from '@/lib/i18n'
import { storageService, defaultSettings } from '@/lib/storage'
import {
  notificationService,
  computeNextReminderTime,
  generateNotificationId,
} from '@/lib/notifications'
import { shareService } from '@/lib/widget'
import { triggerHaptic } from '@/lib/haptics'
import type { SavedLink, AppSettings, Language, AppTab } from '@/types/link'
import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Toaster, toast } from 'sonner'
import confetti from 'canvas-confetti'

const MainApp: React.FC = () => {
  const { t, setLanguage } = useI18n()
  const [links, setLinks] = useState<SavedLink[]>([])
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const [currentTab, setCurrentTab] = useState<AppTab>('queue')
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [sharedUrl, setSharedUrl] = useState<string>('')
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<SavedLink | null>(null)
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false)

  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false)
  const [isVaultViewActive, setIsVaultViewActive] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const lastBackPressRef = useRef<number>(0)

  const applyTheme = useCallback((theme: AppSettings['theme']) => {
    const root = document.documentElement

    let isDark = false
    if (theme === 'dark') {
      isDark = true
    } else if (theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    root.setAttribute('data-theme', isDark ? 'revisit-dark' : 'revisit-light')

    try {
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
    } catch {}
  }, [])

  const syncState = useCallback(async (updatedLinks: SavedLink[]) => {
    setLinks(updatedLinks)
  }, [])

  const handleSnooze = useCallback(async (linkOrId: SavedLink | string, minutes: number) => {
    const linkId = typeof linkOrId === 'string' ? linkOrId : linkOrId.id
    const currentLinks = await storageService.getLinks()
    const targetLink = currentLinks.find((l) => l.id === linkId)
    if (!targetLink) return

    const nextReminder = computeNextReminderTime(minutes, Date.now(), settings)
    const updatedLink: SavedLink = {
      ...targetLink,
      isPaused: false,
      isDone: false,
      nextReminderAt: nextReminder,
    }

    const updatedList = await storageService.updateLink(updatedLink)
    if (settings.notificationsEnabled && nextReminder > 0) {
      await notificationService.scheduleReminder(updatedLink, nextReminder)
    }

    await syncState(updatedList)
    await triggerHaptic(settings.hapticsEnabled)

    const label = minutes >= 1440 ? '1d' : minutes >= 60 ? `${Math.round(minutes / 60)}h` : `${minutes}m`
    toast.success(t.toasts.snoozed.replace('{time}', label))
  }, [settings, syncState, t])

  const checkForSharedLink = useCallback(async () => {
    try {
      const incomingUrl = await shareService.getSharedLink()
      if (incomingUrl) {
        setSharedUrl(incomingUrl)
        setAddSheetOpen(true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [savedLinks, savedSettings] = await Promise.all([
          storageService.getLinks(),
          storageService.getSettings(),
        ])

        setLinks(savedLinks)
        setSettings(savedSettings)
        setLanguage(savedSettings.language)
        applyTheme(savedSettings.theme)

        await notificationService.registerActionTypes()
        notificationService.setupListeners((linkId, minutes) => {
          handleSnooze(linkId, minutes)
        })

        await checkForSharedLink()
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [applyTheme, checkForSharedLink, handleSnooze, setLanguage])

  useEffect(() => {
    const stateChangeListener = CapApp.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        const freshLinks = await storageService.getLinks()
        setLinks(freshLinks)
        checkForSharedLink()
      } else {
        setIsVaultUnlocked(false)
        setIsVaultViewActive(false)
      }
    })

    const urlOpenListener = CapApp.addListener('appUrlOpen', (data) => {
      if (data.url) {
        const parsed = data.url.replace(/^revisit:\/\/?/, '')
        if (parsed) {
          setSharedUrl(parsed)
          setAddSheetOpen(true)
        }
      }
    })

    const backButtonListener = CapApp.addListener('backButton', () => {
      if (authModalOpen) {
        setAuthModalOpen(false)
      } else if (settingsSheetOpen) {
        setSettingsSheetOpen(false)
      } else if (addSheetOpen) {
        setAddSheetOpen(false)
        setSharedUrl('')
      } else if (actionsSheetOpen) {
        setActionsSheetOpen(false)
      } else if (isVaultViewActive) {
        setIsVaultViewActive(false)
      } else if (currentTab !== 'queue') {
        setCurrentTab('queue')
      } else {
        const now = Date.now()
        if (now - lastBackPressRef.current < 2000) {
          CapApp.exitApp()
        } else {
          lastBackPressRef.current = now
          toast(t.app.exitPrompt, { duration: 2000 })
        }
      }
    })

    return () => {
      stateChangeListener.then((h) => h.remove())
      urlOpenListener.then((h) => h.remove())
      backButtonListener.then((h) => h.remove())
    }
  }, [checkForSharedLink, authModalOpen, settingsSheetOpen, addSheetOpen, actionsSheetOpen, isVaultViewActive, currentTab, t])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings.theme, applyTheme])

  const handleAddLink = async (linkData: {
    url: string
    title: string
    domain: string
    faviconUrl: string
    reminderInterval: number
    notes?: string
    isSecret?: boolean
  }) => {
    const hasReminder = linkData.reminderInterval > 0

    if (hasReminder) {
      const hasPermission = await notificationService.checkPermissions()
      if (!hasPermission && settings.notificationsEnabled) {
        await notificationService.requestPermissions()
      }
    }

    const now = Date.now()
    const nextReminder = hasReminder
      ? computeNextReminderTime(linkData.reminderInterval, now, settings)
      : 0

    const newLink: SavedLink = {
      id: crypto.randomUUID ? crypto.randomUUID() : `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url: linkData.url,
      title: linkData.title,
      domain: linkData.domain,
      faviconUrl: linkData.faviconUrl,
      createdAt: now,
      reminderInterval: linkData.reminderInterval,
      nextReminderAt: nextReminder,
      isPaused: false,
      isDone: false,
      notificationId: generateNotificationId(),
      notes: linkData.notes,
      isSecret: linkData.isSecret,
      openCount: 0,
    }

    const updated = await storageService.addLink(newLink)
    if (hasReminder && settings.notificationsEnabled && nextReminder > 0) {
      await notificationService.scheduleReminder(newLink, nextReminder)
    }

    await syncState(updated)
    await triggerHaptic(settings.hapticsEnabled)
    toast.success(t.toasts.linkSaved)
    setSharedUrl('')
  }

  const handleChangeReminder = async (link: SavedLink, newInterval: number) => {
    const hasReminder = newInterval > 0
    const nextReminder = hasReminder
      ? computeNextReminderTime(newInterval, Date.now(), settings)
      : 0

    const updatedLink: SavedLink = {
      ...link,
      reminderInterval: newInterval,
      nextReminderAt: nextReminder,
      isPaused: false,
    }
    const updated = await storageService.updateLink(updatedLink)

    if (hasReminder && settings.notificationsEnabled && nextReminder > 0) {
      await notificationService.scheduleReminder(updatedLink, nextReminder)
    } else {
      await notificationService.cancelReminder(link.notificationId)
    }

    await syncState(updated)
    await triggerHaptic(settings.hapticsEnabled)
    toast.success(t.toasts.linkUpdated)
    if (selectedLink?.id === link.id) {
      setSelectedLink(updatedLink)
    }
  }

  const handleUpdateNote = async (link: SavedLink, note: string) => {
    const updatedLink: SavedLink = {
      ...link,
      notes: note || undefined,
    }
    const updated = await storageService.updateLink(updatedLink)
    await syncState(updated)
    await triggerHaptic(settings.hapticsEnabled)
    if (selectedLink?.id === link.id) {
      setSelectedLink(updatedLink)
    }
  }

  const handleToggleSecret = async (link: SavedLink) => {
    const isNowSecret = !link.isSecret
    const updatedLink: SavedLink = {
      ...link,
      isSecret: isNowSecret,
    }
    const updated = await storageService.updateLink(updatedLink)
    await syncState(updated)
    await triggerHaptic(settings.hapticsEnabled)

    if (selectedLink?.id === link.id) {
      setSelectedLink(updatedLink)
    }

    toast.success(isNowSecret ? t.actions.moveToSecret : t.actions.moveToQueue)
  }

  const handleTogglePause = async (link: SavedLink) => {
    const isNowPaused = !link.isPaused
    const nextReminder = isNowPaused
      ? link.nextReminderAt
      : computeNextReminderTime(link.reminderInterval, Date.now(), settings)

    const updatedLink: SavedLink = {
      ...link,
      isPaused: isNowPaused,
      nextReminderAt: nextReminder,
    }

    const updated = await storageService.updateLink(updatedLink)
    if (isNowPaused) {
      await notificationService.cancelReminder(link.notificationId)
      toast.success(t.toasts.linkPaused)
    } else {
      if (settings.notificationsEnabled && nextReminder > 0) {
        await notificationService.scheduleReminder(updatedLink, nextReminder)
      }
      toast.success(t.toasts.linkResumed)
    }

    await syncState(updated)
    await triggerHaptic(settings.hapticsEnabled)
    if (selectedLink?.id === link.id) {
      setSelectedLink(updatedLink)
    }
  }

  const handleMarkDone = async (link: SavedLink) => {
    const updatedLink: SavedLink = {
      ...link,
      isDone: true,
      doneAt: Date.now(),
    }

    await notificationService.cancelReminder(link.notificationId)
    const updated = await storageService.updateLink(updatedLink)
    await syncState(updated)
    await triggerHaptic(settings.hapticsEnabled)

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.85 },
      colors: ['#FF6B4A', '#10B981', '#FFD166'],
      disableForReducedMotion: true,
    })

    toast.success(t.toasts.linkMarkedDone, {
      action: {
        label: t.inbox.undo,
        onClick: async () => {
          const restored: SavedLink = {
            ...link,
            isDone: false,
            doneAt: undefined,
            nextReminderAt: link.reminderInterval > 0
              ? computeNextReminderTime(link.reminderInterval, Date.now(), settings)
              : 0,
          }
          const restoredList = await storageService.updateLink(restored)
          if (settings.notificationsEnabled && !restored.isPaused && restored.nextReminderAt > 0) {
            await notificationService.scheduleReminder(restored, restored.nextReminderAt)
          }
          await syncState(restoredList)
        },
      },
    })
  }

  const handleRestoreLink = async (link: SavedLink) => {
    const nextReminder = link.reminderInterval > 0
      ? computeNextReminderTime(link.reminderInterval, Date.now(), settings)
      : 0

    const restored: SavedLink = {
      ...link,
      isDone: false,
      doneAt: undefined,
      nextReminderAt: nextReminder,
    }

    const updated = await storageService.updateLink(restored)
    if (settings.notificationsEnabled && !restored.isPaused && nextReminder > 0) {
      await notificationService.scheduleReminder(restored, nextReminder)
    }

    await syncState(updated)
    await triggerHaptic(settings.hapticsEnabled)
    toast.success(t.toasts.linkRestored)
  }

  const handleDeleteLink = async (linkOrId: SavedLink | string) => {
    const linkId = typeof linkOrId === 'string' ? linkOrId : linkOrId.id
    const targetLink = links.find((l) => l.id === linkId)
    if (targetLink) {
      await notificationService.cancelReminder(targetLink.notificationId)
    }

    const updated = await storageService.deleteLink(linkId)
    await syncState(updated)
    await triggerHaptic(settings.hapticsEnabled)
    toast.success(t.toasts.linkDeleted)
  }

  const handleClearHistory = async () => {
    const completedIds = links.filter((l) => l.isDone).map((l) => l.id)
    for (const id of completedIds) {
      await storageService.deleteLink(id)
    }
    const fresh = await storageService.getLinks()
    await syncState(fresh)
    await triggerHaptic(settings.hapticsEnabled)
    toast.success(t.toasts.historyCleared)
  }

  const handleTapLink = async (link: SavedLink) => {
    await triggerHaptic(settings.hapticsEnabled)

    const updatedLink: SavedLink = {
      ...link,
      openCount: (link.openCount || 0) + 1,
      lastOpenedAt: Date.now(),
    }
    const updated = await storageService.updateLink(updatedLink)
    await syncState(updated)

    await notificationService.openLinkInBrowser(link.url)
  }

  const handleOpenActions = (link: SavedLink) => {
    triggerHaptic(settings.hapticsEnabled)
    setSelectedLink(link)
    setActionsSheetOpen(true)
  }

  const handleShareLink = async (link: SavedLink) => {
    await triggerHaptic(settings.hapticsEnabled)
    try {
      if (navigator.share) {
        await navigator.share({
          title: link.title || link.domain,
          url: link.url,
        })
      } else {
        await navigator.clipboard.writeText(link.url)
        toast.success(t.actions.copied)
      }
    } catch {}
  }

  const handleToggleVault = () => {
    triggerHaptic(settings.hapticsEnabled)
    if (!isVaultUnlocked) {
      setAuthModalOpen(true)
    } else {
      setIsVaultViewActive((prev) => !prev)
    }
  }

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    const saved = await storageService.saveSettings(newSettings)
    setSettings(saved)
    applyTheme(saved.theme)

    if (!saved.notificationsEnabled) {
      for (const link of links) {
        await notificationService.cancelReminder(link.notificationId)
      }
    } else {
      for (const link of links) {
        if (!link.isPaused && !link.isDone && link.nextReminderAt > 0) {
          await notificationService.scheduleReminder(link, link.nextReminderAt)
        }
      }
    }
  }

  const handleExportData = async () => {
    const jsonStr = await storageService.exportBackup()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yadban-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(t.toasts.dataExported)
  }

  const handleImportData = async (jsonStr: string) => {
    const { links: importedLinks, settings: importedSettings } = await storageService.importBackup(jsonStr)
    setLinks(importedLinks)
    setSettings(importedSettings)
    setLanguage(importedSettings.language)
    applyTheme(importedSettings.theme)
    await syncState(importedLinks)
  }

  const handleClearAllData = async () => {
    for (const link of links) {
      await notificationService.cancelReminder(link.notificationId)
    }
    await storageService.clearAll()
    setLinks([])
  }

  const displayedLinks = useMemo(() => {
    if (isVaultViewActive) {
      return links.filter((l) => !!l.isSecret)
    }
    return links.filter((l) => !l.isSecret)
  }, [links, isVaultViewActive])

  const activeLinksCount = useMemo(() => {
    return displayedLinks.filter((l) => !l.isDone && !l.isPaused).length
  }, [displayedLinks])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner text-primary loading-md" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content antialiased flex flex-col">
      <Header
        activeCount={activeLinksCount}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isVaultUnlocked={isVaultUnlocked}
        isVaultViewActive={isVaultViewActive}
        onToggleVault={handleToggleVault}
        onBackFromVault={() => setIsVaultViewActive(false)}
        onOpenSettings={() => setSettingsSheetOpen(true)}
      />

      <main className="flex-1">
        {isVaultViewActive ? (
          <LinkList
            links={displayedLinks}
            onTapLink={handleTapLink}
            onOpenActions={handleOpenActions}
            onAddClick={() => {
              setSharedUrl('')
              setAddSheetOpen(true)
            }}
            isVault={true}
          />
        ) : currentTab === 'queue' ? (
          <LinkList
            links={displayedLinks}
            onTapLink={handleTapLink}
            onOpenActions={handleOpenActions}
            onAddClick={() => {
              setSharedUrl('')
              setAddSheetOpen(true)
            }}
            isVault={false}
          />
        ) : currentTab === 'history' ? (
          <HistoryView
            links={displayedLinks}
            onTapLink={handleTapLink}
            onRestoreLink={handleRestoreLink}
            onDeleteLink={handleDeleteLink}
            onClearHistory={handleClearHistory}
          />
        ) : (
          <StatsView
            links={displayedLinks}
            onTapLink={handleTapLink}
          />
        )}
      </main>

      <AddLinkSheet
        open={addSheetOpen}
        initialUrl={sharedUrl}
        onClose={() => {
          setAddSheetOpen(false)
          setSharedUrl('')
        }}
        onSave={handleAddLink}
        existingLinks={links}
        defaultInterval={settings.defaultInterval}
        settings={settings}
        onOpenExisting={(existing) => {
          setSelectedLink(existing)
          setActionsSheetOpen(true)
        }}
      />

      <LinkActionsSheet
        link={selectedLink}
        open={actionsSheetOpen}
        onClose={() => setActionsSheetOpen(false)}
        onOpenInBrowser={(url) => notificationService.openLinkInBrowser(url)}
        onChangeReminder={handleChangeReminder}
        onUpdateNote={handleUpdateNote}
        onTogglePause={handleTogglePause}
        onMarkDone={handleMarkDone}
        onRestore={handleRestoreLink}
        onSnooze={handleSnooze}
        onShare={handleShareLink}
        onDelete={handleDeleteLink}
        onToggleSecret={handleToggleSecret}
      />

      <SettingsSheet
        open={settingsSheetOpen}
        onClose={() => setSettingsSheetOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearAllData={handleClearAllData}
      />

      <SecretAuthModal
        open={authModalOpen}
        mode="unlock"
        settings={settings}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={() => {
          setIsVaultUnlocked(true)
          setIsVaultViewActive(true)
        }}
      />

      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "bg-base-200 text-base-content border border-base-300 rounded-2xl shadow-xl font-sans text-xs",
        }}
      />
    </div>
  )
}

export default function App() {
  const [initialLang, setInitialLang] = useState<Language>(defaultSettings.language)

  return (
    <I18nProvider
      initialLanguage={initialLang}
      onLanguageChange={(lang) => setInitialLang(lang)}
    >
      <MainApp />
    </I18nProvider>
  )
}

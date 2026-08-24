import React, { useState, useRef, useEffect } from 'react'
import {
  Bell,
  Moon,
  Sun,
  Laptop,
  Vibrate,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  Check,
  X,
  Lock,
  KeyRound,
  Fingerprint,
} from 'lucide-react'
import { ReminderPicker } from '@/components/links/ReminderPicker'
import { SecretAuthModal } from '@/components/secret/SecretAuthModal'
import { biometricService } from '@/lib/biometrics'
import { useI18n } from '@/lib/i18n'
import type { AppSettings, ThemeMode, Language } from '@/types/link'
import { toast } from 'sonner'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  settings: AppSettings
  onUpdateSettings: (newSettings: AppSettings) => Promise<void>
  onExportData: () => Promise<void>
  onImportData: (jsonStr: string) => Promise<void>
  onClearAllData: () => Promise<void>
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  open,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearAllData,
}) => {
  const { t, language, setLanguage } = useI18n()
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pinModalMode, setPinModalMode] = useState<'setup' | 'change'>('setup')
  const [hasBiometrics, setHasBiometrics] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    biometricService.isAvailable().then(setHasBiometrics)
  }, [])

  if (!open) return null

  const handleUpdate = async (patch: Partial<AppSettings>) => {
    const updated = { ...settings, ...patch }
    await onUpdateSettings(updated)
  }

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    handleUpdate({ language: newLang })
  }

  const handleSavePin = async (pin: string) => {
    await handleUpdate({ secretPasscode: pin })
  }

  const handleRemovePin = async () => {
    await handleUpdate({ secretPasscode: undefined })
    toast.success(t.secret.pinRemovedSuccess)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        await onImportData(content)
        toast.success(t.toasts.dataImported)
      } catch {
        toast.error(t.toasts.invalidJson)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <div className="bottom-sheet-backdrop" onClick={onClose}>
        <div
          className="bottom-sheet-content max-w-md mx-auto p-5 space-y-4 text-start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto -mt-2 h-1 w-10 rounded-full bg-base-300" />

          <div className="flex items-center justify-between pb-1 border-b border-base-200">
            <h2 className="text-base font-bold text-base-content">
              {t.settings.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-xs h-7 w-7 text-base-content/50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content/60 px-1">
                {t.settings.defaultInterval}
              </label>
              <ReminderPicker
                value={settings.defaultInterval}
                onChange={(minutes) => handleUpdate({ defaultInterval: minutes })}
              />
            </div>

            <div className="rounded-2xl bg-base-200/50 p-3.5 space-y-3 border border-base-300/40">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pe-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-base-content">
                      {t.secret.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C8885] dark:text-[#9E9792]">
                    {t.secret.tagline}
                  </p>
                </div>
                {settings.secretPasscode ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPinModalMode('change')
                        setPinModalOpen(true)
                      }}
                      className="btn btn-outline btn-xs rounded-lg text-[11px] font-bold"
                    >
                      {t.secret.changePin}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePin}
                      className="btn btn-ghost btn-xs text-error text-[11px]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPinModalMode('setup')
                      setPinModalOpen(true)
                    }}
                    className="btn btn-primary btn-xs rounded-lg text-[11px] font-bold text-white"
                  >
                    {t.secret.setPin}
                  </button>
                )}
              </div>

              {hasBiometrics && (
                <>
                  <div className="divider my-0.5 opacity-40" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 pe-4">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4 text-base-content/60" />
                        <span className="text-xs font-bold text-base-content">
                          {t.secret.biometrics}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C8885] dark:text-[#9E9792]">
                        {t.secret.biometricsDesc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.secretBiometricsEnabled ?? true}
                      onChange={(e) => handleUpdate({ secretBiometricsEnabled: e.target.checked })}
                      className="toggle toggle-primary toggle-sm"
                    />
                  </div>
                </>
              )}

              <div className="divider my-0.5 opacity-40" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pe-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-base-content">
                      {t.settings.notifications}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C8885] dark:text-[#9E9792]">
                    {t.settings.notificationsDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleUpdate({ notificationsEnabled: e.target.checked })}
                  className="toggle toggle-primary toggle-sm"
                />
              </div>

              <div className="divider my-0.5 opacity-40" />

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pe-4">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-base-content/60" />
                      <span className="text-xs font-bold text-base-content">
                        {t.settings.quietHours}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C8885] dark:text-[#9E9792]">
                      {t.settings.quietHoursDesc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.quietHoursEnabled}
                    onChange={(e) => handleUpdate({ quietHoursEnabled: e.target.checked })}
                    className="toggle toggle-primary toggle-sm"
                  />
                </div>

                {settings.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-base-content/60">
                        {t.settings.quietHoursFrom}
                      </label>
                      <input
                        type="time"
                        value={settings.quietHoursStart}
                        onChange={(e) => handleUpdate({ quietHoursStart: e.target.value })}
                        className="input input-bordered input-xs h-9 w-full rounded-xl bg-base-100 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-base-content/60">
                        {t.settings.quietHoursTo}
                      </label>
                      <input
                        type="time"
                        value={settings.quietHoursEnd}
                        onChange={(e) => handleUpdate({ quietHoursEnd: e.target.value })}
                        className="input input-bordered input-xs h-9 w-full rounded-xl bg-base-100 text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="divider my-0.5 opacity-40" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pe-4">
                  <div className="flex items-center gap-2">
                    <Vibrate className="h-4 w-4 text-base-content/60" />
                    <span className="text-xs font-bold text-base-content">
                      {t.settings.haptics}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C8885] dark:text-[#9E9792]">
                    {t.settings.hapticsDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hapticsEnabled}
                  onChange={(e) => handleUpdate({ hapticsEnabled: e.target.checked })}
                  className="toggle toggle-primary toggle-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-content/60 px-1">
                {t.settings.theme}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'system' as ThemeMode, label: t.settings.themeSystem, icon: Laptop },
                  { key: 'light' as ThemeMode, label: t.settings.themeLight, icon: Sun },
                  { key: 'dark' as ThemeMode, label: t.settings.themeDark, icon: Moon },
                ].map((item) => {
                  const Icon = item.icon
                  const isSelected = settings.theme === item.key
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleUpdate({ theme: item.key })}
                      className={`btn btn-xs h-10 flex items-center justify-center gap-1.5 rounded-xl font-bold ${
                        isSelected
                          ? 'btn-primary text-white'
                          : 'btn-outline border-base-300 bg-base-100 text-base-content'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-content/60 px-1">
                {t.settings.languageSection}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: 'fa' as Language, label: 'فارسی', sub: 'راست‌به‌چپ' },
                  { code: 'en' as Language, label: 'English', sub: 'Left-to-right' },
                ].map((item) => {
                  const isSelected = language === item.code
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleLanguageChange(item.code)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-start transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-base-300/60 bg-base-200/50 text-base-content'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{item.label}</p>
                        <p className="text-[10px] opacity-60">{item.sub}</p>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onExportData}
                className="btn btn-outline btn-xs h-9 text-xs font-semibold rounded-xl gap-1.5 bg-base-100"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.settings.exportData}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline btn-xs h-9 text-xs font-semibold rounded-xl gap-1.5 bg-base-100"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{t.settings.importData}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="button"
              onClick={() => setClearDialogOpen(true)}
              className="btn btn-ghost btn-xs w-full h-8 text-xs font-semibold text-error hover:bg-error/10 rounded-xl gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.settings.clearData}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-base-content/50 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>{t.settings.offlineFirst} • 1.0.0</span>
          </div>
        </div>
      </div>

      <SecretAuthModal
        open={pinModalOpen}
        mode={pinModalMode}
        settings={settings}
        onClose={() => setPinModalOpen(false)}
        onAuthenticated={() => setPinModalOpen(false)}
        onSavePasscode={handleSavePin}
      />

      {clearDialogOpen && (
        <div className="bottom-sheet-backdrop z-60" onClick={() => setClearDialogOpen(false)}>
          <div
            className="bottom-sheet-content max-w-sm mx-auto p-5 space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-error">
              {t.settings.clearDataConfirmTitle}
            </h3>
            <p className="text-xs text-base-content/75">
              {t.settings.clearDataConfirmDesc}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClearDialogOpen(false)}
                className="btn btn-ghost flex-1 font-semibold"
              >
                {t.add.cancel}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onClearAllData()
                  setClearDialogOpen(false)
                  onClose()
                  toast.success(t.toasts.dataCleared)
                }}
                className="btn btn-error flex-1 font-bold"
              >
                {t.settings.clearData}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

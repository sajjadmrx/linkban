import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { en, type Translations } from '@/locales/en'
import { fa } from '@/locales/fa'
import type { Language } from '@/types/link'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  dir: 'ltr' | 'rtl'
  formatNumber: (num: number | string) => string
  formatTimeAgo: (timestamp: number) => string
  formatNextReminder: (timestamp: number) => string
  formatInterval: (minutes: number) => string
  formatDateTime: (timestamp: number) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const toPersianDigits = (str: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(str).replace(/[0-9]/g, (w) => persianDigits[+w])
}

export const I18nProvider: React.FC<{
  initialLanguage?: Language
  onLanguageChange?: (lang: Language) => void
  children: React.ReactNode
}> = ({ initialLanguage = 'fa', onLanguageChange, children }) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang)
    if (onLanguageChange) {
      onLanguageChange(lang)
    }
  }, [onLanguageChange])

  const dir: 'ltr' | 'rtl' = language === 'fa' ? 'rtl' : 'ltr'
  const t: Translations = language === 'fa' ? fa : en

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = language
  }, [dir, language])

  const formatNumber = (num: number | string): string => {
    if (language === 'fa') {
      return toPersianDigits(num)
    }
    return String(num)
  }

  const formatInterval = (minutes: number): string => {
    if (minutes <= 0) return t.intervals.full_none
    if (minutes === 30) return t.intervals.full_m30
    if (minutes === 60) return t.intervals.full_h1
    if (minutes === 120) return t.intervals.full_h2
    if (minutes === 180) return t.intervals.full_h3
    if (minutes === 360) return t.intervals.full_h6
    if (minutes === 720) return t.intervals.full_h12
    if (minutes === 1440) return t.intervals.full_d1

    if (minutes < 60) {
      const formattedNum = formatNumber(minutes)
      return `${formattedNum} ${t.add.minutes}`
    }
    if (minutes % 1440 === 0) {
      const days = minutes / 1440
      const formattedNum = formatNumber(days)
      return `${formattedNum} ${t.add.days}`
    }
    const hours = Math.round((minutes / 60) * 10) / 10
    const formattedNum = formatNumber(hours)
    return `${formattedNum} ${t.add.hours}`
  }

  const formatNextReminder = (timestamp: number): string => {
    const now = Date.now()
    const diffMs = timestamp - now

    if (diffMs <= 0) {
      return t.intervals.due
    }

    const diffMins = Math.round(diffMs / (60 * 1000))
    if (diffMins < 60) {
      const timeStr = `${formatNumber(Math.max(1, diffMins))} ${t.add.minutes}`
      return t.intervals.in.replace('{time}', timeStr)
    }

    const diffHours = Math.round(diffMs / (60 * 60 * 1000))
    if (diffHours < 24) {
      const timeStr = `${formatNumber(diffHours)} ${t.add.hours}`
      return t.intervals.in.replace('{time}', timeStr)
    }

    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
    const timeStr = `${formatNumber(diffDays)} ${t.add.days}`
    return t.intervals.in.replace('{time}', timeStr)
  }

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diffMs = now - timestamp
    const diffMins = Math.floor(diffMs / (60 * 1000))

    if (diffMins < 1) return t.intervals.now
    if (diffMins < 60) {
      return language === 'fa'
        ? `${formatNumber(diffMins)} دقیقه پیش`
        : `${formatNumber(diffMins)}m ago`
    }
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) {
      return language === 'fa'
        ? `${formatNumber(diffHours)} ساعت پیش`
        : `${formatNumber(diffHours)}h ago`
    }
    const diffDays = Math.floor(diffHours / 24)
    return language === 'fa'
      ? `${formatNumber(diffDays)} روز پیش`
      : `${formatNumber(diffDays)}d ago`
  }

  const formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    if (language === 'fa') {
      try {
        const faDate = new Intl.DateTimeFormat('fa-IR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
        return faDate
      } catch {
        return date.toLocaleDateString()
      }
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      dir,
      formatNumber,
      formatTimeAgo,
      formatNextReminder,
      formatInterval,
      formatDateTime,
    }),
    [language, dir, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

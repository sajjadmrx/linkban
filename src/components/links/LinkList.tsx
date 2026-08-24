import React, { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { LinkItem } from './LinkItem'
import { EmptyState } from './EmptyState'
import { useI18n } from '@/lib/i18n'
import type { SavedLink } from '@/types/link'

interface LinkListProps {
  links: SavedLink[]
  onTapLink: (link: SavedLink) => void
  onOpenActions: (link: SavedLink) => void
  onAddClick: () => void
  isVault?: boolean
}

export const LinkList: React.FC<LinkListProps> = ({
  links,
  onTapLink,
  onOpenActions,
  onAddClick,
  isVault,
}) => {
  const { t } = useI18n()

  const activeLinks = useMemo(() => {
    return links.filter((l) => !l.isDone)
  }, [links])

  const groups = useMemo(() => {
    const now = Date.now()
    const twoHoursFromNow = now + 2 * 60 * 60 * 1000

    const dueList: SavedLink[] = []
    const soonList: SavedLink[] = []
    const laterList: SavedLink[] = []
    const pausedList: SavedLink[] = []
    const savedOnlyList: SavedLink[] = []

    for (const item of activeLinks) {
      const hasReminder = item.reminderInterval > 0 && item.nextReminderAt > 0
      if (!hasReminder) {
        savedOnlyList.push(item)
      } else if (item.isPaused) {
        pausedList.push(item)
      } else if (item.nextReminderAt <= now) {
        dueList.push(item)
      } else if (item.nextReminderAt <= twoHoursFromNow) {
        soonList.push(item)
      } else {
        laterList.push(item)
      }
    }

    const sortFn = (a: SavedLink, b: SavedLink) => a.nextReminderAt - b.nextReminderAt
    const createdSortFn = (a: SavedLink, b: SavedLink) => b.createdAt - a.createdAt

    dueList.sort(sortFn)
    soonList.sort(sortFn)
    laterList.sort(sortFn)
    pausedList.sort(sortFn)
    savedOnlyList.sort(createdSortFn)

    const result = []
    if (dueList.length > 0) {
      result.push({ title: t.inbox.dueSection, items: dueList, isDue: true })
    }
    if (soonList.length > 0) {
      result.push({ title: t.inbox.soonSection, items: soonList, isDue: false })
    }
    if (laterList.length > 0) {
      result.push({ title: t.inbox.laterSection, items: laterList, isDue: false })
    }
    if (pausedList.length > 0) {
      result.push({ title: t.inbox.pausedSection, items: pausedList, isDue: false })
    }
    if (savedOnlyList.length > 0) {
      result.push({ title: t.inbox.savedOnlySection, items: savedOnlyList, isDue: false })
    }

    return result
  }, [activeLinks, t])

  if (activeLinks.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <EmptyState onAddClick={onAddClick} isVault={isVault} />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col min-h-[calc(100vh-3rem)]"
      style={{ paddingBottom: 'max(6rem, calc(5rem + env(safe-area-inset-bottom, 0px)))' }}
    >
      <div className="flex-1">
        {groups.map((group, idx) => (
          <div key={idx}>
            <div className="px-4 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-base-content/40 select-none">
              {group.title}
            </div>
            <div className="divide-y divide-base-200">
              {group.items.map((link) => (
                <LinkItem
                  key={link.id}
                  link={link}
                  onTap={onTapLink}
                  onOpenActions={onOpenActions}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="fixed end-5 z-40"
        style={{ bottom: 'max(1.5rem, calc(1.25rem + env(safe-area-inset-bottom, 0px)))' }}
      >
        <button
          type="button"
          onClick={onAddClick}
          className="btn btn-primary btn-circle h-14 w-14 shadow-xl active:scale-90 transition-transform cursor-pointer text-white"
          aria-label={t.add.title}
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
        </button>
      </div>
    </div>
  )
}

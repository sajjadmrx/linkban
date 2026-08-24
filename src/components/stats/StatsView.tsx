import React from 'react'
import {
  BarChart3,
  TrendingUp,
  Globe,
  CheckCircle2,
  Bookmark,
  Eye,
  ExternalLink,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { SavedLink } from '@/types/link'

interface StatsViewProps {
  links: SavedLink[]
  onTapLink: (link: SavedLink) => void
}

const BAR_COLORS = [
  '#FF6B4A', // Coral Primary
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
]

export const StatsView: React.FC<StatsViewProps> = ({
  links,
  onTapLink,
}) => {
  const { t, formatNumber } = useI18n()

  const totalLinks = links.length
  const completedLinks = links.filter((l) => l.isDone).length
  const activeLinks = links.filter((l) => !l.isDone).length
  const totalOpens = links.reduce((sum, l) => sum + (l.openCount || 0), 0)

  const linksWithOpens = links
    .filter((l) => typeof l.openCount === 'number' && l.openCount > 0)
    .sort((a, b) => (b.openCount || 0) - (a.openCount || 0))

  const maxOpens = linksWithOpens.length > 0 ? (linksWithOpens[0].openCount || 1) : 1

  const domainMap: Record<string, { count: number; opens: number; domain: string; faviconUrl?: string }> = {}
  for (const link of links) {
    if (!domainMap[link.domain]) {
      domainMap[link.domain] = { count: 0, opens: 0, domain: link.domain, faviconUrl: link.faviconUrl }
    }
    domainMap[link.domain].count += 1
    domainMap[link.domain].opens += link.openCount || 0
  }

  const topDomains = Object.values(domainMap)
    .sort((a, b) => b.opens - a.opens || b.count - a.count)
    .slice(0, 6)

  return (
    <div
      className="flex flex-col min-h-[calc(100vh-3rem)] p-4 space-y-5 select-none max-w-md mx-auto"
      style={{ paddingBottom: 'max(6rem, calc(5rem + env(safe-area-inset-bottom, 0px)))' }}
    >
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-base-200/70 border border-base-300/60 p-4 space-y-1 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
              {t.stats.totalOpens}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-base-content">
            {formatNumber(totalOpens)}
          </p>
        </div>

        <div className="rounded-2xl bg-base-200/70 border border-base-300/60 p-4 space-y-1 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
              {t.stats.completed}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-base-content">
            {formatNumber(completedLinks)}
          </p>
        </div>

        <div className="rounded-2xl bg-base-200/70 border border-base-300/60 p-4 space-y-1 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
              {t.stats.totalLinks}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-base-300/80 text-base-content/70">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-base-content">
            {formatNumber(totalLinks)}
          </p>
        </div>

        <div className="rounded-2xl bg-base-200/70 border border-base-300/60 p-4 space-y-1 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
              {t.stats.topDomains}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-info/10 text-info">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-base-content truncate">
            {topDomains.length > 0 ? topDomains[0].domain : '-'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-base-200/50 border border-base-300/60 p-4 space-y-4 text-start">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-base-content">
              {t.stats.topVisited}
            </h3>
          </div>
          <span className="text-[11px] text-base-content/50 font-semibold">
            {formatNumber(linksWithOpens.length)} {t.stats.opens}
          </span>
        </div>

        {linksWithOpens.length === 0 ? (
          <div className="py-8 text-center space-y-1.5">
            <p className="text-xs font-bold text-base-content/70">
              {t.stats.noVisitsYet}
            </p>
            <p className="text-[11px] text-[#8C8885] dark:text-[#9E9792] max-w-xs mx-auto">
              {t.stats.noVisitsDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {linksWithOpens.slice(0, 7).map((link, idx) => {
              const count = link.openCount || 0
              const percent = Math.round((count / maxOpens) * 100)
              const color = BAR_COLORS[idx % BAR_COLORS.length]

              return (
                <div
                  key={link.id}
                  onClick={() => onTapLink(link)}
                  className="space-y-1.5 p-2 rounded-xl hover:bg-base-200/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-base-300 text-[10px] font-bold text-base-content shrink-0">
                        {formatNumber(idx + 1)}
                      </span>
                      <span className="font-semibold text-base-content truncate">
                        {link.title || link.domain}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold">
                      <span className="text-base-content">
                        {formatNumber(count)}
                      </span>
                      <span className="text-[10px] font-normal text-base-content/50">
                        {t.stats.opens}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-base-300/70 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(6, percent)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {topDomains.length > 0 && (
        <div className="rounded-2xl bg-base-200/50 border border-base-300/60 p-4 space-y-3 text-start">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-base-content">
              {t.stats.topDomains}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {topDomains.map((item, idx) => (
              <div
                key={item.domain}
                className="flex items-center justify-between p-2.5 rounded-xl bg-base-100 border border-base-300/50 text-xs"
              >
                <div className="min-w-0 flex-1 pe-2">
                  <p className="font-bold text-base-content truncate">
                    {item.domain}
                  </p>
                  <p className="text-[10px] text-base-content/50">
                    {formatNumber(item.count)} {t.stats.totalLinks.toLowerCase()}
                  </p>
                </div>
                <span className="flex h-6 px-2 items-center justify-center rounded-lg bg-base-200 text-[11px] font-bold text-primary shrink-0">
                  {formatNumber(item.opens)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

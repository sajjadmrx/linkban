export interface ExtractedMetadata {
  url: string
  normalizedUrl: string
  domain: string
  title: string
  faviconUrl: string
  fallbackInitial: string
}

export function normalizeUrl(input: string): string {
  let trimmed = input.trim()
  if (!trimmed) return ""

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`
  }

  try {
    const parsed = new URL(trimmed)
    return parsed.href
  } catch {
    return trimmed
  }
}

export function isValidUrl(input: string): boolean {
  if (!input || !input.trim()) return false
  try {
    const url = new URL(normalizeUrl(input))
    return url.hostname.includes('.') && url.hostname.length > 3
  } catch {
    return false
  }
}

export function extractDomain(urlStr: string): string {
  try {
    const url = new URL(normalizeUrl(urlStr))
    return url.hostname.replace(/^www\./i, '')
  } catch {
    return urlStr.replace(/^https?:\/\//i, '').split('/')[0] || urlStr
  }
}

export function generateFallbackTitle(urlStr: string): string {
  try {
    const url = new URL(normalizeUrl(urlStr))
    const pathname = url.pathname.replace(/\/$/, '')
    
    if (!pathname || pathname === '') {
      const hostParts = url.hostname.replace(/^www\./i, '').split('.')
      return hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1)
    }

    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      const lastSegment = decodeURIComponent(segments[segments.length - 1])
        .replace(/[-_]/g, ' ')
        .replace(/\.[a-zA-Z0-9]+$/, '')
      
      if (lastSegment.length > 2) {
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
      }
    }

    return url.hostname.replace(/^www\./i, '')
  } catch {
    return urlStr
  }
}

export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

export async function extractMetadata(rawUrl: string): Promise<ExtractedMetadata> {
  const normalizedUrl = normalizeUrl(rawUrl)
  const domain = extractDomain(normalizedUrl)
  const fallbackTitle = generateFallbackTitle(normalizedUrl)
  const faviconUrl = getFaviconUrl(domain)
  const fallbackInitial = (domain.charAt(0) || 'L').toUpperCase()

  let title = fallbackTitle

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)
    
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      const html = data.contents
      if (typeof html === 'string') {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (titleMatch && titleMatch[1]) {
          const parsedTitle = titleMatch[1].trim().replace(/\s+/g, ' ')
          if (parsedTitle && parsedTitle.length < 120) {
            title = parsedTitle
          }
        }
      }
    }
  } catch {
    title = fallbackTitle
  }

  return {
    url: rawUrl,
    normalizedUrl,
    domain,
    title,
    faviconUrl,
    fallbackInitial,
  }
}

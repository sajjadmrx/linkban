import { registerPlugin } from '@capacitor/core'

interface ShareBridgePlugin {
  getSharedLink(): Promise<{ url: string | null }>
}

const ShareBridge = registerPlugin<ShareBridgePlugin>('ShareBridge')

export const shareService = {
  async getSharedLink(): Promise<string | null> {
    try {
      if (ShareBridge && typeof ShareBridge.getSharedLink === 'function') {
        const res = await ShareBridge.getSharedLink()
        return res.url || null
      }
    } catch {}
    return null
  },
}

export const widgetService = shareService

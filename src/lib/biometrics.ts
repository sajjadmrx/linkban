import { registerPlugin } from '@capacitor/core'

export interface BiometricAuthPluginInterface {
  isAvailable(): Promise<{ available: boolean; status: number }>
  authenticate(options?: {
    title?: string
    subtitle?: string
    cancelText?: string
  }): Promise<{ success: boolean; error?: string; code?: number }>
}

export const BiometricAuthPlugin = registerPlugin<BiometricAuthPluginInterface>('BiometricAuth')

export const biometricService = {
  async isAvailable(): Promise<boolean> {
    try {
      const res = await BiometricAuthPlugin.isAvailable()
      return !!res.available
    } catch {
      return false
    }
  },

  async authenticate(title?: string, subtitle?: string): Promise<boolean> {
    try {
      const res = await BiometricAuthPlugin.authenticate({
        title,
        subtitle,
        cancelText: 'Cancel',
      })
      return !!res.success
    } catch {
      return false
    }
  },
}

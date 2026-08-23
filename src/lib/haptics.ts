import { Haptics, ImpactStyle } from '@capacitor/haptics'

export const triggerHaptic = async (enabled: boolean = true, style: ImpactStyle = ImpactStyle.Light) => {
  if (!enabled) return
  try {
    await Haptics.impact({ style })
  } catch {}
}

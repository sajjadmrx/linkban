import React, { useState, useEffect } from 'react'
import { Lock, KeyRound, Fingerprint, Delete, X, ShieldCheck } from 'lucide-react'
import { biometricService } from '@/lib/biometrics'
import { triggerHaptic } from '@/lib/haptics'
import { useI18n } from '@/lib/i18n'
import type { AppSettings } from '@/types/link'
import { toast } from 'sonner'

interface SecretAuthModalProps {
  open: boolean
  mode: 'unlock' | 'setup' | 'change'
  settings: AppSettings
  onClose: () => void
  onAuthenticated: () => void
  onSavePasscode?: (pin: string) => Promise<void>
}

export const SecretAuthModal: React.FC<SecretAuthModalProps> = ({
  open,
  mode,
  settings,
  onClose,
  onAuthenticated,
  onSavePasscode,
}) => {
  const { t, formatNumber } = useI18n()
  const [pin, setPin] = useState('')
  const [firstPin, setFirstPin] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'setup' ? 'enter' : 'enter')
  const [errorMessage, setErrorMessage] = useState('')
  const [hasBiometrics, setHasBiometrics] = useState(false)

  useEffect(() => {
    if (open) {
      setPin('')
      setFirstPin('')
      setStep('enter')
      setErrorMessage('')

      biometricService.isAvailable().then((avail) => {
        setHasBiometrics(avail)
        if (mode === 'unlock' && avail) {
          handleBiometricAuth()
        }
      })
    }
  }, [open, mode])

  const handleBiometricAuth = async () => {
    const success = await biometricService.authenticate(
      t.secret.title,
      t.secret.authPrompt
    )
    if (success) {
      await triggerHaptic(settings.hapticsEnabled)
      toast.success(t.secret.vaultUnlocked)
      onAuthenticated()
      onClose()
    }
  }

  const handleNumberClick = async (digit: string) => {
    await triggerHaptic(settings.hapticsEnabled)
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setErrorMessage('')

      if (newPin.length === 4) {
        processPin(newPin)
      }
    }
  }

  const handleDeleteDigit = async () => {
    await triggerHaptic(settings.hapticsEnabled)
    if (pin.length > 0) {
      setPin(pin.slice(0, -1))
      setErrorMessage('')
    }
  }

  const processPin = async (completedPin: string) => {
    if (mode === 'unlock') {
      if (settings.secretPasscode) {
        if (completedPin === settings.secretPasscode) {
          await triggerHaptic(settings.hapticsEnabled)
          toast.success(t.secret.vaultUnlocked)
          onAuthenticated()
          onClose()
        } else {
          setErrorMessage(t.secret.incorrectPin)
          setPin('')
        }
      } else {
        onAuthenticated()
        onClose()
      }
    } else if (mode === 'setup' || mode === 'change') {
      if (step === 'enter') {
        setFirstPin(completedPin)
        setPin('')
        setStep('confirm')
      } else {
        if (completedPin === firstPin) {
          if (onSavePasscode) {
            await onSavePasscode(completedPin)
          }
          toast.success(t.secret.pinSetSuccess)
          onAuthenticated()
          onClose()
        } else {
          setErrorMessage(t.secret.pinMismatch)
          setPin('')
          setStep('enter')
        }
      }
    }
  }

  if (!open) return null

  const titleText =
    mode === 'setup' || mode === 'change'
      ? step === 'enter'
        ? t.secret.enterPin
        : t.secret.confirmPin
      : t.secret.title

  return (
    <div className="bottom-sheet-backdrop z-60" onClick={onClose}>
      <div
        className="bottom-sheet-content max-w-sm mx-auto p-6 space-y-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto -mt-3 h-1 w-10 rounded-full bg-base-300" />

        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <Lock className="h-5 w-5" />
            <span>{titleText}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs h-7 w-7 text-base-content/50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-base-content/60">
            {mode === 'unlock'
              ? settings.secretPasscode
                ? t.secret.enterPin
                : t.secret.tagline
              : step === 'enter'
              ? t.secret.enterPin
              : t.secret.confirmPin}
          </p>

          <div className="flex items-center justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const filled = idx < pin.length
              return (
                <div
                  key={idx}
                  className={`h-4 w-4 rounded-full transition-all duration-200 ${
                    filled
                      ? 'bg-primary scale-110 shadow-sm'
                      : 'border-2 border-base-300 bg-base-200'
                  }`}
                />
              )
            })}
          </div>

          {errorMessage && (
            <p className="text-xs text-error font-bold animate-shake">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleNumberClick(digit)}
              className="flex items-center justify-center border border-base-300 bg-base-200/60 hover:bg-base-200 h-14 w-14 rounded-2xl text-lg font-bold text-base-content active:scale-95 transition-transform cursor-pointer"
            >
              {formatNumber(Number(digit))}
            </button>
          ))}

          {hasBiometrics && mode === 'unlock' ? (
            <button
              type="button"
              onClick={handleBiometricAuth}
              className="btn btn-ghost h-14 w-14 rounded-2xl text-primary flex items-center justify-center active:scale-95"
              aria-label="Fingerprint"
            >
              <Fingerprint className="h-6 w-6" />
            </button>
          ) : (
            <div className="h-14 w-14" />
          )}

          <button
            type="button"
            onClick={() => handleNumberClick('0')}
            className="flex items-center justify-center border border-base-300 bg-base-200/60 hover:bg-base-200 h-14 w-14 rounded-2xl text-lg font-bold text-base-content active:scale-95 transition-transform cursor-pointer"
          >
            {formatNumber(0)}
          </button>

          <button
            type="button"
            onClick={handleDeleteDigit}
            disabled={pin.length === 0}
            className="btn btn-ghost h-14 w-14 rounded-2xl text-base-content/60 flex items-center justify-center disabled:opacity-30 active:scale-95"
            aria-label="Delete"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {mode === 'unlock' && hasBiometrics && (
          <button
            type="button"
            onClick={handleBiometricAuth}
            className="btn btn-ghost btn-xs text-xs text-primary font-bold gap-1 mx-auto"
          >
            <Fingerprint className="h-4 w-4" />
            <span>{t.secret.biometrics}</span>
          </button>
        )}
      </div>
    </div>
  )
}

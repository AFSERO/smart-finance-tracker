import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Background hourly updater leveraging Next.js server runtime
let __rates_interval_started = false as boolean
export function startHourlyRatesUpdater(startNow = true) {
  if (typeof window !== 'undefined') return
  if (__rates_interval_started) return
  __rates_interval_started = true
  const { tcmbService } = require('@/services/tcmbService')
  const tick = async () => {
    try {
      await tcmbService.refreshAll()
      await tcmbService.updatePricedAssetsFromRates()
    } catch (e) {
      console.error('Hourly rates updater failed', e)
    }
  }
  if (startNow) tick()
  setInterval(tick, 60 * 60 * 1000)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min((current / target) * 100, 100)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

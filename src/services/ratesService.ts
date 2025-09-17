const DEFAULT_RATES_URL = process.env.RATES_SERVICE_URL || 'http://localhost:5000/rates'

export type SupportedAutoType = 'XAU' | 'USD' | 'EUR' | 'TRY'

export type RatesResponse = Partial<Record<SupportedAutoType, number>>

export class RatesServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'RatesServiceError'
  }
}

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return promise.finally(() => clearTimeout(timeout))
}

async function fetchJson(url: string) {
  const res = await withTimeout(fetch(url, { cache: 'no-store' }), 2500)
  if (!res.ok) {
    throw new RatesServiceError(`Rates service error: ${res.status} ${res.statusText}`, 'REQUEST_FAILED')
  }
  return res.json()
}

export async function fetchRates(): Promise<RatesResponse> {
  const primary = DEFAULT_RATES_URL
  const fallbacks: string[] = []
  if (primary.includes('localhost')) {
    fallbacks.push(primary.replace('localhost', '127.0.0.1'))
  }
  try {
    const data = await fetchJson(primary)
    return data as RatesResponse
  } catch {
    for (const alt of fallbacks) {
      try {
        const data = await fetchJson(alt)
        return data as RatesResponse
      } catch {}
    }
    // Return empty object instead of throwing to prevent API failures
    return {}
  }
}

export async function getRate(symbol: SupportedAutoType): Promise<number | null> {
  try {
    const rates = await fetchRates()
    const value = rates[symbol]
    return typeof value === 'number' && Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}



import { fetchTcmbGramGoldTry } from './tcmb'

type CachedValue<T> = { value: T; fetchedAt: number }

const ONE_HOUR_MS = 60 * 60 * 1000

class PriceFetcherClass {
  private goldPriceCache: CachedValue<number> | null = null
  private autoRefreshStarted = false

  async getGoldPrice(): Promise<number> {
    const now = Date.now()
    if (this.goldPriceCache && (now - this.goldPriceCache.fetchedAt) < ONE_HOUR_MS) {
      return this.goldPriceCache.value
    }
    const price = await fetchTcmbGramGoldTry()
    this.goldPriceCache = { value: price, fetchedAt: now }
    return price
  }

  async calculateGoldValue(grams: number): Promise<number> {
    const price = await this.getGoldPrice()
    return grams * price
  }

  startHourlyAutoRefresh(): void {
    if (this.autoRefreshStarted) return
    this.autoRefreshStarted = true
    // Guard against multiple intervals across hot reloads
    const globalAny = globalThis as any
    if (globalAny.__price_fetcher_interval_started__) return
    globalAny.__price_fetcher_interval_started__ = true

    setInterval(async () => {
      try {
        const price = await fetchTcmbGramGoldTry()
        this.goldPriceCache = { value: price, fetchedAt: Date.now() }
      } catch {
        // ignore refresh errors; keep existing cache
      }
    }, ONE_HOUR_MS)
  }
}

export const PriceFetcher = new PriceFetcherClass()
// Eagerly start auto refresh on import in server environment
if (typeof window === 'undefined') {
  try {
    PriceFetcher.startHourlyAutoRefresh()
  } catch {}
}



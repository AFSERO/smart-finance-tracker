/**
 * TCMB EVDS API Service
 * Official TCMB Electronic Data Delivery System (EVDS) integration
 */

const EVDS_BASE_URL = 'https://evds2.tcmb.gov.tr/service/evds';

// Series codes for financial instruments
export const SERIES_CODES = {
  USD_TRY: 'TP.DK.USD.A.YTL',
  EUR_TRY: 'TP.DK.EUR.A.YTL',
  GBP_TRY: 'TP.DK.GBP.A.YTL',
  GOLD_OUNCE_USD: 'TP.DK.XAU.A',
} as const;

// Type definitions
export interface EvdsDataPoint {
  date: string;
  value: number;
  series: string;
}

export interface EvdsResponse {
  items?: Array<Record<string, string | number>>;
}

export interface CurrencyRate {
  currency: string;
  rate: number;
  date: string;
}

export interface GoldPrice {
  type: 'gram' | 'ounce';
  price: number;
  currency: 'TRY' | 'USD';
  date: string;
}

export class TcmbError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TcmbError';
  }
}

/**
 * Format date to YYYY-MM-DD format
 */
function formatDateForEvds(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Make authenticated request to EVDS API
 */
async function makeEvdsRequest(seriesCode: string, startDate: string, endDate: string): Promise<EvdsResponse> {
  const apiKey = process.env.TCMB_API_KEY;
  
  if (!apiKey) {
    throw new TcmbError('TCMB_API_KEY environment variable is not set', 'API_KEY_MISSING');
  }

  const params = new URLSearchParams({
    series: seriesCode,
    startDate,
    endDate,
    type: 'json'
  });
  
  const url = `${EVDS_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'key': apiKey,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new TcmbError(`EVDS API request failed: ${response.status} ${response.statusText}`, 'REQUEST_FAILED');
    }

    return await response.json() as EvdsResponse;
  } catch (error) {
    if (error instanceof TcmbError) {
      throw error;
    }
    throw new TcmbError('Failed to fetch data from EVDS API', 'REQUEST_FAILED');
  }
}

/**
 * Parse numeric value from EVDS response
 */
function parseEvdsValue(item: Record<string, string | number>): number {
  for (const [key, value] of Object.entries(item)) {
    if (key.toLowerCase() === 'date') continue;
    
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (!isNaN(numValue) && isFinite(numValue)) {
      return numValue;
    }
  }
  
  throw new TcmbError('No valid numeric value found in EVDS response', 'PARSE_ERROR');
}

/**
 * Fetch data for a single series
 */
async function fetchSeries(seriesCode: string, startDate?: Date, endDate?: Date): Promise<EvdsDataPoint[]> {
  const start = startDate ? formatDateForEvds(startDate) : formatDateForEvds(new Date());
  const end = endDate ? formatDateForEvds(endDate) : formatDateForEvds(new Date());
  
  const data = await makeEvdsRequest(seriesCode, start, end);
  
  if (!data.items || data.items.length === 0) {
    throw new TcmbError(`No data available for series ${seriesCode}`, 'NO_DATA');
  }
  
  return data.items.map(item => {
    const dateValue = item.date || item.DATE || item.Date;
    const value = parseEvdsValue(item);
    
    return {
      date: String(dateValue),
      value,
      series: seriesCode
    };
  });
}

/**
 * Get current exchange rate for a currency
 */
export async function getCurrencyRate(currency: keyof typeof SERIES_CODES): Promise<CurrencyRate> {
  const seriesCode = SERIES_CODES[currency];
  if (!seriesCode) {
    throw new TcmbError(`Unknown currency: ${currency}`);
  }
  
  const data = await fetchSeries(seriesCode);
  const latest = data[data.length - 1];
  
  return {
    currency: currency.replace('_TRY', ''),
    rate: latest.value,
    date: latest.date
  };
}

/**
 * Get multiple currency rates
 */
export async function getCurrencyRates(currencies: Array<keyof typeof SERIES_CODES>): Promise<CurrencyRate[]> {
  const promises = currencies.map(currency => getCurrencyRate(currency));
  return Promise.all(promises);
}

/**
 * Get current gold prices
 */
export async function getGoldPrices(): Promise<GoldPrice[]> {
  const [goldData, usdData] = await Promise.all([
    fetchSeries(SERIES_CODES.GOLD_OUNCE_USD),
    fetchSeries(SERIES_CODES.USD_TRY)
  ]);
  
  const goldOunceUsd = goldData[goldData.length - 1].value;
  const usdTryRate = usdData[usdData.length - 1].value;
  const date = goldData[goldData.length - 1].date;
  
  // Calculate prices (1 ounce = 31.1035 grams)
  const goldGramUsd = goldOunceUsd / 31.1035;
  const goldGramTry = goldGramUsd * usdTryRate;
  const goldOunceTry = goldOunceUsd * usdTryRate;
  
  return [
    { type: 'ounce', price: goldOunceUsd, currency: 'USD', date },
    { type: 'ounce', price: goldOunceTry, currency: 'TRY', date },
    { type: 'gram', price: goldGramUsd, currency: 'USD', date },
    { type: 'gram', price: goldGramTry, currency: 'TRY', date }
  ];
}

/**
 * Get dashboard data with currencies and gold
 */
export async function getDashboardRates() {
  const [currencies, gold] = await Promise.all([
    getCurrencyRates(['USD_TRY', 'EUR_TRY', 'GBP_TRY']),
    getGoldPrices()
  ]);
  
  return {
    currencies,
    gold,
    lastUpdated: new Date().toISOString()
  };
}
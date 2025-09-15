/**
 * Minimal TCMB EVDS client focused on fetching gram gold price in TRY.
 * Uses in-memory caching; callers may add higher-level caching if needed.
 */

const EVDS_BASE_URL = 'https://evds2.tcmb.gov.tr/service/evds/series=SERIES_CODE&startDate=START&endDate=END&type=json';

type EvdsResponse = {
  items?: Array<Record<string, string | number>>
}

function formatDateYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get gram gold price in TRY for the latest available day.
 * The EVDS series code for gram gold can vary. Allow override via env `TCMB_GOLD_SERIES`.
 * If not provided, try a sensible default list.
 */
export async function fetchTcmbGramGoldTry(): Promise<number> {
  const apiKey = process.env.TCMB_API_KEY;
  if (!apiKey) {
    throw new Error('TCMB_API_KEY is not set');
  }

  // Series candidates. If the project owner provides an exact series in env, use that first.
  const seriesCandidates: string[] = [];
  if (process.env.TCMB_GOLD_SERIES) {
    seriesCandidates.push(process.env.TCMB_GOLD_SERIES);
  }
  // Add known/possible candidates here if available in the future.

  if (seriesCandidates.length === 0) {
    throw new Error('TCMB_GOLD_SERIES not configured. Please set env TCMB_GOLD_SERIES to EVDS series code for gram gold in TRY.');
  }

  const today = new Date();
  const start = formatDateYmd(today);
  const end = formatDateYmd(today);

  const headers = {
    'X-evds-key': apiKey,
  } as Record<string, string>;

  const fetchSeries = async (series: string): Promise<number> => {
    const url = EVDS_BASE_URL
      .replace('SERIES_CODE', encodeURIComponent(series))
      .replace('START', start)
      .replace('END', end);

    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`EVDS request failed: ${res.status}`);
    }
    const data = (await res.json()) as EvdsResponse;
    const item = data.items && data.items[0];
    if (!item) {
      throw new Error('No EVDS data returned');
    }
    // Find first numeric value in the record
    for (const [key, value] of Object.entries(item)) {
      if (key.toLowerCase() === 'date') continue;
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (!Number.isNaN(num)) {
        return num;
      }
    }
    throw new Error('No numeric field found in EVDS response item');
  };

  let lastError: unknown = null;
  for (const s of seriesCandidates) {
    try {
      return await fetchSeries(s);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to fetch gold price');
}



# TCMB EVDS API Integration

This document explains how to use the TCMB (Turkish Central Bank) EVDS (Electronic Data Delivery System) API integration in your smart finance tracker.

## Overview

The TCMB EVDS service provides real-time and historical financial data including:
- Currency exchange rates (USD/TRY, EUR/TRY, GBP/TRY, etc.)
- Gold prices (gram and ounce, in USD and TRY)
- Other precious metals data

## Setup

### 1. Get Your API Key

1. Visit [TCMB EVDS Portal](https://evds2.tcmb.gov.tr/)
2. Register for a free account
3. Generate your API key from the dashboard

### 2. Environment Configuration

Add your API key to your `.env` file:

```env
TCMB_API_KEY=your_api_key_here
```

## Usage

### Service Functions

#### `getCurrencyRate(currency)`

Get current exchange rate for a specific currency:

```typescript
import { getCurrencyRate } from '@/services/tcmbService';

const usdRate = await getCurrencyRate('USD_TRY');
console.log(usdRate);
// Output: { currency: 'USD', rate: 34.5678, date: '2024-01-15' }
```

#### `getCurrencyRates(currencies)`

Get multiple currency rates at once:

```typescript
import { getCurrencyRates } from '@/services/tcmbService';

const rates = await getCurrencyRates(['USD_TRY', 'EUR_TRY', 'GBP_TRY']);
console.log(rates);
// Output: Array of currency rate objects
```

#### `getGoldPrices()`

Get current gold prices in multiple formats:

```typescript
import { getGoldPrices } from '@/services/tcmbService';

const goldPrices = await getGoldPrices();
console.log(goldPrices);
// Output: Array of gold prices (gram/ounce, USD/TRY)
```

#### `getDashboardRates()`

Get all rates formatted for dashboard display:

```typescript
import { getDashboardRates } from '@/services/tcmbService';

const dashboardData = await getDashboardRates();
console.log(dashboardData);
// Output: { currencies: [...], gold: [...], lastUpdated: '...' }
```

### API Endpoints

#### GET `/api/tcmb?type=dashboard`

Get all dashboard data:

```bash
curl http://localhost:3000/api/tcmb?type=dashboard
```

#### GET `/api/tcmb?type=currency&currency=USD_TRY`

Get specific currency rate:

```bash
curl http://localhost:3000/api/tcmb?type=currency&currency=USD_TRY
```

#### GET `/api/tcmb?type=gold`

Get gold prices:

```bash
curl http://localhost:3000/api/tcmb?type=gold
```

### Available Series Codes

The service includes predefined series codes:

```typescript
export const SERIES_CODES = {
  USD_TRY: 'TP.DK.USD.A.YTL',      // US Dollar
  EUR_TRY: 'TP.DK.EUR.A.YTL',      // Euro
  GBP_TRY: 'TP.DK.GBP.A.YTL',      // British Pound
  GOLD_OUNCE_USD: 'TP.DK.XAU.A',   // Gold Ounce in USD
};
```

### Adding Custom Series

To add new series codes for future use:

```typescript
import { addCustomSeriesCode } from '@/services/tcmbService';

// Add a new series at runtime
addCustomSeriesCode('CHF_TRY', 'TP.DK.CHF.A.YTL');

// Or add directly to SERIES_CODES constant for compile-time safety
```

## Error Handling

The service includes comprehensive error handling:

```typescript
import { TcmbError } from '@/services/tcmbService';

try {
  const rate = await getCurrencyRate('USD_TRY');
} catch (error) {
  if (error instanceof TcmbError) {
    console.error('TCMB Error:', error.code, error.message);
    
    switch (error.code) {
      case 'API_KEY_MISSING':
        // Handle missing API key
        break;
      case 'REQUEST_FAILED':
        // Handle network/API errors
        break;
      case 'NO_DATA':
        // Handle no data available
        break;
      case 'PARSE_ERROR':
        // Handle data parsing errors
        break;
    }
  }
}
```

## Testing

Run the test script to verify your setup:

```typescript
import { testTcmbService } from '@/lib/tcmb-test';

await testTcmbService();
```

## Integration with Existing Code

The service is backward compatible with the existing `fetchTcmbGramGoldTry()` function:

```typescript
import { fetchTcmbGramGoldTry } from '@/lib/tcmb';

// This still works and now uses the new service internally
const goldPrice = await fetchTcmbGramGoldTry();
```

## Performance Notes

- The service includes no caching by default (`cache: 'no-store'`)
- Consider implementing application-level caching for production use
- API requests are made in parallel when possible for better performance
- Rate limits apply as per TCMB EVDS terms of service

## Official Documentation

- [TCMB EVDS Python Guide](https://evds2.tcmb.gov.tr/help/videos/EVDS_PYTHON_Kullanim_Kilavuzu.pdf)
- [TCMB EVDS Portal](https://evds2.tcmb.gov.tr/)
- [Series Code Search](https://evds2.tcmb.gov.tr/index.php?/evds/serieMarket)

## Troubleshooting

### Common Issues

1. **API Key Missing**: Ensure `TCMB_API_KEY` is set in your `.env` file
2. **Request Failed**: Check your internet connection and API key validity
3. **No Data**: Some series may not have data for weekends/holidays
4. **Rate Limits**: TCMB has rate limits; implement appropriate delays if needed

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will log detailed error information to the console.

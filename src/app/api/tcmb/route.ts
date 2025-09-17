import { NextRequest, NextResponse } from 'next/server';
import { getDashboardRates, getCurrencyRate, getGoldPrices, TcmbError } from '@/services/tcmbService';

/**
 * GET /api/tcmb
 * Fetch current TCMB rates for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';
    
    switch (type) {
      case 'dashboard':
        const dashboardData = await getDashboardRates();
        return NextResponse.json(dashboardData);
        
      case 'currency': {
        const currency = searchParams.get('currency') as 'USD_TRY' | 'EUR_TRY' | 'GBP_TRY';
        if (!currency) {
          return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 });
        }
        const rate = await getCurrencyRate(currency);
        return NextResponse.json(rate);
      }
        
      case 'gold':
        const goldPrices = await getGoldPrices();
        return NextResponse.json(goldPrices);
        
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('TCMB API Error:', error);
    
    if (error instanceof TcmbError) {
      const statusCode = error.code === 'API_KEY_MISSING' ? 500 : 400;
      return NextResponse.json({
        error: error.message,
        code: error.code
      }, { status: statusCode });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

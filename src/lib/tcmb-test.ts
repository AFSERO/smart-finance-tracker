/**
 * Test script for TCMB EVDS API service
 * Run this to test the integration: `node -e "require('./dist/lib/tcmb-test.js').testTcmbService()"`
 */

import { 
  getCurrencyRate, 
  getCurrencyRates, 
  getGoldPrices, 
  getDashboardRates,
  TcmbError,
  SERIES_CODES
} from '@/services/tcmbService';

export async function testTcmbService() {
  console.log('🚀 Testing TCMB EVDS API Service...\n');
  
  try {
    // Test 1: Single currency rate
    console.log('📈 Testing single currency rate (USD/TRY)...');
    const usdRate = await getCurrencyRate('USD_TRY');
    console.log('USD/TRY:', usdRate);
    console.log('✅ Single currency rate test passed\n');
    
    // Test 2: Multiple currency rates
    console.log('💱 Testing multiple currency rates...');
    const rates = await getCurrencyRates(['USD_TRY', 'EUR_TRY', 'GBP_TRY']);
    console.log('Currency Rates:', rates);
    console.log('✅ Multiple currency rates test passed\n');
    
    // Test 3: Gold prices
    console.log('🥇 Testing gold prices...');
    const goldPrices = await getGoldPrices();
    console.log('Gold Prices:', goldPrices);
    console.log('✅ Gold prices test passed\n');
    
    // Test 4: Dashboard data
    console.log('📊 Testing dashboard data...');
    const dashboardData = await getDashboardRates();
    console.log('Dashboard Data:', JSON.stringify(dashboardData, null, 2));
    console.log('✅ Dashboard data test passed\n');
    
    // Test 5: Available series codes
    console.log('📋 Available series codes:');
    console.log(SERIES_CODES);
    console.log('✅ All tests passed! 🎉');
    
  } catch (error) {
    if (error instanceof TcmbError) {
      console.error('❌ TCMB Service Error:', {
        code: error.code,
        message: error.message
      });
      
      if (error.code === 'API_KEY_MISSING') {
        console.log('\n💡 To fix this:');
        console.log('1. Get your API key from: https://evds2.tcmb.gov.tr/');
        console.log('2. Add TCMB_API_KEY=your_api_key to your .env file');
      }
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// For manual testing in development
if (require.main === module) {
  testTcmbService();
}

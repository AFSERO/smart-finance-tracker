/**
 * TCMB EVDS client for fetching gram gold price in TRY.
 * Updated to use the new tcmbService for better integration.
 */

import { getGoldPrices, TcmbError } from '@/services/tcmbService';

/**
 * Get gram gold price in TRY for the latest available day.
 * Uses the new TCMB service for better error handling and consistency.
 * 
 * @deprecated Consider using getGoldPrices() from tcmbService directly for more options
 */
export async function fetchTcmbGramGoldTry(): Promise<number> {
  try {
    const goldPrices = await getGoldPrices();
    
    // Find gram gold price in TRY
    const gramGoldTry = goldPrices.find(price => 
      price.type === 'gram' && price.currency === 'TRY'
    );
    
    if (!gramGoldTry) {
      throw new Error('Gram gold price in TRY not found in response');
    }
    
    return gramGoldTry.price;
  } catch (error) {
    if (error instanceof TcmbError) {
      // Convert TcmbError to regular Error for backward compatibility
      throw new Error(error.message);
    }
    throw error;
  }
}



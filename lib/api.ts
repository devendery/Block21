// Use fetch to avoid Axios XHR network errors and simplify CORS handling
import { B21_CONTRACT_ADDRESS } from './utils';

export interface MarketData {
  btc: number;
  eth: number;
  b21: number;
}

export const getMarketData = async (): Promise<MarketData> => {
  try {
    const res = await fetch('/api/market', { cache: 'no-store' });
    const data = await res.json();
    return data as MarketData;
  } catch (error) {
    // Silent fallback to prevent scary console noise during development/offline
    // console.warn('Market data unavailable, using fallback.');
    return { btc: 0, eth: 0, b21: 0 };
  }
};

export const getICOStatus = async () => {
  try {
    const response = await fetch('/ico-status.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ICO status:', error);
    return { round: 1, total: 210000, remaining: 210000 };
  }
};

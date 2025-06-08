const axios = require('axios');
require('dotenv').config();

const alpacaConfig = {
  headers: {
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET
  }
};

const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';

async function testEndpoints() {
  console.log('Testing Alpaca API endpoints...\n');

  // Test 1: Account (we know this works)
  try {
    const accountRes = await axios.get(`${ALPACA_BASE_URL}/v2/account`, alpacaConfig);
    console.log('✓ Account endpoint works');
    console.log(`  Status: ${accountRes.data.status}`);
  } catch (error) {
    console.log('✗ Account endpoint failed:', error.response?.status);
  }

  // Test 2: Try different data endpoints
  const symbol = 'AAPL';
  
  // Test bars with different parameters
  console.log('\nTesting market data endpoints for', symbol);
  
  try {
    const barsRes = await axios.get(
      `${ALPACA_BASE_URL}/v2/stocks/${symbol}/bars?timeframe=1Day&limit=1`,
      alpacaConfig
    );
    console.log('✓ Bars endpoint works (with symbol in path)');
    console.log('  Latest bar:', barsRes.data.bars?.[0]);
  } catch (error) {
    console.log('✗ Bars endpoint failed:', error.response?.status, error.response?.data);
  }

  // Test trades
  try {
    const tradesRes = await axios.get(
      `${ALPACA_BASE_URL}/v2/stocks/${symbol}/trades/latest`,
      alpacaConfig
    );
    console.log('✓ Trades endpoint works');
    console.log('  Latest trade:', tradesRes.data.trade);
  } catch (error) {
    console.log('✗ Trades endpoint failed:', error.response?.status, error.response?.data);
  }

  // Test snapshot
  try {
    const snapshotRes = await axios.get(
      `${ALPACA_BASE_URL}/v2/stocks/${symbol}/snapshot`,
      alpacaConfig
    );
    console.log('✓ Snapshot endpoint works');
    console.log('  Snapshot:', snapshotRes.data);
  } catch (error) {
    console.log('✗ Snapshot endpoint failed:', error.response?.status, error.response?.data);
  }

  // Test using data.alpaca.markets
  console.log('\nTrying data.alpaca.markets...');
  const DATA_URL = 'https://data.alpaca.markets';
  
  try {
    const dataRes = await axios.get(
      `${DATA_URL}/v2/stocks/bars/latest?symbols=${symbol}&feed=iex`,
      alpacaConfig
    );
    console.log('✓ Data API bars endpoint works');
    console.log('  Latest bar:', dataRes.data.bars?.[symbol]);
  } catch (error) {
    console.log('✗ Data API bars endpoint failed:', error.response?.status, error.response?.data);
  }
}

testEndpoints();
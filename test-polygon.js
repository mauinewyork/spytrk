const axios = require('axios');

// Note: You'll need to sign up for a free Polygon.io account to get an API key
// Visit https://polygon.io/dashboard/signup

const POLYGON_API_KEY = 'YOUR_POLYGON_API_KEY_HERE'; // Replace with your key

async function testPolygonEndpoints() {
  console.log('Testing Polygon.io endpoints for S&P 500 data...\n');
  
  // Test 1: Try to get S&P 500 constituents (usually premium)
  try {
    const response = await axios.get(
      `https://api.polygon.io/v3/reference/tickers?market=stocks&ticker.gte=A&ticker.lte=Z&active=true&limit=1000&apiKey=${POLYGON_API_KEY}`
    );
    console.log('✓ Tickers endpoint works (free tier)');
    console.log(`  Total active stocks available: ${response.data.count}`);
  } catch (error) {
    console.log('✗ Tickers endpoint failed:', error.response?.status, error.response?.data);
  }

  // Test 2: Try to get ticker details (free tier)
  try {
    const response = await axios.get(
      `https://api.polygon.io/v3/reference/tickers/AAPL?apiKey=${POLYGON_API_KEY}`
    );
    console.log('✓ Ticker details endpoint works');
    console.log('  Sample data:', response.data.results);
  } catch (error) {
    console.log('✗ Ticker details failed:', error.response?.status, error.response?.data);
  }

  // Test 3: Try to get grouped daily bars (free tier - previous day)
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    const response = await axios.get(
      `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${dateStr}?apiKey=${POLYGON_API_KEY}`
    );
    console.log('✓ Grouped daily bars endpoint works');
    console.log(`  Data for ${response.data.resultsCount} stocks available`);
  } catch (error) {
    console.log('✗ Grouped daily bars failed:', error.response?.status, error.response?.data);
  }

  // Test 4: Check if index constituents endpoint is available (usually premium)
  try {
    const response = await axios.get(
      `https://api.polygon.io/v3/reference/tickers/indices/I:SPX/constituents?apiKey=${POLYGON_API_KEY}`
    );
    console.log('✓ Index constituents endpoint works (surprising if on free tier!)');
    console.log(`  S&P 500 has ${response.data.count} constituents`);
  } catch (error) {
    console.log('✗ Index constituents endpoint failed (expected on free tier):', error.response?.status);
  }

  console.log('\n--- Alternative Approach ---');
  console.log('The free tier can get all active US stocks and filter by market cap');
  console.log('to approximate S&P 500 constituents, though not 100% accurate.\n');
}

// Note about Polygon.io Free Tier (as of 2024):
console.log('Polygon.io Free Tier typically includes:');
console.log('- End-of-day data (previous day)');
console.log('- 5 API calls per minute');
console.log('- Limited to 2 years of historical data');
console.log('- No real-time data');
console.log('- No index constituents endpoint\n');

if (POLYGON_API_KEY === 'YOUR_POLYGON_API_KEY_HERE') {
  console.log('⚠️  Please add your Polygon.io API key to test the endpoints');
  console.log('Sign up for free at: https://polygon.io/dashboard/signup\n');
} else {
  testPolygonEndpoints();
}
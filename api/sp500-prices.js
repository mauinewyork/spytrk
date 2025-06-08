const axios = require('axios');
const { SP500_SYMBOLS, SP500_COMPANIES } = require('../sp500-symbols');

// Helper function to chunk array
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Fetching S&P 500 prices...');
    
    const alpacaConfig = {
      headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET
      }
    };
    
    const ALPACA_DATA_URL = 'https://data.alpaca.markets';
    
    // Alpaca allows batching up to 200 symbols per request
    const symbolChunks = chunkArray(SP500_SYMBOLS, 200);
    const allPrices = [];
    
    for (const chunk of symbolChunks) {
      const symbols = chunk.join(',');
      
      // Get the latest bar data for each symbol
      const response = await axios.get(
        `${ALPACA_DATA_URL}/v2/stocks/bars/latest?symbols=${symbols}&feed=iex`,
        alpacaConfig
      );
      
      // Process the response
      for (const [symbol, bar] of Object.entries(response.data.bars || {})) {
        // Find the company name from our SP500_COMPANIES list
        const company = SP500_COMPANIES.find(c => c.symbol === symbol);
        allPrices.push({
          symbol,
          name: company ? company.name : symbol, // Use company name if found
          price: bar.c, // Close price
          open: bar.o,
          high: bar.h,
          low: bar.l,
          volume: bar.v,
          timestamp: bar.t
        });
      }
    }
    
    // Sort by symbol
    allPrices.sort((a, b) => a.symbol.localeCompare(b.symbol));
    
    res.status(200).json({
      success: true,
      count: allPrices.length,
      timestamp: new Date().toISOString(),
      data: allPrices
    });
    
  } catch (error) {
    console.error('Error fetching prices:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};
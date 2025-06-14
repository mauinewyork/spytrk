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
    console.log('Fetching S&P 500 and ETF prices (using IEX feed)...'); // Updated log
    
    const etfSymbols = ['SPY', 'SPYX', 'SPXS', 'SPXL'];
    const allSymbolsToFetch = [...SP500_SYMBOLS, ...etfSymbols]; // Using hardcoded symbols

    const alpacaConfig = {
      headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET
      }
    };
    
    const ALPACA_DATA_URL = 'https://data.alpaca.markets';
    
    // Alpaca allows batching up to 200 symbols per request
    const symbolChunks = chunkArray(allSymbolsToFetch, 200); // Use the combined list
    const allPrices = [];
    const etfData = {};
    
    for (const chunk of symbolChunks) {
      const symbols = chunk.join(',');
      
      // Get the latest bar data for each symbol
      const response = await axios.get(
        `${ALPACA_DATA_URL}/v2/stocks/bars/latest?symbols=${symbols}&feed=iex`, // Changed to iex
        alpacaConfig
      );
      
      // Process the response
      for (const [symbol, bar] of Object.entries(response.data.bars || {})) {
        const company = SP500_COMPANIES.find(c => c.symbol === symbol);
        const dataPoint = {
          symbol,
          name: company ? company.name : symbol,
          price: bar.c,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          volume: bar.v,
          timestamp: bar.t
        };

        // Removed BRK.A specific log as it was for sip/iex comparison primarily
        // if (symbol === 'BRK.A') {
        //   console.log('BRK.A bar data from Alpaca (iex):', JSON.stringify(bar, null, 2));
        // }

        if (etfSymbols.includes(symbol)) {
          etfData[symbol] = dataPoint;
        } else {
          allPrices.push(dataPoint);
        }
      }
    }
    
    // Sort S&P 500 stocks by symbol
    allPrices.sort((a, b) => a.symbol.localeCompare(b.symbol));
    
    res.status(200).json({
      success: true,
      count: allPrices.length, // Count only S&P 500 stocks
      timestamp: new Date().toISOString(),
      data: allPrices,
      etfData: etfData
    });
    
  } catch (error) {
    console.error('Error fetching prices:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const { SP500_SYMBOLS, SP500_COMPANIES, getRebalanceDates } = require('./sp500-symbols');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Alpaca API configuration
const alpacaConfig = {
  headers: {
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET
  }
};

const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
const ALPACA_DATA_URL = 'https://data.alpaca.markets';

// Helper function to chunk array
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Route to get all S&P 500 prices
app.get('/api/sp500-prices', async (req, res) => {
  try {
    console.log('Fetching S&P 500 and ETF prices...'); // Updated log
    
    const etfSymbols = ['SPY', 'SPYX']; // Add ETFs to fetch
    const allSymbolsToFetch = [...SP500_SYMBOLS, ...etfSymbols];

    // Alpaca allows batching up to 200 symbols per request
    const symbolChunks = chunkArray(allSymbolsToFetch, 200); // Use the combined list
    const allPrices = [];
    const etfData = {}; // To store ETF specific data
    
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
        const dataPoint = {
          symbol,
          name: company ? company.name : (etfSymbols.includes(symbol) ? symbol : 'N/A'), // Handle ETF names
          price: bar.c, // Close price
          open: bar.o,
          high: bar.h,
          low: bar.l,
          volume: bar.v,
          timestamp: bar.t
        };

        if (etfSymbols.includes(symbol)) {
          etfData[symbol] = dataPoint;
        } else {
          allPrices.push(dataPoint);
        }
      }
    }
    
    // Sort S&P 500 stocks by symbol
    allPrices.sort((a, b) => a.symbol.localeCompare(b.symbol));
    
    res.json({
      success: true,
      count: allPrices.length, // Count only S&P 500 stocks
      timestamp: new Date().toISOString(),
      data: allPrices,
      etfData: etfData // Add ETF data to the response
    });
    
  } catch (error) {
    console.error('Error fetching prices:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

// Route to get price for specific symbols
app.get('/api/price/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    const response = await axios.get(
      `${ALPACA_DATA_URL}/v2/stocks/bars/latest?symbols=${symbol}&feed=iex`,
      alpacaConfig
    );
    
    const bar = response.data.bars?.[symbol];
    
    if (!bar) {
      return res.status(404).json({
        success: false,
        error: 'Symbol not found'
      });
    }
    
    // Find the company name
    const company = SP500_COMPANIES.find(c => c.symbol === symbol);
    
    res.json({
      success: true,
      data: {
        symbol,
        name: company ? company.name : symbol,
        price: bar.c,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        volume: bar.v,
        timestamp: bar.t
      }
    });
    
  } catch (error) {
    console.error('Error fetching price:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

// Route to search multiple symbols
app.post('/api/prices', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of symbols'
      });
    }
    
    const symbolsStr = symbols.map(s => s.toUpperCase()).join(',');
    
    const response = await axios.get(
      `${ALPACA_DATA_URL}/v2/stocks/bars/latest?symbols=${symbolsStr}&feed=iex`,
      alpacaConfig
    );
    
    const prices = [];
    for (const [symbol, bar] of Object.entries(response.data.bars || {})) {
      prices.push({
        symbol,
        price: bar.c,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        volume: bar.v,
        timestamp: bar.t
      });
    }
    
    res.json({
      success: true,
      count: prices.length,
      data: prices
    });
    
  } catch (error) {
    console.error('Error fetching prices:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Test Alpaca connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const response = await axios.get(
      `${ALPACA_BASE_URL}/v2/account`,
      alpacaConfig
    );
    
    res.json({
      success: true,
      message: 'Alpaca API connection successful',
      account: {
        status: response.data.status,
        buying_power: response.data.buying_power,
        equity: response.data.equity
      }
    });
  } catch (error) {
    console.error('Connection test error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
  }
});

// Get rebalance info
app.get('/api/rebalance-info', (req, res) => {
  const { lastRebalance, nextRebalance } = getRebalanceDates();
  const daysSinceLast = Math.floor((new Date() - lastRebalance) / (1000 * 60 * 60 * 24));
  const daysUntilNext = Math.ceil((nextRebalance - new Date()) / (1000 * 60 * 60 * 24));
  
  res.json({
    lastRebalanceDate: lastRebalance.toISOString(),
    lastRebalanceDateFormatted: lastRebalance.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    daysSinceLastRebalance: daysSinceLast,
    nextRebalanceDate: nextRebalance.toISOString(),
    nextRebalanceDateFormatted: nextRebalance.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    daysUntilNextRebalance: daysUntilNext,
    rebalanceSchedule: 'Typically third Friday of March, June, September, and December',
    note: 'June 2025 rebalance occurred on June 6 (first Friday)'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'S&P 500 Price Tracker API',
    endpoints: {
      'GET /api/sp500-prices': 'Get current prices for all S&P 500 stocks',
      'GET /api/price/:symbol': 'Get current price for a specific symbol',
      'POST /api/prices': 'Get prices for multiple symbols (body: { symbols: [...] })',
      'GET /api/rebalance-info': 'Get S&P 500 rebalance schedule information',
      'GET /api/test-connection': 'Test Alpaca API connection',
      'GET /health': 'Health check'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.ALPACA_BASE_URL?.includes('paper') ? 'Paper Trading' : 'Live'}`);
  console.log(`Total S&P 500 symbols loaded: ${SP500_SYMBOLS.length}`);
});
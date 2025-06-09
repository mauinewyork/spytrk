const axios = require('axios');

// Helper function to format a date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to get the next valid trading day (skips weekends)
// TODO: Add holiday checking for more accuracy
function getNextTradingDay(initialDate = new Date()) {
  let date = new Date(initialDate);
  // If it's a weekend, move to Monday
  if (date.getDay() === 6) { // Saturday
    date.setDate(date.getDate() + 2);
  } else if (date.getDay() === 0) { // Sunday
    date.setDate(date.getDate() + 1);
  }

  // Check again in case initialDate was Friday and we moved to Sunday then Monday
  if (date.getDay() === 6) { // Saturday
    date.setDate(date.getDate() + 2);
  } else if (date.getDay() === 0) { // Sunday
    date.setDate(date.getDate() + 1);
  }
  return date;
}


// Placeholder for Alpaca API configuration
const alpacaConfig = {
  headers: {
    // Assuming similar auth as your existing Alpaca setup
    // These would come from process.env
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET,
    // Add any other headers required for the options trades API
  }
};

// Placeholder for the Alpaca Options Trades API endpoint
// This URL will need to be confirmed based on Alpaca's documentation for paid data
const ALPACA_OPTIONS_TRADES_URL = 'https://data.alpaca.markets/v1beta1/options/trades'; // Example URL

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const symbol = 'SPY'; // Focusing on SPY
    let targetDate = new Date();
    const now = new Date();

    // Simple check: if it's a weekend or after 4 PM ET (approx 1 PM PT where server might be)
    // More robust market hours/holiday logic would be needed for production.
    // Assuming Eastern Time for market close for this example.
    // Current server time is PT. 4 PM ET is 1 PM PT.
    const marketCloseHourPT = 13; // 1 PM PT

    if (now.getDay() === 0 || now.getDay() === 6 ||
        (now.getDay() === 5 && now.getHours() >= marketCloseHourPT) || // Friday after close
        (now.getHours() >= marketCloseHourPT) // Any other weekday after close
    ) {
      targetDate = getNextTradingDay(new Date(now.setDate(now.getDate() + 1))); // Start check from tomorrow
    } else {
      // If it's a weekday before close, check if today is a valid trading day
      targetDate = getNextTradingDay(now); // Ensures if today is Sat/Sun, it moves to Mon
    }
    
    const expirationDateForDisplay = formatDate(targetDate); // YYYY-MM-DD for display
    const expYYMMDD = expirationDateForDisplay.substring(2).replace(/-/g, ''); // YYMMDD format for OCC symbol

    console.log(`Fetching current SPY price to determine relevant strikes for ${expirationDateForDisplay}...`);

    // 1. Fetch current SPY price
    // Re-defining alpacaConfig and ALPACA_DATA_URL for this specific call, similar to server.js
    const localAlpacaConfig = {
      headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET
      }
    };
    const DATA_URL = 'https://data.alpaca.markets'; // Consistent with server.js usage for stock prices

    let currentSpyPrice = 500; // Default fallback
    try {
      const spyPriceResponse = await axios.get(
        `${DATA_URL}/v2/stocks/bars/latest?symbols=SPY&feed=sip`, // Using SIP feed
        localAlpacaConfig
      );
      if (spyPriceResponse.data.bars && spyPriceResponse.data.bars.SPY) {
        currentSpyPrice = spyPriceResponse.data.bars.SPY.c; // Close price
        console.log(`Current SPY price (SIP): ${currentSpyPrice}`);
      } else {
        console.warn('Could not fetch current SPY price, using default for strikes.');
      }
    } catch (priceError) {
      console.error('Error fetching SPY price:', priceError.response?.data || priceError.message);
      console.warn('Proceeding with default SPY price for strikes.');
    }

    const roundedSpyPrice = Math.round(currentSpyPrice);
    const strikes = [];
    for (let i = -5; i <= 5; i++) {
      strikes.push(roundedSpyPrice + i);
    }
    console.log(`Generated strikes based on SPY price ${currentSpyPrice}: ${strikes.join(', ')}`);

    const optionTypes = ['C', 'P'];
    const occSymbolsToQuery = [];

    strikes.forEach(strike => {
      optionTypes.forEach(type => {
        const strikeStr = (strike * 1000).toString().padStart(8, '0');
        occSymbolsToQuery.push(`${symbol}${expYYMMDD}${type}${strikeStr}`);
      });
    });

    if (occSymbolsToQuery.length === 0) {
      console.log('No OCC symbols generated, returning empty flow.');
      return res.status(200).json({
        success: true,
        symbol: symbol,
        expirationDate: expirationDateForDisplay,
        flow: [],
        timestamp: new Date().toISOString(),
        message: "No strikes to query."
      });
    }
    
    const symbolsParam = occSymbolsToQuery.join(',');
    console.log(`Attempting to fetch trades for SPY 0DTE contracts on ${expirationDateForDisplay} (YYMMDD: ${expYYMMDD})`);
    console.log(`Querying ${occSymbolsToQuery.length} OCC Symbols: ${symbolsParam.substring(0, 200)}...`); // Log only a part if too long

    const response = await axios.get(
      `${ALPACA_OPTIONS_TRADES_URL}?symbols=${symbolsParam}&limit=2000`, // Increased limit slightly
      alpacaConfig // Use the module-level alpacaConfig for options trades
    );

    console.log('Alpaca options trades API raw response.data:', JSON.stringify(response.data, null, 2)); // Log the raw response data

    const tradesBySymbol = response.data.trades || {}; // Expecting an object keyed by OCC symbol

    // --- Process trades to aggregate volume per strike ---
    const strikeData = {}; // { "strikePrice": { callVolume: X, putVolume: Y, contracts: [] } }

    // Iterate over each symbol's list of trades
    Object.values(tradesBySymbol).forEach(symbolTradesArray => {
      if (Array.isArray(symbolTradesArray)) {
        symbolTradesArray.forEach(trade => {
          // Alpaca's trade object for options usually has:
          // S: OCC Symbol (e.g., "SPY250610C00500000")
      // s: trade size (volume)
      // p: trade price
      // t: timestamp
      // x: exchange
      // c: conditions (array)

      const occSymbol = trade.S;
      const tradeVolume = trade.s;

      if (!occSymbol || typeof tradeVolume === 'undefined') return; // Skip if essential data is missing

      // Parse OCC symbol to extract strike and type
      const underlyingLength = symbol.length;
      const datePartLength = 6; // YYMMDD
      
      if (occSymbol.length < underlyingLength + datePartLength + 1 + 8) {
          console.warn(`Skipping malformed OCC symbol from trade data: ${occSymbol}`);
          return;
      }

      const typeChar = occSymbol.charAt(underlyingLength + datePartLength);
      const strikePart = occSymbol.substring(underlyingLength + datePartLength + 1);
      
      let strikePrice;
      try {
        strikePrice = parseInt(strikePart) / 1000;
      } catch (e) {
        console.warn(`Could not parse strike from OCC symbol: ${occSymbol}, strikePart: ${strikePart}`);
        return;
      }

      const strikeKey = strikePrice.toFixed(2);

      if (!strikeData[strikeKey]) {
        strikeData[strikeKey] = { callVolume: 0, putVolume: 0 };
      }

      if (typeChar === 'C') {
        strikeData[strikeKey].callVolume += tradeVolume;
      } else if (typeChar === 'P') {
        strikeData[strikeKey].putVolume += tradeVolume;
      }
        }); // End of symbolTradesArray.forEach(trade =>
      } // End of if (Array.isArray(symbolTradesArray))
    }); // End of Object.values(tradesBySymbol).forEach(symbolTradesArray =>
    
    const aggregatedFlow = Object.entries(strikeData).map(([strike, data]) => ({
        strike: parseFloat(strike),
        callVolume: data.callVolume,
        putVolume: data.putVolume,
    })).sort((a,b) => a.strike - b.strike);

    res.status(200).json({
      success: true,
      symbol: symbol,
      expirationDate: expirationDateForDisplay, // Display YYYY-MM-DD
      flow: aggregatedFlow,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching SPY 0DTE options flow:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};
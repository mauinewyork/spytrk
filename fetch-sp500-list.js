const axios = require('axios');
const fs = require('fs');

// Method 1: Scrape from Wikipedia (most reliable free option)
async function fetchFromWikipedia() {
  try {
    console.log('Fetching S&P 500 list from Wikipedia...');
    
    // Note: This is a simple example. For production, use a proper HTML parser
    // or consider using puppeteer for more reliable scraping
    const response = await axios.get(
      'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
    );
    
    // Extract table data using regex (simplified - use cheerio for production)
    const tableMatch = response.data.match(/<table[^>]*id="constituents"[^>]*>([\s\S]*?)<\/table>/);
    if (tableMatch) {
      // Parse the table to extract symbols
      const symbolMatches = tableMatch[1].matchAll(/<a[^>]*>([A-Z.]+)<\/a>/g);
      const symbols = Array.from(symbolMatches, m => m[1])
        .filter(s => s.length <= 5 && s !== 'NYSE' && s !== 'NASDAQ');
      
      console.log(`Found ${symbols.length} S&P 500 symbols`);
      return symbols;
    }
  } catch (error) {
    console.error('Wikipedia fetch failed:', error.message);
  }
  return null;
}

// Method 2: Use IEX Cloud (free tier includes index constituents)
async function fetchFromIEX(apiKey) {
  try {
    console.log('Fetching S&P 500 list from IEX Cloud...');
    
    const response = await axios.get(
      `https://cloud.iexapis.com/stable/stock/market/collection/sector?collectionName=sp500&token=${apiKey}`
    );
    
    const symbols = response.data.map(stock => stock.symbol);
    console.log(`Found ${symbols.length} S&P 500 symbols`);
    return symbols;
  } catch (error) {
    console.error('IEX fetch failed:', error.response?.data || error.message);
  }
  return null;
}

// Method 3: Use Financial Modeling Prep (free tier)
async function fetchFromFMP(apiKey) {
  try {
    console.log('Fetching S&P 500 list from Financial Modeling Prep...');
    
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/sp500_constituent?apikey=${apiKey}`
    );
    
    const symbols = response.data.map(stock => stock.symbol);
    console.log(`Found ${symbols.length} S&P 500 symbols`);
    return symbols;
  } catch (error) {
    console.error('FMP fetch failed:', error.response?.data || error.message);
  }
  return null;
}

// Method 4: Use a maintained GitHub list
async function fetchFromGitHub() {
  try {
    console.log('Fetching S&P 500 list from GitHub...');
    
    // Several repos maintain updated S&P 500 lists
    const response = await axios.get(
      'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv'
    );
    
    // Parse CSV
    const lines = response.data.split('\n');
    const symbols = lines.slice(1) // Skip header
      .map(line => line.split(',')[0])
      .filter(s => s && s.length > 0);
    
    console.log(`Found ${symbols.length} S&P 500 symbols`);
    return symbols;
  } catch (error) {
    console.error('GitHub fetch failed:', error.message);
  }
  return null;
}

// Save symbols to file
function saveSymbols(symbols, filename = 'sp500-symbols-updated.js') {
  const content = `// S&P 500 Ticker Symbols (Auto-updated: ${new Date().toISOString()})
// Source: External API/Web scraping
const SP500_SYMBOLS = ${JSON.stringify(symbols, null, 2)};

module.exports = SP500_SYMBOLS;
`;
  
  fs.writeFileSync(filename, content);
  console.log(`Saved ${symbols.length} symbols to ${filename}`);
}

// Example usage
async function updateSP500List() {
  console.log('Options for updating S&P 500 list:\n');
  
  // Try GitHub first (no API key needed)
  const githubSymbols = await fetchFromGitHub();
  if (githubSymbols) {
    saveSymbols(githubSymbols, 'sp500-from-github.js');
  }
  
  // For other methods, you'll need API keys:
  console.log('\n--- Other options (require API keys) ---');
  console.log('1. IEX Cloud: Sign up at https://iexcloud.io');
  console.log('2. Financial Modeling Prep: Sign up at https://financialmodelingprep.com');
  console.log('3. Wikipedia scraping: No key needed but less reliable');
  
  // Uncomment and add your API keys to use:
  // const iexSymbols = await fetchFromIEX('YOUR_IEX_API_KEY');
  // const fmpSymbols = await fetchFromFMP('YOUR_FMP_API_KEY');
}

updateSP500List();
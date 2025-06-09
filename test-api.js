const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing S&P 500 API...');
    const response = await axios.get('http://localhost:3000/api/sp500-prices');
    
    // Check first 5 stocks
    console.log('\nFirst 5 S&P 500 stocks:');
    response.data.data.slice(0, 5).forEach(stock => {
      console.log(`${stock.symbol}: ${stock.name || 'NO NAME'} - $${stock.price}`);
    });
    
    console.log(`\nTotal S&P 500 stocks: ${response.data.count}`);

    if (response.data.etfData) {
      console.log('\nETF Data:');
      for (const symbol in response.data.etfData) {
        const etf = response.data.etfData[symbol];
        const dayChange = etf.open && etf.price ? ((etf.price - etf.open) / etf.open * 100).toFixed(2) : 0;
        console.log(`${etf.symbol}: $${etf.price?.toFixed(2)} (Change: ${dayChange > 0 ? '+' : ''}${dayChange}%)`);
      }
    } else {
      console.log('\nNo ETF Data found in API response.');
    }

  } catch (error) {
    console.error('Error testing API:', error.response ? error.response.data : error.message);
  }
}

testAPI();